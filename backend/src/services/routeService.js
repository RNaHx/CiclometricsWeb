/**
 * routeService.js
 * Servicio para procesar y calcular rutas con el motor físico-mecánico
 */

const { defaultStore } = require('../storage/jsonStore');
const profileService = require('./profileService');
const { analyzeRoute } = require('../calculators/routeAnalyzer');
const { validateUser, validateBicycle } = require('../models/validators');

class RouteService {
  constructor(store = defaultStore) {
    this.store = store;
  }

  async calculateAndStoreRoute(payload) {
    const {
      userId,
      user: inlineUser,
      bicycle: inlineBicycle,
      points,
      totalDistanceKm,
      origen,
      destino,
      saveRoute = false
    } = payload;

    let targetUser = inlineUser;
    let targetBicycle = inlineBicycle;

    // Si viene userId, intentar resolver desde el almacén
    if (userId) {
      const profile = await profileService.getProfile(userId);
      if (profile) {
        targetUser = targetUser || profile.user;
        targetBicycle = targetBicycle || profile.bicycle;
      }
    }

    // Si no hay datos de usuario o bicicleta, aplicar defaults seguros o validar
    if (!targetUser) {
      targetUser = {
        nombre: 'Ciclista Invitado',
        email: 'invitado@ciclometrics.local',
        biometria: { peso: 70, altura: 175, edad: 30, genero: 'masculino' }
      };
    } else {
      // Validar si los datos de biometría son coherentes
      const userVal = validateUser(targetUser);
      if (userVal.isValid) {
        targetUser = userVal.sanitized;
      }
    }

    if (!targetBicycle) {
      targetBicycle = {
        tipo: 'ruta',
        peso: 9.5,
        rodado: '700c',
        ancho_neumatico: 28,
        psi_min: 60,
        psi_max: 110
      };
    } else {
      const bikeVal = validateBicycle(targetBicycle);
      if (bikeVal.isValid) {
        targetBicycle = bikeVal.sanitized;
      }
    }

    // Ejecutar motor de cálculo físico-mecánico
    const analysis = analyzeRoute({
      points: points || [],
      totalDistanceKm: totalDistanceKm ? parseFloat(totalDistanceKm) : undefined,
      user: targetUser,
      bicycle: targetBicycle,
      origen: origen || 'Punto A',
      destino: destino || 'Punto B'
    });

    const routeRecord = {
      userId: userId || null,
      ...analysis
    };

    if (saveRoute) {
      const saved = await this.store.insert('routes', routeRecord);
      return saved;
    }

    return routeRecord;
  }

  async getRouteById(routeId) {
    return await this.store.findById('routes', routeId);
  }

  async getRoutesByUser(userId) {
    return await this.store.find('routes', (r) => String(r.userId) === String(userId));
  }
}

module.exports = new RouteService();
