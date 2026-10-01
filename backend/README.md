# CicloMetrics Web - Backend & Core Calculation Engines

Servicio backend en Node.js / Express con motores de cálculo físico-mecánico y persistencia desacoplada para CicloMetrics Web (Fase 1).

## 🚀 Puesta en marcha rápida

```bash
cd backend
npm install
npm run dev     # Modo desarrollo con auto-reload (Node --watch)
npm test        # Ejecuta pruebas unitarias y de integración de endpoints
```

El servidor se ejecuta por defecto en `http://localhost:5000/api`.

---

## 📐 Motores Físico-Mecánicos

### 1. Interpolador Altimétrico (`src/calculators/elevationInterpolator.js`)
- **Mitigación RT-02**: Resuelve fallos en perfiles de elevación GPS/API que devuelven `null`, `NaN` o valores faltantes.
- Utiliza interpolación lineal continua (LERP) y propagación en bordes para garantizar que ninguna coordenada altimétrica interrumpa los cálculos de pendiente.

### 2. Equivalente Metabólico y Gasto Calórico (`src/calculators/metCalculator.js`)
- Basado en **Ainsworth et al. (2011)**:
  - **Bajada (< -2%)**: MET base 3.5 a 4.5. Velocidades entre 30 y 45 km/h.
  - **Plano (-2% a +2%)**: MET base 6.0 a 8.0 según velocidad estimada (18 a 26 km/h).
  - **Subida moderada (2% a 6%)**: Aumento progresivo de MET (8.5 a 12.0). Velocidad reducida (11 a 18 km/h).
  - **Subida pronunciada (> 6%)**: MET elevado (12.0 a 16.0). Velocidad de 6 a 11 km/h.
- Fórmula de gasto calórico total:
  $$\text{kCal} = \text{MET} \times (M_{\text{usuario}} + M_{\text{bicicleta}}) \times t_{\text{horas}}$$
- Tiempo estimado de llegada (ETA) dinámico calculado tramo a tramo según la gradiente.

### 3. Presión Óptima de Neumáticos (`src/calculators/tirePressureCalculator.js`)
- Basado en los principios de deformación óptima de carcasa (15% tire drop) y recomendaciones técnicas de **Schwalbe (2022)**:
  - Distribución de carga: **40% rueda delantera** / **60% rueda trasera** de la masa total ($M_{\text{usuario}} + M_{\text{bicicleta}}$).
  - Cálculo no lineal dependiente del ancho del neumático en mm y la carga por rueda.
  - Clamping estricto de seguridad: $[\text{psi\_min}, \text{psi\_max}]$.

---

## 📡 Contrato de Endpoints API REST

### `GET /api/health`
Verificación de estado del servicio.

### `POST /api/profile`
Guarda o actualiza el perfil del ciclista y su bicicleta.
- **Request Body**:
```json
{
  "userId": "opcional-uuid",
  "user": {
    "nombre": "Carlos Ciclista",
    "email": "carlos@example.com",
    "biometria": {
      "peso": 75.0,
      "altura": 178,
      "edad": 30,
      "genero": "masculino"
    }
  },
  "bicycle": {
    "tipo": "ruta",
    "peso": 8.8,
    "rodado": "700c",
    "ancho_neumatico": 28,
    "psi_min": 60,
    "psi_max": 110
  }
}
```
- **Response**: `200 OK` con IDs generados y objetos persistidos.

### `GET /api/profile/:id`
Obtiene un perfil biométrico y su bicicleta registrada.

### `POST /api/routes/calculate`
Calcula el análisis físico-mecánico y predictivo para una ruta.
- **Request Body**:
```json
{
  "userId": "opcional-id-perfil",
  "user": { ... },       // Opcional si se pasa userId
  "bicycle": { ... },    // Opcional si se pasa userId
  "origen": "Plaza Mayor",
  "destino": "Mirador Norte",
  "points": [
    { "distance": 0, "elevation": 50 },
    { "distance": 2000, "elevation": 50 },
    { "distance": 4000, "elevation": 130 },
    { "distance": 6000, "elevation": 110 }
  ],
  "saveRoute": false
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "distancia_km": 6,
    "desnivel_positivo_m": 80,
    "desnivel_negativo_m": 20,
    "pendiente_promedio_pct": 1.0,
    "pendiente_maxima_pct": 4.0,
    "tiempo_estimado_min": 16.5,
    "velocidad_promedio_kmh": 21.8,
    "met_promedio": 7.9,
    "kcal_quemadas": 185.3,
    "psi_delantero_recomendado": 74,
    "psi_trasero_recomendado": 90,
    "presiones_detalle": { ... },
    "desglose_tramos": {
      "downhill": { "distanceKm": 2, "timeMinutes": 3.8, "kcal": 19.8 },
      "flat": { "distanceKm": 2, "timeMinutes": 5.0, "kcal": 55.2 },
      "moderateClimb": { "distanceKm": 2, "timeMinutes": 7.7, "kcal": 110.3 },
      "steepClimb": { "distanceKm": 0, "timeMinutes": 0, "kcal": 0 }
    }
  }
}
```
