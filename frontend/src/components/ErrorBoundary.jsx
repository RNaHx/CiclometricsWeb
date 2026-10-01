import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó una excepción en la interfaz:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] w-full p-6 flex flex-col items-center justify-center bg-slate-900 border border-rose-500/30 rounded-2xl text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 ring-8 ring-rose-500/5">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-2">
            Módulo de Recuperación Visual
          </span>
          <h3 className="text-lg font-bold text-white mb-2">
            Se detectó una interrupción en el renderizado
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            El sistema contuvo el fallo para evitar que la aplicación se apague. Puedes restaurar el estado interactivo de la interfaz con un clic.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recuperar Vista</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
            >
              Recargar CicloMetrics
            </button>
          </div>

          {this.state.error && (
            <details className="mt-6 text-left max-w-xl w-full bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 overflow-x-auto">
              <summary className="cursor-pointer text-slate-500 hover:text-slate-300 font-mono">
                Detalles técnicos del error
              </summary>
              <pre className="mt-2 font-mono text-[10px] text-rose-300 whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
