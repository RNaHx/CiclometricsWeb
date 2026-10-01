import React, { useState } from 'react';
import { 
  MapPin, 
  Globe, 
  Bike, 
  Navigation, 
  Sparkles, 
  Loader2,
  CheckCircle2,
  Compass
} from 'lucide-react';

export default function RoutePlanningCard({
  bicycles = [],
  selectedBikeId,
  onSelectBikeId,
  onCalculateRoute,
  isCalculating
}) {
  const [activeTab, setActiveTab] = useState('direcciones'); // 'direcciones' | 'coordenadas'
  
  // Direcciones inputs
  const [origenDir, setOrigenDir] = useState('Antonio Varas 810, Providencia');
  const [destinoDir, setDestinoDir] = useState('Cerro San Cristóbal, Santiago, Provincia de Santiago');

  // Coordenadas inputs
  const [origenLat, setOrigenLat] = useState('-33.4350');
  const [origenLng, setOrigenLng] = useState('-70.6150');
  const [destinoLat, setDestinoLat] = useState('-33.4240');
  const [destinoLng, setDestinoLng] = useState('-70.6325');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'direcciones') {
      onCalculateRoute({
        type: 'direcciones',
        origen: origenDir.trim(),
        destino: destinoDir.trim(),
        bikeId: selectedBikeId
      });
    } else {
      onCalculateRoute({
        type: 'coordenadas',
        origenCoords: [parseFloat(origenLat), parseFloat(origenLng)],
        destinoCoords: [parseFloat(destinoLat), parseFloat(destinoLng)],
        origen: `Lat: ${origenLat}, Lng: ${origenLng}`,
        destino: `Lat: ${destinoLat}, Lng: ${destinoLng}`,
        bikeId: selectedBikeId
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg transition-colors">
      
      {/* Título de la tarjeta */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <Navigation className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Planificar Nueva Ruta
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Trazado predictivo biomecánico
          </p>
        </div>
      </div>

      {/* Tabs: [📍 Direcciones] | [🌐 Coordenadas] */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-4 border border-slate-200 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setActiveTab('direcciones')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'direcciones'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Direcciones</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('coordenadas')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'coordenadas'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Coordenadas</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Vista Tab Direcciones */}
        {activeTab === 'direcciones' && (
          <>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Dirección Origen
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={origenDir}
                  onChange={(e) => setOrigenDir(e.target.value)}
                  placeholder="Ej. Antonio Varas 810, Providencia"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Dirección Destino
              </label>
              <div className="relative">
                <Compass className="w-3.5 h-3.5 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={destinoDir}
                  onChange={(e) => setDestinoDir(e.target.value)}
                  placeholder="Ej. Cerro San Cristóbal, Santiago, Provincia de Santiago"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Vista Tab Coordenadas */}
        {activeTab === 'coordenadas' && (
          <>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Origen (Latitud, Longitud)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={origenLat}
                  onChange={(e) => setOrigenLat(e.target.value)}
                  placeholder="Latitud"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  value={origenLng}
                  onChange={(e) => setOrigenLng(e.target.value)}
                  placeholder="Longitud"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Destino (Latitud, Longitud)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={destinoLat}
                  onChange={(e) => setDestinoLat(e.target.value)}
                  placeholder="Latitud"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  value={destinoLng}
                  onChange={(e) => setDestinoLng(e.target.value)}
                  placeholder="Longitud"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Dropdown BICICLETA cargado dinámicamente con las bicis del usuario */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Bicicleta
          </label>
          <div className="relative">
            <Bike className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedBikeId || ''}
              onChange={(e) => onSelectBikeId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              {bicycles.length === 0 ? (
                <option value="">Aro 29 • 60mm (10kg)</option>
              ) : (
                bicycles.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {bike.nombre || `Bici ${bike.tipo}`} • {bike.ancho_neumatico}mm ({bike.peso}kg)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Botón verde esmeralda: [Calcular Ruta Óptima] */}
        <button
          type="submit"
          disabled={isCalculating}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calculando Trayecto...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Calcular Ruta Óptima</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
