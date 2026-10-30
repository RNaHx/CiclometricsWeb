const path = require('path');
const os = require('os');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el .env de la raíz del proyecto o de backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const defaultDataFile = isServerless
  ? path.join(os.tmpdir(), 'ciclometrics_store.json')
  : path.resolve(__dirname, '../../data/store.json');

/**
 * Normaliza y sanea la cadena de conexión de MongoDB Atlas para evitar errores comunes:
 * - Prefijo accidental "MONGODB_URI=" pegado dentro del valor en Vercel
 * - Comillas envolventes simples o dobles
 * - Paréntesis angulares "<password>" dejados alrededor de la contraseña real
 * - Caracteres especiales sin codificar (@, :, #, ?, /) dentro de la contraseña
 */
function normalizeMongoUri(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let val = raw.trim();

  if (val.toUpperCase().startsWith('MONGODB_URI=')) {
    val = val.slice('MONGODB_URI='.length).trim();
  }

  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1).trim();
  }

  const match = val.match(/^(mongodb(?:\+srv)?:\/\/)([^/]+)(\/.*)?$/i);
  if (!match) return val;

  const [, scheme, authority, rest = ''] = match;
  const lastAtIdx = authority.lastIndexOf('@');
  if (lastAtIdx === -1) return val;

  const credentials = authority.slice(0, lastAtIdx);
  const host = authority.slice(lastAtIdx + 1);
  const firstColonIdx = credentials.indexOf(':');
  if (firstColonIdx === -1) return val;

  let user = credentials.slice(0, firstColonIdx);
  let pass = credentials.slice(firstColonIdx + 1);

  if (user.startsWith('<') && user.endsWith('>') && user.length > 2) {
    user = user.slice(1, -1);
  }
  if (pass.startsWith('<') && pass.endsWith('>') && pass.length > 2) {
    pass = pass.slice(1, -1);
  }

  // Si aún es el placeholder literal de plantilla, ignorar
  if (
    user.toLowerCase() === 'usuario' ||
    pass.toLowerCase() === 'password' ||
    pass.toLowerCase() === 'db_password'
  ) {
    return '';
  }

  try {
    user = encodeURIComponent(decodeURIComponent(user));
  } catch {
    user = encodeURIComponent(user);
  }

  try {
    pass = encodeURIComponent(decodeURIComponent(pass));
  } catch {
    pass = encodeURIComponent(pass);
  }

  return `${scheme}${user}:${pass}@${host}${rest}`;
}

const rawMongoUri =
  process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || '';

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isServerless,
  mongoUri: normalizeMongoUri(rawMongoUri),
  mongoDbName: process.env.MONGODB_DB_NAME ? process.env.MONGODB_DB_NAME.trim() : 'ciclometrics',
  dataFile: process.env.DATA_FILE_PATH
    ? path.resolve(__dirname, '../../', process.env.DATA_FILE_PATH)
    : defaultDataFile,
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

module.exports = config;
