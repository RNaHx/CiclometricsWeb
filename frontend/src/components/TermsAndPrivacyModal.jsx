import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Scale, FileText, Lock, Cookie, Bike, CheckCircle2, X, AlertTriangle, Database } from 'lucide-react';

export default function TermsAndPrivacyModal({ isOpen, onClose, onAcceptTerms, initialSection = 'all' }) {
  const dialogRef = useRef(null);
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      const val = dialog.returnValue;
      dialog.returnValue = '';
      if (val === 'accept' && onAcceptTerms) {
        onAcceptTerms();
      }
      if (onClose) {
        onClose();
      }
    };

    dialog.addEventListener('close', handleClose);

    // Fallback de light-dismiss para navegadores sin soporte nativo de closedBy
    let cleanupLightDismiss = null;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dlg) => {
        const r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      const onPointerDown = (e) => {
        pressedOutside = outside(e, dialog);
      };
      const onPointerUp = (e) => {
        if (pressedOutside && outside(e, dialog)) {
          dialog.close();
        }
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      cleanupLightDismiss = () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      if (cleanupLightDismiss) cleanupLightDismiss();
    };
  }, [onClose, onAcceptTerms]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="terms-dialog-title"
      {...({ closedby: 'any' })}
      className="m-auto w-full max-w-3xl max-h-[88vh] bg-[#0b1320] text-slate-100 border border-slate-800 rounded-3xl shadow-2xl shadow-emerald-500/10 p-0 overflow-hidden backdrop:bg-slate-950/85 backdrop:backdrop-blur-md"
    >
      <div className="flex flex-col max-h-[88vh]">
        {/* Encabezado fijo */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                Marco Legal y Normativo • CicloMetrics Web
              </span>
              <h2 id="terms-dialog-title" className="text-lg sm:text-xl font-black text-white tracking-tight">
                Términos de Uso del Producto y Tratamiento de Datos
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close('cancel')}
            aria-label="Cerrar ventana de términos y condiciones"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de navegación rápida */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'all'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Documento Completo
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('terms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
              activeSection === 'terms'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            1. Términos de Uso
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
              activeSection === 'privacy'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            2. Tratamiento de Datos (Ley 21.719)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('cookies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
              activeSection === 'cookies'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            3. Política de Cookies
          </button>
        </div>

        {/* Cuerpo desplazable del documento legal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed flex-1">
          
          {/* SECCIÓN 1: TÉRMINOS DE USO DEL PRODUCTO */}
          {(activeSection === 'all' || activeSection === 'terms') && (
            <section className="space-y-3 bg-slate-900/50 border border-slate-800/90 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2.5 text-emerald-400 font-extrabold text-sm">
                <Bike className="w-5 h-5" />
                <h3>1. Términos y Condiciones de Uso del Producto</h3>
              </div>

              <p>
                Bienvenido a <strong>CicloMetrics Web</strong>, plataforma de planificación predictiva de rutas ciclistas desarrollada en el marco académico de la Escuela de Informática de la <strong>Universidad Andrés Bello (UNAB)</strong>, Santiago de Chile. Al crear una cuenta y utilizar la aplicación, el usuario acepta íntegramente las presentes condiciones:
              </p>

              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>
                  <strong>Naturaleza Predictiva y Referencial de los Cálculos:</strong> Las estimaciones de gasto calórico (basadas en el Compendio de Equivalentes Metabólicos MET de <em>Ainsworth et al., 2011</em>), el Tiempo Estimado de Llegada (ETA) según pendiente y la recomendación de presión de neumáticos (basada en la regla del <em>15% drop de Frank Berto y Schwalbe, 2022</em>) constituyen orientaciones físico-matemáticas y <strong>no reemplazan una evaluación médica deportiva ni las especificaciones máximas del fabricante de su bicicleta</strong>.
                </li>
                <li>
                  <strong>Límites Mecánicos de Seguridad:</strong> El usuario es responsable de verificar los rangos de presión mínima y máxima (<code className="text-emerald-300">PSI_min</code> y <code className="text-emerald-300">PSI_max</code>) grabados en el flanco lateral de sus cubiertas antes de inflar los neumáticos.
                </li>
                <li>
                  <strong>Cumplimiento de la Ley de Convivencia Vial (Ley N° 21.088):</strong> El trazado de rutas sobre cartografía abierta (OpenStreetMap, CyclOSM y OSRM) es referencial. Durante la circulación en vía pública, el ciclista debe respetar la señalización del tránsito vigente en Chile, utilizar casco protector, elementos reflectantes y mantener atención permanente al entorno vial, especialmente al utilizar la vista de <em>Cockpit Móvil en Manillar</em>.
                </li>
                <li>
                  <strong>Propiedad Intelectual (Ley N° 17.336):</strong> El motor de cálculo predictivo, el algoritmo de suavizado altimétrico con Kernel Gaussiano y el diseño del sistema están protegidos por la legislación chilena de propiedad intelectual, integrando componentes cartográficos de licencia abierta debidamente atribuidos.
                </li>
              </ul>
            </section>
          )}

          {/* SECCIÓN 2: POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES Y BIOMÉTRICOS */}
          {(activeSection === 'all' || activeSection === 'privacy') && (
            <section className="space-y-3 bg-slate-900/50 border border-slate-800/90 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2.5 text-cyan-400 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <h3>2. Política de Tratamiento de Datos Personales y Biométricos (Ley N° 19.628 y Ley N° 21.719)</h3>
              </div>

              <p>
                En estricto cumplimiento de la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> y su modernización mediante la <strong>Ley N° 21.719 de 2024</strong> que regula el tratamiento y protección de datos personales en Chile, informamos de manera transparente cómo se recolectan, procesan y resguardan sus datos:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>Datos Recolectados</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Nombre, correo electrónico, parámetros biométricos (peso corporal en kg, estatura en cm, edad, género y nivel de condición física) y especificaciones técnicas de sus bicicletas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Ciberseguridad y Cifrado</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Las contraseñas nunca se almacenan en texto plano; se protegen mediante derivación criptográfica <code className="text-emerald-300">scrypt</code> con salt aleatorio de 16 bytes y comparación inmune a ataques de temporización.
                  </p>
                </div>
              </div>

              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>
                  <strong>Principio de Finalidad Exclusiva:</strong> Sus variables biométricas (peso, altura, edad) se utilizan única y exclusivamente para parametrizar las ecuaciones de gasto energético (<code>E = MET × M_sistema × Δt</code>) y la distribución de carga sobre los ejes de la bicicleta (40% delantero / 60% trasero).
                </li>
                <li>
                  <strong>No Comercialización ni Cesión a Terceros:</strong> CicloMetrics Web no vende, arrienda ni transfiere sus datos personales o biométricos a terceros ni a redes publicitarias. Las consultas a servicios externos de elevación y ruteo (Open-Meteo y OSRM) solo envían coordenadas geográficas anónimas de la ruta.
                </li>
                <li>
                  <strong>Derechos ARCO+ del Titular (Acceso, Rectificación, Cancelación y Oposición):</strong> El usuario puede en cualquier momento visualizar y actualizar sus datos biométricos desde el panel de <em>Perfil</em>, administrar o eliminar bicicletas de su garaje, o solicitar la eliminación definitiva de su cuenta.
                </li>
              </ul>
            </section>
          )}

          {/* SECCIÓN 3: POLÍTICA DE COOKIES DE SESIÓN */}
          {(activeSection === 'all' || activeSection === 'cookies') && (
            <section className="space-y-3 bg-slate-900/50 border border-slate-800/90 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-sm">
                <Cookie className="w-5 h-5" />
                <h3>3. Uso de Cookies Esenciales y Persistencia de Sesión</h3>
              </div>

              <p>
                CicloMetrics Web utiliza exclusivamente <strong>cookies técnicas de sesión estrictamente necesarias</strong> (sin cookies de rastreo publicitario de terceros):
              </p>

              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>
                  <code className="text-amber-300">ciclometrics_auth_token</code> y <code className="text-amber-300">ciclometrics_auth_user</code>: Permiten mantener su sesión autenticada activa en su navegador por hasta 30 días (con atributo de seguridad <code className="text-amber-300">SameSite=Lax</code>), evitando que deba volver a introducir su correo y contraseña cada vez que abre la aplicación.
                </li>
                <li>
                  <code className="text-amber-300">ciclometrics_cookie_consent</code>: Registra su preferencia sobre el almacenamiento persistente de la sesión al iniciar sesión por primera vez.
                </li>
              </ul>
            </section>
          )}

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-200">
            <AlertTriangle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Al marcar la casilla de aceptación en el formulario de registro, usted declara haber leído este documento y otorga su consentimiento expreso e informado conforme a la Ley N° 19.628 y Ley N° 21.719.
            </span>
          </div>
        </div>

        {/* Pie del modal con acciones */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close('cancel')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
          {onAcceptTerms && (
            <button
              type="button"
              onClick={() => dialogRef.current?.close('accept')}
              autofocus="true"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aceptar Términos y Tratamiento de Datos</span>
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
