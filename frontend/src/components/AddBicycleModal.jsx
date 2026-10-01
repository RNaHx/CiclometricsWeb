import React, { useState } from 'react';
import { Bike, X, PlusCircle, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function AddBicycleModal({ isOpen, onClose, onAddBicycle, userId }) {
  const [nombre, setNombre] = useState('Bici Aro 29');
  const [tipo, setTipo] = useState('mtb');
  const [rodado, setRodado] = useState('29');
  const [peso, setPeso] = useState('10');
  const [ancho, setAncho] = useState('60');
  const [psiMin, setPsiMin] = useState('30');
  const [psiMax, setPsiMax] = useState('70');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pesoNum = parseFloat(peso);
    const anchoNum = parseFloat(ancho);
    const minPsiNum = parseFloat(psiMin);
    const maxPsiNum = parseFloat(psiMax);

    if (isNaN(pesoNum) || pesoNum < 4 || pesoNum > 40) {
      setError('El peso debe estar entre 4 kg y 40 kg.');
      return;
    }
    if (isNaN(anchoNum) || anchoNum < 18 || anchoNum > 80) {
      setError('El ancho de neumático debe estar entre 18 mm y 80 mm.');
      return;
    }
    if (isNaN(minPsiNum) || isNaN(maxPsiNum) || minPsiNum >= maxPsiNum) {
      setError('El PSI Máximo debe ser mayor al PSI Mínimo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bikeData = {
        userId,
        nombre: nombre.trim() || `Bici ${tipo.toUpperCase()} ${rodado}`,
        tipo,
        rodado,
        peso: pesoNum,
        ancho_neumatico: anchoNum,
        psi_min: minPsiNum,
        psi_max: maxPsiNum
      };

      await onAddBicycle(bikeData);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar bicicleta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100">
        
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Registrar Nueva Bicicleta
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Parámetros mecánicos para el cálculo predictivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Nombre de la Bicicleta
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Bici Aro 29 o Gravel All-Road"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => {
                  const t = e.target.value;
                  setTipo(t);
                  if (t === 'ruta') {
                    setRodado('700c'); setAncho('25'); setPsiMin('75'); setPsiMax('120'); setPeso('8.5');
                  } else if (t === 'mtb') {
                    setRodado('29'); setAncho('60'); setPsiMin('30'); setPsiMax('70'); setPeso('10');
                  } else if (t === 'gravel') {
                    setRodado('700c'); setAncho('38'); setPsiMin('35'); setPsiMax('75'); setPeso('10.2');
                  } else if (t === 'urbana') {
                    setRodado('27.5'); setAncho('38'); setPsiMin('45'); setPsiMax('75'); setPeso('12');
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="mtb">Montaña / MTB</option>
                <option value="ruta">Ruta / Carretera</option>
                <option value="gravel">Gravel / Mixta</option>
                <option value="urbana">Urbana / Paseo</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Rodado
              </label>
              <select
                value={rodado}
                onChange={(e) => setRodado(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="29">Aro 29</option>
                <option value="700c">700c</option>
                <option value="27.5">Aro 27.5</option>
                <option value="26">Aro 26</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Peso Bicicleta (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="4"
                max="40"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Ancho Cubierta (mm)
              </label>
              <input
                type="number"
                min="18"
                max="80"
                value={ancho}
                onChange={(e) => setAncho(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Mínimo PSI
              </label>
              <input
                type="number"
                min="1"
                max="130"
                value={psiMin}
                onChange={(e) => setPsiMin(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Máximo PSI
              </label>
              <input
                type="number"
                min="20"
                max="150"
                value={psiMax}
                onChange={(e) => setPsiMax(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Bicicleta</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
