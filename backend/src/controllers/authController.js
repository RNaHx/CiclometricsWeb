/**
 * authController.js
 * Controlador para autenticación y sesiones de usuario en CicloMetrics Web
 */

const { defaultStore } = require('../storage/jsonStore');
const { validateUser, validateResetPassword } = require('../models/validators');
const { hashPassword, verifyPassword } = require('../services/passwordService');

function generateToken(userId) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `token-${userId}-${timestamp}-${randomSuffix}`;
}

function extractUserIdFromRequest(req) {
  // 1. Cabecera Authorization: Bearer <token>
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.slice(7).trim();
    if (rawToken.startsWith('token-')) {
      const parts = rawToken.split('-');
      // Si el formato es token-<userId>-<timestamp>-<suffix>
      if (parts.length >= 3) {
        // Puede que userId contenga guiones (ej. user-ricardo-1 o uuid)
        // Eliminamos el primer elemento ('token') y los dos últimos (timestamp, suffix)
        return parts.slice(1, parts.length - 2).join('-');
      }
    }
    // Token directo con userId
    return rawToken;
  }

  // 2. Cabecera personalizada x-user-id
  if (req.headers['x-user-id']) {
    return req.headers['x-user-id'].trim();
  }

  // 3. Query param opcional
  if (req.query.userId) {
    return String(req.query.userId).trim();
  }

  return null;
}

function sanitizeUserResponse(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

async function register(req, res) {
  try {
    const { nombre, email, password, confirmPassword, acceptedTerms, termsAcceptedAt, biometria } = req.body || {};

    // Validar datos de entrada (incluyendo complejidad de contraseña, confirmación y aceptación de términos)
    const validation = validateUser(
      { nombre, email, password, confirmPassword, acceptedTerms, termsAcceptedAt, biometria },
      { requirePassword: true, requireTerms: true }
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos de registro inválidos.',
        details: validation.errors
      });
    }

    const sanitizedData = validation.sanitized;

    // Verificar si el correo ya existe
    const existingUsers = await defaultStore.find(
      'users',
      (u) => u.email.toLowerCase() === sanitizedData.email.toLowerCase()
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un usuario registrado con este correo electrónico.'
      });
    }

    // Persistir nuevo usuario con contraseña hasheada
    const userToInsert = {
      ...sanitizedData,
      password: sanitizedData.password ? hashPassword(sanitizedData.password) : undefined
    };

    const newUser = await defaultStore.insert('users', userToInsert);
    const token = generateToken(newUser.id);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: {
        token,
        user: sanitizeUserResponse(newUser)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno al registrar usuario.',
      details: error.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Debe ingresar email y contraseña.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const matchingUsers = await defaultStore.find(
      'users',
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (matchingUsers.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Correo o contraseña incorrectos.'
      });
    }

    const user = matchingUsers[0];

    // Si el usuario tiene password registrado, verificar coincidencia con hash o migración
    if (user.password) {
      const { isValid, needsRehash } = verifyPassword(cleanPassword, user.password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas. Correo o contraseña incorrectos.'
        });
      }

      // Si la contraseña estaba en texto plano legado, se migra a hash con salt automáticamente
      if (needsRehash) {
        try {
          await defaultStore.update('users', user.id, {
            password: hashPassword(cleanPassword)
          });
        } catch (err) {
          console.warn(`[Security] No fue posible migrar contraseña de usuario ${user.id}:`, err.message);
        }
      }
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Autenticación exitosa.',
      data: {
        token,
        user: sanitizeUserResponse(user)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno en la autenticación.',
      details: error.message
    });
  }
}

async function me(req, res) {
  try {
    const userId = extractUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado. Proporcione cabecera Authorization: Bearer <token> o x-user-id.'
      });
    }

    let user = await defaultStore.findById('users', userId);

    // Si no fue encontrado por ID directo, verificar si el token coincide con un usuario
    if (!user) {
      const allUsers = await defaultStore.find('users');
      user = allUsers.find((u) => userId.includes(u.id)) || null;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Usuario con identificador "${userId}" no encontrado.`
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno al consultar perfil autenticado.',
      details: error.message
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body || {};

    const validation = validateResetPassword({ email, newPassword, confirmPassword });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos de restablecimiento inválidos.',
        details: validation.errors
      });
    }

    const { email: cleanEmail, newPassword: cleanNewPassword } = validation.sanitized;

    const matchingUsers = await defaultStore.find(
      'users',
      (u) => u.email && u.email.toLowerCase() === cleanEmail
    );

    if (matchingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ninguna cuenta asociada a este correo electrónico.'
      });
    }

    const targetUser = matchingUsers[0];
    const updatedUser = await defaultStore.update('users', targetUser.id, {
      password: hashPassword(cleanNewPassword)
    });

    return res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
      data: {
        userId: updatedUser.id,
        email: updatedUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno al restablecer contraseña.',
      details: error.message
    });
  }
}

module.exports = {
  generateToken,
  extractUserIdFromRequest,
  register,
  login,
  me,
  resetPassword
};
