/**
 * Validadores y normalizadores de datos para CicloMetrics Web
 * Cumple con mitigación de riesgo RT-03 (Entradas incoherentes o fuera de rango)
 */

const VALID_BICYCLE_TYPES = ['ruta', 'mtb', 'urbana', 'gravel'];
const VALID_WHEEL_SIZES = ['26', '27.5', '29', '700c'];
const VALID_GENDERS = ['masculino', 'femenino', 'otro'];

function validateUser(data) {
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

  // Biometría
  const biometria = data.biometria || {};
  const peso = parseFloat(biometria.peso);
  const altura = parseFloat(biometria.altura);
  const edad = parseInt(biometria.edad, 10);
  const genero = biometria.genero ? String(biometria.genero).toLowerCase() : 'otro';

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

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? {
      nombre: data.nombre.trim(),
      email: data.email.trim().toLowerCase(),
      biometria: {
        peso: Math.round(peso * 10) / 10,
        altura: Math.round(altura),
        edad,
        genero
      }
    } : null
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

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? {
      tipo,
      peso: Math.round(peso * 10) / 10,
      rodado,
      ancho_neumatico: Math.round(ancho),
      psi_min: Math.round(psi_min),
      psi_max: Math.round(psi_max)
    } : null
  };
}

module.exports = {
  VALID_BICYCLE_TYPES,
  VALID_WHEEL_SIZES,
  VALID_GENDERS,
  validateUser,
  validateBicycle
};
