import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Globe, 
  Bike, 
  Navigation, 
  Sparkles, 
  Loader2,
  Compass,
  X
} from 'lucide-react';

// Catálogo instantáneo de hitos ciclistas y rutas frecuentes (Chile / RM)
const LOCAL_LANDMARKS = [
  {
    primary: 'Cerro San Cristóbal',
    secondary: 'Santiago, Parque Metropolitano',
    fullLabel: 'Cerro San Cristóbal, Santiago, Parque Metropolitano',
    coords: [-33.42401, -70.63262]
  },
  {
    primary: 'Antonio Varas 810',
    secondary: 'Providencia',
    fullLabel: 'Antonio Varas 810, Providencia',
    coords: [-33.4349, -70.61513]
  },
  {
    primary: 'Avenida Los Leones 2015',
    secondary: 'Providencia',
    fullLabel: 'Avenida Los Leones 2015, Providencia',
    coords: [-33.4368, -70.6012]
  },
  {
    primary: 'Avenida José Joaquín Prieto 10635',
    secondary: 'San Bernardo',
    fullLabel: 'Avenida José Joaquín Prieto 10635, San Bernardo',
    coords: [-33.55005, -70.69035]
  },
  {
    primary: 'Parque Bicentenario',
    secondary: 'Vitacura',
    fullLabel: 'Parque Bicentenario, Vitacura',
    coords: [-33.4015, -70.6020]
  },
  {
    primary: 'Costanera Center',
    secondary: 'Avenida Andrés Bello 2425, Providencia',
    fullLabel: 'Costanera Center, Avenida Andrés Bello 2425, Providencia',
    coords: [-33.4177, -70.6068]
  },
  {
    primary: 'Plaza Baquedano / Plaza Italia',
    secondary: 'Providencia, Santiago',
    fullLabel: 'Plaza Baquedano / Plaza Italia, Providencia, Santiago',
    coords: [-33.4370, -70.6344]
  },
  {
    primary: 'Plaza de Armas',
    secondary: 'Santiago Centro',
    fullLabel: 'Plaza de Armas, Santiago Centro',
    coords: [-33.4378, -70.6505]
  },
  {
    primary: "Templo Bahá'í de Sudamérica",
    secondary: 'Peñalolén',
    fullLabel: "Templo Bahá'í de Sudamérica, Peñalolén",
    coords: [-33.4764, -70.5117]
  },
  {
    primary: 'Cuesta La Dormida',
    secondary: 'Tiltil / Olmué',
    fullLabel: 'Cuesta La Dormida, Tiltil / Olmué',
    coords: [-33.0560, -71.0080]
  },
  {
    primary: 'Farellones',
    secondary: 'Lo Barnechea',
    fullLabel: 'Farellones, Lo Barnechea',
    coords: [-33.3508, -70.3129]
  },
  {
    primary: "Parque O'Higgins",
    secondary: 'Santiago',
    fullLabel: "Parque O'Higgins, Santiago",
    coords: [-33.4642, -70.6596]
  }
];

