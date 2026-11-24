/**
 * rmCoverage.js
 * Detección de cobertura geográfica limitada a la Región Metropolitana de Santiago (RM).
 * Combina validación de metadatos administrativos (Nominatim/Photon) con un polígono geográfico
 * de la Región Metropolitana (excluyendo Valparaíso, Viña del Mar, San Antonio, Rancagua, etc.).
 */

// Polígono [lat, lng] aproximado del límite administrativo de la Región Metropolitana de Santiago
export const RM_POLYGON = [
  [-33.02, -71.06], // Tiltil / Cuesta La Dormida (borde NW)
  [-32.93, -70.68], // Chacabuco / Cuesta Chacabuco (borde N)
  [-33.00, -70.05], // Cordillera NE
  [-33.35, -69.78], // Frontera Andina Norte
  [-34.25, -69.80], // Frontera Andina Sur
  [-34.15, -70.32], // Pirque / San José de Maipo Sur
  [-33.92, -70.66], // Angostura de Paine (Este)
  [-33.92, -70.82], // Angostura de Paine (Oeste)
  [-34.18, -71.05], // Sur de Alhué
  [-34.10, -71.68], // San Pedro (SW)
  [-33.82, -71.65], // San Pedro (W)
  [-33.68, -71.38], // Melipilla (W)
  [-33.38, -71.24], // Curacaví / Túnel Zapata
  [-33.15, -71.14]  // Tiltil (W)
];

const normalizeText = (str) =>
  String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/**
 * Evalúa mediante ray-casting si un par [lat, lng] está dentro del polígono de la RM.
 * Devuelve true para coordenadas inválidas o incompletas para evitar falsos positivos al escribir.
 */
export function isCoordInRM(coord) {
  if (!Array.isArray(coord) || coord.length < 2) return true;
  const lat = Number(coord[0]);
  const lng = Number(coord[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return true;
  }

  let inside = false;
  for (let i = 0, j = RM_POLYGON.length - 1; i < RM_POLYGON.length; j = i++) {
    const [yi, xi] = RM_POLYGON[i];
    const [yj, xj] = RM_POLYGON[j];
    const intersect = (yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Evalúa metadatos administrativos (Nominatim o Photon) para determinar pertenencia a la RM.
 * Retorna boolean si es concluyente, o null si no hay suficiente información.
 */
export function isAddressMetadataInRM(address) {
  if (!address || typeof address !== 'object') return null;

  const countryCode = address.country_code || address.countrycode;
  if (countryCode && String(countryCode).toLowerCase() !== 'cl') {
    return false;
  }

  if (address['ISO3166-2-lvl4']) {
    return String(address['ISO3166-2-lvl4']).toUpperCase() === 'CL-RM';
  }

  const regionStr = address.state || address.region || '';
  if (regionStr) {
    return normalizeText(regionStr).includes('metropolitana');
  }

  return null;
}

/**
 * Determina si una ubicación puntual está fuera de la Región Metropolitana.
 */
export function isLocationOutsideRM({ coords, address, isPresetRM = false } = {}) {
  if (isPresetRM) return false;

  const meta = isAddressMetadataInRM(address);
  if (meta !== null) {
    return !meta;
  }

  return !isCoordInRM(coords);
}

/**
 * Evalúa la cobertura de una ruta completa (origen y destino) respecto a la RM.
 */
export function evaluateRouteRMCoverage({
  origenLabel,
  destinoLabel,
  origenCoords,
  destinoCoords,
  origenAddress,
  destinoAddress,
  origenForceOutside = false,
  destinoForceOutside = false,
  origenPresetRM = false,
  destinoPresetRM = false,
  isPreset = false
} = {}) {
  if (isPreset) {
    return {
      isOutsideRM: false,
      origenOutside: false,
      destinoOutside: false,
      outsidePoints: []
    };
  }

  const origenOutside = Boolean(
    origenForceOutside ||
      isLocationOutsideRM({
        coords: origenCoords,
        address: origenAddress,
        isPresetRM: Boolean(origenPresetRM)
      })
  );

  const destinoOutside = Boolean(
    destinoForceOutside ||
      isLocationOutsideRM({
        coords: destinoCoords,
        address: destinoAddress,
        isPresetRM: Boolean(destinoPresetRM)
      })
  );

  const outsidePoints = [];
  if (origenOutside) {
    outsidePoints.push({
      role: 'Origen',
      label: origenLabel || 'Origen seleccionado'
    });
  }
  if (destinoOutside) {
    outsidePoints.push({
      role: 'Destino',
      label: destinoLabel || 'Destino seleccionado'
    });
  }

  return {
    isOutsideRM: origenOutside || destinoOutside,
    origenOutside,
    destinoOutside,
    outsidePoints
  };
}
