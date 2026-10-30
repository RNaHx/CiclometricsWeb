/**
 * app.js
 * Configuración de Express para CicloMetrics Backend (Local y Vercel Services / Functions)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const { defaultStore } = require('./storage/jsonStore');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Middlewares globales
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Asegurar inicialización de MongoDB Atlas / Store antes de procesar peticiones API
app.use(async (req, res, next) => {
  try {
    await defaultStore.init();
    next();
  } catch (err) {
    next(err);
  }
});

// Montaje de rutas API bajo /api (Vercel preserva el prefijo /api al enrutar al servicio backend)
app.use('/api', apiRoutes);

// En entorno Serverless (Vercel), permitir resolución también sin el prefijo /api por compatibilidad
if (config.isServerless) {
  app.use('/', apiRoutes);
} else {
  // En modo servidor monolítico local, servir frontend compilado si existe en frontend/dist
  const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  }
}

// Manejador de ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejador global de excepciones
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    details: err.details || null
  });
});

module.exports = app;
