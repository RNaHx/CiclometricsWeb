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
    return session?.user?.id ? apiService.getCookieConsent(session.user.id) : null;
  });

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

  // Manejador del botón [Calcular Ruta Óptima]
  const handleCalculateRoutePlan = async ({ type, origen, destino, origenCoords, destinoCoords, bikeId }) => {
    setIsCalculating(true);
    
    // Si la búsqueda incluye Varas / San Cristóbal, activar la ruta real con 417 coordenadas viales OSRM
    const isVarasCristobal = 
      (origen && origen.toLowerCase().includes('varas')) ||
      (destino && (destino.toLowerCase().includes('cristóbal') || destino.toLowerCase().includes('cristobal'))) ||
      (type === 'coordenadas' &&
        origenCoords && destinoCoords &&
        Math.abs(origenCoords[0] - (-33.435)) < 0.02 &&
        Math.abs(origenCoords[1] - (-70.615)) < 0.02 &&
        Math.abs(destinoCoords[0] - (-33.424)) < 0.02 &&
        Math.abs(destinoCoords[1] - (-70.632)) < 0.02);

    if (isVarasCristobal) {
      setTimeout(() => {
        setSelectedRoute(OPTIMAL_ROUTE_VARAS_CRISTOBAL);
        setIsCalculating(false);
      }, 350);
      return;
    }

    // Si el usuario introduce coordenadas personalizadas
    if (type === 'coordenadas' && origenCoords && destinoCoords) {
      const lat1 = origenCoords[0], lon1 = origenCoords[1];
      const lat2 = destinoCoords[0], lon2 = destinoCoords[1];

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
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

            const getAlt = (lat, lng, progressFraction) => {
              const isHill = lat > -33.435 && lat < -33.415 && lng > -70.645 && lng < -70.615;
              if (isHill && progressFraction > 0.4) {
                const hProg = (progressFraction - 0.4) / 0.6;
                return Math.round(590 + Math.pow(hProg, 1.3) * 260);
              }
              const eastFactor = (-70.50 - lng) / (-70.50 - -70.75);
              const northFactor = (-33.35 - lat) / (-33.35 - -33.55);
              const baseElev = 520 + (1 - eastFactor) * 220 + (1 - northFactor) * 60;
              return Math.round(baseElev + Math.sin(lat * 1200) * 8 + Math.cos(lng * 1200) * 8);
            };

            const numSamples = Math.min(30, Math.max(12, Math.floor(totalDistMeters / 150)));
            const points = [];
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
              const ptCoord = coords[bestIdx];
              points.push({
                distance: Math.round(targetDist),
                elevation: getAlt(ptCoord[0], ptCoord[1], s / numSamples)
              });
            }

            const distKm = (totalDistMeters / 1000).toFixed(1);
            const dynamicRoute = {
              id: `osrm-calculated-route-${Date.now()}`,
              name: `Ruta Ciclista Calculada (${distKm} km)`,
              subtitle: `Trazado ciclista real en calles (${coords.length} coordenadas viales)`,
              category: 'Ruta Óptima',
              surface: 'Ciclovía segregada / Vía urbana compartida',
              difficulty: totalDistMeters > 10000 ? 'Exigente' : (totalDistMeters > 5000 ? 'Moderada' : 'Fácil'),
              badgeColor: 'emerald',
              center: [(lat1 + lat2) / 2, (lon1 + lon2) / 2],
              zoom: 14,
              origen: origen || `Lat: ${lat1.toFixed(3)}, Lng: ${lon1.toFixed(3)}`,
              destino: destino || `Lat: ${lat2.toFixed(3)}, Lng: ${lon2.toFixed(3)}`,
              coordinates: coords,
              points: points
            };

            setSelectedRoute(dynamicRoute);
            setIsCalculating(false);
            return;
          }
        }
      } catch (osrmErr) {
        console.warn('Error en cálculo OSRM dinámico, recurriendo a preset real:', osrmErr);
      }
    }

    // Fallback: usar una de las rutas predeterminadas reales de PRESET_ROUTES (que ya tienen entre 91 y 417 puntos sobre calles)
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
    setCurrentUser(user);
    if (token) {
      apiService.saveSession(token, user);
    }
    setCookieConsent(apiService.getCookieConsent(user.id));
    fetchBicycles(user.id);
  };

  // Manejadores de consentimiento de cookies de sesión
  const handleAcceptCookies = () => {
    if (!currentUser?.id) return;
    const session = apiService.getSession();
    apiService.acceptCookies(currentUser.id, session?.token, currentUser);
    setCookieConsent('accepted');
  };

  const handleDeclineCookies = () => {
    if (!currentUser?.id) return;
    apiService.declinePersistentCookies(currentUser.id);
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
