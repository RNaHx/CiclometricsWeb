/**
 * apiRoutes.js
 * Enrutador principal de endpoints para CicloMetrics Backend
 */

const express = require('express');
const router = express.Router();

const { defaultStore } = require('../storage/jsonStore');
const authController = require('../controllers/authController');
const bicycleController = require('../controllers/bicycleController');
const profileController = require('../controllers/profileController');
const routeController = require('../controllers/routeController');

// Estado y verificación de salud del servicio y motor de base de datos (MongoDB Atlas / JSON Local)
router.get('/health', async (req, res) => {
  try {
    await defaultStore.init();
  } catch (err) {
    console.warn('[Health] Aviso al inicializar store:', err.message);
  }
  res.json({
    status: 'ok',
    service: 'CicloMetrics Backend API',
    version: '1.0.0',
    storage: defaultStore.getEngineInfo(),
    timestamp: new Date().toISOString()
  });
});

// Endpoints de autenticación y sesión
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/cookie-consent', authController.saveCookieConsent);
router.get('/auth/me', authController.me);

// Endpoints de CRUD de bicicletas
router.get('/bicycles', bicycleController.getBicycles);
router.post('/bicycles', bicycleController.createBicycle);
router.delete('/bicycles/:id', bicycleController.deleteBicycle);

// Endpoints de perfil biométrico y bicicleta
router.post('/profile', profileController.saveProfile);
router.get('/profile', profileController.listProfiles);
router.get('/profile/:id', profileController.getProfile);

// Endpoints de cálculo de ruta y métricas físico-mecánicas
router.post('/routes/calculate', routeController.calculateRoute);
router.get('/routes/:id', routeController.getRouteById);
router.get('/routes/user/:userId', routeController.getRoutesByUser);

module.exports = router;
