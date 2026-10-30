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

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isServerless,
  mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '',
  mongoDbName: process.env.MONGODB_DB_NAME ? process.env.MONGODB_DB_NAME.trim() : 'ciclometrics',
  dataFile: process.env.DATA_FILE_PATH
    ? path.resolve(__dirname, '../../', process.env.DATA_FILE_PATH)
    : defaultDataFile,
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

module.exports = config;
