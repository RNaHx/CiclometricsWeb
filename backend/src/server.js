/**
 * server.js
 * Punto de entrada del servidor CicloMetrics Backend
 */

const app = require('./app');
const config = require('./config/config');
const { defaultStore } = require('./storage/jsonStore');

async function startServer() {
  try {
    // Inicializar capa de almacenamiento persistente (MongoDB Atlas o JSON local)
    await defaultStore.init();
    const engineInfo = defaultStore.getEngineInfo();
    if (engineInfo.engine === 'mongodb') {
      console.log(`[Storage] Conectado a MongoDB Atlas (Base de datos: ${engineInfo.database})`);
    } else {
      console.log(`[Storage] Base de datos JSON local activa en: ${engineInfo.file}`);
    }

    const server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(` CicloMetrics Backend API iniciado exitosamente `);
      console.log(` Entorno: ${config.nodeEnv}`);
      console.log(` Motor BBDD: ${engineInfo.engine.toUpperCase()}`);
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

// Exportar la instancia Express `app` por defecto para compatibilidad con Vercel Express Runtime,
// manteniendo `startServer` accesible como propiedad nombrada.
app.startServer = startServer;
module.exports = app;
