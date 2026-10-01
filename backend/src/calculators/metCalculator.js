/**
 * metCalculator.js
 * Motor físico-fisiológico de cálculo de Equivalente Metabólico (MET),
 * estimación de velocidad dinámica por pendiente (ETA) y gasto calórico (kCal)
 * basado en Ainsworth et al. (2011) "Compendium of Physical Activities".
 */

// Velocidades de referencia plana (km/h) según el tipo de bicicleta
const BASE_SPEEDS_BY_BIKE_TYPE = {
  ruta: 25.0,
  gravel: 22.0,
  urbana: 18.0,
  mtb: 19.0
};

/**
 * Estima la velocidad media esperada (km/h) en función de la pendiente y tipo de bicicleta.
 * @param {number} gradePercent - Pendiente en porcentaje (ej: 4.5 para 4.5%, -3.0 para -3%)
 * @param {string} bikeType - 'ruta', 'mtb', 'urbana', 'gravel'
 * @returns {number} Velocidad estimada en km/h
 */
function estimateSpeedForGrade(gradePercent, bikeType = 'ruta') {
  const normalizedType = String(bikeType).toLowerCase();
  const baseSpeed = BASE_SPEEDS_BY_BIKE_TYPE[normalizedType] || BASE_SPEEDS_BY_BIKE_TYPE.ruta;

  let speed;

  if (gradePercent < -8) {
    // Bajada muy pronunciada: frenado preventivo por seguridad
    speed = Math.min(baseSpeed * 1.7, 45.0);
  } else if (gradePercent < -2) {
    // Bajada moderada a rápida (-2% a -8%)
    // Incremento progresivo de velocidad con la pendiente negativa
    const descentFactor = 1.0 + Math.abs(gradePercent) * 0.11;
    speed = Math.min(baseSpeed * descentFactor, 42.0);
  } else if (gradePercent <= 2) {
    // Terreno plano (-2% a +2%)
    // Ajuste lineal suave
    const flatAdjustment = 1.0 - (gradePercent * 0.04);
    speed = baseSpeed * flatAdjustment;
  } else if (gradePercent <= 6) {
    // Subida moderada (+2% a +6%)
    // La velocidad cae progresivamente (12 a 18 km/h en promedio)
    const factor = 0.90 - ((gradePercent - 2) * 0.10);
    speed = Math.max(baseSpeed * factor, 11.0);
  } else if (gradePercent <= 12) {
    // Subida pronunciada (+6% a +12%)
    // Caída sensible a 7 - 11 km/h
    const factor = 0.50 - ((gradePercent - 6) * 0.04);
    speed = Math.max(baseSpeed * factor, 6.5);
  } else {
    // Subida extrema (> +12%)
    speed = Math.max(baseSpeed * 0.25, 4.5);
  }

  return Math.round(speed * 10) / 10;
}

/**
 * Calcula el MET (Equivalente Metabólico) según la pendiente y velocidad.
 * Referencias Ainsworth et al. (2011):
 * - Ciclismo plano moderado: ~ 6.0 a 8.0 METs
 * - Ciclismo subida moderada (2% a 6%): ~ 8.5 a 12.0 METs
 * - Ciclismo subida pronunciada (> 6%): ~ 12.0 a 16.0 METs
 * - Ciclismo en bajada (< -2%): ~ 3.5 a 4.5 METs
 *
 * @param {number} gradePercent - Pendiente en porcentaje
 * @param {number} [speedKmh] - Velocidad actual/estimada en km/h
 * @returns {number} Valor MET
 */
function getMetForGrade(gradePercent, speedKmh = null) {
  let met;

  if (gradePercent < -2) {
    // Bajada: menor resistencia metabólica, pedaleo suave o recuperación
    // Cuanto más empinada la bajada, menor pedaleo activo
    if (gradePercent <= -6) {
      met = 3.5;
    } else {
      // Entre -2% y -6%, interpolación lineal de 4.5 a 3.5
      const ratio = (Math.abs(gradePercent) - 2) / 4;
      met = 4.5 - ratio * 1.0;
    }
  } else if (gradePercent <= 2) {
    // Terreno plano (-2% a +2%)
    // Base 6.0 a 8.0 según velocidad o pendiente neutra
    if (speedKmh) {
      if (speedKmh < 16) met = 6.0;
      else if (speedKmh <= 22) met = 7.0;
      else if (speedKmh <= 26) met = 8.0;
      else met = 9.0;
    } else {
      // Si no se pasa velocidad, ponderar suavemente entre 6.8 y 7.5
      met = 6.8 + (gradePercent * 0.3);
    }
  } else if (gradePercent <= 6) {
    // Subida moderada (2% a 6%): aumento progresivo 8.5 a 12.0
    const ratio = (gradePercent - 2) / 4.0; // 0 en 2%, 1 en 6%
    met = 8.5 + ratio * (12.0 - 8.5);
  } else {
    // Subida pronunciada (> 6%): MET elevado 12.0 a 16.0
    if (gradePercent >= 14) {
      met = 16.0;
    } else {
      const ratio = (gradePercent - 6) / 8.0; // 0 en 6%, 1 en 14%
      met = 12.0 + ratio * (16.0 - 12.0);
    }
  }

  return Math.round(met * 10) / 10;
}

