/**
 * server.js
 * Punto de entrada del servidor CicloMetrics Backend
 */

const app = require('./app');
const config = require('./config/config');
const { defaultStore } = require('./storage/jsonStore');

async function startServer() {
  try {
    // Inicializar capa de almacenamiento persistente
    await defaultStore.init();
    console.log(`[Storage] Base de datos JSON inicializada en: ${config.dataFile}`);

    const server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(` CicloMetrics Backend API iniciado exitosamente `);
      console.log(` Entorno: ${config.nodeEnv}`);
      console.log(` Puerto: ${config.port}`);
      console.log(` Base URL: http://localhost:${config.port}/api`);
      console.log(` Health: http://localhost:${config.port}/api/health`);
      console.log(`===============================================`);
    });

    return server;
  } catch (error) {
    console.error('Fallo al iniciar el servidor:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
