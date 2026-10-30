const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const config = require('../config/config');
const { MongoStore } = require('./mongoStore');

const DEFAULT_SEED_DATA = {
  users: [
    {
      id: 'user-ricardo-1',
      nombre: 'Ricardo Henríquez',
      email: 'ricardo@ciclometrics.cl',
      password: 'password123',
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
  ],
  routes: []
};

class JsonStore {
  constructor(filePath = config.dataFile) {
    this.filePath = filePath;
    this.initialData = DEFAULT_SEED_DATA;
    this.isInitialized = false;
    this._writeLock = Promise.resolve();
  }

  async init() {
    if (this.isInitialized) return;

    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      try {
        await fs.access(this.filePath);
        const raw = await fs.readFile(this.filePath, 'utf-8');
        const currentData = JSON.parse(raw || '{}');
        let needsSave = false;

        if (!Array.isArray(currentData.users)) {
          currentData.users = [];
          needsSave = true;
        }
        if (!Array.isArray(currentData.bicycles)) {
          currentData.bicycles = [];
          needsSave = true;
        }
        if (!Array.isArray(currentData.routes)) {
          currentData.routes = [];
          needsSave = true;
        }

        const hasRicardo = currentData.users.some(
          (u) => u.id === 'user-ricardo-1' || u.email === 'ricardo@ciclometrics.cl'
        );
        if (!hasRicardo) {
          currentData.users.unshift(DEFAULT_SEED_DATA.users[0]);
          needsSave = true;
        }

        const hasBike = currentData.bicycles.some((b) => b.id === 'bike-ricardo-1');
        if (!hasBike) {
          currentData.bicycles.unshift(DEFAULT_SEED_DATA.bicycles[0]);
          needsSave = true;
        }

        if (needsSave) {
          await this._persist(currentData);
        }
      } catch {
        await this._persist(DEFAULT_SEED_DATA);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error inicializando JsonStore:', error);
      throw error;
    }
  }

  async _read() {
    await this.init();
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(content || '{}');
    } catch (error) {
      console.warn(`Aviso de lectura en JsonStore: ${error.message}. Reinicializando fallback.`);
      return { ...this.initialData };
    }
  }

  async _persist(data) {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    const tempPath = `${this.filePath}.${crypto.randomUUID()}.tmp`;
    const serialized = JSON.stringify(data, null, 2);
    await fs.writeFile(tempPath, serialized, 'utf-8');
    await fs.rename(tempPath, this.filePath);
  }

  async _withLock(action) {
    const nextLock = this._writeLock.then(async () => {
      return await action();
    });
    this._writeLock = nextLock.catch(() => {});
    return nextLock;
  }

  async find(collection, filterOrFn = () => true) {
    const data = await this._read();
    const items = data[collection] || [];
    if (typeof filterOrFn === 'function') {
      return items.filter(filterOrFn);
    }
    if (typeof filterOrFn === 'object' && filterOrFn !== null) {
      return items.filter((item) =>
        Object.entries(filterOrFn).every(([k, v]) => item[k] === v)
      );
    }
    return items;
  }

  async findById(collection, id) {
    const data = await this._read();
    const items = data[collection] || [];
    return items.find((item) => String(item.id) === String(id)) || null;
  }

  async insert(collection, item) {
    return this._withLock(async () => {
      const data = await this._read();
      if (!data[collection]) {
        data[collection] = [];
      }

      const newItem = {
        id: item.id || crypto.randomUUID(),
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data[collection].push(newItem);
      await this._persist(data);
      return newItem;
    });
  }

  async update(collection, id, updates) {
    return this._withLock(async () => {
      const data = await this._read();
      const items = data[collection] || [];
      const index = items.findIndex((item) => String(item.id) === String(id));

      if (index === -1) {
        return null;
      }

      const updatedItem = {
        ...items[index],
        ...updates,
        id: items[index].id,
        updatedAt: new Date().toISOString()
      };

      items[index] = updatedItem;
      await this._persist(data);
      return updatedItem;
    });
  }

  async delete(collection, id) {
    return this._withLock(async () => {
      const data = await this._read();
      const items = data[collection] || [];
      const index = items.findIndex((item) => String(item.id) === String(id));

      if (index === -1) {
        return false;
      }

      items.splice(index, 1);
      await this._persist(data);
      return true;
    });
  }

  getEngineInfo() {
    return {
      engine: 'json-local',
      file: this.filePath,
      connected: this.isInitialized
    };
  }
}

/**
 * HybridStore: Utiliza MongoStore (MongoDB Atlas) automáticamente cuando MONGODB_URI
 * está presente en el entorno, o JsonStore en desarrollo/pruebas locales.
 */
class HybridStore {
  constructor() {
    this.jsonStore = new JsonStore();
    this.mongoStore = config.mongoUri ? new MongoStore(config.mongoUri, config.mongoDbName) : null;
    this.activeStore = this.mongoStore || this.jsonStore;
  }

  async _resolveStore() {
    if (this.mongoStore) {
      try {
        await this.mongoStore.init();
        this.activeStore = this.mongoStore;
        return this.mongoStore;
      } catch (err) {
        console.warn(
          `[Storage] No se pudo conectar a MongoDB (${err.message}). Operando con respaldo JsonStore.`
        );
        this.mongoStore = null;
        this.activeStore = this.jsonStore;
      }
    }
    await this.jsonStore.init();
    this.activeStore = this.jsonStore;
    return this.jsonStore;
  }

  async init() {
    await this._resolveStore();
  }

  async find(collection, filterOrFn) {
    const store = await this._resolveStore();
    return store.find(collection, filterOrFn);
  }

  async findById(collection, id) {
    const store = await this._resolveStore();
    return store.findById(collection, id);
  }

  async insert(collection, item) {
    const store = await this._resolveStore();
    return store.insert(collection, item);
  }

  async update(collection, id, updates) {
    const store = await this._resolveStore();
    return store.update(collection, id, updates);
  }

  async delete(collection, id) {
    const store = await this._resolveStore();
    return store.delete(collection, id);
  }

  getEngineInfo() {
    return this.activeStore.getEngineInfo();
  }
}

const defaultStore = new HybridStore();

module.exports = {
  JsonStore,
  MongoStore,
  HybridStore,
  defaultStore
};