/**
 * Calcula las calorías quemadas por un esfuerzo sostenido:
 * kCal = MET * (peso_usuario + peso_bicicleta) * tiempo_horas
 *
 * @param {number} met - Equivalente Metabólico
 * @param {number} totalWeightKg - Peso total (ciclista + bicicleta)
 * @param {number} timeHours - Duración en horas
 * @returns {number} Calorías quemadas (kCal)
 */
function calculateCalories(met, totalWeightKg, timeHours) {
  if (totalWeightKg <= 0 || timeHours <= 0) return 0;
  const kcal = met * totalWeightKg * timeHours;
  return Math.round(kcal * 10) / 10;
}

/**
 * Analiza un conjunto de segmentos de ruta para determinar kCal totales y ETA
 *
 * @param {Array<{ distanceMeters: number, gradePercent: number }>} segments
 * @param {number} userWeightKg - Peso del ciclista en kg
 * @param {number} bikeWeightKg - Peso de la bicicleta en kg
 * @param {string} bikeType - Tipo de bicicleta
 * @returns {Object} Desglose total de tiempo, MET promedio y kCal
 */
function computeRouteEnergyAndETA(segments, userWeightKg, bikeWeightKg, bikeType = 'ruta') {
  const totalWeight = userWeightKg + bikeWeightKg;
  let totalTimeHours = 0;
  let totalKcal = 0;
  let totalDistanceMeters = 0;
  let weightedMetSum = 0;

  const segmentBreakdown = {
    downhill: { distanceKm: 0, timeMinutes: 0, kcal: 0 },
    flat: { distanceKm: 0, timeMinutes: 0, kcal: 0 },
    moderateClimb: { distanceKm: 0, timeMinutes: 0, kcal: 0 },
    steepClimb: { distanceKm: 0, timeMinutes: 0, kcal: 0 }
  };

  segments.forEach((seg) => {
    const distM = Math.max(0, seg.distanceMeters || 0);
    const distKm = distM / 1000;
    const grade = seg.gradePercent || 0;

    const speed = estimateSpeedForGrade(grade, bikeType);
    const timeHours = speed > 0 ? distKm / speed : 0;
    const timeMin = timeHours * 60;
    const met = getMetForGrade(grade, speed);
    const kcal = calculateCalories(met, totalWeight, timeHours);

    totalDistanceMeters += distM;
    totalTimeHours += timeHours;
    totalKcal += kcal;
    weightedMetSum += met * distKm;

    // Clasificación por tipo de pendiente
    if (grade < -2) {
      segmentBreakdown.downhill.distanceKm += distKm;
      segmentBreakdown.downhill.timeMinutes += timeMin;
      segmentBreakdown.downhill.kcal += kcal;
    } else if (grade <= 2) {
      segmentBreakdown.flat.distanceKm += distKm;
      segmentBreakdown.flat.timeMinutes += timeMin;
      segmentBreakdown.flat.kcal += kcal;
    } else if (grade <= 6) {
      segmentBreakdown.moderateClimb.distanceKm += distKm;
      segmentBreakdown.moderateClimb.timeMinutes += timeMin;
      segmentBreakdown.moderateClimb.kcal += kcal;
    } else {
      segmentBreakdown.steepClimb.distanceKm += distKm;
      segmentBreakdown.steepClimb.timeMinutes += timeMin;
      segmentBreakdown.steepClimb.kcal += kcal;
    }
  });

  const totalDistanceKm = totalDistanceMeters / 1000;
  const avgMet = totalDistanceKm > 0 ? (weightedMetSum / totalDistanceKm) : 6.8;
  const avgSpeedKmh = totalTimeHours > 0 ? (totalDistanceKm / totalTimeHours) : 20.0;

  // Redondeos limpios
  return {
    distanceKm: Math.round(totalDistanceKm * 100) / 100,
    etaMinutes: Math.round(totalTimeHours * 60 * 10) / 10,
    totalKcal: Math.round(totalKcal * 10) / 10,
    averageSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
    averageMet: Math.round(avgMet * 10) / 10,
    breakdown: {
      downhill: {
        distanceKm: Math.round(segmentBreakdown.downhill.distanceKm * 100) / 100,
        timeMinutes: Math.round(segmentBreakdown.downhill.timeMinutes * 10) / 10,
        kcal: Math.round(segmentBreakdown.downhill.kcal * 10) / 10
      },
      flat: {
        distanceKm: Math.round(segmentBreakdown.flat.distanceKm * 100) / 100,
        timeMinutes: Math.round(segmentBreakdown.flat.timeMinutes * 10) / 10,
        kcal: Math.round(segmentBreakdown.flat.kcal * 10) / 10
      },
      moderateClimb: {
        distanceKm: Math.round(segmentBreakdown.moderateClimb.distanceKm * 100) / 100,
        timeMinutes: Math.round(segmentBreakdown.moderateClimb.timeMinutes * 10) / 10,
        kcal: Math.round(segmentBreakdown.moderateClimb.kcal * 10) / 10
      },
      steepClimb: {
        distanceKm: Math.round(segmentBreakdown.steepClimb.distanceKm * 100) / 100,
        timeMinutes: Math.round(segmentBreakdown.steepClimb.timeMinutes * 10) / 10,
        kcal: Math.round(segmentBreakdown.steepClimb.kcal * 10) / 10
      }
    }
  };
}

module.exports = {
  BASE_SPEEDS_BY_BIKE_TYPE,
  estimateSpeedForGrade,
  getMetForGrade,
  calculateCalories,
  computeRouteEnergyAndETA
};
