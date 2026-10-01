import React, { useState } from 'react';
import { Bike, Eye, EyeOff, Lock, Mail, User, Activity, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import apiService from '../services/api';

export default function AuthModal({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login form state (pre-filled with default test credentials for convenience)
  const [loginEmail, setLoginEmail] = useState('ricardo@ciclometrics.cl');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form state
  const [regNombre, setRegNombre] = useState('Ricardo Henríquez');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPeso, setRegPeso] = useState('75');
  const [regAltura, setRegAltura] = useState('178');
  const [regNivel, setRegNivel] = useState('intermedio');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Por favor ingrese correo y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.login({
        email: loginEmail.trim(),
        password: loginPassword.trim()
      });

      if (res && res.data && res.data.user) {
        onAuthSuccess(res.data.user, res.data.token);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error al autenticar. Verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regNombre || !regEmail || !regPassword) {
      setErrorMessage('Nombre, correo y contraseña son obligatorios.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        nombre: regNombre.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        biometria: {
          peso: parseFloat(regPeso) || 70,
          altura: parseFloat(regAltura) || 175,
          edad: 30,
          genero: 'masculino',
          nivel: regNivel
        }
      };

      const res = await apiService.register(payload);
      if (res && res.data && res.data.user) {
        onAuthSuccess(res.data.user, res.data.token);
      } else {
        throw new Error('Respuesta de registro inesperada');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error al registrar usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = () => {
    setLoginEmail('ricardo@ciclometrics.cl');
    setLoginPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md my-8 bg-[#0b1320] border border-slate-800 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden text-slate-100">
        
        {/* Glow de fondo decorativo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-8 relative z-10">
          
          {/* Logo y Encabezado */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 mb-3 ring-4 ring-emerald-500/10">
              <Bike className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              CicloMetrics Web
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Plataforma predictiva de rendimiento ciclista basada en biometría y topografía
            </p>
          </div>

          {/* Selector de Pestañas: [Iniciar Sesión] | [Registrarse] */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Mensaje de error general */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================
              PESTAÑA 1: INICIAR SESIÓN
              ======================================================== */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ricardo@ciclometrics.cl"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón de acceso directo para testing / demo */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Cuenta Demo precargada</span>
                <button
                  type="button"
                  onClick={setDemoCredentials}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Usar Ricardo Henríquez
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Acceder al Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================
              PESTAÑA 2: REGISTRARSE
              ======================================================== */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej. Ricardo Henríquez"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Contraseña (Mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Datos Biométricos */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="200"
                    step="0.5"
                    value={regPeso}
                    onChange={(e) => setRegPeso(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    min="120"
                    max="220"
                    value={regAltura}
                    onChange={(e) => setRegAltura(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nivel Ciclista
                </label>
                <select
                  value={regNivel}
                  onChange={(e) => setRegNivel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="principiante">Principiante (12-16 km/h)</option>
                  <option value="intermedio">Intermedio (18-24 km/h)</option>
                  <option value="avanzado">Avanzado (25-32 km/h)</option>
                  <option value="profesional">Pro / Élite (&gt; 32 km/h)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creando Cuenta...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Crear Cuenta e Ingresar</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
