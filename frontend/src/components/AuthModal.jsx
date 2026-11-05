import React, { useState, useEffect, useRef } from 'react';
import {
  Bike,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Check,
  ShieldCheck,
  Clock,
  RotateCcw
} from 'lucide-react';
import apiService from '../services/api';
import TermsAndPrivacyModal from './TermsAndPrivacyModal';

const PASSWORD_COMPLEXITY_PATTERN = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\W_]).{8,}';

function evaluatePasswordRules(password = '') {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[\W_]/.test(password)
  };
}

function isPasswordCompliant(password = '') {
  const rules = evaluatePasswordRules(password);
  return rules.minLength && rules.hasUpper && rules.hasLower && rules.hasNumber && rules.hasSpecial;
}

/**
 * Genera los manejadores para mostrar la contraseña únicamente mientras se mantiene presionado el botón
 * y ocultarla inmediatamente al soltarlo o retirar el puntero.
 */
function getHoldToRevealProps(setVisible) {
  return {
    onPointerDown: (e) => {
      e.preventDefault();
      setVisible(true);
    },
    onPointerUp: () => setVisible(false),
    onPointerLeave: () => setVisible(false),
    onPointerCancel: () => setVisible(false),
    onMouseDown: (e) => {
      e.preventDefault();
      setVisible(true);
    },
    onMouseUp: () => setVisible(false),
    onMouseLeave: () => setVisible(false),
    onTouchStart: () => setVisible(true),
    onTouchEnd: () => setVisible(false),
    onTouchCancel: () => setVisible(false),
    onKeyDown: (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setVisible(true);
      }
    },
    onKeyUp: () => setVisible(false),
    onBlur: () => setVisible(false)
  };
}

