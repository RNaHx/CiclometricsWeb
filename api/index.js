/**
 * api/index.js
 * Punto de entrada Serverless Function para Vercel.
 * Redirige todas las peticiones /api/* a la aplicación Express del backend
 * garantizando que la conexión a MongoDB Atlas esté inicializada.
 */

const app = require('../backend/src/app');
const { defaultStore } = require('../backend/src/storage/jsonStore');

module.exports = async (req, res) => {
  await defaultStore.init();
  return app(req, res);
};
