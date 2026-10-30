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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Perfil Altimétrico de Elevación
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ascenso acumulado: -- m
              </p>
            </div>
          </div>
        </div>
        <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <Mountain className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-xs">Sin datos de elevación disponibles. Calcule una ruta para renderizar la altimetría.</p>
        </div>
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

  // Cálculo de pendiente por tramo con ventana mínima de seguridad (40m) y acotada físicamente
  const getSlope = (index) => {
    if (!points || points.length < 2 || index < 0 || index >= points.length) return 0;

    let startIdx = index > 0 ? index - 1 : 0;
    let endIdx = index > 0 ? index : 1;

    // Si el paso entre puntos consecutivos es menor a 40m, expandir ventana para evitar ruido puntual
    const minSafeWindow = 40;
    while (
      (points[endIdx].distance - points[startIdx].distance) < minSafeWindow &&
      (startIdx > 0 || endIdx < points.length - 1)
    ) {
      if (startIdx > 0) startIdx--;
      if (endIdx < points.length - 1) endIdx++;
    }

    const pStart = points[startIdx];
    const pEnd = points[endIdx];
    const dDist = pEnd.distance - pStart.distance;
    const dElev = pEnd.elevation - pStart.elevation;

    if (dDist < 5) return 0;

    const rawSlope = (dElev / dDist) * 100;
    // Acotar físicamente en el rango [-30%, +30%]
    return Math.max(-30, Math.min(30, rawSlope));
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

  const { calculatedAscent, calculatedDescent, maxSlopePct } = React.useMemo(() => {
    let gain = 0;
    let loss = 0;
    let maxS = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const diff = points[i + 1].elevation - points[i].elevation;
      const dDist = points[i + 1].distance - points[i].distance;
      if (diff > 0) gain += diff;
      if (diff < 0) loss += Math.abs(diff);
      if (dDist >= 5) {
        const s = (diff / dDist) * 100;
        if (s > maxS) maxS = s;
      }
    }
    return {
      calculatedAscent: Math.round(gain),
      calculatedDescent: Math.round(loss),
      maxSlopePct: Math.min(30, Math.round(maxS * 10) / 10)
    };
  }, [points]);

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
              Perfil Altimétrico de Elevación
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {points.length > 0 
                ? `Ascenso Acumulado: ↑ ${calculatedAscent} m · ↓ ${calculatedDescent} m | Máx: ${Math.round(maxElevationRaw)} m | Pendiente Máx: ${maxSlopePct.toFixed(1)}%` 
                : 'Ascenso acumulado: -- m'}
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
