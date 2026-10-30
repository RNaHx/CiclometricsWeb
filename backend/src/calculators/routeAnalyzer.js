/**
 * routeAnalyzer.js
 * Orquestador del análisis de rutas: altimetría, segmentación, cálculo dinámico
 * de MET, kCal, ETA y presiones recomendadas de neumáticos.
 */

const {
  interpolateElevationProfile,
  smoothElevationProfile
} = require('./elevationInterpolator');
const { computeRouteEnergyAndETA } = require('./metCalculator');
const { calculateRecommendedTirePressure } = require('./tirePressureCalculator');

/**
 * Calcula la distancia haversine en metros entre dos coordenadas geográficas (lat, lng).
 */
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Analiza una ruta completa y genera todas las métricas predictivas y físicas.
 *
 * @param {Object} params
 * @param {Array<Object>} params.points - Puntos de la ruta (con lat/lng o elevation/distance)
 * @param {number} [params.totalDistanceKm] - Distancia explícita si se provee directamente
 * @param {Object} params.user - Datos del ciclista ({ biometria: { peso, ... } })
 * @param {Object} params.bicycle - Datos de la bicicleta ({ peso, ancho_neumatico, psi_min, psi_max, tipo })
 * @param {string|Object} [params.origen] - Nombre o coordenadas de origen
 * @param {string|Object} [params.destino] - Nombre o coordenadas de destino
 * @returns {Object} RouteMetrics consolidado
 */
