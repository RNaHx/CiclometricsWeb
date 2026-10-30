/**
 * Validadores y normalizadores de datos para CicloMetrics Web
 * Cumple con mitigación de riesgo RT-03 (Entradas incoherentes o fuera de rango)
 */

const VALID_BICYCLE_TYPES = ['ruta', 'mtb', 'urbana', 'gravel'];
const VALID_WHEEL_SIZES = ['26', '27.5', '29', '700c'];
const VALID_GENDERS = ['masculino', 'femenino', 'otro'];
const VALID_LEVELS = ['principiante', 'intermedio', 'avanzado', 'profesional'];

/**
 * Valida que la contraseña cumpla con la política de complejidad:
 * - Mínimo 8 caracteres
 * - Al menos 1 letra mayúscula
 * - Al menos 1 letra minúscula
 * - Al menos 1 número
 * - Al menos 1 carácter especial
 */
function validatePasswordStrength(password) {
  const pwdErrors = [];
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['La contraseña es obligatoria.']
    };
  }

  const clean = password.trim();
  if (clean.length < 8) {
    pwdErrors.push('La contraseña debe tener un mínimo de 8 caracteres.');
  }
  if (!/[A-Z]/.test(clean)) {
    pwdErrors.push('La contraseña debe incluir al menos una letra mayúscula.');
  }
  if (!/[a-z]/.test(clean)) {
    pwdErrors.push('La contraseña debe incluir al menos una letra minúscula.');
  }
  if (!/[0-9]/.test(clean)) {
    pwdErrors.push('La contraseña debe incluir al menos un número.');
  }
  if (!/[\W_]/.test(clean)) {
    pwdErrors.push('La contraseña debe incluir al menos un carácter especial (ej. !@#$%^&*).');
  }

  return {
    isValid: pwdErrors.length === 0,
    errors: pwdErrors
  };
}

