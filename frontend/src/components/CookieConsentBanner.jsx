import React from 'react';
import { Cookie, ShieldCheck, CheckCircle2, Clock, FileText } from 'lucide-react';

export default function CookieConsentBanner({ user, onAccept, onDecline, onOpenPolicy }) {
  if (!user) return null;

  return (
    <div
      role="region"
      aria-label="Consentimiento de uso de cookies de sesión"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none flex justify-center"
    >
      <div className="pointer-events-auto w-full max-w-3xl bg-[#0b1320]/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/60 p-5 sm:p-6 text-slate-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 mt-0.5">
              <Cookie className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Primera Sesión Detectada
                </span>
                <h3 className="text-sm sm:text-base font-black text-white">
                  Uso de Cookies Esenciales para Mantener tu Sesión Iniciada
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hola, <strong>{user.nombre}</strong>. Utilizamos cookies técnicas estrictamente necesarias (<code className="text-emerald-300">ciclometrics_auth_token</code> y <code className="text-emerald-300">ciclometrics_auth_user</code>) para recordar tu sesión de forma segura en este navegador y evitar que tengas que iniciar sesión cada vez que abras la página.
              </p>
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={onOpenPolicy}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Consultar Política de Cookies y Tratamiento de Datos (Ley N° 21.719)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto flex-shrink-0">
            <button
              type="button"
              onClick={onDecline}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
              title="Tu sesión solo se mantendrá abierta mientras no cierres esta pestaña"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Solo esta pestaña</span>
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aceptar Cookies y Mantener Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
