import React from 'react';
import { Compass } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import ErrorBoundary from './ErrorBoundary';

export default function RouteMapCard({
  selectedRoute,
  onSelectRoute,
  onSetCustomRoute,
  hoverCoordinate,
  theme
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg transition-colors flex flex-col">
      
      {/* Header con título y badge "MAPA INTERACTIVO ACTIVO" */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Trazado Geoespacial de la Ruta
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30">
          <span>MAPA INTERACTIVO ACTIVO</span>
        </div>
      </div>

      {/* Contenedor del Mapa: InteractiveMap SIEMPRE montado para evitar problemas de layout 0x0 */}
      <div className="relative flex-1 min-h-[440px] h-[520px]">
        <ErrorBoundary>
          <InteractiveMap
            selectedRoute={selectedRoute}
            onSelectRoute={onSelectRoute}
            customRoutePoints={selectedRoute?.coordinates}
            onSetCustomRoute={onSetCustomRoute}
            hoverCoordinate={hoverCoordinate}
            theme={theme}
          />
        </ErrorBoundary>

        {/* Overlay cuando no hay ruta seleccionada (Imagen 3 del PDF) */}
        {!selectedRoute && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 bg-slate-950/80 dark:bg-slate-950/85 backdrop-blur-sm text-center transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-300 mb-4 ring-8 ring-slate-800/40 shadow-xl">
              <Compass className="w-8 h-8 stroke-[1.5] text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white mb-1.5">
              Sin Ruta Seleccionada
            </h4>
            <p className="text-xs text-slate-300 dark:text-slate-400 max-w-md leading-relaxed">
              Ingrese el origen, destino y su bicicleta para trazar la ruta y renderizar el perfil altimétrico en tiempo real.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

