import React from 'react';
import { Bike, Plus, Trash2, Shield } from 'lucide-react';

export default function BicyclesListCard({
  bicycles = [],
  selectedBikeId,
  onSelectBike,
  onOpenAddModal,
  onDeleteBike
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg transition-colors">
      
      {/* Header con título "Mis Bicicletas" y botón [+ REGISTRAR] */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Bike className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Mis Bicicletas
          </h2>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ REGISTRAR</span>
        </button>
      </div>

      {/* Lista de bicicletas del usuario */}
      {bicycles.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          <Bike className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p>No tienes bicicletas registradas.</p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-2 text-emerald-500 font-bold hover:underline"
          >
            Registrar tu primera bicicleta
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {bicycles.map((bike) => {
            const isSelected = selectedBikeId === bike.id;
            return (
              <div
                key={bike.id}
                onClick={() => onSelectBike(bike)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/40'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Bike className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {bike.nombre || `Bici Aro ${bike.rodado || '29'}`}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-500 text-white">
                          Activa
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Peso: {bike.peso}kg | Ancho: {bike.ancho_neumatico}mm | Máx PSI: {bike.psi_max}
                    </p>
                  </div>
                </div>

                {/* Botón rojo [Eliminar] */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`¿Eliminar la bicicleta "${bike.nombre || 'Bicicleta'}"?`)) {
                      onDeleteBike(bike.id);
                    }
                  }}
                  className="px-2 py-1 text-[11px] font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all flex items-center gap-1 flex-shrink-0"
                  title="Eliminar bicicleta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
