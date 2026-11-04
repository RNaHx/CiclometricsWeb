import React from 'react';
import { Cookie } from 'lucide-react';

export default function CookieConsentBanner({ user, onAccept, onDecline, onOpenPolicy }) {
  if (!user) return null;

  return (
    <div
      role="region"
      aria-label="Consentimiento de privacidad y cookies"
      className="fixed bottom-0 inset-x-0 z-50 bg-[#070e18]/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl text-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        {/* Contenido descriptivo (Izquierda) */}
        <div className="space-y-1.5 max-w-4xl text-left">
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Privacidad y cookies
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Utilizamos cookies y tecnologías similares para garantizar el funcionamiento seguro y óptimo de la plataforma. Algunas cookies son estrictamente necesarias para autenticar tu cuenta y mantener tu sesión activa. También utilizamos almacenamiento local para guardar tus configuraciones y optimizar tus cálculos biomecánicos. Puedes gestionar tus preferencias en cualquier momento. Para más información, consulta nuestra{' '}
            <button
              type="button"
              onClick={onOpenPolicy}
              className="text-emerald-400 hover:text-emerald-300 underline font-medium transition-colors inline cursor-pointer"
            >
              Política de Privacidad y Tratamiento de Datos
            </button>
            .
          </p>
        </div>

        {/* Botones en formato píldora (Derecha) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenPolicy}
            className="w-full sm:w-auto rounded-full border border-slate-300 dark:border-slate-400 text-white hover:bg-white/10 px-5 py-2 text-xs sm:text-sm font-semibold transition-all text-center whitespace-nowrap cursor-pointer"
          >
            Configurar cookies
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="w-full sm:w-auto rounded-full border border-slate-300 dark:border-slate-400 text-white hover:bg-white/10 px-5 py-2 text-xs sm:text-sm font-semibold transition-all text-center whitespace-nowrap cursor-pointer"
          >
            Rechazar opcionales
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="w-full sm:w-auto rounded-full bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all text-center whitespace-nowrap cursor-pointer"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
