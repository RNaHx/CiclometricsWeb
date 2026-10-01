/**
 * profileService.js
 * Servicio de gestión de usuarios y bicicletas con persistencia desacoplada
 */

const { defaultStore } = require('../storage/jsonStore');
const { validateUser, validateBicycle } = require('../models/validators');

class ProfileService {
  constructor(store = defaultStore) {
    this.store = store;
  }

  async saveOrUpdateProfile({ user, bicycle, userId }) {
    // Validar usuario
    const userValidation = validateUser(user);
    if (!userValidation.isValid) {
      const error = new Error('Datos de usuario inválidos');
      error.details = userValidation.errors;
      error.status = 400;
      throw error;
    }

    // Validar bicicleta
    const bikeValidation = validateBicycle(bicycle);
    if (!bikeValidation.isValid) {
      const error = new Error('Datos de bicicleta inválidos');
      error.details = bikeValidation.errors;
      error.status = 400;
      throw error;
    }

    const targetUserId = userId || user.id;
    let savedUser;

    if (targetUserId) {
      const existingUser = await this.store.findById('users', targetUserId);
      if (existingUser) {
        savedUser = await this.store.update('users', targetUserId, userValidation.sanitized);
      } else {
        savedUser = await this.store.insert('users', {
          id: targetUserId,
          ...userValidation.sanitized
        });
      }
    } else {
      savedUser = await this.store.insert('users', userValidation.sanitized);
    }

    // Persistir o actualizar bicicleta asociada
    let savedBicycle;
    const existingBikes = await this.store.find(
      'bicycles',
      (b) => String(b.userId) === String(savedUser.id)
    );

    const bikePayload = {
      ...bikeValidation.sanitized,
      userId: savedUser.id
    };

    if (bicycle.id) {
      const bikeFound = await this.store.findById('bicycles', bicycle.id);
      if (bikeFound) {
        savedBicycle = await this.store.update('bicycles', bicycle.id, bikePayload);
      } else {
        savedBicycle = await this.store.insert('bicycles', { id: bicycle.id, ...bikePayload });
      }
    } else if (existingBikes.length > 0) {
      // Si el usuario ya tiene bicicleta registrada y no especificó ID, actualizamos la primera
      savedBicycle = await this.store.update('bicycles', existingBikes[0].id, bikePayload);
    } else {
      savedBicycle = await this.store.insert('bicycles', bikePayload);
    }

    return {
      user: savedUser,
      bicycle: savedBicycle
    };
  }

  async getProfile(userId) {
    if (!userId) {
      const error = new Error('El ID de usuario es requerido');
      error.status = 400;
      throw error;
    }

    const user = await this.store.findById('users', userId);
    if (!user) {
      return null;
    }

    const bicycles = await this.store.find(
      'bicycles',
      (b) => String(b.userId) === String(userId)
    );

    return {
      user,
      bicycle: bicycles[0] || null,
      bicycles
    };
  }

  async getAllProfiles() {
    const users = await this.store.find('users');
    const bicycles = await this.store.find('bicycles');

    return users.map((u) => ({
      user: u,
      bicycle: bicycles.find((b) => String(b.userId) === String(u.id)) || null
    }));
  }
}

module.exports = new ProfileService();
