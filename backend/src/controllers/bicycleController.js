/**
 * bicycleController.js
 * Controlador HTTP para el CRUD de bicicletas en CicloMetrics Web
 */

const { defaultStore } = require('../storage/jsonStore');
const { validateBicycle } = require('../models/validators');
const { extractUserIdFromRequest } = require('./authController');

async function getBicycles(req, res) {
  try {
    const queryUserId = req.query.userId || extractUserIdFromRequest(req);

    let bicycles;
    if (queryUserId) {
      bicycles = await defaultStore.find(
        'bicycles',
        (b) => String(b.userId) === String(queryUserId)
      );
    } else {
      bicycles = await defaultStore.find('bicycles');
    }

    return res.status(200).json({
      success: true,
      count: bicycles.length,
      data: bicycles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al obtener bicicletas.',
      details: error.message
    });
  }
}

async function createBicycle(req, res) {
  try {
    const payload = req.body || {};
    const userId = payload.userId || extractUserIdFromRequest(req);

    const validation = validateBicycle({
      ...payload,
      userId
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos de bicicleta inválidos.',
        details: validation.errors
      });
    }

    const bikeData = validation.sanitized;
    if (userId) {
      bikeData.userId = userId;
    }

    const newBicycle = await defaultStore.insert('bicycles', bikeData);

    return res.status(201).json({
      success: true,
      message: 'Bicicleta registrada exitosamente.',
      data: newBicycle
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al registrar bicicleta.',
      details: error.message
    });
  }
}

async function deleteBicycle(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'El ID de la bicicleta es obligatorio.'
      });
    }

    const existing = await defaultStore.findById('bicycles', id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Bicicleta con ID "${id}" no encontrada.`
      });
    }

    const deleted = await defaultStore.delete('bicycles', id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `No se pudo eliminar la bicicleta con ID "${id}".`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Bicicleta eliminada exitosamente.',
      id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al eliminar bicicleta.',
      details: error.message
    });
  }
}

module.exports = {
  getBicycles,
  createBicycle,
  deleteBicycle
};
