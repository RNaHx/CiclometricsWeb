/**
 * mongoStore.js
 * Adaptador de persistencia en MongoDB Atlas con caché de conexión para entornos Serverless (Vercel)
 */

const crypto = require('crypto');
const { MongoClient, ServerApiVersion } = require('mongodb');
const config = require('../config/config');

class MongoStore {
  constructor(uri = config.mongoUri, dbName = config.mongoDbName) {
    this.uri = uri;
    this.dbName = dbName;
    this.isInitialized = false;
    this._initPromise = null;
  }

  async _getClient() {
    const activeUri = this.uri || config.mongoUri;
    if (!activeUri) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno.');
    }

    if (!global._ciclometricsMongoClientPromise) {
      const client = new MongoClient(activeUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: false,
          deprecationErrors: true
        },
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000
      });
      global._ciclometricsMongoClientPromise = client.connect().catch((err) => {
        global._ciclometricsMongoClientPromise = null;
        throw err;
      });
    }

    return global._ciclometricsMongoClientPromise;
  }

  async _getDb() {
    const client = await this._getClient();
    return client.db(this.dbName || config.mongoDbName || 'ciclometrics');
  }

  async init() {
    if (this.isInitialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      const db = await this._getDb();

      // Crear índices de manera tolerante a índices preexistentes
      try {
        await Promise.all([
          db.collection('users').createIndex({ id: 1 }, { unique: true }),
          db.collection('users').createIndex({ email: 1 }, { unique: true }),
          db.collection('bicycles').createIndex({ id: 1 }, { unique: true }),
          db.collection('bicycles').createIndex({ userId: 1 }),
          db.collection('routes').createIndex({ id: 1 }, { unique: true }),
          db.collection('routes').createIndex({ userId: 1 })
        ]);
      } catch (idxErr) {
        console.warn('[MongoStore] Aviso al verificar índices:', idxErr.message);
      }

      // Eliminar cuenta de prueba/demo legada si existiera en la colección de MongoDB
      try {
        await Promise.all([
          db.collection('users').deleteMany({
            $or: [{ id: 'user-ricardo-1' }, { email: 'ricardo@ciclometrics.cl' }]
          }),
          db.collection('bicycles').deleteMany({
            $or: [{ id: 'bike-ricardo-1' }, { userId: 'user-ricardo-1' }]
          }),
          db.collection('routes').deleteMany({ userId: 'user-ricardo-1' })
        ]);
      } catch (cleanupErr) {
        console.warn('[MongoStore] Aviso al limpiar cuenta de prueba:', cleanupErr.message);
      }

      this.isInitialized = true;
    })();

    try {
      await this._initPromise;
    } catch (err) {
      this._initPromise = null;
      throw err;
    }
  }

  async find(collection, filterOrFn = () => true) {
    await this.init();
    const db = await this._getDb();
    const col = db.collection(collection);

    if (typeof filterOrFn === 'object' && filterOrFn !== null) {
      return await col.find(filterOrFn, { projection: { _id: 0 } }).toArray();
    }

    const items = await col.find({}, { projection: { _id: 0 } }).toArray();
    if (typeof filterOrFn === 'function') {
      return items.filter(filterOrFn);
    }
    return items;
  }

  async findById(collection, id) {
    await this.init();
    const db = await this._getDb();
    const doc = await db
      .collection(collection)
      .findOne({ id: String(id) }, { projection: { _id: 0 } });
    return doc || null;
  }

  async insert(collection, item) {
    await this.init();
    const db = await this._getDb();
    const now = new Date().toISOString();
    const { _id, ...cleanItem } = item || {};

    const newItem = {
      id: cleanItem.id || crypto.randomUUID(),
      ...cleanItem,
      createdAt: cleanItem.createdAt || now,
      updatedAt: now
    };

    await db.collection(collection).insertOne({ ...newItem });
    return newItem;
  }

  async update(collection, id, updates) {
    await this.init();
    const db = await this._getDb();
    const { _id, id: _ignoredId, ...safeUpdates } = updates || {};

    const result = await db.collection(collection).findOneAndUpdate(
      { id: String(id) },
      {
        $set: {
          ...safeUpdates,
          updatedAt: new Date().toISOString()
        }
      },
      {
        returnDocument: 'after',
        projection: { _id: 0 }
      }
    );

    const updatedDoc = result && result.value !== undefined ? result.value : result;
    return updatedDoc || null;
  }

  async delete(collection, id) {
    await this.init();
    const db = await this._getDb();
    const res = await db.collection(collection).deleteOne({ id: String(id) });
    return res.deletedCount > 0;
  }

  getEngineInfo() {
    return {
      engine: 'mongodb',
      database: this.dbName,
      connected: this.isInitialized
    };
  }
}

module.exports = {
  MongoStore
};
