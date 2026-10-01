/**
 * api.js - Servicio desacoplado de comunicación con el backend CicloMetrics
 * Consume los contratos expuestos por el subagente backend sin lógica de persistencia interna.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Petición genérica con manejo de timeouts y errores legibles
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || `Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.details = data.details || null;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al conectar con el servidor backend');
    }
    throw error;
  }
}

export const apiService = {
  /**
   * Verifica la conectividad y salud del backend
   */
  async checkHealth() {
    return request('/health');
  },

  /**
   * Guarda o actualiza un perfil de ciclista y bicicleta
   * @param {Object} profileData
   */
  async saveProfile(profileData) {
    return request('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  },

  /**
   * Obtiene la lista de perfiles registrados
   */
  async getProfiles() {
    return request('/profile');
  },

  /**
   * Obtiene un perfil específico por ID
   * @param {string} profileId
   */
  async getProfile(profileId) {
    return request(`/profile/${profileId}`);
  },

  /**
   * Solicita el cálculo predictivo físico-mecánico de una ruta
   * @param {Object} routeCalculationPayload
   */
  async calculateRoute(routeCalculationPayload) {
    return request('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify(routeCalculationPayload)
    });
  },

  /**
   * Obtiene una ruta por ID
   * @param {string} routeId
   */
  async getRouteById(routeId) {
    return request(`/routes/${routeId}`);
  }
};

export default apiService;
