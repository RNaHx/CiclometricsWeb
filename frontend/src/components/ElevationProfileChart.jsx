import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Mountain, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

// Dimensiones estándar del canvas SVG
const CHART_WIDTH_TOTAL = 800;
const CHART_HEIGHT_TOTAL = 240;
const PADDING = { top: 25, right: 35, bottom: 40, left: 55 };
const CHART_INNER_WIDTH = CHART_WIDTH_TOTAL - PADDING.left - PADDING.right;
const CHART_INNER_HEIGHT = CHART_HEIGHT_TOTAL - PADDING.top - PADDING.bottom;

function ElevationProfileChart({
  points = [],
  coordinates = [],
  onHoverPoint,
  theme
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);
  const rafIdRef = useRef(null);

  // Memoización integral de cálculos geométricos del SVG y dominios
  const {
    maxDistance,
    elevations,
    minElevationRaw,
    maxElevationRaw,
    minElevation,
    maxElevation,
    getX,
    getY,
    pathD,
    areaD
  } = useMemo(() => {
    if (!points || points.length === 0) {
      return {
        maxDistance: 1,
        elevations: [],
        minElevationRaw: 0,
        maxElevationRaw: 0,
        minElevation: 0,
        maxElevation: 100,
        getX: () => PADDING.left,
        getY: () => PADDING.top,
        pathD: '',
        areaD: ''
      };
    }

    const maxDist = points[points.length - 1].distance || 1;
    const elevs = points.map(p => p.elevation);
    const minRaw = Math.min(...elevs);
    const maxRaw = Math.max(...elevs);

    // Margen en Y para que el gráfico no toque los bordes superior e inferior
    const elevRange = Math.max(maxRaw - minRaw, 30);
    const minElev = Math.max(0, Math.floor((minRaw - elevRange * 0.15) / 10) * 10);
    const maxElev = Math.ceil((maxRaw + elevRange * 0.15) / 10) * 10;
    const elevDenominator = maxElev - minElev || 1;

    // Funciones de proyección lineal
    const calcX = (dist) => PADDING.left + (dist / maxDist) * CHART_INNER_WIDTH;
    const calcY = (elev) => PADDING.top + CHART_INNER_HEIGHT - ((elev - minElev) / elevDenominator) * CHART_INNER_HEIGHT;

    // Construcción de la ruta SVG para el trazo de contorno
    let path = '';
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x = calcX(p.distance);
      const y = calcY(p.elevation);
      path += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }

    const lastX = calcX(points[points.length - 1].distance);
    const firstX = calcX(points[0].distance);
    const groundY = PADDING.top + CHART_INNER_HEIGHT;
    const area = `${path} L ${lastX} ${groundY} L ${firstX} ${groundY} Z`;

    return {
      maxDistance: maxDist,
      elevations: elevs,
      minElevationRaw: minRaw,
      maxElevationRaw: maxRaw,
      minElevation: minElev,
      maxElevation: maxElev,
      getX: calcX,
      getY: calcY,
      pathD: path,
      areaD: area
    };
  }, [points]);

  // Cálculo de pendiente por tramo con ventana mínima de seguridad (40m) y acotada físicamente
  const getSlope = useCallback((index) => {
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
    return Math.max(-30, Math.min(30, rawSlope));
  }, [points]);

  // Manejo de interacción táctil / mouse limitado por requestAnimationFrame
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || !points || points.length === 0) return;

    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : null);
    if (clientX === null) return;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const svgX = (mouseX / rect.width) * CHART_WIDTH_TOTAL;

      let closestIdx = 0;
      let minDiff = Infinity;

      for (let idx = 0; idx < points.length; idx++) {
        const px = getX(points[idx].distance);
        const diff = Math.abs(px - svgX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      }

      setHoverIndex(closestIdx);

      if (onHoverPoint && coordinates && coordinates.length > 0) {
        const targetCoord = coordinates.length === points.length
          ? coordinates[closestIdx]
          : coordinates[Math.min(coordinates.length - 1, Math.round((closestIdx / Math.max(1, points.length - 1)) * (coordinates.length - 1)))];
        if (targetCoord) {
          onHoverPoint(targetCoord, closestIdx);
        }
      }
    });
  }, [points, coordinates, getX, onHoverPoint]);

  const handleMouseLeave = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setHoverIndex(null);
    if (onHoverPoint) {
      onHoverPoint(null, null);
    }
  }, [onHoverPoint]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const { calculatedAscent, calculatedDescent, maxSlopePct } = useMemo(() => {
    if (!points || points.length < 2) {
      return { calculatedAscent: 0, calculatedDescent: 0, maxSlopePct: 0 };
    }
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

  // Si no hay puntos válidos, renderizamos el empty state
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
          viewBox={`0 0 ${CHART_WIDTH_TOTAL} ${CHART_HEIGHT_TOTAL}`}
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
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Líneas de cuadrícula horizontal (Eje Y) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const elevValue = Math.round(minElevation + (maxElevation - minElevation) * (1 - ratio));
            const y = PADDING.top + CHART_INNER_HEIGHT * ratio;
            return (
              <g key={idx}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={PADDING.left + CHART_INNER_WIDTH}
                  y2={y}
                  stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={PADDING.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[10px]"
                >
                  {elevValue} m
                </text>
              </g>
            );
          })}

          {/* Líneas de cuadrícula vertical (Eje X) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const distKm = ((maxDistance / 1000) * ratio).toFixed(1);
            const x = PADDING.left + CHART_INNER_WIDTH * ratio;
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={PADDING.top}
                  x2={x}
                  y2={PADDING.top + CHART_INNER_HEIGHT}
                  stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={PADDING.top + CHART_INNER_HEIGHT + 20}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[10px]"
                >
                  {distKm} km
                </text>
              </g>
            );
          })}

          {/* Área sombreada bajo el relieve */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#elevGradient)"
            />
          )}

          {/* Trazado continuo del relieve de elevación */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Indicador interactivo dinámico cuando se hace hover */}
          {activePoint && (
            <g>
              {/* Línea vertical guía */}
              <line
                x1={getX(activePoint.distance)}
                y1={PADDING.top}
                x2={getX(activePoint.distance)}
                y2={PADDING.top + CHART_INNER_HEIGHT}
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

export default React.memo(ElevationProfileChart);
