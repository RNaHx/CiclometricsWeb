const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el .env del directorio raíz del backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dataFile: process.env.DATA_FILE_PATH 
    ? path.resolve(__dirname, '../../', process.env.DATA_FILE_PATH)
    : path.resolve(__dirname, '../../data/store.json'),
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

module.exports = config;
