/**
 * apiRoutes.js
 * Enrutador principal de endpoints para CicloMetrics Backend
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const bicycleController = require('../controllers/bicycleController');
const profileController = require('../controllers/profileController');
const routeController = require('../controllers/routeController');

// Estado y verificación de salud del servicio
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CicloMetrics Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Endpoints de autenticación y sesión
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
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
