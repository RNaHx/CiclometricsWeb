import React, { useState } from 'react';
import { 
  X, 
  User, 
  Bike, 
  Weight, 
  Ruler, 
  Calendar, 
  Gauge, 
  Save, 
  Check, 
  Info,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { BIKE_PRESETS } from '../data/presetRoutes';

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  isSaving
}) {
  if (!isOpen) return null;

  // Estado local para edición
  const [formData, setFormData] = useState({
    userId: profile?.userId || profile?.user?.id || null,
    user: {
      id: profile?.user?.id || null,
      nombre: profile?.user?.nombre || 'Ciclista Activo',
      email: profile?.user?.email || 'ciclista@ciclometrics.cl',
      biometria: {
        peso: profile?.user?.biometria?.peso ?? 70,
        altura: profile?.user?.biometria?.altura ?? 175,
        edad: profile?.user?.biometria?.edad ?? 28,
        genero: profile?.user?.biometria?.genero || 'masculino',
        nivel: profile?.user?.biometria?.nivel || 'intermedio'
      }
    },
    bicycle: {
      id: profile?.bicycle?.id || null,
      nombre: profile?.bicycle?.nombre || 'Bicicleta Principal',
      tipo: profile?.bicycle?.tipo || 'ruta',
      peso: profile?.bicycle?.peso ?? 8.5,
      rodado: profile?.bicycle?.rodado || '700c',
      ancho_neumatico: profile?.bicycle?.ancho_neumatico ?? 25,
      psi_min: profile?.bicycle?.psi_min ?? 75,
      psi_max: profile?.bicycle?.psi_max ?? 120
    }
  });

  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);

  // Selector rápido de plantilla de bicicleta
  const handleApplyBikePreset = (presetKey) => {
    const preset = BIKE_PRESETS[presetKey];
    if (!preset) return;
    setFormData(prev => ({
      ...prev,
      bicycle: {
        tipo: preset.tipo,
        peso: preset.peso,
        rodado: preset.rodado,
        ancho_neumatico: preset.ancho_neumatico,
        psi_min: preset.psi_min,
        psi_max: preset.psi_max
      }
    }));
  };

  const handleUserChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [field]: value
      }
    }));
  };

  const handleBiometriaChange = (field, value) => {
    const numValue = field === 'genero' ? value : parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        biometria: {
          ...prev.user.biometria,
          [field]: numValue
        }
      }
    }));
  };

  const handleBicycleChange = (field, value) => {
    const isNum = ['peso', 'ancho_neumatico', 'psi_min', 'psi_max'].includes(field);
    const parsedValue = isNum ? parseFloat(value) || 0 : value;
    setFormData(prev => ({
      ...prev,
      bicycle: {
        ...prev.bicycle,
        [field]: parsedValue
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onSaveProfile(formData);
      setSaveSuccessMessage('¡Perfil guardado y sincronizado exitosamente con el sistema!');
      setTimeout(() => {
        setSaveSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error al guardar perfil:', err);
    }
  };

  // Cálculos reactivos informativos
  const pesoUsuario = formData.user.biometria.peso || 0;
  const pesoBici = formData.bicycle.peso || 0;
  const masaTotal = (pesoUsuario + pesoBici).toFixed(1);
  const cargaDelantera = (masaTotal * 0.4).toFixed(1);
  const cargaTrasera = (masaTotal * 0.6).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-title" className="text-lg font-bold">
                Perfil de Ciclista y Bicicleta
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parámetros físico-mecánicos para cálculo de MET, ETA y Presión de Neumáticos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación de éxito */}
        {saveSuccessMessage && (
          <div className="m-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-2 text-sm font-medium">
            <Check className="w-5 h-5 text-emerald-500" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* SECCIÓN 1: BIOMETRÍA DEL CICLISTA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Biometría del Ciclista
                </h3>
              </div>
              <span className="text-xs text-slate-400">Ainsworth et al. (2011)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Nombre o Identificador
                </label>
                <input
                  type="text"
                  value={formData.user.nombre}
                  onChange={(e) => handleUserChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ej: Carlos Ciclista"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Género
                </label>
                <select
                  value={formData.user.biometria.genero}
                  onChange={(e) => handleBiometriaChange('genero', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro / Neutro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Peso Corporal (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="35"
                    max="180"
                    step="0.5"
                    value={formData.user.biometria.peso}
                    onChange={(e) => handleBiometriaChange('peso', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none pl-9"
                  />
                  <Weight className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Altura (cm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="120"
                    max="220"
                    step="1"
                    value={formData.user.biometria.altura}
                    onChange={(e) => handleBiometriaChange('altura', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none pl-9"
                  />
                  <Ruler className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Edad (años)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="14"
                    max="99"
                    step="1"
                    value={formData.user.biometria.edad}
                    onChange={(e) => handleBiometriaChange('edad', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none pl-9"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: BICICLETA Y CONFIGURACIÓN DE RUEDAS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Bicicleta y Cubiertas
                </h3>
              </div>
              <span className="text-xs text-slate-400">Schwalbe 15% Tire Drop</span>
            </div>

            {/* Selector rápido de presets de bicicleta */}
            <div>
              <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Plantillas Rápidas de Bicicleta:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(BIKE_PRESETS).map(([key, item]) => {
                  const isSelected = formData.bicycle.tipo.toLowerCase() === key.toLowerCase();
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleApplyBikePreset(key)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="block text-xs font-bold capitalize">{item.tipo}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">{item.ancho_neumatico}mm • {item.peso}kg</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Tipo de Bicicleta
                </label>
                <select
                  value={formData.bicycle.tipo}
                  onChange={(e) => handleBicycleChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none capitalize"
                >
                  <option value="ruta">Ruta / Carretera</option>
                  <option value="gravel">Gravel / All-Road</option>
                  <option value="mtb">Montaña / MTB</option>
                  <option value="urbana">Urbana / City</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Peso de la Bicicleta (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="35"
                    step="0.1"
                    value={formData.bicycle.peso}
                    onChange={(e) => handleBicycleChange('peso', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none pl-9"
                  />
                  <Bike className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Rodado de Rueda
                </label>
                <select
                  value={formData.bicycle.rodado}
                  onChange={(e) => handleBicycleChange('rodado', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="700c">700c (Ruta / Gravel)</option>
                  <option value="29">29" (MTB Moderna)</option>
                  <option value="27.5">27.5" (MTB / Gravel)</option>
                  <option value="26">26" (MTB Clásica / Urbana)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Ancho de Cubierta (mm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="18"
                    max="70"
                    step="1"
                    value={formData.bicycle.ancho_neumatico}
                    onChange={(e) => handleBicycleChange('ancho_neumatico', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none pl-9"
                  />
                  <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Ej: 25mm ruta, 40mm gravel, 54mm mtb</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  PSI Mínimo Fabricante
                </label>
                <input
                  type="number"
                  min="15"
                  max="100"
                  step="1"
                  value={formData.bicycle.psi_min}
                  onChange={(e) => handleBicycleChange('psi_min', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  PSI Máximo Fabricante
                </label>
                <input
                  type="number"
                  min="30"
                  max="140"
                  step="1"
                  value={formData.bicycle.psi_max}
                  onChange={(e) => handleBicycleChange('psi_max', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* TARJETA DINÁMICA DE RESUMEN DE MASA Y DISTRIBUCIÓN */}
          <div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Resumen Mecánico Preliminar:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Masa Total</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{masaTotal} kg</span>
                <span className="block text-[10px] text-slate-400">Ciclista + Bici</span>
              </div>
              <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Rueda Delantera</span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-200">{cargaDelantera} kg</span>
                <span className="block text-[10px] text-slate-400">40% de carga</span>
              </div>
              <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Rueda Trasera</span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-200">{cargaTrasera} kg</span>
                <span className="block text-[10px] text-slate-400">60% de carga</span>
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando en API...' : 'Guardar y Aplicar Perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
