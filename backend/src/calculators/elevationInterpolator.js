/**
 * elevationInterpolator.js
 * Módulo para rellenar vacíos altimétricos (null, NaN, undefined) y asegurar
 * continuidad altimétrica en perfiles de ruta GPS/API.
 * Mitigación directa de RT-02.
 */

function isValidElevation(val) {
  return typeof val === 'number' && !isNaN(val) && isFinite(val);
}

/**
 * Interpola y normaliza una serie de puntos de elevación.
 * Puede recibir:
 * 1) Array de números: [100, null, 120, NaN, 140]
 * 2) Array de objetos: [{ distance: 0, elevation: 100 }, { distance: 100, elevation: null }, ...]
 *
 * @param {Array<number|Object>} points - Puntos altimétricos brutos
 * @param {Object} options - Opciones de configuración (ej. defaultElevation si todo es nulo)
 * @returns {Array<Object>} Lista de puntos normalizados con { distance, elevation }
 */
function interpolateElevationProfile(points, options = {}) {
  const { defaultElevation = 10 } = options;

  if (!Array.isArray(points) || points.length === 0) {
    return [];
  }

  // Normalizar a formato uniforme [{ distance, elevation }]
  let currentDist = 0;
  const normalized = points.map((p, index) => {
    if (typeof p === 'number' || p === null || p === undefined) {
      const dist = index * 100; // Paso estándar de 100m si es solo serie numérica
      return {
        distance: dist,
        elevation: isValidElevation(p) ? p : null
      };
    }

    if (typeof p === 'object') {
      const dist = typeof p.distance === 'number' && !isNaN(p.distance) ? p.distance : currentDist;
      currentDist = dist + 100;
      const elev = isValidElevation(p.elevation)
        ? p.elevation
        : (isValidElevation(p.ele) ? p.ele : (isValidElevation(p.alt) ? p.alt : null));
      return {
        ...p,
        distance: dist,
        elevation: elev
      };
    }

    return { distance: index * 100, elevation: null };
  });

  // Encontrar índices válidos
  const validIndices = [];
  for (let i = 0; i < normalized.length; i++) {
    if (normalized[i].elevation !== null) {
      validIndices.push(i);
    }
  }

  // Caso 1: Ningún punto tiene elevación válida
  if (validIndices.length === 0) {
    return normalized.map((p) => ({
      ...p,
      elevation: defaultElevation,
      interpolated: true
    }));
  }

  // Caso 2: Al menos un punto es válido
  const firstValidIndex = validIndices[0];
  const lastValidIndex = validIndices[validIndices.length - 1];

  // Rellenar valores antes del primer índice válido (propagación hacia atrás)
  for (let i = 0; i < firstValidIndex; i++) {
    normalized[i].elevation = normalized[firstValidIndex].elevation;
    normalized[i].interpolated = true;
  }

  // Rellenar valores después del último índice válido (propagación hacia adelante)
  for (let i = lastValidIndex + 1; i < normalized.length; i++) {
    normalized[i].elevation = normalized[lastValidIndex].elevation;
    normalized[i].interpolated = true;
  }

  // Interpolar linealmente entre pares de puntos válidos consecutivos
  for (let v = 0; v < validIndices.length - 1; v++) {
    const idxA = validIndices[v];
    const idxB = validIndices[v + 1];

    if (idxB - idxA > 1) {
      const elevA = normalized[idxA].elevation;
      const elevB = normalized[idxB].elevation;
      const distA = normalized[idxA].distance;
      const distB = normalized[idxB].distance;

      const distDelta = distB - distA;

      for (let k = idxA + 1; k < idxB; k++) {
        let ratio;
        if (distDelta > 0) {
          ratio = (normalized[k].distance - distA) / distDelta;
        } else {
          ratio = (k - idxA) / (idxB - idxA);
        }

        normalized[k].elevation = Math.round((elevA + ratio * (elevB - elevA)) * 100) / 100;
        normalized[k].interpolated = true;
      }
    }
  }

  return normalized;
}

/**
 * Suaviza el perfil altimétrico utilizando un Kernel Gaussiano de ventana adaptativa (50-100m).
 * Elimina ruido discreto de DEM/GPS (escalonamiento, picos y valles espurios)
 * que generan pendientes irreales de hasta -105.5%.
 *
 * @param {Array<Object>} points - Puntos con { distance, elevation }
 * @param {Object} [options]
 * @param {number} [options.windowDistanceMeters=80] - Ventana de suavizado espacial en metros (~50-100m)
 * @returns {Array<Object>} Lista de puntos con elevación suavizada físicamente
 */
function smoothElevationProfile(points, options = {}) {
  const { windowDistanceMeters = 80 } = options;

  if (!Array.isArray(points) || points.length <= 2) {
    return points ? points.map((p) => ({ ...p })) : [];
  }

  const n = points.length;
  const smoothed = [];
  const sigma = Math.max(10, windowDistanceMeters / 2.5); // Desviación estándar espacial

  for (let i = 0; i < n; i++) {
    const current = points[i];
    const currentDist = typeof current.distance === 'number' ? current.distance : i * 100;

    let weightedElevSum = 0;
    let weightSum = 0;

    for (let j = 0; j < n; j++) {
      const p = points[j];
      const pDist = typeof p.distance === 'number' ? p.distance : j * 100;
      const distDelta = pDist - currentDist;

      if (Math.abs(distDelta) <= windowDistanceMeters * 1.5) {
        // Ponderación kernel Gaussiano: exp(-distDelta^2 / (2 * sigma^2))
        const weight = Math.exp(-(distDelta * distDelta) / (2 * sigma * sigma));
        weightedElevSum += (p.elevation || 0) * weight;
        weightSum += weight;
      }
    }

    let smoothedElevation = weightSum > 0 ? weightedElevSum / weightSum : (current.elevation || 0);

    // Preservar fielmente los extremos inicial y final de la ruta
    if (i === 0 || i === n - 1) {
      smoothedElevation = current.elevation;
    } else {
      const distFromStart = currentDist - (points[0].distance || 0);
      const distFromEnd = (points[n - 1].distance || 0) - currentDist;
      const blendSpan = windowDistanceMeters * 0.5;

      if (distFromStart < blendSpan && distFromStart > 0) {
        const factor = distFromStart / blendSpan;
        smoothedElevation = points[0].elevation * (1 - factor) + smoothedElevation * factor;
      } else if (distFromEnd < blendSpan && distFromEnd > 0) {
        const factor = distFromEnd / blendSpan;
        smoothedElevation = points[n - 1].elevation * (1 - factor) + smoothedElevation * factor;
      }
    }

    smoothed.push({
      ...current,
      elevation: Math.round(smoothedElevation * 10) / 10,
      smoothed: true
    });
  }

  return smoothed;
}

module.exports = {
  isValidElevation,
  interpolateElevationProfile,
  smoothElevationProfile
};