function validateUser(data, options = {}) {
  const { requirePassword = false, requireTerms = false } = options;
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['El cuerpo de datos del usuario es obligatorio.'] };
  }

  // Nombre
  if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim().length < 2) {
    errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres.');
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || typeof data.email !== 'string' || !emailRegex.test(data.email.trim())) {
    errors.push('El email es inválido.');
  }

  // Password
  if (requirePassword || (data.password !== undefined && data.password !== null)) {
    const pwdCheck = validatePasswordStrength(data.password);
    if (!pwdCheck.isValid) {
      errors.push(...pwdCheck.errors);
    }
    if (data.confirmPassword !== undefined && data.confirmPassword !== null) {
      if (String(data.password || '').trim() !== String(data.confirmPassword).trim()) {
        errors.push('La confirmación de contraseña no coincide.');
      }
    }
  }

  // Términos y condiciones
  if (requireTerms && data.acceptedTerms !== true) {
    errors.push('Debe aceptar los Términos y Condiciones de Uso y la Política de Tratamiento de Datos.');
  } else if (data.acceptedTerms === false) {
    errors.push('Debe aceptar los Términos y Condiciones de Uso y la Política de Tratamiento de Datos.');
  }

  // Biometría
  const biometria = data.biometria || {};
  const peso = parseFloat(biometria.peso);
  const altura = parseFloat(biometria.altura);
  const edad = parseInt(biometria.edad, 10);
  const genero = biometria.genero ? String(biometria.genero).toLowerCase() : 'otro';
  const nivelRaw = biometria.nivel ? String(biometria.nivel).toLowerCase().trim() : 'intermedio';
  const nivel = VALID_LEVELS.includes(nivelRaw) ? nivelRaw : 'intermedio';

  if (isNaN(peso) || peso < 30 || peso > 250) {
    errors.push('El peso debe ser un número válido entre 30 kg y 250 kg.');
  }

  if (isNaN(altura) || altura < 100 || altura > 240) {
    errors.push('La altura debe ser un número válido entre 100 cm y 240 cm.');
  }

  if (isNaN(edad) || edad < 10 || edad > 100) {
    errors.push('La edad debe ser un número entero entre 10 y 100 años.');
  }

  if (!VALID_GENDERS.includes(genero)) {
    errors.push(`El género debe ser uno de: ${VALID_GENDERS.join(', ')}.`);
  }

  const sanitized = errors.length === 0 ? {
    nombre: data.nombre.trim(),
    email: data.email.trim().toLowerCase(),
    biometria: {
      peso: Math.round(peso * 10) / 10,
      altura: Math.round(altura),
      edad,
      genero,
      nivel
    }
  } : null;

  if (sanitized && data.password) {
    sanitized.password = String(data.password).trim();
  }

  if (sanitized && data.acceptedTerms === true) {
    sanitized.acceptedTerms = true;
    sanitized.termsAcceptedAt = data.termsAcceptedAt || new Date().toISOString();
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

function validateBicycle(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['El cuerpo de datos de la bicicleta es obligatorio.'] };
  }

  const tipo = data.tipo ? String(data.tipo).toLowerCase().trim() : '';
  if (!VALID_BICYCLE_TYPES.includes(tipo)) {
    errors.push(`El tipo de bicicleta debe ser uno de: ${VALID_BICYCLE_TYPES.join(', ')}.`);
  }

  const peso = parseFloat(data.peso);
  if (isNaN(peso) || peso < 4 || peso > 40) {
    errors.push('El peso de la bicicleta debe estar entre 4 kg y 40 kg.');
  }

  const rodado = data.rodado ? String(data.rodado).trim().toLowerCase() : '';
  if (!VALID_WHEEL_SIZES.includes(rodado)) {
    errors.push(`El rodado debe ser uno de: ${VALID_WHEEL_SIZES.join(', ')}.`);
  }

  const ancho = parseFloat(data.ancho_neumatico);
  if (isNaN(ancho) || ancho < 18 || ancho > 80) {
    errors.push('El ancho de neumático debe estar entre 18 mm y 80 mm.');
  }

  let psi_min = data.psi_min !== undefined ? parseFloat(data.psi_min) : undefined;
  let psi_max = data.psi_max !== undefined ? parseFloat(data.psi_max) : undefined;

  // Valores predeterminados sugeridos según ancho si no vienen definidos
  if (psi_min === undefined || isNaN(psi_min)) {
    psi_min = ancho <= 28 ? 60 : (ancho <= 42 ? 35 : 22);
  }
  if (psi_max === undefined || isNaN(psi_max)) {
    psi_max = ancho <= 28 ? 120 : (ancho <= 42 ? 75 : 55);
  }

  if (psi_min <= 0 || psi_min > 130) {
    errors.push('El psi_min debe estar entre 1 y 130 PSI.');
  }
  if (psi_max <= psi_min || psi_max > 150) {
    errors.push('El psi_max debe ser mayor a psi_min y menor o igual a 150 PSI.');
  }

  const sanitized = errors.length === 0 ? {
    tipo,
    peso: Math.round(peso * 10) / 10,
    rodado,
    ancho_neumatico: Math.round(ancho),
    psi_min: Math.round(psi_min),
    psi_max: Math.round(psi_max)
  } : null;

  if (sanitized) {
    if (data.nombre && typeof data.nombre === 'string' && data.nombre.trim()) {
      sanitized.nombre = data.nombre.trim();
    } else {
      sanitized.nombre = `Bicicleta ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${rodado}`;
    }
    if (data.userId) {
      sanitized.userId = String(data.userId).trim();
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

function validateResetPassword(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['El cuerpo de la solicitud es obligatorio.'] };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || typeof data.email !== 'string' || !emailRegex.test(data.email.trim())) {
    errors.push('El correo electrónico no tiene un formato válido.');
  }

  const pwdCheck = validatePasswordStrength(data.newPassword);
  if (!pwdCheck.isValid) {
    errors.push(...pwdCheck.errors);
  }

  if (data.confirmPassword !== undefined && data.confirmPassword !== null) {
    if (String(data.newPassword || '').trim() !== String(data.confirmPassword).trim()) {
      errors.push('La confirmación de contraseña no coincide.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      email: data.email ? String(data.email).trim().toLowerCase() : '',
      newPassword: data.newPassword ? String(data.newPassword).trim() : ''
    }
  };
}

module.exports = {
  VALID_BICYCLE_TYPES,
  VALID_WHEEL_SIZES,
  VALID_GENDERS,
  VALID_LEVELS,
  validatePasswordStrength,
  validateUser,
  validateBicycle,
  validateResetPassword
};

