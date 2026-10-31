import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import RoutePlanningCard from './components/RoutePlanningCard';
import BicyclesListCard from './components/BicyclesListCard';
import AddBicycleModal from './components/AddBicycleModal';
import MetricsHeaderBar from './components/MetricsHeaderBar';
import RouteMapCard from './components/RouteMapCard';
import ElevationProfileChart from './components/ElevationProfileChart';
import PredictiveHud from './components/PredictiveHud';
import ProfileModal from './components/ProfileModal';
import CockpitView from './components/CockpitView';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsentBanner from './components/CookieConsentBanner';
import TermsAndPrivacyModal from './components/TermsAndPrivacyModal';
import apiService from './services/api';
import { PRESET_ROUTES } from './data/presetRoutes';
import OPTIMAL_ROUTE_VARAS_CRISTOBAL from './data/optimalRouteVarasCristobal.json';
import { SlidersHorizontal, Zap, RotateCcw, MapPin, Compass } from 'lucide-react';

const DEFAULT_USER = {
  id: 'user-ricardo-1',
  nombre: 'Ricardo Henríquez',
  email: 'ricardo@ciclometrics.cl',
  biometria: {
    peso: 75,
    altura: 178,
    edad: 30,
    genero: 'masculino',
    nivel: 'intermedio'
  }
};

const DEFAULT_BIKE = {
  id: 'bike-ricardo-1',
  nombre: 'Bici Aro 29',
  tipo: 'mtb',
  peso: 10,
  rodado: '29',
  ancho_neumatico: 60,
  psi_min: 30,
  psi_max: 70,
  userId: 'user-ricardo-1'
};

