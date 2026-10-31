import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Layers, 
  Flag, 
  CheckCircle, 
  MousePointer, 
  RotateCcw,
  Sparkles,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { PRESET_ROUTES } from '../data/presetRoutes';

/**
 * Catálogo de proveedores de teselas (Tile Providers)
 * 100% libres de API keys y sin marcas de agua de pago (CartoDB eliminado).
 */
export const MAP_LAYERS = {
  cyclosm: {
    id: 'cyclosm',
    name: 'Ciclista / Topo',
    shortName: 'Ciclista',
    icon: '🚲',
    description: 'Ciclovías, vías ciclables y curvas de nivel (CyclOSM)',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles by <a href="https://www.cyclosm.org">CyclOSM</a>',
    subdomains: 'abc',
    maxZoom: 18
  },
  osm: {
    id: 'osm',
    name: 'Calles (OSM)',
    shortName: 'Calles',
    icon: '🗺️',
    description: 'Cartografía vial estándar OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19
  },
  satellite: {
    id: 'satellite',
    name: 'Satélite',
    shortName: 'Satélite',
    icon: '🛰️',
    description: 'Fotografía satelital Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics',
    subdomains: '',
    maxZoom: 19
  }
};

export default function InteractiveMap({
  selectedRoute,
  onSelectRoute,
  customRoutePoints,
  onSetCustomRoute,
  hoverCoordinate,
  theme
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const hoverMarkerRef = useRef(null);
  const tempMarkerRef = useRef(null);
  const layerMenuRef = useRef(null);

  // Capa activa: CyclOSM predeterminada para ciclismo
  const [activeLayer, setActiveLayer] = useState('cyclosm');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Estados para creación de ruta personalizada
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customMarkers, setCustomMarkers] = useState([]);
  const [isRouting, setIsRouting] = useState(false);
  const [routingNotice, setRoutingNotice] = useState(null);

  // Cerrar menú de capas al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(e.target)) {
        setIsLayerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Inicialización de Leaflet blindada
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Prevención de "Map container is already initialized" en React 18 StrictMode
      if (mapContainerRef.current._leaflet_id && !mapInstanceRef.current) {
        mapContainerRef.current._leaflet_id = null;
      }

      if (!mapInstanceRef.current) {
        // Coordenadas iniciales por defecto (Santiago Centro / Providencia)
        const initialCenter = selectedRoute?.center || [-33.4350, -70.6350];
        const initialZoom = selectedRoute?.zoom || 13;

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: false
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile layer inicial (CyclOSM por defecto)
        const layerConfig = MAP_LAYERS.cyclosm;
        const tileLayer = L.tileLayer(layerConfig.url, {
          attribution: layerConfig.attribution,
          subdomains: layerConfig.subdomains || 'abc',
          maxZoom: layerConfig.maxZoom || 18
        }).addTo(map);

        mapInstanceRef.current = map;
        mapInstanceRef.current._tileLayer = tileLayer;

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;

        // Asegurar que Leaflet calcule dimensiones DOM correctas
        setTimeout(() => {
          try {
            map.invalidateSize();
          } catch (e) {
            console.warn('Error en invalidateSize inicial:', e);
          }
        }, 150);
      }
    } catch (err) {
      console.error('Error al inicializar Leaflet:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error al desmontar mapa Leaflet:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Cambio dinámico de proveedor de capa (CyclOSM, OSM, Satélite)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    try {
      const map = mapInstanceRef.current;
      const layerConfig = MAP_LAYERS[activeLayer];
      if (!layerConfig) return;

      if (map._tileLayer) {
        map.removeLayer(map._tileLayer);
      }

      const newTileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        subdomains: layerConfig.subdomains || 'abc',
        maxZoom: layerConfig.maxZoom || 19
      }).addTo(map);

      map._tileLayer = newTileLayer;
    } catch (err) {
      console.warn('Error al cambiar capa en mapa Leaflet:', err);
    }
  }, [activeLayer]);

  // 3. Manejo de clics en el mapa para marcar punto A y punto B
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      try {
        if (!isCustomMode || isRouting) return;

        const { lat, lng } = e.latlng;
        const newPoint = [parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))];

        setCustomMarkers(prev => {
          if (prev.length >= 2) {
            return [newPoint];
          } else {
            const next = [...prev, newPoint];
            if (next.length === 2) {
              handleBuildCustomRoute(next[0], next[1]);
            }
            return next;
          }
        });
      } catch (err) {
        console.warn('Error en click sobre el mapa:', err);
      }
    };

    try {
      map.on('click', handleMapClick);
    } catch (e) {
      console.warn('Error asociando evento click al mapa:', e);
    }

    return () => {
      try {
        map.off('click', handleMapClick);
      } catch (e) {
        // Ignorar si el mapa ya fue desmontado
      }
    };
  }, [isCustomMode, isRouting]);

  // Marcador temporal visual para Punto A mientras se espera el Punto B
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    try {
      const map = mapInstanceRef.current;

      if (isCustomMode && customMarkers.length === 1) {
        const originIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; animation: bounce 1s infinite;">
              A
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        if (tempMarkerRef.current) {
          map.removeLayer(tempMarkerRef.current);
        }
        tempMarkerRef.current = L.marker(customMarkers[0], { icon: originIcon }).addTo(map);
      } else {
        if (tempMarkerRef.current) {
          map.removeLayer(tempMarkerRef.current);
          tempMarkerRef.current = null;
        }
      }
    } catch (err) {
      console.warn('Error actualizando marcador temporal:', err);
    }
  }, [isCustomMode, customMarkers]);

  // 4. Motor de Ruteo Ciclista OSRM con Fallback Local
  const handleBuildCustomRoute = async (originCoord, destCoord) => {
    const lat1 = originCoord[0], lon1 = originCoord[1];
    const lat2 = destCoord[0], lon2 = destCoord[1];

    setIsRouting(true);
    setRoutingNotice('Consultando motor OSRM para trazar ruta ciclista real en calles...');

    // Distancia haversine auxiliar
    const haversineDist = (pA, pB) => {
      const dL = (pB[0] - pA[0]) * Math.PI / 180;
      const dG = (pB[1] - pA[1]) * Math.PI / 180;
      const a = Math.sin(dL/2) * Math.sin(dL/2) +
                Math.cos(pA[0] * Math.PI / 180) * Math.cos(pB[0] * Math.PI / 180) *
                Math.sin(dG/2) * Math.sin(dG/2);
      return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Modelo altimétrico topográfico de la cuenca de Santiago (valle hacia precordillera este)
    const getSantiagoElevation = (lat, lon, frac = 0) => {
      // Santiago Centro (-33.44, -70.65) a ~560m; gradiente hacia el Este (-70.55 Las Condes ~680m)
      const dLonEast = -70.65 - lon;
      const dLatNorth = -33.44 - lat;
      const base = 560 - (dLonEast * 1150) + (dLatNorth * 250);
      const micro = Math.sin(frac * Math.PI * 4) * 6 + Math.cos(frac * Math.PI * 2) * 4;
      return Math.max(420, Math.min(1350, Math.round(base + micro)));
    };

    // Fallback físico en caso de fallo de red o timeout
    const executeFallbackRoute = () => {
      const pointsCount = 7;
      const coords = [];
      const points = [];

      const totalDistMeters = Math.round(haversineDist(originCoord, destCoord));
      const baseElev = 550 + Math.abs(originCoord[0] * 100) % 80;
      const targetElev = 550 + Math.abs(destCoord[0] * 100) % 180;

      for (let i = 0; i <= pointsCount; i++) {
        const frac = i / pointsCount;
        const curLat = lat1 + (lat2 - lat1) * frac;
        const curLng = lon1 + (lon2 - lon1) * frac;
        coords.push([parseFloat(curLat.toFixed(5)), parseFloat(curLng.toFixed(5))]);

        const curDist = Math.round(totalDistMeters * frac);
        const noise = Math.sin(frac * Math.PI) * 25;
        const curElev = Math.round(baseElev + (targetElev - baseElev) * frac + noise);
        points.push({ distance: curDist, elevation: curElev });
      }

      const distKm = (totalDistMeters / 1000).toFixed(1);
      const customRouteObj = {
        id: `custom-interactive-route-${Date.now()}`,
        name: `Ruta Personalizada (${distKm} km)`,
        subtitle: `Trazado directo de ${coords.length} puntos (Modo sin conexión OSRM)`,
        category: 'Personalizada',
        surface: 'Vía pública / Asfalto urbano',
        difficulty: totalDistMeters > 8000 ? 'Exigente' : 'Moderada',
        badgeColor: 'purple',
        center: [(lat1 + lat2) / 2, (lon1 + lon2) / 2],
        zoom: 13,
        origen: `Lat: ${lat1.toFixed(3)}, Lng: ${lon1.toFixed(3)}`,
        destino: `Lat: ${lat2.toFixed(3)}, Lng: ${lon2.toFixed(3)}`,
        coordinates: coords,
        points: points
      };

      onSetCustomRoute(customRouteObj);
      setRoutingNotice('⚠️ Sin conexión OSRM: Trazado con motor físico local');
      setTimeout(() => setRoutingNotice(null), 4000);
      setIsRouting(false);
      setIsCustomMode(false);
      setCustomMarkers([]);
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      // Consulta OSRM modo ciclista con coordenadas [lon, lat]
      const osrmUrl = `https://router.project-osrm.org/route/v1/bicycle/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
      const response = await fetch(osrmUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OSRM status ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('OSRM no encontró rutas ciclistas para estos puntos');
      }

      const routeData = data.routes[0];
      const rawCoords = routeData.geometry.coordinates; // [[lon, lat], ...]
      const coords = rawCoords.map(([lon, lat]) => [
        parseFloat(lat.toFixed(5)),
        parseFloat(lon.toFixed(5))
      ]);

      // Distancia acumulada tramo a tramo
      const cumDist = [0];
      for (let i = 1; i < coords.length; i++) {
        cumDist.push(cumDist[i - 1] + haversineDist(coords[i - 1], coords[i]));
      }
      const totalDistMeters = Math.round(routeData.distance || cumDist[cumDist.length - 1]);

      // Muestreo uniforme de puntos altimétricos para un perfil continuo suave
      const numSamples = Math.min(25, Math.max(12, Math.floor(totalDistMeters / 150)));
      const points = [];

      for (let s = 0; s <= numSamples; s++) {
        const targetDist = (s / numSamples) * totalDistMeters;
        let bestIdx = 0;
        let minDiff = Infinity;
        for (let i = 0; i < cumDist.length; i++) {
          const diff = Math.abs(cumDist[i] - targetDist);
          if (diff < minDiff) {
            minDiff = diff;
            bestIdx = i;
          }
        }
        const ptCoord = coords[bestIdx];
        const frac = s / numSamples;
        const elev = getSantiagoElevation(ptCoord[0], ptCoord[1], frac);
        points.push({
          distance: Math.round(targetDist),
          elevation: elev
        });
      }

      // Nombres de calles identificados por OSRM
      const startStreet = data.waypoints?.[0]?.name?.trim();
      const endStreet = data.waypoints?.[1]?.name?.trim();
      const origenStr = startStreet ? `${startStreet} (${lat1.toFixed(3)}, ${lon1.toFixed(3)})` : `Lat: ${lat1.toFixed(3)}, Lng: ${lon1.toFixed(3)}`;
      const destinoStr = endStreet ? `${endStreet} (${lat2.toFixed(3)}, ${lon2.toFixed(3)})` : `Lat: ${lat2.toFixed(3)}, Lng: ${lon2.toFixed(3)}`;

      const distKm = (totalDistMeters / 1000).toFixed(1);
      const customRouteObj = {
        id: `custom-interactive-route-${Date.now()}`,
        name: `Ruta Ciclista OSRM (${distKm} km)`,
        subtitle: `Trazado ciclista real en calles con ${coords.length} nodos viales`,
        category: 'Personalizada',
        surface: 'Ciclovía segregada / Vía urbana compartida',
        difficulty: totalDistMeters > 10000 ? 'Exigente' : (totalDistMeters > 5000 ? 'Moderada' : 'Fácil'),
        badgeColor: 'purple',
        center: [(lat1 + lat2) / 2, (lon1 + lon2) / 2],
        zoom: 14,
        origen: origenStr,
        destino: destinoStr,
        coordinates: coords,
        points: points
      };

      onSetCustomRoute(customRouteObj);
      setRoutingNotice(`✨ Ruta ciclista real trazada (${distKm} km vía OSRM)`);
      setTimeout(() => setRoutingNotice(null), 4000);
      setIsRouting(false);
      setIsCustomMode(false);
      setCustomMarkers([]);
    } catch (err) {
      console.warn('Error al consultar OSRM, recurriendo a cálculo de respaldo:', err);
      executeFallbackRoute();
    }
  };

  // 5. Renderizado del trazado de la ruta activa y sus marcadores
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    try {
      const map = mapInstanceRef.current;
      const layerGroup = layerGroupRef.current;
      layerGroup.clearLayers();

      const activeCoords = selectedRoute?.coordinates || [];
      if (activeCoords.length === 0) return;

      // 1. Trazado de sombra brillante (Glow effect)
      const glowLine = L.polyline(activeCoords, {
        color: theme === 'dark' ? '#00f2fe' : '#0284c7',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      });
      layerGroup.addLayer(glowLine);

      // 2. Trazado de ruta principal (Línea sólida ciclista)
      const mainLine = L.polyline(activeCoords, {
        color: theme === 'dark' ? '#10b981' : '#059669',
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      });
      layerGroup.addLayer(mainLine);

      // 3. Marcador de Origen (Verde)
      const originCoord = activeCoords[0];
      const originIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #10b981; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
            A
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const originMarker = L.marker(originCoord, { icon: originIcon });
      originMarker.bindPopup(`<b>Origen:</b> ${selectedRoute?.origen || 'Punto de Partida'}`);
      layerGroup.addLayer(originMarker);

      // 4. Marcador de Destino (Rojo / Bandera)
      const destCoord = activeCoords[activeCoords.length - 1];
      const destIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #ef4444; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
            B
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const destMarker = L.marker(destCoord, { icon: destIcon });
      destMarker.bindPopup(`<b>Destino:</b> ${selectedRoute?.destino || 'Meta'}`);
      layerGroup.addLayer(destMarker);

      // Ajustar vista del mapa para encuadrar la ruta de forma segura
      if (mainLine && typeof mainLine.getBounds === 'function') {
        const bounds = mainLine.getBounds();
        if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
          setTimeout(() => {
            try {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
                mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
              }
            } catch (boundsErr) {
              console.warn('Error al ajustar límites de mapa con fitBounds:', boundsErr);
            }
          }, 100);
        }
      }
    } catch (err) {
      console.warn('Error en renderizado de ruta en mapa Leaflet:', err);
    }
  }, [selectedRoute, theme]);

  // 6. Marcador dinámico para sincronización de hover con el gráfico de elevación
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    try {
      const map = mapInstanceRef.current;

      if (!hoverCoordinate) {
        if (hoverMarkerRef.current) {
          map.removeLayer(hoverMarkerRef.current);
          hoverMarkerRef.current = null;
        }
        return;
      }

      const hoverIcon = L.divIcon({
        className: 'custom-hover-icon',
        html: `
          <div style="position: relative;">
            <div style="background-color: #f59e0b; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px #f59e0b; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background-color: #f59e0b; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); position: absolute; top: 0; left: 0;"></div>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      if (!hoverMarkerRef.current) {
        hoverMarkerRef.current = L.marker(hoverCoordinate, { icon: hoverIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        hoverMarkerRef.current.setLatLng(hoverCoordinate);
      }
    } catch (err) {
      console.warn('Error sincronizando marcador hover en mapa:', err);
    }
  }, [hoverCoordinate]);

  // El filtro oscuro se aplica en tema oscuro a Calles y CyclOSM, NUNCA a Satélite
  const shouldApplyDarkTilesFilter = theme === 'dark' && activeLayer !== 'satellite';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl flex flex-col h-[520px]">
      
      {/* Barra Superior Flotante: Selector de Rutas Emblemáticas y Capas */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Chips de Rutas Predeterminadas */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg max-w-full overflow-x-auto">
          {PRESET_ROUTES.map((route) => {
            const isSelected = selectedRoute?.id === route.id;
            return (
              <button
                key={route.id}
                onClick={() => {
                  setIsCustomMode(false);
                  setCustomMarkers([]);
                  onSelectRoute(route);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{route.name.split('/')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                  route.difficulty === 'Exigente' || route.difficulty === 'Muy Difícil'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {route.difficulty}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controles de Capas y Modo Personalizado */}
        <div className="pointer-events-auto flex items-center gap-2">
          
          {/* Selector Flotante de Capas (CyclOSM, OSM, Satélite) */}
          <div className="relative" ref={layerMenuRef}>
            <button
              type="button"
              onClick={() => setIsLayerMenuOpen(prev => !prev)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-lg bg-white/90 dark:bg-slate-950/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Cambiar capa cartográfica del mapa"
              aria-expanded={isLayerMenuOpen}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="flex items-center gap-1">
                <span>{MAP_LAYERS[activeLayer]?.icon}</span>
                <span className="hidden sm:inline font-medium">{MAP_LAYERS[activeLayer]?.name}</span>
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLayerMenuOpen && (
              <div 
                className="absolute left-0 top-full mt-1.5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 w-60 sm:w-64 max-w-[calc(100vw-2rem)] min-w-[235px] flex flex-col gap-1 z-30"
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                  Capas Cartográficas
                </div>
                {Object.values(MAP_LAYERS).map((layer) => {
                  const isCurrent = activeLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => {
                        setActiveLayer(layer.id);
                        setIsLayerMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{layer.icon}</span>
                        <div>
                          <div className="font-semibold text-xs leading-none">{layer.name}</div>
                          <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {layer.description}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón Modo Personalizado (Marcar en mapa) */}
          <button
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              setCustomMarkers([]);
            }}
            disabled={isRouting}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-lg ${
              isCustomMode
                ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400/40 animate-pulse'
                : 'bg-white/90 dark:bg-slate-950/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isRouting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-200" />
            ) : (
              <MousePointer className="w-3.5 h-3.5" />
            )}
            <span>
              {isRouting 
                ? 'Ruteando con OSRM...' 
                : isCustomMode 
                  ? 'Haz clic en el mapa (Origen y Meta)' 
                  : 'Crear Ruta Propia'}
            </span>
          </button>
        </div>
      </div>

      {/* Cartel Flotante de Estado de Ruteo o Instrucción de Clic */}
      {routingNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-slate-900/95 text-white backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/40 shadow-xl text-xs flex items-center gap-2">
          {isRouting ? (
            <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{routingNotice}</span>
        </div>
      )}

      {isCustomMode && customMarkers.length === 1 && !routingNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-slate-900/90 text-white backdrop-blur-md px-4 py-1.5 rounded-full border border-purple-500/40 shadow-xl text-xs flex items-center gap-2">
          <Flag className="w-3.5 h-3.5 text-purple-400" />
          <span>Punto A fijado. Haz clic en el mapa para marcar el Punto B (Destino).</span>
        </div>
      )}

      {/* Contenedor del Mapa Leaflet (con filtro Dark Mode solo si no es Satélite) */}
      <div 
        ref={mapContainerRef} 
        className={`w-full h-full relative ${shouldApplyDarkTilesFilter ? 'dark-map-tiles' : ''}`} 
      />

      {/* Banner Informativo Inferior Flotante de la Ruta Activa */}
      {selectedRoute && (
        <div className="absolute bottom-3 left-3 z-20 pointer-events-auto bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs max-w-sm sm:max-w-md hidden sm:block">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
              {selectedRoute.name}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>🏁 {selectedRoute.origen} ➔ {selectedRoute.destino}</span>
          </div>
        </div>
      )}
    </div>
  );
}
