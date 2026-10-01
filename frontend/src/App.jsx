import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';
import InteractiveMap from './components/InteractiveMap';
import ElevationProfileChart from './components/ElevationProfileChart';
import PredictiveHud from './components/PredictiveHud';
import CockpitView from './components/CockpitView';
import apiService from './services/api';
import { PRESET_ROUTES } from './data/presetRoutes';
import { 
  Bike, 
  MapPin, 
  Info, 
  Zap, 
  SlidersHorizontal, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const DEFAULT_PROFILE = {
  userId: 'user-default-1',
  user: {
    nombre: 'Carlos Ciclista',
    email: 'carlos@ciclometrics.cl',
    biometria: {
      peso: 70,
      altura: 175,
      edad: 28,
      genero: 'masculino'
    }
  },
  bicycle: {
    tipo: 'ruta',
    peso: 8.5,
    rodado: '700c',
    ancho_neumatico: 25,
    psi_min: 75,
    psi_max: 120
  }
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

  // 2. PERFIL DE USUARIO Y BICICLETA
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('ciclometrics_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parseando perfil guardado:', e);
      }
    }
    return DEFAULT_PROFILE;
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // 3. ESTADO DEL BACKEND Y MODO COCKPIT
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [isCockpitMode, setIsCockpitMode] = useState(false);

  // 4. RUTA ACTIVA
  const [selectedRoute, setSelectedRoute] = useState(PRESET_ROUTES[0]);
  const [hoverCoordinate, setHoverCoordinate] = useState(null);

  // 5. RESULTADOS DE CÁLCULO PREDICTIVO
  const [calculationData, setCalculationData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);

  // Comprobar estado del backend
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

  // Cálculo predictivo de ruta (consume POST /api/routes/calculate o fallback físico)
  const calculateMetrics = useCallback(async (routeObj, userProf) => {
    if (!routeObj || !routeObj.points || routeObj.points.length === 0) return;

    setIsCalculating(true);
    setCalcError(null);

    const payload = {
      userId: userProf?.userId,
      user: userProf?.user,
      bicycle: userProf?.bicycle,
      origen: routeObj.origen || routeObj.name,
      destino: routeObj.destino || 'Destino',
      points: routeObj.points,
      saveRoute: false
    };

    try {
      const response = await apiService.calculateRoute(payload);
      if (response && response.success && response.data) {
        setCalculationData(response.data);
      } else {
        throw new Error('Formato de respuesta no reconocido del backend');
      }
    } catch (err) {
      console.warn('Error al calcular con el backend API, ejecutando motor físico frontend equivalente:', err);
      // Fallback físico basado en las mismas fórmulas (Ainsworth & Schwalbe)
      const points = routeObj.points;
      const massTotal = (userProf.user.biometria.peso || 70) + (userProf.bicycle.peso || 9);
      const tireWidth = userProf.bicycle.ancho_neumatico || 25;
      const psiMin = userProf.bicycle.psi_min || 60;
      const psiMax = userProf.bicycle.psi_max || 110;

      let posGain = 0;
      let negGain = 0;
      let totalDist = points[points.length - 1].distance;
      let maxSlope = 0;
      let weightedSlopeSum = 0;
      let totalTimeHours = 0;
      let totalKcal = 0;

      const segs = {
        downhill: { distanceKm: 0, timeMinutes: 0, kcal: 0 },
        flat: { distanceKm: 0, timeMinutes: 0, kcal: 0 },
        moderateClimb: { distanceKm: 0, timeMinutes: 0, kcal: 0 },
        steepClimb: { distanceKm: 0, timeMinutes: 0, kcal: 0 }
      };

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
        weightedSlopeSum += slope * dD;

        let met = 7.0;
        let speed = 20.0; // km/h
        let segKey = 'flat';

        if (slope < -2) {
          met = 4.0;
          speed = 35.0;
          segKey = 'downhill';
        } else if (slope <= 2) {
          met = 6.8;
          speed = 22.0;
          segKey = 'flat';
        } else if (slope <= 6) {
          met = 9.5;
          speed = 14.0;
          segKey = 'moderateClimb';
        } else {
          met = 13.5;
          speed = 8.5;
          segKey = 'steepClimb';
        }

        const timeHours = distKm / speed;
        const kcal = met * massTotal * timeHours;

        totalTimeHours += timeHours;
        totalKcal += kcal;

        segs[segKey].distanceKm += distKm;
        segs[segKey].timeMinutes += timeHours * 60;
        segs[segKey].kcal += kcal;
      }

      // Cálculo de presiones de neumáticos Schwalbe
      const frontLoad = massTotal * 0.4;
      const rearLoad = massTotal * 0.6;
      const calcPsi = (load) => {
        const rawPsi = Math.round((load / (tireWidth * 0.038)) * 1.55);
        return Math.max(psiMin, Math.min(psiMax, rawPsi));
      };

      setCalculationData({
        distancia_km: parseFloat((totalDist / 1000).toFixed(2)),
        desnivel_positivo_m: Math.round(posGain),
        desnivel_negativo_m: Math.round(negGain),
        pendiente_promedio_pct: parseFloat((weightedSlopeSum / (totalDist || 1)).toFixed(1)),
        pendiente_maxima_pct: parseFloat(maxSlope.toFixed(1)),
        tiempo_estimado_min: parseFloat((totalTimeHours * 60).toFixed(1)),
        velocidad_promedio_kmh: parseFloat(((totalDist / 1000) / (totalTimeHours || 1)).toFixed(1)),
        met_promedio: parseFloat((totalKcal / (massTotal * (totalTimeHours || 1))).toFixed(1)),
        kcal_quemadas: parseFloat(totalKcal.toFixed(1)),
        psi_delantero_recomendado: calcPsi(frontLoad),
        psi_trasero_recomendado: calcPsi(rearLoad),
        desglose_tramos: {
          downhill: {
            distanceKm: parseFloat(segs.downhill.distanceKm.toFixed(2)),
            timeMinutes: parseFloat(segs.downhill.timeMinutes.toFixed(1)),
            kcal: parseFloat(segs.downhill.kcal.toFixed(1))
          },
          flat: {
            distanceKm: parseFloat(segs.flat.distanceKm.toFixed(2)),
            timeMinutes: parseFloat(segs.flat.timeMinutes.toFixed(1)),
            kcal: parseFloat(segs.flat.kcal.toFixed(1))
          },
          moderateClimb: {
            distanceKm: parseFloat(segs.moderateClimb.distanceKm.toFixed(2)),
            timeMinutes: parseFloat(segs.moderateClimb.timeMinutes.toFixed(1)),
            kcal: parseFloat(segs.moderateClimb.kcal.toFixed(1))
          },
          steepClimb: {
            distanceKm: parseFloat(segs.steepClimb.distanceKm.toFixed(2)),
            timeMinutes: parseFloat(segs.steepClimb.timeMinutes.toFixed(1)),
            kcal: parseFloat(segs.steepClimb.kcal.toFixed(1))
          }
        }
      });
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Recalcular métricas cuando cambie la ruta o el perfil
  useEffect(() => {
    calculateMetrics(selectedRoute, profile);
  }, [selectedRoute, profile, calculateMetrics]);

  // Manejador de guardado de perfil
  const handleSaveProfile = async (newProfileData) => {
    setIsSavingProfile(true);
    try {
      if (backendStatus === 'connected') {
        const res = await apiService.saveProfile(newProfileData);
        if (res && res.profile) {
          setProfile(res.profile);
          localStorage.setItem('ciclometrics_profile', JSON.stringify(res.profile));
          return res.profile;
        }
      }
      // Guardado local
      setProfile(newProfileData);
      localStorage.setItem('ciclometrics_profile', JSON.stringify(newProfileData));
      return newProfileData;
    } catch (err) {
      console.warn('Error guardando en backend, guardando en localStorage:', err);
      setProfile(newProfileData);
      localStorage.setItem('ciclometrics_profile', JSON.stringify(newProfileData));
      return newProfileData;
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      
      {/* 1. NAVEGACIÓN Y ACCIONES */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenProfile={() => setIsProfileOpen(true)}
        profile={profile}
        backendStatus={backendStatus}
        onCheckBackend={checkBackendConnectivity}
        isCockpitMode={isCockpitMode}
        onToggleCockpit={() => setIsCockpitMode(!isCockpitMode)}
      />

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        
        {/* Banner de Bienvenida y Configuración Rápida */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-4 sm:p-5 rounded-2xl border border-emerald-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                CicloMetrics Web • Simulación Biomecánica & Altimetría
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              {selectedRoute?.name || 'Ruta Ciclista'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedRoute?.subtitle || 'Análisis predictivo de gasto calórico, ETA y presión de inflado'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ajustar Biometría / Bici</span>
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

        {/* 3. MAPA INTERACTIVO Y SELECTOR DE RUTAS */}
        <section aria-label="Mapa interactivo y rutas">
          <InteractiveMap
            selectedRoute={selectedRoute}
            onSelectRoute={(route) => setSelectedRoute(route)}
            customRoutePoints={selectedRoute?.coordinates}
            onSetCustomRoute={(customRoute) => setSelectedRoute(customRoute)}
            hoverCoordinate={hoverCoordinate}
            theme={theme}
          />
        </section>

        {/* 4. GRÁFICO TOPOGRÁFICO Y PERFIL ALTIMÉTRICO */}
        <section aria-label="Perfil de elevación">
          <ElevationProfileChart
            points={selectedRoute?.points || []}
            coordinates={selectedRoute?.coordinates || []}
            onHoverPoint={(coord, index) => setHoverCoordinate(coord)}
            theme={theme}
          />
        </section>

        {/* 5. HUD PREDICTIVO (MÉTRICAS MET, ETA, SCHWALBE TIRE PRESSURE) */}
        <section aria-label="Métricas predictivas">
          <PredictiveHud
            calculationData={calculationData}
            profile={profile}
            isLoading={isCalculating}
            error={calcError}
          />
        </section>
      </main>

      {/* FOOTER INFORMATIVO */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <p>
          CicloMetrics Web — Proyecto de Tesis & Arquitectura Multi-Agente • Modelos Ainsworth et al. (2011) & Schwalbe (2022)
        </p>
      </footer>

      {/* MODAL DE PERFIL */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        isSaving={isSavingProfile}
      />

      {/* MODO COCKPIT / MANILLAR MÓVIL FULLSCREEN */}
      {isCockpitMode && (
        <CockpitView
          calculationData={calculationData}
          profile={profile}
          selectedRoute={selectedRoute}
          onClose={() => setIsCockpitMode(false)}
        />
      )}
    </div>
  );
}
