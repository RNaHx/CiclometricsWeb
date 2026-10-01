import React from 'react';
import { 
  X, 
  Bike, 
  Flame, 
  Clock, 
  Mountain, 
  Gauge, 
  TrendingUp, 
  Compass, 
  Battery, 
  Wifi, 
  Navigation
} from 'lucide-react';

export default function CockpitView({
  calculationData,
  profile,
  selectedRoute,
  onClose
}) {
  const {
    distancia_km = 0,
    desnivel_positivo_m = 0,
    pendiente_maxima_pct = 0,
    tiempo_estimado_min = 0,
    velocidad_promedio_kmh = 0,
    kcal_quemadas = 0,
    psi_delantero_recomendado = 0,
    psi_trasero_recomendado = 0
  } = calculationData || {};

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-4 sm:p-6 font-mono select-none overflow-y-auto">
      
      {/* Barra de Estado del Ciclocomputador */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">
            COCKPIT MANILLAR V1.0
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPS ACTIVO</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>98%</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Cerrar Modo Manillar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nombre de la Ruta Activa */}
      <div className="my-2 py-1.5 px-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <Navigation className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="font-bold text-zinc-200 truncate">{selectedRoute?.name || 'Ruta Activa'}</span>
        </div>
        <span className="text-zinc-500 hidden sm:inline">{profile?.bicycle?.tipo?.toUpperCase()} • {profile?.bicycle?.ancho_neumatico}MM</span>
      </div>

      {/* PANTALLA PRINCIPAL CON NÚMEROS GIGANTES TIPO GARMIN / WAHOO */}
      <div className="grid grid-cols-2 gap-3 my-auto py-2">
        
        {/* Velocidad Promedio Estimada */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 text-center flex flex-col justify-center">
          <span className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-wider">
            VELOCIDAD MEDIA
          </span>
          <span className="text-5xl sm:text-7xl font-black text-cyan-400 my-1">
            {velocidad_promedio_kmh}
          </span>
          <span className="text-xs text-zinc-400 font-semibold">KM / H</span>
        </div>

        {/* Tiempo Estimado (ETA) */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 text-center flex flex-col justify-center">
          <span className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-wider">
            TIEMPO ESTIMADO
          </span>
          <span className="text-5xl sm:text-7xl font-black text-emerald-400 my-1">
            {Math.round(tiempo_estimado_min)}
          </span>
          <span className="text-xs text-zinc-400 font-semibold">MINUTOS</span>
        </div>

        {/* Calorías */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 text-center flex flex-col justify-center">
          <span className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-wider">
            GASTO ENERGÉTICO
          </span>
          <span className="text-4xl sm:text-6xl font-black text-orange-400 my-1">
            {Math.round(kcal_quemadas)}
          </span>
          <span className="text-xs text-zinc-400 font-semibold">KCAL (AINSWORTH)</span>
        </div>

        {/* Altimetría */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 text-center flex flex-col justify-center">
          <span className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-wider">
            DESNIVEL POSITIVO
          </span>
          <span className="text-4xl sm:text-6xl font-black text-amber-400 my-1">
            +{Math.round(desnivel_positivo_m)}
          </span>
          <span className="text-xs text-zinc-400 font-semibold">METROS (MAX {pendiente_maxima_pct}%)</span>
        </div>
      </div>

      {/* BARRA INFERIOR DE PRESIÓN ÓPTIMA */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 grid grid-cols-2 gap-3 text-center">
        <div className="border-r border-zinc-800 pr-2">
          <span className="text-[11px] text-zinc-500 block uppercase font-bold">PRESIÓN DELANTERA (40%)</span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400">{psi_delantero_recomendado}</span>
            <span className="text-xs text-zinc-400 font-bold">PSI</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-zinc-500 block uppercase font-bold">PRESIÓN TRASERA (60%)</span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{psi_trasero_recomendado}</span>
            <span className="text-xs text-zinc-400 font-bold">PSI</span>
          </div>
        </div>
      </div>

      {/* Botón Salir */}
      <div className="mt-3 text-center">
        <button
          onClick={onClose}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors border border-zinc-700"
        >
          Volver a Vista Completa
        </button>
      </div>
    </div>
  );
}
