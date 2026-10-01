/**
 * app.js
 * Configuración de Express para CicloMetrics Backend
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Middlewares globales
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Montaje de rutas API
app.use('/api', apiRoutes);

// Servir frontend compilado si existe en frontend/dist
const path = require('path');
const fs = require('fs');
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