const normalizeText = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function RoutePlanningCard({
  bicycles = [],
  selectedBikeId,
  onSelectBikeId,
  onCalculateRoute,
  isCalculating
}) {
  const [activeTab, setActiveTab] = useState('direcciones'); // 'direcciones' | 'coordenadas'
  
  // Direcciones inputs y coordenadas preseleccionadas desde autocompletado
  const [origenDir, setOrigenDir] = useState('Antonio Varas 810, Providencia');
  const [destinoDir, setDestinoDir] = useState('Cerro San Cristóbal, Santiago, Provincia de Santiago');
  const [origenSelectedCoords, setOrigenSelectedCoords] = useState([-33.4349, -70.61513]);
  const [destinoSelectedCoords, setDestinoSelectedCoords] = useState([-33.42401, -70.63262]);

  // Estado del autocompletado para Origen
  const [origenSuggestions, setOrigenSuggestions] = useState([]);
  const [isOrigenOpen, setIsOrigenOpen] = useState(false);
  const [isOrigenLoading, setIsOrigenLoading] = useState(false);
  const [origenActiveIdx, setOrigenActiveIdx] = useState(-1);

  // Estado del autocompletado para Destino
  const [destinoSuggestions, setDestinoSuggestions] = useState([]);
  const [isDestinoOpen, setIsDestinoOpen] = useState(false);
  const [isDestinoLoading, setIsDestinoLoading] = useState(false);
  const [destinoActiveIdx, setDestinoActiveIdx] = useState(-1);

  // Referencias para detectar clic fuera
  const origenContainerRef = useRef(null);
  const destinoContainerRef = useRef(null);

  // Coordenadas inputs (pestaña Coordenadas)
  const [origenLat, setOrigenLat] = useState('-33.4350');
  const [origenLng, setOrigenLng] = useState('-70.6150');
  const [destinoLat, setDestinoLat] = useState('-33.4240');
  const [destinoLng, setDestinoLng] = useState('-70.6325');

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (origenContainerRef.current && !origenContainerRef.current.contains(event.target)) {
        setIsOrigenOpen(false);
      }
      if (destinoContainerRef.current && !destinoContainerRef.current.contains(event.target)) {
        setIsDestinoOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar catálogo local instantáneo con preservación de número si coincide la calle
  const getLocalMatches = useCallback((query) => {
    const normQuery = normalizeText(query);
    if (!normQuery) return LOCAL_LANDMARKS.slice(0, 6);

    const tokens = normQuery.split(/\s+/).filter(Boolean);
    return LOCAL_LANDMARKS.filter((item) => {
      const haystack = normalizeText(`${item.primary} ${item.secondary}`);
      return tokens.every((t) => haystack.includes(t)) || haystack.includes(normQuery);
    });
  }, []);

  // Consulta híbrida: Catálogo instantáneo + Nominatim OpenStreetMap Chile
  const fetchHybridSuggestions = useCallback(async (query, setSuggestions, setLoading, signal) => {
    const trimmed = (query || '').trim();
    const localMatches = getLocalMatches(trimmed);

    if (trimmed.length < 2) {
      setSuggestions(localMatches.slice(0, 6));
      setLoading(false);
      return;
    }

    // Mostrar coincidencias locales de inmediato mientras carga Nominatim
    setSuggestions(localMatches.slice(0, 6));
    setLoading(true);

    // Extraer numeración ingresada por el usuario (ej. "2015" en "Avenida Los Leones 2015")
    const numberMatch = trimmed.match(/\b(\d{1,6})\b/);
    const userHouseNumber = numberMatch ? numberMatch[1] : null;

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        trimmed
      )}&countrycodes=cl&addressdetails=1&limit=5`;

      const res = await fetch(url, {
        headers: { 'Accept-Language': 'es' },
        signal
      });

      if (!res.ok) throw new Error('Error consultando Nominatim');
      const data = await res.json();

      const nominatimItems = (Array.isArray(data) ? data : []).map((item) => {
        const addr = item.address || {};
        const baseStreet =
          addr.road ||
          addr.pedestrian ||
          addr.cycleway ||
          addr.footway ||
          addr.suburb ||
          item.name ||
          (item.display_name ? item.display_name.split(',')[0] : trimmed);

        const houseNum = addr.house_number || userHouseNumber || '';
        const primaryHasNum = houseNum && new RegExp(`\\b${houseNum}\\b`).test(baseStreet);
        const primary =
          houseNum && !primaryHasNum ? `${baseStreet} ${houseNum}`.trim() : baseStreet.trim();

        const secondaryCandidates = [
          addr.suburb,
          addr.city_district,
          addr.town,
          addr.city,
          addr.municipality,
          addr.county,
          addr.state
        ].filter(Boolean);

        // Elegir comuna/ciudad que no sea idéntica al nombre principal
        const secondary =
          secondaryCandidates.find(
            (s) => normalizeText(s) !== normalizeText(baseStreet)
          ) ||
          secondaryCandidates[0] ||
          'Chile';

        const fullLabel = secondary ? `${primary}, ${secondary}` : primary;
        const coords = [
          parseFloat(parseFloat(item.lat).toFixed(5)),
          parseFloat(parseFloat(item.lon).toFixed(5))
        ];

        return {
          primary,
          secondary,
          fullLabel,
          coords
        };
      });

      // Combinar locales + Nominatim y deduplicar por primary + secondary
      const combined = [...localMatches, ...nominatimItems];
      const seen = new Set();
      const deduped = [];

      for (const item of combined) {
        const key = `${normalizeText(item.primary)}|${normalizeText(item.secondary)}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(item);
        }
        if (deduped.length >= 6) break;
      }

      setSuggestions(deduped);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setSuggestions(localMatches.slice(0, 6));
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [getLocalMatches]);

  // Efecto debounce (~250ms) para Origen
  useEffect(() => {
    if (!isOrigenOpen) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchHybridSuggestions(origenDir, setOrigenSuggestions, setIsOrigenLoading, controller.signal);
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [origenDir, isOrigenOpen, fetchHybridSuggestions]);

  // Efecto debounce (~250ms) para Destino
  useEffect(() => {
    if (!isDestinoOpen) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchHybridSuggestions(destinoDir, setDestinoSuggestions, setIsDestinoLoading, controller.signal);
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [destinoDir, isDestinoOpen, fetchHybridSuggestions]);

  const handleSelectOrigen = (item) => {
    setOrigenDir(item.fullLabel);
    setOrigenSelectedCoords(item.coords);
    setIsOrigenOpen(false);
    setOrigenActiveIdx(-1);
  };

  const handleSelectDestino = (item) => {
    setDestinoDir(item.fullLabel);
    setDestinoSelectedCoords(item.coords);
    setIsDestinoOpen(false);
    setDestinoActiveIdx(-1);
  };

  const handleOrigenKeyDown = (e) => {
    if (!isOrigenOpen || origenSuggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOrigenOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOrigenActiveIdx((prev) => (prev < origenSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOrigenActiveIdx((prev) => (prev > 0 ? prev - 1 : origenSuggestions.length - 1));
    } else if (e.key === 'Enter' && origenActiveIdx >= 0 && origenSuggestions[origenActiveIdx]) {
      e.preventDefault();
      handleSelectOrigen(origenSuggestions[origenActiveIdx]);
    } else if (e.key === 'Escape') {
      setIsOrigenOpen(false);
      setOrigenActiveIdx(-1);
    }
  };

  const handleDestinoKeyDown = (e) => {
    if (!isDestinoOpen || destinoSuggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsDestinoOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDestinoActiveIdx((prev) => (prev < destinoSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDestinoActiveIdx((prev) => (prev > 0 ? prev - 1 : destinoSuggestions.length - 1));
    } else if (e.key === 'Enter' && destinoActiveIdx >= 0 && destinoSuggestions[destinoActiveIdx]) {
      e.preventDefault();
      handleSelectDestino(destinoSuggestions[destinoActiveIdx]);
    } else if (e.key === 'Escape') {
      setIsDestinoOpen(false);
      setDestinoActiveIdx(-1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOrigenOpen(false);
    setIsDestinoOpen(false);

    if (activeTab === 'direcciones') {
      onCalculateRoute({
        type: 'direcciones',
        origen: origenDir.trim(),
        destino: destinoDir.trim(),
        origenCoords: origenSelectedCoords,
        destinoCoords: destinoSelectedCoords,
        bikeId: selectedBikeId
      });
    } else {
      onCalculateRoute({
        type: 'coordenadas',
        origenCoords: [parseFloat(origenLat), parseFloat(origenLng)],
        destinoCoords: [parseFloat(destinoLat), parseFloat(destinoLng)],
        origen: `Lat: ${origenLat}, Lng: ${origenLng}`,
        destino: `Lat: ${destinoLat}, Lng: ${destinoLng}`,
        bikeId: selectedBikeId
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg transition-colors">
      
      {/* Título de la tarjeta */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <Navigation className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Planificar Nueva Ruta
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Trazado predictivo biomecánico
          </p>
        </div>
      </div>

      {/* Tabs: [📍 Direcciones] | [🌐 Coordenadas] */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-4 border border-slate-200 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setActiveTab('direcciones')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'direcciones'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Direcciones</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('coordenadas')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'coordenadas'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Coordenadas</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Vista Tab Direcciones */}
        {activeTab === 'direcciones' && (
          <>
            {/* Input Dirección Origen con Autocompletado */}
            <div ref={origenContainerRef} className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Dirección Origen
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={origenDir}
                  onFocus={() => {
                    setIsOrigenOpen(true);
                    setOrigenSuggestions(getLocalMatches(origenDir).slice(0, 6));
                  }}
                  onChange={(e) => {
                    setOrigenDir(e.target.value);
                    setOrigenSelectedCoords(null);
                    setIsOrigenOpen(true);
                    setOrigenActiveIdx(-1);
                  }}
                  onKeyDown={handleOrigenKeyDown}
                  placeholder="Ej. Avenida Los Leones 2015, Providencia"
                  autoComplete="off"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
                {origenDir && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrigenDir('');
                      setOrigenSelectedCoords(null);
                      setOrigenSuggestions(LOCAL_LANDMARKS.slice(0, 6));
                      setIsOrigenOpen(true);
                      setOrigenActiveIdx(-1);
                    }}
                    title="Limpiar dirección"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Menú Desplegable Estilo Google Maps - Origen */}
              {isOrigenOpen && (origenSuggestions.length > 0 || isOrigenLoading) && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto">
                  {isOrigenLoading && (
                    <div className="px-3 py-1.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                      <span>Buscando direcciones en Chile...</span>
                    </div>
                  )}
                  {origenSuggestions.map((item, idx) => {
                    const isActive = idx === origenActiveIdx;
                    return (
                      <button
                        key={`${item.primary}-${item.secondary}-${idx}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectOrigen(item)}
                        onMouseEnter={() => setOrigenActiveIdx(idx)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs transition-colors ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="truncate leading-snug">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {item.primary}
                          </span>
                          {item.secondary && (
                            <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                              {item.secondary}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input Dirección Destino con Autocompletado */}
            <div ref={destinoContainerRef} className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Dirección Destino
              </label>
              <div className="relative">
                <Compass className="w-3.5 h-3.5 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={destinoDir}
                  onFocus={() => {
                    setIsDestinoOpen(true);
                    setDestinoSuggestions(getLocalMatches(destinoDir).slice(0, 6));
                  }}
                  onChange={(e) => {
                    setDestinoDir(e.target.value);
                    setDestinoSelectedCoords(null);
                    setIsDestinoOpen(true);
                    setDestinoActiveIdx(-1);
                  }}
                  onKeyDown={handleDestinoKeyDown}
                  placeholder="Ej. Cerro San Cristóbal, Santiago"
                  autoComplete="off"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
                {destinoDir && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestinoDir('');
                      setDestinoSelectedCoords(null);
                      setDestinoSuggestions(LOCAL_LANDMARKS.slice(0, 6));
                      setIsDestinoOpen(true);
                      setDestinoActiveIdx(-1);
                    }}
                    title="Limpiar dirección"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Menú Desplegable Estilo Google Maps - Destino */}
              {isDestinoOpen && (destinoSuggestions.length > 0 || isDestinoLoading) && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto">
                  {isDestinoLoading && (
                    <div className="px-3 py-1.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                      <span>Buscando direcciones en Chile...</span>
                    </div>
                  )}
                  {destinoSuggestions.map((item, idx) => {
                    const isActive = idx === destinoActiveIdx;
                    return (
                      <button
                        key={`${item.primary}-${item.secondary}-${idx}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectDestino(item)}
                        onMouseEnter={() => setDestinoActiveIdx(idx)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs transition-colors ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <div className="truncate leading-snug">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {item.primary}
                          </span>
                          {item.secondary && (
                            <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                              {item.secondary}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Vista Tab Coordenadas */}
        {activeTab === 'coordenadas' && (
          <>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Origen (Latitud, Longitud)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={origenLat}
                  onChange={(e) => setOrigenLat(e.target.value)}
                  placeholder="Latitud"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  value={origenLng}
                  onChange={(e) => setOrigenLng(e.target.value)}
                  placeholder="Longitud"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Destino (Latitud, Longitud)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={destinoLat}
                  onChange={(e) => setDestinoLat(e.target.value)}
                  placeholder="Latitud"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  value={destinoLng}
                  onChange={(e) => setDestinoLng(e.target.value)}
                  placeholder="Longitud"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Dropdown BICICLETA cargado dinámicamente con las bicis del usuario */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Bicicleta
          </label>
          <div className="relative">
            <Bike className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedBikeId || ''}
              onChange={(e) => onSelectBikeId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              {bicycles.length === 0 ? (
                <option value="">Aro 29 • 60mm (10kg)</option>
              ) : (
                bicycles.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {bike.nombre || `Bici ${bike.tipo}`} • {bike.ancho_neumatico}mm ({bike.peso}kg)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Botón verde esmeralda: [Calcular Ruta Óptima] */}
        <button
          type="submit"
          disabled={isCalculating}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calculando Trayecto...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Calcular Ruta Óptima</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
