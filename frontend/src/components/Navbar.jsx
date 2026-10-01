import React, { useState } from 'react';
import { 
  Bike, 
  Sun, 
  Moon, 
  User, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  LogOut,
  Zap,
  ChevronDown
} from 'lucide-react';

export default function Navbar({
  theme,
  onToggleTheme,
  onOpenProfile,
  profile,
  backendStatus,
  onCheckBackend,
  isCockpitMode,
  onToggleCockpit,
  onLogout
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userNameUpper = (profile?.user?.nombre || 'RICARDO HENRÍQUEZ').toUpperCase();
  const userWeight = profile?.user?.biometria?.peso || 75;
  const userBikeType = profile?.bicycle?.nombre || 'Bici Aro 29';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-white/90 dark:bg-slate-950/90 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Marca y Logotipo (Imagen 2) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/20">
            <Bike className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                CicloMetrics
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                WEB V1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-tight">
              Predicción Biomecánica & Altimetría Físico-Mecánica
            </p>
          </div>
        </div>

        {/* Acciones principales del Header */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Badge de Estado del Backend (Imagen 2: ⚡ API Online / Modo Offline) */}
          <button
            onClick={onCheckBackend}
            title={backendStatus === 'connected' ? 'Backend Conectado (API Online)' : 'Reintentar conexión con backend'}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border font-bold transition-all shadow-sm ${
              backendStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : backendStatus === 'checking'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {backendStatus === 'connected' ? (
              <span className="text-emerald-500 font-bold">⚡ API Online</span>
            ) : backendStatus === 'checking' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>Verificando...</span>
              </>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-semibold">⚡ Modo Offline</span>
            )}
          </button>

          {/* Menú de Usuario Logeado (Avatar con nombre en mayúsculas como en Imagen 2) */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-white dark:bg-slate-900 shadow-sm transition-all text-left"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
                {userNameUpper.charAt(0) || 'R'}
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
                  {userNameUpper}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {userWeight} kg • {userBikeType}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown de opciones de usuario y Cerrar Sesión */}
            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 text-xs animate-fade-in"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="block font-bold text-slate-800 dark:text-slate-200 truncate">
                    {userNameUpper}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    {profile?.user?.email || 'ricardo@ciclometrics.cl'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                >
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ajustar Biometría</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>

          {/* Toggle Modo Manillar / Cockpit */}
          <button
            onClick={onToggleCockpit}
            title="Simulador de Computador de Manillar / Cockpit Móvil"
            className={`p-2 rounded-xl border transition-all ${
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
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
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

