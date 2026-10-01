import React, { useState, useRef } from 'react';
import { Mountain, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

export default function ElevationProfileChart({
  points = [],
  coordinates = [],
  onHoverPoint,
  theme
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  if (!points || points.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 p-6 text-center">
        <Mountain className="w-10 h-10 mb-2 opacity-40 animate-pulse" />
        <p className="text-sm font-medium">Cargando perfil altimétrico de la ruta...</p>
      </div>
    );
  }

  // Dimensiones del canvas SVG
  const width = 800;
  const height = 240;
  const padding = { top: 25, right: 35, bottom: 40, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Cálculos de dominios min y max
  const maxDistance = points[points.length - 1].distance || 1;
  const elevations = points.map(p => p.elevation);
  const minElevationRaw = Math.min(...elevations);
  const maxElevationRaw = Math.max(...elevations);

  // Margen en Y para que el gráfico no toque los extremos
  const elevRange = Math.max(maxElevationRaw - minElevationRaw, 30);
  const minElevation = Math.max(0, Math.floor((minElevationRaw - elevRange * 0.15) / 10) * 10);
  const maxElevation = Math.ceil((maxElevationRaw + elevRange * 0.15) / 10) * 10;

  // Funciones de mapeo
  const getX = (dist) => padding.left + (dist / maxDistance) * chartWidth;
  const getY = (elev) => padding.top + chartHeight - ((elev - minElevation) / (maxElevation - minElevation)) * chartHeight;

  // Construcción de la ruta SVG para el polígono de área y la línea de perfil
  const pathD = points.reduce((acc, p, i) => {
    const x = getX(p.distance);
    const y = getY(p.elevation);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(points[points.length - 1].distance)} ${padding.top + chartHeight} L ${getX(points[0].distance)} ${padding.top + chartHeight} Z`;

  // Cálculo de pendiente puntual para cada tramo
  const getSlope = (index) => {
    if (index === 0) {
      if (points.length < 2) return 0;
      const dD = points[1].distance - points[0].distance;
      const dE = points[1].elevation - points[0].elevation;
      return dD > 0 ? (dE / dD) * 100 : 0;
    }
    const prev = points[index - 1];
    const curr = points[index];
    const dDist = curr.distance - prev.distance;
    const dElev = curr.elevation - prev.elevation;
    return dDist > 0 ? (dElev / dDist) * 100 : 0;
  };

  // Manejo de interacción táctil / mouse
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const mouseX = clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;

    // Buscar el punto más cercano
    let closestIdx = 0;
    let minDiff = Infinity;

    points.forEach((p, idx) => {
      const px = getX(p.distance);
      const diff = Math.abs(px - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
    if (onHoverPoint && coordinates.length > 0) {
      const targetCoord = coordinates.length === points.length
        ? coordinates[closestIdx]
        : coordinates[Math.min(coordinates.length - 1, Math.round((closestIdx / Math.max(1, points.length - 1)) * (coordinates.length - 1)))];
      if (targetCoord) {
        onHoverPoint(targetCoord, closestIdx);
      }
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    if (onHoverPoint) {
      onHoverPoint(null, null);
    }
  };

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;
  const activeSlope = hoverIndex !== null ? getSlope(hoverIndex) : null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg transition-colors">
      
      {/* Cabecera del Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Perfil Altimétrico Continuo (Topografía)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interpolación LERP de elevación y gradientes tramo a tramo
            </p>
          </div>
        </div>

        {/* Resumen del punto bajo el cursor */}
        {activePoint ? (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">Distancia</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {(activePoint.distance / 1000).toFixed(2)} km
              </span>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
              <span className="text-slate-400 text-[10px] block">Altitud</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {Math.round(activePoint.elevation)} m
              </span>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
              <span className="text-slate-400 text-[10px] block">Pendiente</span>
              <span className={`font-extrabold flex items-center gap-1 ${
                activeSlope > 6 ? 'text-rose-500' :
                activeSlope > 2 ? 'text-amber-500' :
                activeSlope < -2 ? 'text-cyan-500' : 'text-emerald-500'
              }`}>
                {activeSlope > 1 ? <TrendingUp className="w-3.5 h-3.5" /> :
                 activeSlope < -1 ? <TrendingDown className="w-3.5 h-3.5" /> :
                 <Minus className="w-3.5 h-3.5" />}
                {activeSlope.toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Pasa el cursor por el gráfico para explorar pendientes</span>
          </div>
        )}
      </div>

      {/* Contenedor SVG Interactivo */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Gradiente para el relleno de la montaña */}
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradiente de la línea del perfil */}
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Líneas de rejilla horizontal (Altitud) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * ratio;
            const elevVal = Math.round(maxElevation - (maxElevation - minElevation) * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  fontFamily="system-ui"
                >
                  {elevVal}m
                </text>
              </g>
            );
          })}

          {/* Líneas de rejilla vertical (Distancia km) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const x = padding.left + chartWidth * ratio;
            const distKm = ((maxDistance * ratio) / 1000).toFixed(1);
            return (
              <g key={ratio}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  fontFamily="system-ui"
                >
                  {distKm} km
                </text>
              </g>
            );
          })}

          {/* Relleno sombreado del perfil */}
          <path d={areaD} fill="url(#elevGradient)" />

          {/* Línea del perfil de elevación */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Línea y punto activo de interacción */}
          {activePoint && (
            <g>
              {/* Línea vertical guía */}
              <line
                x1={getX(activePoint.distance)}
                y1={padding.top}
                x2={getX(activePoint.distance)}
                y2={padding.top + chartHeight}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Círculo puntual sobre la línea */}
              <circle
                cx={getX(activePoint.distance)}
                cy={getY(activePoint.elevation)}
                r="7"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="shadow-lg"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