export default function AuthModal({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'recover'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados de visibilidad temporal (mantener presionado para ver)
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showRecoverPassword, setShowRecoverPassword] = useState(false);
  const [showRecoverConfirmPassword, setShowRecoverConfirmPassword] = useState(false);

  // Estado del modal de Términos de Uso y Tratamiento de Datos
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsModalSection, setTermsModalSection] = useState('all');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPeso, setRegPeso] = useState('75');
  const [regAltura, setRegAltura] = useState('178');
  const [regNivel, setRegNivel] = useState('intermedio');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Recover password state
  const [recoverStep, setRecoverStep] = useState(1); // 1 | 2
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverCode, setRecoverCode] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [recoverConfirmPassword, setRecoverConfirmPassword] = useState('');
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(900); // 15 min
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const modalContainerRef = useRef(null);

  // Sincronización de aria-invalid con :user-invalid y fallback WeakMap (Modern Web Guidance)
  useEffect(() => {
    const root = modalContainerRef.current;
    if (!root) return;

    const supportsUserInvalid =
      typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('selector(:user-invalid)');
    const dirtyState = new WeakMap();

    const syncAriaAndFallback = (el) => {
      if (!el || typeof el.checkValidity !== 'function') return;
      if (supportsUserInvalid) {
        try {
          el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
        } catch {
          // Ignorar si el selector no aplica al elemento
        }
      } else {
        const isValid = el.checkValidity();
        el.classList.toggle('user-invalid-fallback', !isValid);
        el.classList.toggle('user-valid-fallback', isValid);
        if (!isValid) {
          el.setAttribute('aria-invalid', 'true');
        } else {
          el.removeAttribute('aria-invalid');
        }
      }
    };

    const onBlur = (e) => {
      const input = e.target;
      if (!input || !input.checkValidity) return;
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasBlurred = true;
      dirtyState.set(input, state);
      if (state.hasInteracted || supportsUserInvalid) {
        syncAriaAndFallback(input);
      }
    };

    const onInput = (e) => {
      const input = e.target;
      if (!input || !input.checkValidity) return;
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasInteracted = true;
      dirtyState.set(input, state);
      if (state.hasBlurred || input.hasAttribute('aria-invalid')) {
        syncAriaAndFallback(input);
      }
    };

    root.addEventListener('blur', onBlur, true);
    root.addEventListener('input', onInput, true);
    return () => {
      root.removeEventListener('blur', onBlur, true);
      root.removeEventListener('input', onInput, true);
    };
  }, [activeTab]);

  // Temporizador para expiración de código OTP (15 min) y enfriamiento de reenvío (60 seg)
  useEffect(() => {
    if (activeTab !== 'recover' || recoverStep !== 2) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setOtpSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab, recoverStep]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const regPwdRules = evaluatePasswordRules(regPassword);
  const recoverPwdRules = evaluatePasswordRules(recoverNewPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
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
    setSuccessMessage('');

    if (!regNombre || !regEmail || !regPassword || !regConfirmPassword) {
      setErrorMessage('Nombre, correo, contraseña y confirmación son obligatorios.');
      return;
    }

    if (!isPasswordCompliant(regPassword)) {
      setErrorMessage(
        'La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un carácter especial.'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage('Debe aceptar los Términos y Condiciones de Uso y la Política de Tratamiento de Datos para registrarse.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        nombre: regNombre.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        confirmPassword: regConfirmPassword.trim(),
        acceptedTerms: true,
        termsAcceptedAt: new Date().toISOString(),
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
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        setErrorMessage(err.details.join(' '));
      } else {
        setErrorMessage(err.message || 'Error al registrar usuario.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = (recoverEmail || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.forgotPassword(cleanEmail);
      setRecoverStep(2);
      setRecoverCode('');
      setOtpSecondsLeft(900); // 15 minutos
      setResendCooldown(60);  // 60 segundos de enfriamiento
      setSuccessMessage(
        res?.message || 'Si el correo está registrado, recibirás un código de verificación de 6 dígitos válido por 15 minutos.'
      );
    } catch (err) {
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        setErrorMessage(err.details.join(' '));
      } else {
        setErrorMessage(err.message || 'No fue posible solicitar el código de recuperación.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsResending(true);
    try {
      const res = await apiService.forgotPassword(recoverEmail.trim());
      setOtpSecondsLeft(900);
      setResendCooldown(60);
      setSuccessMessage(res?.message || 'Nuevo código de verificación enviado exitosamente.');
    } catch (err) {
      setErrorMessage(err.message || 'Error al reenviar el código de verificación.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = (recoverEmail || '').trim();
    const cleanCode = (recoverCode || '').trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMessage('Por favor ingresa el código de verificación de 6 dígitos.');
      return;
    }
    if (otpSecondsLeft <= 0) {
      setErrorMessage('El código de verificación ha expirado. Por favor solicita uno nuevo.');
      return;
    }
    if (!recoverNewPassword || !recoverConfirmPassword) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }
    if (!isPasswordCompliant(recoverNewPassword)) {
      setErrorMessage(
        'La nueva contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.'
      );
      return;
    }
    if (recoverNewPassword !== recoverConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifíquelas.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.resetPassword({
        email: cleanEmail,
        code: cleanCode,
        newPassword: recoverNewPassword.trim(),
        confirmPassword: recoverConfirmPassword.trim()
      });

      // Redirigir a login con el email prellenado y mensaje de éxito destacado
      setActiveTab('login');
      setLoginEmail(cleanEmail);
      setLoginPassword('');
      setRecoverStep(1);
      setRecoverCode('');
      setRecoverNewPassword('');
      setRecoverConfirmPassword('');
      setSuccessMessage(
        res?.message || '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva contraseña.'
      );
    } catch (err) {
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        setErrorMessage(err.details.join(' '));
      } else {
        setErrorMessage(err.message || 'No fue posible restablecer la contraseña.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openTermsModal = (section = 'all') => {
    setTermsModalSection(section);
    setIsTermsModalOpen(true);
  };

  const renderPasswordRulesList = (rules, idPrefix) => (
    <ul
      id={`${idPrefix}-password-rules`}
      className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[10px]"
    >
      <li className={`flex items-center gap-1 font-medium ${rules.minLength ? 'text-emerald-400' : 'text-slate-400'}`}>
        <Check className={`w-3 h-3 flex-shrink-0 ${rules.minLength ? 'opacity-100 text-emerald-400' : 'opacity-30'}`} />
        <span>Mín. 8 caracteres</span>
      </li>
      <li className={`flex items-center gap-1 font-medium ${rules.hasUpper ? 'text-emerald-400' : 'text-slate-400'}`}>
        <Check className={`w-3 h-3 flex-shrink-0 ${rules.hasUpper ? 'opacity-100 text-emerald-400' : 'opacity-30'}`} />
        <span>1 Mayúscula (A-Z)</span>
      </li>
      <li className={`flex items-center gap-1 font-medium ${rules.hasLower ? 'text-emerald-400' : 'text-slate-400'}`}>
        <Check className={`w-3 h-3 flex-shrink-0 ${rules.hasLower ? 'opacity-100 text-emerald-400' : 'opacity-30'}`} />
        <span>1 Minúscula (a-z)</span>
      </li>
      <li className={`flex items-center gap-1 font-medium ${rules.hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
        <Check className={`w-3 h-3 flex-shrink-0 ${rules.hasNumber ? 'opacity-100 text-emerald-400' : 'opacity-30'}`} />
        <span>1 Número (0-9)</span>
      </li>
      <li className={`flex items-center gap-1 font-medium col-span-2 sm:col-span-2 ${rules.hasSpecial ? 'text-emerald-400' : 'text-slate-400'}`}>
        <Check className={`w-3 h-3 flex-shrink-0 ${rules.hasSpecial ? 'opacity-100 text-emerald-400' : 'opacity-30'}`} />
        <span>1 Carácter especial (!@#$%...)</span>
      </li>
    </ul>
  );

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-md my-6 bg-[#0b1320] border border-slate-800 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden text-slate-100">
        
        {/* Glow de fondo decorativo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-7 relative z-10">
          
          {/* Logo y Encabezado */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 mb-2.5 ring-4 ring-emerald-500/10">
              <Bike className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              CicloMetrics Web
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Plataforma predictiva de rendimiento ciclista basada en biometría y topografía
            </p>
          </div>

          {/* Selector de Pestañas: [Iniciar Sesión] | [Registrarse] */}
          {activeTab !== 'recover' ? (
            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
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
                onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'register'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  if (recoverStep === 2) {
                    setRecoverStep(1);
                  } else {
                    setActiveTab('login');
                  }
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{recoverStep === 2 ? 'Cambiar correo' : 'Volver al inicio de sesión'}</span>
              </button>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                {recoverStep === 1 ? 'Paso 1 de 2' : 'Paso 2 de 2'}
              </span>
            </div>
          )}

          {/* Mensaje de error general */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mensaje de éxito general */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{successMessage}</p>
                {activeTab === 'recover' && (
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setSuccessMessage(''); setErrorMessage(''); }}
                    className="mt-2 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-colors inline-block"
                  >
                    Iniciar Sesión Ahora →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              PESTAÑA 1: INICIAR SESIÓN
              ======================================================== */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    spellCheck="false"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="usuario@ciclometrics.cl"
                    className="auth-validated-input w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Contraseña
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Mantén presionado el ojo para ver
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    {...getHoldToRevealProps(setShowLoginPassword)}
                    aria-label="Mantener presionado para mostrar contraseña"
                    title="Mantén presionado para mostrar tu contraseña; suéltalo para ocultarla"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white active:text-emerald-400 select-none cursor-pointer transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Enlace de recuperación de contraseña */}
              <div className="flex items-center justify-end text-[11px] text-slate-400 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('recover');
                    setRecoverStep(1);
                    setRecoverEmail(loginEmail || '');
                    setRecoverCode('');
                    setRecoverNewPassword('');
                    setRecoverConfirmPassword('');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
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
                    <span>Iniciar Sesión en CicloMetrics</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-slate-800/70">
                <button
                  type="button"
                  onClick={() => openTermsModal('all')}
                  className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consultar Términos de Uso y Tratamiento de Datos</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              PESTAÑA 2: REGISTRARSE
              ======================================================== */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label htmlFor="reg-nombre" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-nombre"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej. Ricardo Henríquez"
                    className="auth-validated-input w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    minLength={2}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    spellCheck="false"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="usuario@ciclometrics.cl"
                    className="auth-validated-input w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Contraseña con indicadores de complejidad situados arriba del campo (Modern Web Guidance) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="reg-password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Contraseña Segura
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Mantén presionado el ojo para ver
                  </span>
                </div>
                {renderPasswordRulesList(regPwdRules, 'reg')}
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-password"
                    name="new-password"
                    type={showRegPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    pattern={PASSWORD_COMPLEXITY_PATTERN}
                    minLength={8}
                    aria-describedby="reg-password-rules"
                    placeholder="Mín. 8 caracteres (Aa1!)"
                    className="auth-validated-input w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    {...getHoldToRevealProps(setShowRegPassword)}
                    aria-label="Mantener presionado para mostrar contraseña"
                    title="Mantén presionado para mostrar tu contraseña; suéltalo para ocultarla"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white active:text-emerald-400 select-none cursor-pointer transition-colors"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="reg-confirm-password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Confirmar Contraseña
                  </label>
                  {regConfirmPassword && (
                    <span
                      className={`text-[10px] font-bold ${
                        regPassword === regConfirmPassword ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {regPassword === regConfirmPassword ? '✓ Coinciden' : '✕ No coinciden'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-confirm-password"
                    name="confirm-password"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña exacta"
                    className={`w-full bg-slate-900 border rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      regConfirmPassword
                        ? regPassword === regConfirmPassword
                          ? 'border-emerald-500/80 focus:border-emerald-500'
                          : 'border-rose-500/80 focus:border-rose-500'
                        : 'border-slate-800 focus:border-emerald-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    {...getHoldToRevealProps(setShowRegConfirmPassword)}
                    aria-label="Mantener presionado para mostrar confirmación de contraseña"
                    title="Mantén presionado para mostrar la contraseña; suéltalo para ocultarla"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white active:text-emerald-400 select-none cursor-pointer transition-colors"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-0.5">
                <div>
                  <label htmlFor="reg-peso" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    id="reg-peso"
                    type="number"
                    min="30"
                    max="250"
                    step="0.01"
                    placeholder="Ej. 62.02"
                    value={regPeso}
                    onChange={(e) => setRegPeso(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reg-altura" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Altura (cm)
                  </label>
                  <input
                    id="reg-altura"
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
                <label htmlFor="reg-nivel" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nivel Ciclista
                </label>
                <select
                  id="reg-nivel"
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

              {/* Aceptación obligatoria de Términos y Condiciones + Tratamiento de Datos */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <input
                    id="reg-accept-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                    required
                  />
                  <label htmlFor="reg-accept-terms" className="text-[11px] text-slate-300 leading-snug cursor-pointer">
                    He leído y acepto los{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        openTermsModal('terms');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold underline"
                    >
                      Términos de Uso del Producto
                    </button>{' '}
                    y la{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        openTermsModal('privacy');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold underline"
                    >
                      Política de Tratamiento de Datos Personales (Ley N° 21.719)
                    </button>
                    .
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
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

          {/* ========================================================
              PESTAÑA 3: RECUPERAR CONTRASEÑA EN 2 PASOS (OTP 6 DÍGITOS)
              ======================================================== */}
          {activeTab === 'recover' && (
            <div className="space-y-4">
              {/* PASO 1: SOLICITUD DEL CÓDIGO */}
              {recoverStep === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1.5">
                      <KeyRound className="w-4 h-4" />
                      <span>Recuperación de Contraseña</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ingresa tu correo para recibir un código de verificación de 6 dígitos (válido por 15 minutos).
                    </p>
                  </div>

                  <div>
                    <label htmlFor="recover-email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Correo Electrónico Registrado
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="recover-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        spellCheck="false"
                        value={recoverEmail}
                        onChange={(e) => setRecoverEmail(e.target.value)}
                        placeholder="usuario@ciclometrics.cl"
                        className="auth-validated-input w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando Código de Verificación...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Enviar Código de Verificación</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center border-t border-slate-800/70">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-[11px] text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver al inicio de sesión</span>
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 2: VERIFICACIÓN DEL CÓDIGO Y NUEVA CONTRASEÑA */}
              {recoverStep === 2 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  {/* Resumen informativo con enlace para cambiar correo */}
                  <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-3.5 flex items-start justify-between gap-3">
                    <div className="text-xs">
                      <p className="text-slate-400">
                        Enviamos un código de 6 dígitos a:
                      </p>
                      <p className="font-bold text-white break-all text-xs mt-0.5">
                        {recoverEmail}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoverStep(1);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline flex-shrink-0 transition-colors"
                    >
                      Cambiar correo
                    </button>
                  </div>

                  {/* Campo para el código OTP de 6 dígitos */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="recover-otp" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Código OTP de 6 Dígitos
                      </label>
                      {/* Temporizador visual de expiración */}
                      <div className="flex items-center gap-1 text-[11px] font-medium">
                        {otpSecondsLeft > 0 ? (
                          <span className="text-amber-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>⏱️ Código válido por {formatTimer(otpSecondsLeft)}</span>
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3" />
                            <span>Código expirado</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        id="recover-otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={recoverCode}
                        onChange={(e) => setRecoverCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono tracking-[0.4em] text-center text-lg font-bold"
                        required
                      />
                    </div>

                    {/* Opción reenviar código con enfriamiento de 60s */}
                    <div className="flex items-center justify-between mt-1.5 px-0.5 text-[11px]">
                      <span className="text-slate-500">¿No recibiste el código?</span>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isResending}
                        onClick={handleResendOtp}
                        className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 disabled:cursor-not-allowed font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Reenviando...</span>
                          </>
                        ) : resendCooldown > 0 ? (
                          <>
                            <RotateCcw className="w-3 h-3" />
                            <span>Reenviar código ({resendCooldown}s)</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3 h-3" />
                            <span>Reenviar código</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Campos de Nueva Contraseña */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="recover-new-password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Nueva Contraseña
                      </label>
                      <span className="text-[10px] text-slate-500">
                        Mantén presionado el ojo para ver
                      </span>
                    </div>
                    {renderPasswordRulesList(recoverPwdRules, 'recover')}
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="recover-new-password"
                        name="new-password"
                        type={showRecoverPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={recoverNewPassword}
                        onChange={(e) => setRecoverNewPassword(e.target.value)}
                        pattern={PASSWORD_COMPLEXITY_PATTERN}
                        minLength={8}
                        aria-describedby="recover-password-rules"
                        placeholder="Mín. 8 caracteres (Aa1!)"
                        className="auth-validated-input w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        {...getHoldToRevealProps(setShowRecoverPassword)}
                        aria-label="Mantener presionado para mostrar nueva contraseña"
                        title="Mantén presionado para mostrar la contraseña; suéltalo para ocultarla"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white active:text-cyan-400 select-none cursor-pointer transition-colors"
                      >
                        {showRecoverPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Nueva Contraseña */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="recover-confirm-password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Confirmar Nueva Contraseña
                      </label>
                      {recoverConfirmPassword && (
                        <span
                          className={`text-[10px] font-bold ${
                            recoverNewPassword === recoverConfirmPassword ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {recoverNewPassword === recoverConfirmPassword ? '✓ Coinciden' : '✕ No coinciden'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="recover-confirm-password"
                        name="confirm-new-password"
                        type={showRecoverConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={recoverConfirmPassword}
                        onChange={(e) => setRecoverConfirmPassword(e.target.value)}
                        placeholder="Repite tu nueva contraseña"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        {...getHoldToRevealProps(setShowRecoverConfirmPassword)}
                        aria-label="Mantener presionado para mostrar confirmación de contraseña"
                        title="Mantén presionado para mostrar la contraseña; suéltalo para ocultarla"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white active:text-cyan-400 select-none cursor-pointer transition-colors"
                      >
                        {showRecoverConfirmPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Botón Restablecer Contraseña */}
                  <button
                    type="submit"
                    disabled={isLoading || otpSecondsLeft <= 0}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Restableciendo Contraseña...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Restablecer Contraseña</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modal Nativo <dialog> de Términos y Condiciones de Uso y Tratamiento de Datos */}
      <TermsAndPrivacyModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAcceptTerms={() => {
          setAcceptedTerms(true);
          setIsTermsModalOpen(false);
        }}
        initialSection={termsModalSection}
      />
    </div>
  );
}
