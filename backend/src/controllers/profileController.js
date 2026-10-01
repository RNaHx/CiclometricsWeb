/**
 * profileController.js
 * Controlador HTTP para la gestión de perfiles de usuario y bicicleta
 */

const profileService = require('../services/profileService');

async function saveProfile(req, res) {
  try {
    const { user, bicycle, userId } = req.body;

    if (!user || !bicycle) {
      return res.status(400).json({
        success: false,
        error: 'El cuerpo de la solicitud debe contener los objetos "user" y "bicycle".'
      });
    }

    const result = await profileService.saveOrUpdateProfile({
      user,
      bicycle,
      userId: userId || req.params.id || user.id
    });

    return res.status(200).json({
      success: true,
      message: 'Perfil guardado exitosamente.',
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

async function getProfile(req, res) {
  try {
    const { id } = req.params;
    const profile = await profileService.getProfile(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Perfil con ID "${id}" no encontrado.`
      });
    }

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

async function listProfiles(req, res) {
  try {
    const profiles = await profileService.getAllProfiles();
    return res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  saveProfile,
  getProfile,
  listProfiles
};