function analyzeRoute({
  points = [],
  totalDistanceKm,
  user = {},
  bicycle = {},
  origen = 'Punto de partida',
  destino = 'Punto de llegada'
}) {
  const userWeight = parseFloat(user.biometria?.peso || user.peso || 70);
  const bikeWeight = parseFloat(bicycle.peso || 10);
  const tireWidth = parseFloat(bicycle.ancho_neumatico || 28);
  const bikeType = bicycle.tipo || 'ruta';
  const psiMin = bicycle.psi_min;
  const psiMax = bicycle.psi_max;

  // Paso 1: Normalizar puntos y calcular distancias acumuladas si no existen
  let preparedPoints = [];

  if (Array.isArray(points) && points.length > 0) {
    let accumulatedDistM = 0;
    preparedPoints = points.map((pt, idx) => {
      if (idx > 0 && pt.lat !== undefined && pt.lng !== undefined && points[idx - 1].lat !== undefined) {
        const stepDist = haversineDistanceMeters(
          points[idx - 1].lat, points[idx - 1].lng,
          pt.lat, pt.lng
        );
        accumulatedDistM += stepDist;
      } else if (typeof pt.distance === 'number') {
        accumulatedDistM = pt.distance;
      } else if (idx > 0) {
        accumulatedDistM += 100; // Paso por defecto de 100m
      }

      return {
        ...pt,
        distance: accumulatedDistM,
        elevation: pt.elevation !== undefined ? pt.elevation : (pt.ele !== undefined ? pt.ele : null)
      };
    });
  } else {
    // Si no se pasaron puntos pero sí una distancia total, sintetizar ruta plana de 2 puntos
    const distM = (parseFloat(totalDistanceKm) || 10) * 1000;
    preparedPoints = [
      { distance: 0, elevation: 20 },
      { distance: distM, elevation: 20 }
    ];
  }

  // Paso 2: Interpolar vacíos de elevación (Mitigación RT-02)
  const interpolatedPoints = interpolateElevationProfile(preparedPoints);

  // Paso 2.1: Suavizado de elevación gaussiano selectivo cuando existen saltos bruscos / ruido DEM (> 15%)
  const hasDemNoise = interpolatedPoints.some((pt, idx) => {
    if (idx === 0) return false;
    const dDist = Math.max(1, (pt.distance || 0) - (interpolatedPoints[idx - 1].distance || 0));
    const dElev = (pt.elevation || 0) - (interpolatedPoints[idx - 1].elevation || 0);
    return Math.abs((dElev / dDist) * 100) > 15;
  });

  const smoothedPoints = hasDemNoise
    ? smoothElevationProfile(interpolatedPoints, { windowDistanceMeters: 80 })
    : interpolatedPoints;

  // Paso 3: Segmentar la ruta y calcular pendientes con ventana segura
  const segments = [];
  let elevationGain = 0;
  let elevationLoss = 0;
  let maxGrade = 0;
  let minGrade = 0;

  const MIN_SAFE_SLOPE_DISTANCE_M = 40; // Distancia mínima para calcular gradiente sin ruido
  const MAX_REALISTIC_GRADE = 30.0;     // Límite físico realista máximo (rampas extremas)
  const MIN_REALISTIC_GRADE = -30.0;    // Límite físico realista mínimo (descensos extremos)

  for (let i = 0; i < smoothedPoints.length - 1; i++) {
    const p1 = smoothedPoints[i];
    const p2 = smoothedPoints[i + 1];

    const distStepM = Math.max(0.1, (p2.distance || 0) - (p1.distance || 0));
    const elevDiff = (p2.elevation || 0) - (p1.elevation || 0);

    if (elevDiff > 0) elevationGain += elevDiff;
    if (elevDiff < 0) elevationLoss += Math.abs(elevDiff);

    // Cálculo de pendiente considerando ventana de distancia mínima segura
    let gradePercent;
    if (distStepM >= MIN_SAFE_SLOPE_DISTANCE_M) {
      gradePercent = (elevDiff / distStepM) * 100;
    } else {
      let leftIdx = i;
      let rightIdx = i + 1;
      while (
        (smoothedPoints[rightIdx].distance - smoothedPoints[leftIdx].distance) < MIN_SAFE_SLOPE_DISTANCE_M &&
        (leftIdx > 0 || rightIdx < smoothedPoints.length - 1)
      ) {
        if (leftIdx > 0) leftIdx--;
        if (rightIdx < smoothedPoints.length - 1) rightIdx++;
      }
      const spanDist = Math.max(1, smoothedPoints[rightIdx].distance - smoothedPoints[leftIdx].distance);
      const spanElev = smoothedPoints[rightIdx].elevation - smoothedPoints[leftIdx].elevation;
      gradePercent = (spanElev / spanDist) * 100;
    }

    // Clamp estricto a límites físicos ciclables [-30%, +30%]
    if (gradePercent > MAX_REALISTIC_GRADE) gradePercent = MAX_REALISTIC_GRADE;
    if (gradePercent < MIN_REALISTIC_GRADE) gradePercent = MIN_REALISTIC_GRADE;

    if (gradePercent > maxGrade) maxGrade = gradePercent;
    if (gradePercent < minGrade) minGrade = gradePercent;

    segments.push({
      segmentIndex: i,
      fromDistanceM: Math.round(p1.distance),
      toDistanceM: Math.round(p2.distance),
      distanceMeters: Math.round(distStepM),
      startElevation: Math.round(p1.elevation * 10) / 10,
      endElevation: Math.round(p2.elevation * 10) / 10,
      elevationDiffM: Math.round(elevDiff * 10) / 10,
      gradePercent: Math.round(gradePercent * 10) / 10
    });
  }

  // Paso 4: Cálculos energéticos y cinemáticos (MET, velocidad, kCal, ETA)
  const energyAndEta = computeRouteEnergyAndETA(segments, userWeight, bikeWeight, bikeType);

  // Paso 5: Cálculo de presión de neumáticos
  const tirePressure = calculateRecommendedTirePressure({
    userWeightKg: userWeight,
    bikeWeightKg: bikeWeight,
    tireWidthMm: tireWidth,
    psiMin,
    psiMax,
    bikeType
  });

  const finalDistanceKm = energyAndEta.distanceKm;
  let avgGrade = finalDistanceKm > 0
    ? ((elevationGain - elevationLoss) / (finalDistanceKm * 1000)) * 100
    : 0;
  if (avgGrade > MAX_REALISTIC_GRADE) avgGrade = MAX_REALISTIC_GRADE;
  if (avgGrade < MIN_REALISTIC_GRADE) avgGrade = MIN_REALISTIC_GRADE;

  return {
    origen,
    destino,
    distancia_km: finalDistanceKm,
    desnivel_positivo_m: Math.round(elevationGain * 10) / 10,
    desnivel_negativo_m: Math.round(elevationLoss * 10) / 10,
    pendiente_promedio_pct: Math.round(avgGrade * 10) / 10,
    pendiente_maxima_pct: Math.round(maxGrade * 10) / 10,
    tiempo_estimado_min: energyAndEta.etaMinutes,
    velocidad_promedio_kmh: energyAndEta.averageSpeedKmh,
    met_promedio: energyAndEta.averageMet,
    kcal_quemadas: energyAndEta.totalKcal,
    psi_delantero_recomendado: tirePressure.recommendation.front.psi,
    psi_trasero_recomendado: tirePressure.recommendation.rear.psi,
    presiones_detalle: tirePressure,
    desglose_tramos: energyAndEta.breakdown,
    puntos_interpolados_count: smoothedPoints.length,
    perfil_altimetrico: smoothedPoints.map((pt) => ({
      distancia_m: Math.round(pt.distance),
      elevacion_m: pt.elevation,
      interpolado: !!pt.interpolated
    }))
  };
}

module.exports = {
  haversineDistanceMeters,
  analyzeRoute
};
