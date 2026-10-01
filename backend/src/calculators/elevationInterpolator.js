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

module.exports = {
  isValidElevation,
  interpolateElevationProfile
};
