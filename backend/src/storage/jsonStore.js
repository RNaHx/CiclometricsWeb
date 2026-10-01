const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const config = require('../config/config');

class JsonStore {
  constructor(filePath = config.dataFile) {
    this.filePath = filePath;
    this.initialData = {
      users: [],
      bicycles: [],
      routes: []
    };
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
      } catch {
        // Archivo no existe, inicializamos con estructura base
        await this._persist(this.initialData);
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

    // Escritura atómica a archivo temporal y rename
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

  async find(collection, filterFn = () => true) {
    const data = await this._read();
    const items = data[collection] || [];
    return items.filter(filterFn);
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
        id: items[index].id, // Preservar id inmutable
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
}

// Instancia singleton para compartir en el backend
const defaultStore = new JsonStore();

module.exports = {
  JsonStore,
  defaultStore
};
