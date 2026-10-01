import React from 'react';
import { 
  Flame, 
  Clock, 
  Mountain, 
  Gauge, 
  Zap, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck, 
  Bike,
  Activity,
  Compass,
  AlertCircle
} from 'lucide-react';

export default function PredictiveHud({
  calculationData,
  profile,
  isLoading,
  error
}) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
          ))}
        </div>
        <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Error en el cálculo físico-mecánico</h4>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!calculationData) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <Bike className="w-12 h-12 mx-auto text-slate-400 mb-2 opacity-60" />
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Esperando selección de ruta
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Selecciona una de las rutas emblemáticas de Santiago o marca puntos en el mapa para calcular métricas.
        </p>
      </div>
    );
  }

  const {
    distancia_km = 0,
    desnivel_positivo_m = 0,
    desnivel_negativo_m = 0,
    pendiente_promedio_pct = 0,
    pendiente_maxima_pct = 0,
    tiempo_estimado_min = 0,
    velocidad_promedio_kmh = 0,
    met_promedio = 0,
    kcal_quemadas = 0,
    psi_delantero_recomendado = 0,
    psi_trasero_recomendado = 0,
    desglose_tramos = {}
  } = calculationData;

  const psiMin = profile?.bicycle?.psi_min || 30;
  const psiMax = profile?.bicycle?.psi_max || 120;

  // Formato de tiempo legible
  const formatTime = (mins) => {
    if (mins < 60) {
      return `${Math.round(mins)} min`;
    }
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  };

  // Desglose de tramos seguro
  const tramos = {
    downhill: desglose_tramos.downhill || { distanceKm: 0, timeMinutes: 0, kcal: 0 },
    flat: desglose_tramos.flat || { distanceKm: 0, timeMinutes: 0, kcal: 0 },
    moderateClimb: desglose_tramos.moderateClimb || { distanceKm: 0, timeMinutes: 0, kcal: 0 },
    steepClimb: desglose_tramos.steepClimb || { distanceKm: 0, timeMinutes: 0, kcal: 0 }
  };

  const totalDist = distancia_km > 0 ? distancia_km : 1;
  const pctDownhill = Math.max(0, Math.min(100, (tramos.downhill.distanceKm / totalDist) * 100));
  const pctFlat = Math.max(0, Math.min(100, (tramos.flat.distanceKm / totalDist) * 100));
  const pctModerate = Math.max(0, Math.min(100, (tramos.moderateClimb.distanceKm / totalDist) * 100));
  const pctSteep = Math.max(0, Math.min(100, (tramos.steepClimb.distanceKm / totalDist) * 100));

  // Función para calcular porcentaje en la barra de PSI
  const getPsiPercentage = (psi) => {
    if (psiMax <= psiMin) return 50;
    const clamped = Math.max(psiMin, Math.min(psiMax, psi));
    return ((clamped - psiMin) / (psiMax - psiMin)) * 100;
  };

  return (
    <div className="space-y-4">
      
      {/* 4 TARJETAS KPI PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: GASTO CALÓRICO */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative overflow-hidden transition-all hover:border-emerald-500/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/15 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gasto Calórico
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              {Math.round(kcal_quemadas)}
            </span>
            <span className="text-sm font-semibold text-orange-500">kCal</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>MET Promedio:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{met_promedio} METs</span>
          </div>
        </div>

        {/* KPI 2: TIEMPO ESTIMADO (ETA) */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative overflow-hidden transition-all hover:border-emerald-500/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/15 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tiempo Estimado
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              {formatTime(tiempo_estimado_min)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>Velocidad Estimada:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{velocidad_promedio_kmh} km/h</span>
          </div>
        </div>

        {/* KPI 3: ALTIMETRÍA Y PENDIENTES */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative overflow-hidden transition-all hover:border-emerald-500/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/15 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Altimetría & Desnivel
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Mountain className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              +{Math.round(desnivel_positivo_m)}
            </span>
            <span className="text-sm font-semibold text-slate-400">m desnivel</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>Pendiente Prom / Máx:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {pendiente_promedio_pct}% / <span className="text-rose-500">{pendiente_maxima_pct}%</span>
            </span>
          </div>
        </div>

        {/* KPI 4: DISTANCIA TOTAL */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative overflow-hidden transition-all hover:border-emerald-500/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/15 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recorrido Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              {distancia_km}
            </span>
            <span className="text-sm font-semibold text-indigo-500">km</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>Desnivel Negativo:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">-{Math.round(desnivel_negativo_m)} m</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN PRESIÓN ÓPTIMA DE NEUMÁTICOS (SCHWALBE 15% DROP) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Presión Óptima de Neumáticos (Deformación 15% Schwalbe)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cálculo de distribución de masa (40% Delantera / 60% Trasera) para cubierta de {profile?.bicycle?.ancho_neumatico || 25}mm
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Rango Seguro: [{psiMin} - {psiMax} PSI]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Rueda Delantera */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Rueda Delantera (40% Masa)
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                  {psi_delantero_recomendado}
                </span>
                <span className="text-xs font-semibold text-slate-500">PSI</span>
              </div>
            </div>

            {/* Medidor visual de rango */}
            <div className="space-y-1.5 mt-3">
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${getPsiPercentage(psi_delantero_recomendado)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Min: {psiMin} PSI</span>
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                  {(psi_delantero_recomendado / 14.5038).toFixed(1)} bar
                </span>
                <span>Max: {psiMax} PSI</span>
              </div>
            </div>
          </div>

          {/* Rueda Trasera */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Rueda Trasera (60% Masa)
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {psi_trasero_recomendado}
                </span>
                <span className="text-xs font-semibold text-slate-500">PSI</span>
              </div>
            </div>

            {/* Medidor visual de rango */}
            <div className="space-y-1.5 mt-3">
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${getPsiPercentage(psi_trasero_recomendado)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Min: {psiMin} PSI</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {(psi_trasero_recomendado / 14.5038).toFixed(1)} bar
                </span>
                <span>Max: {psiMax} PSI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DESGLOSE DE TRAMOS */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Desglose de Tramos por Pendiente (Ainsworth MET Segments)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribución de esfuerzo según inclinación topográfica de la ruta
            </p>
          </div>
        </div>

        {/* Barra de progreso apilada proporcional */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner mb-4">
          {pctDownhill > 0 && (
            <div 
              style={{ width: `${pctDownhill}%` }} 
              className="bg-cyan-500 hover:opacity-90 transition-all" 
              title={`Bajada: ${tramos.downhill.distanceKm} km (${pctDownhill.toFixed(0)}%)`}
            />
          )}
          {pctFlat > 0 && (
            <div 
              style={{ width: `${pctFlat}%` }} 
              className="bg-emerald-500 hover:opacity-90 transition-all" 
              title={`Plano: ${tramos.flat.distanceKm} km (${pctFlat.toFixed(0)}%)`}
            />
          )}
          {pctModerate > 0 && (
            <div 
              style={{ width: `${pctModerate}%` }} 
              className="bg-amber-500 hover:opacity-90 transition-all" 
              title={`Subida Moderada: ${tramos.moderateClimb.distanceKm} km (${pctModerate.toFixed(0)}%)`}
            />
          )}
          {pctSteep > 0 && (
            <div 
              style={{ width: `${pctSteep}%` }} 
              className="bg-rose-500 hover:opacity-90 transition-all" 
              title={`Subida Empinada: ${tramos.steepClimb.distanceKm} km (${pctSteep.toFixed(0)}%)`}
            />
          )}
        </div>

        {/* 4 Tarjetas de Detalle por Tramo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          {/* Tramo 1: Bajada */}
          <div className="p-3 rounded-xl border border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/40 dark:bg-cyan-950/20">
            <div className="flex items-center gap-1.5 font-bold text-cyan-700 dark:text-cyan-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span>Bajada (&lt; -2%)</span>
            </div>
            <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Distancia:</span>
                <span className="font-semibold">{tramos.downhill.distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span>Tiempo:</span>
                <span className="font-semibold">{Math.round(tramos.downhill.timeMinutes)} min</span>
              </div>
              <div className="flex justify-between text-cyan-600 dark:text-cyan-400 font-bold">
                <span>Calorías:</span>
                <span>{Math.round(tramos.downhill.kcal)} kCal</span>
              </div>
            </div>
          </div>

          {/* Tramo 2: Plano */}
          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Plano (-2% a 2%)</span>
            </div>
            <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Distancia:</span>
                <span className="font-semibold">{tramos.flat.distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span>Tiempo:</span>
                <span className="font-semibold">{Math.round(tramos.flat.timeMinutes)} min</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Calorías:</span>
                <span>{Math.round(tramos.flat.kcal)} kCal</span>
              </div>
            </div>
          </div>

          {/* Tramo 3: Subida Moderada */}
          <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Subida (2% a 6%)</span>
            </div>
            <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Distancia:</span>
                <span className="font-semibold">{tramos.moderateClimb.distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span>Tiempo:</span>
                <span className="font-semibold">{Math.round(tramos.moderateClimb.timeMinutes)} min</span>
              </div>
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                <span>Calorías:</span>
                <span>{Math.round(tramos.moderateClimb.kcal)} kCal</span>
              </div>
            </div>
          </div>

          {/* Tramo 4: Subida Empinada */}
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Empinada (&gt; 6%)</span>
            </div>
            <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Distancia:</span>
                <span className="font-semibold">{tramos.steepClimb.distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span>Tiempo:</span>
                <span className="font-semibold">{Math.round(tramos.steepClimb.timeMinutes)} min</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                <span>Calorías:</span>
                <span>{Math.round(tramos.steepClimb.kcal)} kCal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
