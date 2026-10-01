import React from 'react';
import { 
  Bike, 
  Sun, 
  Moon, 
  User, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Gauge
} from 'lucide-react';

export default function Navbar({
  theme,
  onToggleTheme,
  onOpenProfile,
  profile,
  backendStatus,
  onCheckBackend,
  isCockpitMode,
  onToggleCockpit
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-white/90 dark:bg-slate-950/90 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Marca y Logotipo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Bike className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                CicloMetrics
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                Web v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Predicción Biomecánica & Altimetría Físico-Mecánica
            </p>
          </div>
        </div>

        {/* Acciones principales del Header */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Indicador de estado del Backend */}
          <button
            onClick={onCheckBackend}
            title={backendStatus === 'connected' ? 'Backend Conectado (API Online)' : 'Reintentar conexión con backend'}
            className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              backendStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : backendStatus === 'checking'
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 animate-pulse'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
            }`}
          >
            {backendStatus === 'connected' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : backendStatus === 'checking' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>
              {backendStatus === 'connected' ? 'API Online' : backendStatus === 'checking' ? 'Conectando...' : 'Modo Autónomo'}
            </span>
          </button>

          {/* Botón Perfil Ciclista */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs sm:text-sm font-medium"
          >
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-semibold leading-tight">
                {profile?.user?.nombre || 'Ciclista'}
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                {profile?.user?.biometria?.peso || 70} kg • {profile?.bicycle?.tipo || 'ruta'} ({profile?.bicycle?.ancho_neumatico || 25}mm)
              </span>
            </div>
          </button>

          {/* Toggle Modo Manillar / Cockpit */}
          <button
            onClick={onToggleCockpit}
            title="Simulador de Computador de Manillar / Cockpit Móvil"
            className={`p-2 rounded-lg border transition-all ${
              isCockpitMode
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/25'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Selector Modo Oscuro / Claro */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
