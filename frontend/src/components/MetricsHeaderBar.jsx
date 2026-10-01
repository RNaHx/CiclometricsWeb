import React from 'react';
import { 
  Compass, 
  Clock, 
  Flame, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  Database,
  Activity
} from 'lucide-react';

export default function MetricsHeaderBar({
  hasRoute,
  calculationData
}) {
  const formatTime = (mins) => {
    if (!mins && mins !== 0) return '--';
    const totalMinutes = Math.round(mins);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m < 10 ? '0' : ''}${m}m`;
  };

  const distancia = hasRoute ? (calculationData?.distancia_km ?? '24.8') : '--';
  const tiempo = hasRoute ? formatTime(calculationData?.tiempo_estimado_min ?? 74) : '--';
  const gasto = hasRoute ? Math.round(calculationData?.kcal_quemadas ?? 422) : '--';
  const pndProm = hasRoute ? (calculationData?.pendiente_promedio_pct ?? 0.84) : null;
  const metProm = hasRoute ? (calculationData?.met_promedio ?? 4.0) : null;
  
  const psiDel = hasRoute ? (calculationData?.psi_delantero_recomendado ?? 15) : '--';
  const psiTras = hasRoute ? (calculationData?.psi_trasero_recomendado ?? 23) : '--';

  return (
    <div className="space-y-3">
      
      {/* Barra de Estado Superior (Imagen 5 y 6) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm text-xs">
        
        {/* Izquierda: Origen de Datos */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="text-emerald-500">⚡</span>
            <span>Origen de Datos:</span>
            <span className={`font-semibold ${hasRoute ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {hasRoute ? 'OSRM & Open-Meteo' : 'Esperando ruta...'}
            </span>
          </span>
        </div>

        {/* Derecha: Circuit Breaker y Redis Cache */}
        <div className="flex items-center gap-2.5 text-[11px]">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Circuit Breaker: CLOSED</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
            <Database className="w-3 h-3" />
            <span>Redis Cache: 7-Day TTL</span>
          </div>
        </div>
      </div>

      {/* 4 Tarjetas Métricas Superiores (Imagen 5 y 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* 1. DISTANCIA TOTAL */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative overflow-hidden transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              DISTANCIA TOTAL
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {distancia}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Kilómetros
            </div>
          </div>
        </div>

        {/* 2. TIEMPO ESTIMADO */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative overflow-hidden transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TIEMPO ESTIMADO
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {tiempo}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Horas : Minutos
            </div>
          </div>
        </div>

        {/* 3. GASTO ENERGÉTICO */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative overflow-hidden transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              GASTO ENERGÉTICO
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {gasto} {hasRoute ? <span className="text-sm font-bold text-orange-500">kcal</span> : ''}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              {hasRoute ? `Pnd. Promedio: ${pndProm}% | ${metProm} MET` : '- MET'}
            </div>
          </div>
        </div>

        {/* 4. PRESIÓN ÓPTIMA (PSI) */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative overflow-hidden transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PRESIÓN ÓPTIMA (PSI)
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
              {hasRoute ? `${psiDel} Del / ${psiTras} Tras` : '-- Del / -- Tras'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              40% F / 60% R Load
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
