/**
 * routeController.js
 * Controlador HTTP para ejecución del motor de cálculo de rutas
 */

const routeService = require('../services/routeService');

async function calculateRoute(req, res) {
  try {
    const payload = req.body;

    // Validación básica de cuerpo de solicitud
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'El cuerpo de la solicitud no puede estar vacío.'
      });
    }

    const result = await routeService.calculateAndStoreRoute(payload);

    return res.status(200).json({
      success: true,
      message: 'Cálculo físico-mecánico ejecutado exitosamente.',
      data: result
    });
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message,
      details: error.details || null
    });
  }
}

async function getRouteById(req, res) {
  try {
    const { id } = req.params;
    const route = await routeService.getRouteById(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        error: `Ruta con ID "${id}" no encontrada.`
      });
    }

    return res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getRoutesByUser(req, res) {
  try {
    const { userId } = req.params;
    const routes = await routeService.getRoutesByUser(userId);

    return res.status(200).json({
      success: true,
      data: routes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  calculateRoute,
  getRouteById,
  getRoutesByUser
};
