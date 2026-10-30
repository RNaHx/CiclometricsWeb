/**
 * mongoStore.js
 * Adaptador de persistencia en MongoDB Atlas con caché de conexión para entornos Serverless (Vercel)
 */

const crypto = require('crypto');
const { MongoClient, ServerApiVersion } = require('mongodb');
const config = require('../config/config');
const { hashPassword } = require('../services/passwordService');

const DEFAULT_SEED_DATA = {
  users: [
    {
      id: 'user-ricardo-1',
      nombre: 'Ricardo Henríquez',
      email: 'ricardo@ciclometrics.cl',
      password: hashPassword('password123'),
      acceptedTerms: true,
      termsAcceptedAt: '2026-09-30T00:00:00.000Z',
      biometria: {
        peso: 75,
        altura: 178,
        edad: 30,
        genero: 'masculino',
        nivel: 'intermedio'
      },
      createdAt: '2026-09-30T00:00:00.000Z',
      updatedAt: '2026-09-30T00:00:00.000Z'
    }
  ],
  bicycles: [
    {
      id: 'bike-ricardo-1',
      userId: 'user-ricardo-1',
      nombre: 'Bici Aro 29',
      tipo: 'mtb',
      peso: 10,
      rodado: '29',
      ancho_neumatico: 60,
      psi_min: 30,
      psi_max: 70,
      createdAt: '2026-09-30T00:00:00.000Z',
      updatedAt: '2026-09-30T00:00:00.000Z'
    }
  ]
};

class MongoStore {
  constructor(uri = config.mongoUri, dbName = config.mongoDbName) {
    this.uri = uri;
    this.dbName = dbName;
    this.isInitialized = false;
    this._initPromise = null;
  }

  async _getClient() {
    if (!this.uri) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno.');
    }

    // Reutilizar promesa de cliente en caché global (patrón oficial Vercel Serverless + MongoDB Atlas)
    if (!global._ciclometricsMongoClientPromise) {
      const client = new MongoClient(this.uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
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
    return client.db(this.dbName);
  }

  async init() {
    if (this.isInitialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      const db = await this._getDb();

      // Crear índices para optimizar consultas y garantizar integridad
      await Promise.all([
        db.collection('users').createIndex({ id: 1 }, { unique: true }),
        db.collection('users').createIndex({ email: 1 }, { unique: true }),
        db.collection('bicycles').createIndex({ id: 1 }, { unique: true }),
        db.collection('bicycles').createIndex({ userId: 1 }),
        db.collection('routes').createIndex({ id: 1 }, { unique: true }),
        db.collection('routes').createIndex({ userId: 1 })
      ]);

      // Asegurar datos semilla en un clúster nuevo para pruebas inmediatas
      const seedUser = DEFAULT_SEED_DATA.users[0];
      const existingRicardo = await db.collection('users').findOne({
        $or: [{ id: seedUser.id }, { email: seedUser.email }]
      });

      if (!existingRicardo) {
        await db.collection('users').insertOne({ ...seedUser });
      }

      const seedBike = DEFAULT_SEED_DATA.bicycles[0];
      const existingBike = await db.collection('bicycles').findOne({ id: seedBike.id });
      if (!existingBike) {
        await db.collection('bicycles').insertOne({ ...seedBike });
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

    // Compatibilidad entre versiones del driver MongoDB (result directo o result.value)
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