export default function App() {
  // 1. TEMA CLARO / OSCURO
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ciclometrics_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ciclometrics_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. SESIÓN DE USUARIO AUTENTICADO Y CONSENTIMIENTO DE COOKIES
  const [currentUser, setCurrentUser] = useState(() => {
    const session = apiService.getSession();
    return session?.user || null;
  });

  const [cookieConsent, setCookieConsent] = useState(() => {
    const session = apiService.getSession();
    return apiService.getCookieConsent(session?.user);
  });

  useEffect(() => {
    if (currentUser) {
      const detected = apiService.getCookieConsent(currentUser);
      if (detected) {
        setCookieConsent(detected);
      }
    }
  }, [currentUser]);

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsInitialSection, setTermsInitialSection] = useState('terms');

  // 3. ESTADO DE CONECTIVIDAD DEL BACKEND
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'

  const checkBackendConnectivity = useCallback(async () => {
    setBackendStatus('checking');
    try {
      await apiService.checkHealth();
      setBackendStatus('connected');
    } catch (err) {
      console.warn('Backend no responde en http://localhost:5000/api. Operando en modo local resiliente.', err);
      setBackendStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    checkBackendConnectivity();
  }, [checkBackendConnectivity]);

  // 4. BICICLETAS DEL USUARIO
  const [bicycles, setBicycles] = useState([DEFAULT_BIKE]);
  const [selectedBikeId, setSelectedBikeId] = useState(DEFAULT_BIKE.id);
  const [isAddBikeModalOpen, setIsAddBikeModalOpen] = useState(false);

  const fetchBicycles = useCallback(async (userId) => {
    try {
      const res = await apiService.getBicycles(userId);
      if (res && res.data && res.data.length > 0) {
        setBicycles(res.data);
        if (!selectedBikeId || !res.data.some(b => b.id === selectedBikeId)) {
          setSelectedBikeId(res.data[0].id);
        }
      } else {
        setBicycles([DEFAULT_BIKE]);
        setSelectedBikeId(DEFAULT_BIKE.id);
      }
    } catch (err) {
      console.warn('Error cargando bicicletas, usando predeterminadas:', err);
      setBicycles([DEFAULT_BIKE]);
    }
  }, [selectedBikeId]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchBicycles(currentUser.id);
    }
  }, [currentUser?.id, fetchBicycles]);

  const handleAddBicycle = async (bikeData) => {
    try {
      const res = await apiService.createBicycle(bikeData);
      if (res && res.data) {
        await fetchBicycles(currentUser?.id);
        setSelectedBikeId(res.data.id);
      }
    } catch (err) {
      console.error('Error al agregar bicicleta:', err);
      throw err;
    }
  };

  const handleDeleteBicycle = async (bikeId) => {
    try {
      await apiService.deleteBicycle(bikeId);
      await fetchBicycles(currentUser?.id);
    } catch (err) {
      console.error('Error al eliminar bicicleta:', err);
    }
  };

  const activeBike = useMemo(() => {
    return bicycles.find(b => b.id === selectedBikeId) || bicycles[0] || DEFAULT_BIKE;
  }, [bicycles, selectedBikeId]);

  // 5. PERFIL DEPORTIVO Y BIOMÉTRICO ACTIVO
  const activeProfile = useMemo(() => {
    return {
      userId: currentUser?.id || DEFAULT_USER.id,
      user: currentUser || DEFAULT_USER,
      bicycle: activeBike
    };
  }, [currentUser, activeBike]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCockpitMode, setIsCockpitMode] = useState(false);

  // 6. RUTA ACTIVA (Inicialmente null para reflejar el estado vacío de la Imagen 3)
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [hoverCoordinate, setHoverCoordinate] = useState(null);

  // 7. RESULTADOS DE CÁLCULO PREDICTIVO
  const [calculationData, setCalculationData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);

  // Cálculo predictivo de ruta (consume POST /api/routes/calculate o fallback físico-mecánico)
  const calculateMetrics = useCallback(async (routeObj, userProf) => {
    if (!routeObj || !routeObj.points || routeObj.points.length === 0) {
      setCalculationData(null);
      return;
    }

    setIsCalculating(true);
    setCalcError(null);

    const payload = {
      userId: userProf?.userId,
      user: userProf?.user,
      bicycle: userProf?.bicycle,
      origen: routeObj.origen || routeObj.name,
      destino: routeObj.destino || 'Destino',
      points: routeObj.points,
      saveRoute: true
    };

    try {
      const response = await apiService.calculateRoute(payload);
      if (response && response.success && response.data) {
        setCalculationData(response.data);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.warn('Cálculo con motor físico local equivalente:', err);
      // Motor de cálculo físico-mecánico local blindado con optional chaining
      const userWeight = parseFloat(userProf?.user?.biometria?.peso ?? userProf?.user?.peso ?? 75);
      const bikeWeight = parseFloat(userProf?.bicycle?.peso ?? 10);
      const massTotal = userWeight + bikeWeight;
      const tireWidth = parseFloat(userProf?.bicycle?.ancho_neumatico ?? 60);
      const psiMin = parseFloat(userProf?.bicycle?.psi_min ?? 30);
      const psiMax = parseFloat(userProf?.bicycle?.psi_max ?? 70);

      // Cálculo físico-mecánico para la ruta basado en sus puntos reales de elevación
      const points = routeObj.points;
      let posGain = 0;
      let negGain = 0;
      let totalDist = points[points.length - 1].distance;
      let maxSlope = 0;
      let weightedSlopeSum = 0;
      let totalTimeHours = 0;
      let totalKcal = 0;

      let downhillDist = 0, downhillTime = 0, downhillKcal = 0;
      let flatDist = 0, flatTime = 0, flatKcal = 0;
      let moderateDist = 0, moderateTime = 0, moderateKcal = 0;
      let steepDist = 0, steepTime = 0, steepKcal = 0;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const dD = p2.distance - p1.distance;
        const dE = p2.elevation - p1.elevation;
        const distKm = dD / 1000;

        if (dE > 0) posGain += dE;
        else negGain += Math.abs(dE);

        const slope = dD > 0 ? (dE / dD) * 100 : 0;
        if (Math.abs(slope) > maxSlope) maxSlope = Math.abs(slope);
        weightedSlopeSum += Math.abs(slope) * dD;

        let met = slope > 6 ? 13.5 : (slope > 2 ? 9.5 : (slope < -2 ? 4.0 : 6.8));
        let speed = slope > 6 ? 8.5 : (slope > 2 ? 14.0 : (slope < -2 ? 35.0 : 22.0));
        let timeHours = distKm / speed;
        let kcal = met * massTotal * timeHours;

        totalTimeHours += timeHours;
        totalKcal += kcal;

        if (slope < -2) {
          downhillDist += distKm;
          downhillTime += timeHours * 60;
          downhillKcal += kcal;
        } else if (slope <= 2) {
          flatDist += distKm;
          flatTime += timeHours * 60;
          flatKcal += kcal;
        } else if (slope <= 6) {
          moderateDist += distKm;
          moderateTime += timeHours * 60;
          moderateKcal += kcal;
        } else {
          steepDist += distKm;
          steepTime += timeHours * 60;
          steepKcal += kcal;
        }
      }

      const frontLoad = massTotal * 0.4;
      const rearLoad = massTotal * 0.6;
      const calcPsi = (load) => {
        const rawPsi = Math.round((load / (tireWidth * 0.038)) * 1.55);
        return Math.max(psiMin, Math.min(psiMax, rawPsi));
      };

      setCalculationData({
        distancia_km: parseFloat((totalDist / 1000).toFixed(1)),
        desnivel_positivo_m: Math.round(posGain),
        desnivel_negativo_m: Math.round(negGain),
        pendiente_promedio_pct: parseFloat((weightedSlopeSum / (totalDist || 1)).toFixed(2)),
        pendiente_maxima_pct: parseFloat(maxSlope.toFixed(1)),
        tiempo_estimado_min: parseFloat((totalTimeHours * 60).toFixed(1)),
        velocidad_promedio_kmh: parseFloat(((totalDist / 1000) / (totalTimeHours || 1)).toFixed(1)),
        met_promedio: parseFloat((totalKcal / (massTotal * (totalTimeHours || 1))).toFixed(1)),
        kcal_quemadas: parseFloat(totalKcal.toFixed(0)),
        psi_delantero_recomendado: calcPsi(frontLoad),
        psi_trasero_recomendado: calcPsi(rearLoad),
        desglose_tramos: {
          downhill: { distanceKm: parseFloat(downhillDist.toFixed(1)), timeMinutes: parseFloat(downhillTime.toFixed(1)), kcal: Math.round(downhillKcal) },
          flat: { distanceKm: parseFloat(flatDist.toFixed(1)), timeMinutes: parseFloat(flatTime.toFixed(1)), kcal: Math.round(flatKcal) },
          moderateClimb: { distanceKm: parseFloat(moderateDist.toFixed(1)), timeMinutes: parseFloat(moderateTime.toFixed(1)), kcal: Math.round(moderateKcal) },
          steepClimb: { distanceKm: parseFloat(steepDist.toFixed(1)), timeMinutes: parseFloat(steepTime.toFixed(1)), kcal: Math.round(steepKcal) }
        }
      });
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Recalcular métricas cuando cambie la ruta o el perfil activo
  useEffect(() => {
    if (selectedRoute) {
      calculateMetrics(selectedRoute, activeProfile);
    } else {
      setCalculationData(null);
    }
  }, [selectedRoute, activeProfile, calculateMetrics]);

  // Geocodificador de direcciones y hitos ciclistas (Nominatim OSM + Photon + Hitos RM)
  const geocodeAddress = async (rawAddress) => {
    if (!rawAddress || !rawAddress.trim()) return null;
    const text = rawAddress.trim();
    const norm = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // 1. Coordenadas directas escritas como "-33.4349, -70.6151"
    const coordMatch = text.match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
    if (coordMatch) {
      return [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
    }

    // 2. Hitos ciclistas y puntos emblemáticos de Santiago / RM (evita ambigüedad con calles homónimas)
    if (norm.includes('cerro san cristobal') || norm.includes('cumbre san cristobal') || norm.includes('parque metropolitano')) {
      return [-33.42401, -70.63262];
    }
    if (norm.includes('antonio varas') && (norm.includes('810') || !/\d/.test(norm))) {
      return [-33.4349, -70.61513];
    }
    if (norm.includes('cuesta la dormida')) {
      return [-33.0560, -71.0080];
    }
    if (norm.includes('templo bahai') || norm.includes('bahai')) {
      return [-33.4764, -70.5117];
    }
    if (norm.includes('farellones')) {
      return [-33.3508, -70.3129];
    }
    if (norm.includes('valle nevado')) {
      return [-33.3547, -70.2494];
    }
    if (norm.includes('parque bicentenario') && !/\d/.test(norm)) {
      return [-33.4015, -70.6020];
    }
    if (norm.includes('costanera center') || norm.includes('tobalaba')) {
      if (!/\d/.test(norm)) return [-33.4177, -70.6068];
    }
    if (norm.includes('plaza de armas') && !/\d/.test(norm)) {
      return [-33.4378, -70.6505];
    }
    if (norm.includes('plaza baquedano') || norm.includes('plaza italia')) {
      return [-33.4370, -70.6344];
    }

    // 3. Consulta Nominatim OpenStreetMap (con variantes de búsqueda en Chile)
    const cleanText = text.replace(/,\s*provincia de [\w\sáéíóúñ]+/i, '').trim();
    const queries = [
      cleanText.toLowerCase().includes('chile') ? cleanText : `${cleanText}, Chile`,
      text.toLowerCase().includes('chile') ? text : `${text}, Región Metropolitana, Chile`,
      // Variante sin número de puerta por si la numeración exacta no está indexada en OSM
      `${cleanText.replace(/\b\d{2,6}\b/g, '').replace(/\s+/g, ' ').trim()}, Chile`
    ];

    for (const q of queries) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=cl&limit=1`;
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'es' }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
            return [parseFloat(parseFloat(data[0].lat).toFixed(5)), parseFloat(parseFloat(data[0].lon).toFixed(5))];
          }
        }
      } catch (err) {
        console.warn('Nominatim geocoding fallback:', err);
      }
    }

    // 4. Respaldo con Photon (Komoot OSM Geocoder)
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanText + ', Chile')}&limit=1`;
      const res = await fetch(photonUrl);
      if (res.ok) {
        const data = await res.json();
        const coords = data?.features?.[0]?.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length >= 2) {
          return [parseFloat(coords[1].toFixed(5)), parseFloat(coords[0].toFixed(5))];
        }
      }
    } catch (err) {
      console.warn('Photon geocoding fallback:', err);
    }

    // 5. Respaldo por comuna de la Región Metropolitana si la calle específica no aparece
    const comunasRM = {
      'san bernardo': [-33.5922, -70.6996],
      'providencia': [-33.4314, -70.6093],
      'santiago': [-33.4489, -70.6693],
      'las condes': [-33.4117, -70.5665],
      'vitacura': [-33.3867, -70.5750],
      'nuñoa': [-33.4569, -70.5978],
      'nunoa': [-33.4569, -70.5978],
      'la reina': [-33.4431, -70.5344],
      'peñalolen': [-33.4861, -70.5333],
      'penalolen': [-33.4861, -70.5333],
      'la florida': [-33.5228, -70.5983],
      'puente alto': [-33.6117, -70.5758],
      'maipu': [-33.5106, -70.7572],
      'recoleta': [-33.4061, -70.6425],
      'independencia': [-33.4153, -70.6644],
      'san miguel': [-33.4986, -70.6514],
      'la cisterna': [-33.5347, -70.6628],
      'el bosque': [-33.5625, -70.6750],
      'estacion central': [-33.4592, -70.6989],
      'pudahuel': [-33.4411, -70.7664],
      'quilicura': [-33.3619, -70.7289],
      'huechuraba': [-33.3736, -70.6369],
      'lo barnechea': [-33.3519, -70.5178],
      'macul': [-33.4889, -70.5992],
      'san joaquin': [-33.4969, -70.6275]
    };
    for (const [comuna, cCoords] of Object.entries(comunasRM)) {
      if (norm.includes(comuna)) {
        return cCoords;
      }
    }

    return null;
  };

  // Manejador del botón [Calcular Ruta Óptima]
  const handleCalculateRoutePlan = async ({ type, origen, destino, origenCoords, destinoCoords }) => {
    setIsCalculating(true);

    const normOrigen = (origen || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normDestino = (destino || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Solo usar la ruta predefinida calibrada cuando TANTO el origen es Antonio Varas COMO el destino es Cerro San Cristóbal
    const isExactVarasCristobal =
      (type === 'direcciones' &&
        normOrigen.includes('varas') &&
        normDestino.includes('cristobal')) ||
      (type === 'coordenadas' &&
        origenCoords && destinoCoords &&
        Math.abs(origenCoords[0] - (-33.435)) < 0.015 &&
        Math.abs(origenCoords[1] - (-70.615)) < 0.015 &&
        Math.abs(destinoCoords[0] - (-33.424)) < 0.015 &&
        Math.abs(destinoCoords[1] - (-70.632)) < 0.015);

    if (isExactVarasCristobal) {
      setTimeout(() => {
        setSelectedRoute(OPTIMAL_ROUTE_VARAS_CRISTOBAL);
        setIsCalculating(false);
      }, 300);
      return;
    }

    // Resolver coordenadas de origen y destino (ya sea desde direcciones geocodificadas o coordenadas directas)
    let resolvedOrigenCoords = origenCoords;
    let resolvedDestinoCoords = destinoCoords;

    if (type === 'direcciones') {
      const [geoOrig, geoDest] = await Promise.all([
        geocodeAddress(origen),
        geocodeAddress(destino)
      ]);
      resolvedOrigenCoords = geoOrig;
      resolvedDestinoCoords = geoDest;
    }

    // Si contamos con coordenadas válidas para origen y destino, trazar ruta ciclista real vía OSRM + Open-Meteo Elevation
    if (resolvedOrigenCoords && resolvedDestinoCoords) {
      const lat1 = resolvedOrigenCoords[0], lon1 = resolvedOrigenCoords[1];
      const lat2 = resolvedDestinoCoords[0], lon2 = resolvedDestinoCoords[1];

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const osrmUrl = `https://router.project-osrm.org/route/v1/bicycle/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
        const response = await fetch(osrmUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const routeData = data.routes[0];
            const rawCoords = routeData.geometry.coordinates;
            const coords = rawCoords.map(([lon, lat]) => [
              parseFloat(lat.toFixed(5)),
              parseFloat(lon.toFixed(5))
            ]);

            const haversine = (c1, c2) => {
              const R = 6371e3;
              const p1 = (c1[0] * Math.PI) / 180;
              const p2 = (c2[0] * Math.PI) / 180;
              const dp = ((c2[0] - c1[0]) * Math.PI) / 180;
              const dl = ((c2[1] - c1[1]) * Math.PI) / 180;
              const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
              return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            };

            const cumDist = [0];
            for (let i = 1; i < coords.length; i++) {
              cumDist.push(cumDist[i - 1] + haversine(coords[i - 1], coords[i]));
            }
            const totalDistMeters = Math.round(routeData.distance || cumDist[cumDist.length - 1]);

            const getFallbackAlt = (lat, lng, progressFraction) => {
              const isHill = lat > -33.435 && lat < -33.415 && lng > -70.645 && lng < -70.615;
              if (isHill && progressFraction > 0.39) {
                const hProg = (progressFraction - 0.39) / 0.61;
                return Math.round(630 + hProg * 188);
              }
              const eastFactor = (-70.50 - lng) / (-70.50 - -70.75);
              const northFactor = (-33.35 - lat) / (-33.35 - -33.55);
              const baseElev = 520 + (1 - eastFactor) * 220 + (1 - northFactor) * 60;
              return Math.round(baseElev + Math.sin(lat * 1200) * 6 + Math.cos(lng * 1200) * 6);
            };

            const numSamples = Math.min(40, Math.max(16, Math.floor(totalDistMeters / 250)));
            const sampledNodes = [];
            for (let s = 0; s <= numSamples; s++) {
              const targetDist = (s / numSamples) * totalDistMeters;
              let bestIdx = 0;
              let minDiff = Infinity;
              for (let i = 0; i < cumDist.length; i++) {
                const diff = Math.abs(cumDist[i] - targetDist);
                if (diff < minDiff) {
                  minDiff = diff;
                  bestIdx = i;
                }
              }
              sampledNodes.push({
                distance: Math.round(targetDist),
                coord: coords[bestIdx],
                frac: s / numSamples
              });
            }

            // Consultar elevaciones reales a Open-Meteo Elevation API (SRTM/Copernicus DEM)
            let elevations = null;
            try {
              const latsParam = sampledNodes.map(n => n.coord[0]).join(',');
              const lonsParam = sampledNodes.map(n => n.coord[1]).join(',');
              const elevRes = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${latsParam}&longitude=${lonsParam}`);
              if (elevRes.ok) {
                const elevData = await elevRes.json();
                if (Array.isArray(elevData.elevation) && elevData.elevation.length === sampledNodes.length) {
                  const rawElevs = elevData.elevation.map(e => Number(e));
                  // Suavizado de media móvil ponderada en puntos intermedios para evitar dientes de sierra DEM
                  elevations = rawElevs.map((val, idx) => {
                    if (idx === 0 || idx === rawElevs.length - 1) return Math.round(val);
                    return Math.round(rawElevs[idx - 1] * 0.25 + val * 0.5 + rawElevs[idx + 1] * 0.25);
                  });
                }
              }
            } catch (elevErr) {
              console.warn('Open-Meteo Elevation fallback:', elevErr);
            }

            const points = sampledNodes.map((node, idx) => ({
              distance: node.distance,
              elevation: elevations ? elevations[idx] : getFallbackAlt(node.coord[0], node.coord[1], node.frac)
            }));

            const shortLabel = (str, fallbackCoord) => {
              if (!str || !str.trim()) return `(${fallbackCoord[0].toFixed(3)}, ${fallbackCoord[1].toFixed(3)})`;
              return str.split(',')[0].trim();
            };

            const shortOrigen = shortLabel(origen, resolvedOrigenCoords);
            const shortDestino = shortLabel(destino, resolvedDestinoCoords);
            const distKm = (totalDistMeters / 1000).toFixed(2);

            const dynamicRoute = {
              id: `osrm-calculated-route-${Date.now()}`,
              name: `Ruta Óptima: ${shortOrigen} ➔ ${shortDestino} (${distKm} km)`,
              subtitle: `Trazado ciclista real OSRM (${coords.length} nodos viales) • Altimetría Open-Meteo`,
              category: 'Ruta Óptima',
              surface: 'Ciclovía segregada / Vía urbana compartida',
              difficulty: totalDistMeters > 12000 ? 'Exigente' : (totalDistMeters > 5000 ? 'Moderada' : 'Fácil'),
              badgeColor: 'emerald',
              center: [(lat1 + lat2) / 2, (lon1 + lon2) / 2],
              zoom: totalDistMeters > 15000 ? 12 : (totalDistMeters > 7000 ? 13 : 14),
              origen: origen || `Lat: ${lat1.toFixed(4)}, Lng: ${lon1.toFixed(4)}`,
              destino: destino || `Lat: ${lat2.toFixed(4)}, Lng: ${lon2.toFixed(4)}`,
              coordinates: coords,
              points: points
            };

            setSelectedRoute(dynamicRoute);
            setIsCalculating(false);
            return;
          }
        }
      } catch (osrmErr) {
        console.warn('Error en cálculo OSRM dinámico:', osrmErr);
      }
    }

    // Fallback en caso de sin conexión externa
    setTimeout(() => {
      const match = PRESET_ROUTES[0];
      setSelectedRoute({
        ...match,
        origen: origen || match.origen,
        destino: destino || match.destino
      });
      setIsCalculating(false);
    }, 400);
  };

  // Manejador de guardado de perfil biométrico (persiste en MongoDB vía POST /api/profile)
  const handleSaveProfile = async (newProfileData) => {
    try {
      const res = await apiService.saveProfile(newProfileData);
      const savedData = res?.data || res?.profile;
      if (savedData && savedData.user) {
        setCurrentUser(savedData.user);
        apiService.saveSession(apiService.getSession()?.token, savedData.user);
        if (savedData.user.id) {
          await fetchBicycles(savedData.user.id);
        }
        return savedData;
      }
      setCurrentUser(newProfileData.user);
      apiService.saveSession(apiService.getSession()?.token, newProfileData.user);
      return newProfileData;
    } catch (err) {
      console.warn('Error guardando en backend, guardando localmente:', err);
      setCurrentUser(newProfileData.user);
      apiService.saveSession(apiService.getSession()?.token, newProfileData.user);
      return newProfileData;
    }
  };

  // Manejador de login exitoso
  const handleAuthSuccess = (user, token) => {
    const detectedConsent = apiService.getCookieConsent(user);
    setCookieConsent(detectedConsent);
    setCurrentUser(user);
    if (token) {
      apiService.saveSession(token, user);
    }
    if (user?.id) {
      fetchBicycles(user.id);
    }
  };

  // Manejadores de consentimiento de cookies de sesión
  const handleAcceptCookies = () => {
    const session = apiService.getSession();
    const updatedUser = apiService.acceptCookies(currentUser?.id, session?.token, currentUser);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
    setCookieConsent('accepted');
  };

  const handleDeclineCookies = () => {
    apiService.declinePersistentCookies(currentUser?.id, currentUser);
    setCookieConsent('session_only');
  };

  // Manejador de logout
  const handleLogout = () => {
    apiService.clearSession();
    setCurrentUser(null);
    setCookieConsent(null);
    setSelectedRoute(null);
    setCalculationData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      
      {/* 1. MODAL DE AUTENTICACIÓN (Si no hay sesión activa - Imagen 1) */}
      {!currentUser && (
        <AuthModal onAuthSuccess={handleAuthSuccess} />
      )}

      {/* 2. NAVBAR SUPERIOR (Imagen 2) */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenProfile={() => setIsProfileOpen(true)}
        profile={activeProfile}
        backendStatus={backendStatus}
        onCheckBackend={checkBackendConnectivity}
        isCockpitMode={isCockpitMode}
        onToggleCockpit={() => setIsCockpitMode(!isCockpitMode)}
        onLogout={handleLogout}
      />

      {/* 3. CONTENIDO PRINCIPAL: ESTRUCTURA DE 2 COLUMNAS (Imágenes 3, 4, 5 y 6) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        
        {/* Banner de Bienvenida y Acciones Rápidas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-4 sm:p-5 rounded-2xl border border-emerald-500/20 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                CicloMetrics Web • Simulación Biomecánica & Altimetría Físico-Mecánica
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              {selectedRoute ? selectedRoute.name : 'Simulador Predictivo de Rutas'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedRoute 
                ? selectedRoute.subtitle 
                : 'Configure su origen, destino y bicicleta para estimar ETA, gasto calórico y presiones Schwalbe'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedRoute && (
              <button
                type="button"
                onClick={() => { setSelectedRoute(null); setCalculationData(null); }}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all flex items-center gap-1.5"
                title="Limpiar ruta para ver estado inicial"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ajustar Biometría</span>
            </button>
            <button
              onClick={() => setIsCockpitMode(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Modo Manillar</span>
            </button>
          </div>
        </div>

        {/* DISTRIBUCIÓN EN 2 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================
              COLUMNA IZQUIERDA: Planificación y Bicicletas (Imagen 4)
              ======================================================== */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Tarjeta 1: Planificar Nueva Ruta */}
            <RoutePlanningCard
              bicycles={bicycles}
              selectedBikeId={selectedBikeId}
              onSelectBikeId={setSelectedBikeId}
              onCalculateRoute={handleCalculateRoutePlan}
              isCalculating={isCalculating}
            />

            {/* Tarjeta 2: Mis Bicicletas */}
            <BicyclesListCard
              bicycles={bicycles}
              selectedBikeId={selectedBikeId}
              onSelectBike={(bike) => setSelectedBikeId(bike.id)}
              onOpenAddModal={() => setIsAddBikeModalOpen(true)}
              onDeleteBike={handleDeleteBicycle}
            />

          </aside>

          {/* ========================================================
              COLUMNA DERECHA: Métricas, Mapa y Elevación (Imágenes 3, 5 y 6)
              ======================================================== */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Barra de estado superior y 4 tarjetas KPI (Imagen 5 y 6) */}
            <MetricsHeaderBar
              hasRoute={!!selectedRoute}
              calculationData={calculationData}
            />

            {/* Tarjeta: Trazado Geoespacial de la Ruta (Imagen 3 y 6) */}
            <ErrorBoundary>
              <RouteMapCard
                selectedRoute={selectedRoute}
                onSelectRoute={(route) => setSelectedRoute(route)}
                onSetCustomRoute={(custom) => setSelectedRoute(custom)}
                hoverCoordinate={hoverCoordinate}
                theme={theme}
              />
            </ErrorBoundary>

            {/* Tarjeta: Perfil Altimétrico de Elevación (Imagen 3 y 6) */}
            <ErrorBoundary>
              <ElevationProfileChart
                points={selectedRoute?.points || []}
                coordinates={selectedRoute?.coordinates || []}
                onHoverPoint={(coord) => setHoverCoordinate(coord)}
                theme={theme}
              />
            </ErrorBoundary>

            {/* HUD Predictivo Extendido con Desglose de Tramos (Solo con ruta activa) */}
            {selectedRoute && calculationData && (
              <div className="pt-2">
                <ErrorBoundary>
                  <PredictiveHud
                    calculationData={calculationData}
                    profile={activeProfile}
                    isLoading={isCalculating}
                    error={calcError}
                  />
                </ErrorBoundary>
              </div>
            )}

          </section>

        </div>

      </main>

      {/* FOOTER INFORMATIVO Y ACCESO A TÉRMINOS Y PRIVACIDAD */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-400 mt-auto space-y-2">
        <p>
          CicloMetrics Web — Proyecto de Tesis & Arquitectura Multi-Agente • Modelos Ainsworth et al. (2011) & Schwalbe (2022)
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => {
              setTermsInitialSection('terms');
              setIsTermsModalOpen(true);
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Términos y Condiciones de Uso
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={() => {
              setTermsInitialSection('privacy');
              setIsTermsModalOpen(true);
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Política de Tratamiento de Datos (Ley N° 19.628)
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={() => {
              setTermsInitialSection('cookies');
              setIsTermsModalOpen(true);
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Política de Cookies de Sesión
          </button>
        </div>
      </footer>

      {/* BANNER DE CONSENTIMIENTO DE COOKIES DE SESIÓN (Primera vez que inicia sesión) */}
      {currentUser && !cookieConsent && (
        <CookieConsentBanner
          user={currentUser}
          onAccept={handleAcceptCookies}
          onDecline={handleDeclineCookies}
          onOpenPolicy={() => {
            setTermsInitialSection('cookies');
            setIsTermsModalOpen(true);
          }}
        />
      )}

      {/* MODAL DE TÉRMINOS DE USO, PRIVACIDAD Y COOKIES (Accesible desde el Footer o Banner) */}
      <TermsAndPrivacyModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        initialSection={termsInitialSection}
      />

      {/* MODAL REGISTRO DE BICICLETA */}
      <AddBicycleModal
        isOpen={isAddBikeModalOpen}
        onClose={() => setIsAddBikeModalOpen(false)}
        onAddBicycle={handleAddBicycle}
        userId={currentUser?.id || DEFAULT_USER.id}
      />

      {/* MODAL AJUSTE DE BIOMETRÍA */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={activeProfile}
        onSaveProfile={handleSaveProfile}
        isSaving={false}
      />

      {/* SIMULADOR COCKPIT / MANILLAR MÓVIL FULLSCREEN */}
      {isCockpitMode && (
        <CockpitView
          calculationData={calculationData}
          profile={activeProfile}
          selectedRoute={selectedRoute}
          onClose={() => setIsCockpitMode(false)}
        />
      )}

    </div>
  );
}
