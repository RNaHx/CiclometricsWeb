# Universidad Andrés Bello
## Facultad de Ingeniería — Escuela de Informática
### Asignatura: Proyecto de Título

---

# INFORME TÉCNICO — HITO 2: SEGUNDA VISTA DEL PROTOTIPO
## CicloMetrics Web: Plataforma de Planificación Inteligente de Rutas Ciclistas

**Autor:** Ricardo Ignacio Henríquez Novoa  
**Profesor Guía:** Félix Gonzalo Burgos González  
**Repositorio GitHub:** https://github.com/RNaHx/CiclometricsWeb (`main`)  
**Fecha:** 04 de octubre de 2026  

---

## 1. RESUMEN EJECUTIVO
El presente informe técnico documenta la entrega del **Hito 2 (Segunda Vista del Prototipo)** del proyecto **CicloMetrics Web**, correspondiente a las Unidades 1 y 2 del syllabus institucional. En esta iteración (consolidada en el commit `1735de0`), se implementó la reestructuración completa de la interfaz a un **layout responsivo en 2 columnas**, se integró un **módulo de autenticación con tokens seguros**, se habilitó la **gestión de garaje multi-bicicleta**, se incorporó el **ruteo sobre calles y ciclovías reales (OSRM)** y se resolvió la anomalía de pendientes irreales ($-105.5\%$) mediante un **filtro de suavizado altimétrico con Kernel Gaussiano**.

---

## 2. AVANCE DEL PROTOTIPO / MVP (SEGUNDA VISTA FUNCIONAL)

### 2.1 Arquitectura Visual del Prototipo (Layout en 2 Columnas)
La segunda vista del prototipo desacopla las responsabilidades en una interfaz ergonómica:
- **Cintillo Superior (`MetricsHeaderBar.jsx`):** Muestra en tiempo real las métricas consolidadas: Distancia (km), ETA Dinámico, Calorías (kCal), Desnivel (+m) y Presión recomendada (PSI del/tras).
- **Columna Izquierda (Control y Planificación):**
  - `RoutePlanningCard.jsx`: Selección de puntos de origen/destino, selector de rutas optimizadas (e.g., Campus Antonio Varas a Cerro San Cristóbal) y botón de análisis predictivo.
  - `BicyclesListCard.jsx`: Selector de bicicleta activa del garaje con recálculo automático de presiones.
  - `AddBicycleModal.jsx`: Formulario para añadir nuevas bicicletas al perfil.
- **Columna Derecha (Visualización Cartográfica y Topográfica):**
  - `RouteMapCard.jsx` / `InteractiveMap.jsx`: Mapa Leaflet multicapa (CyclOSM, OpenStreetMap, Esri Satellite) con trazado vial real asistido por OSRM.
  - `ElevationProfileChart.jsx`: Gráfico vectorial SVG de altimetría con sincronización bidireccional de puntero en tiempo real.
  - `PredictiveHud.jsx`: Panel de rendimiento con desglose de tramos según gradiente.

### 2.2 Historias de Usuario / Casos de Uso Implementados (Sprint 2)

| Código | Historia de Usuario | Comportamiento Implementado | Componente / Archivo |
| :---: | :--- | :--- | :--- |
| **HU-01** | Autenticación y Sesiones | Registro y login con contraseñas cifradas vía `bcrypt` y Bearer token de sesión persistido en `localStorage`. | `AuthModal.jsx`<br>`authController.js` |
| **HU-02** | Garaje Multi-Bicicleta (CRUD) | Creación, listado y eliminación de bicicletas (MTB, ruta, gravel, urbana) con pesos, rodados y anchos en mm. | `AddBicycleModal.jsx`<br>`bicycleController.js` |
| **HU-03** | Recálculo Reactivo de Presiones | Alternar la bicicleta activa recalcula al instante la presión óptima en PSI (40% del / 60% tras) sin reiniciar la ruta. | `BicyclesListCard.jsx`<br>`tirePressureCalculator.js` |
| **HU-04** | Ruteo Real sobre Calles (OSRM) | Trazado fiel sobre calzadas y ciclovías de Santiago (dataset `optimalRouteVarasCristobal.json`), evitando líneas rectas. | `InteractiveMap.jsx`<br>`routeService.js` |
| **HU-05** | Suavizado Gaussiano Altimétrico | Mitiga errores de DEM satelital (eliminando pendientes absurdas de $-105.5\%$) y acota gradientes al rango $[-30\%, +30\%]$. | `elevationInterpolator.js`<br>`routeAnalyzer.js` |
| **HU-06** | Sincronización Mapa-Perfil | Pasar el cursor sobre el gráfico SVG ubica un marcador interactivo en el mapa Leaflet en tiempo real. | `ElevationProfileChart.jsx`<br>`InteractiveMap.jsx` |
| **HU-07** | Resiliencia y Modo Offline | Control de errores con `ErrorBoundary` y motor físico local en frontend ante desconexión del backend. | `ErrorBoundary.jsx`<br>`App.jsx` |

---

## 3. MODELAMIENTO DE DATOS Y COMPONENTES TÉCNICOS

### 3.1 Estrategia de Persistencia Atómica
El backend utiliza un almacenamiento estructurado no relacional en documentos JSON (`backend/src/storage/jsonStore.js`). Para garantizar integridad transaccional y prevenir condiciones de carrera, incorpora cerrojos asíncronos (`_withLock`) y escrituras atómicas en disco con renombrado temporal.

### 3.2 Esquemas de Datos (NoSQL)

```json
// 1. Colección USERS (Usuarios y Biometría)
{
  "id": "user-ricardo-1",
  "nombre": "Ricardo Henríquez",
  "email": "ricardo@ciclometrics.cl",
  "password": "$2b$10$... (hash bcrypt)",
  "biometria": { "peso": 75.0, "altura": 178, "edad": 30, "nivel": "intermedio" }
}

// 2. Colección BICYCLES (Garaje de Bicicletas)
{
  "id": "bike-ricardo-1",
  "userId": "user-ricardo-1",
  "nombre": "Bicicleta Gravel 700c",
  "tipo": "gravel",
  "peso": 10.5,
  "rodado": "700c",
  "ancho_neumatico": 38.0,
  "psi_min": 35.0,
  "psi_max": 75.0
}

// 3. Objeto de Salida ROUTE_ANALYSIS (POST /api/routes/calculate)
{
  "distancia_km": 8.74,
  "tiempo_estimado_min": 32.5,
  "velocidad_media_kmh": 16.1,
  "desnivel_positivo_m": 298.0,
  "pendiente_maxima": 11.4,
  "kcal_quemadas": 384.2,
  "psi_delantero_recomendado": 42,
  "psi_trasero_recomendado": 63,
  "perfil_altimetrico": [{ "distancia_m": 0, "elevacion_m": 580.2, "suavizado": true }]
}
```

### 3.3 Diagrama de Componentes del Sistema

```text
+-----------------------------------------------------------------------------------+
|                        ARQUITECTURA DE COMPONENTES                                |
+-----------------------------------------------------------------------------------+
  FRONTEND (React 18 + Vite)
  [ Navbar | MetricsHeaderBar | RoutePlanningCard | BicyclesListCard ]
  [ InteractiveMap (Leaflet)  | ElevationProfileChart (SVG) | PredictiveHud ]
         |
         v (HTTP / JSON / Bearer Token)
  BACKEND (Node.js + Express)
  [ authController | bicycleController | routeController | validators ]
  [ Motores: smoothElevationProfile (Gauss) | metCalculator | tirePressureCalculator ]
         |                                |
         v                                v
  [ jsonStore (store.json) ]    [ SERVICIOS EXTERNOS: OSRM Router | Open-Meteo DEM ]
+-----------------------------------------------------------------------------------+
```

---

## 4. GESTIÓN DEL PROYECTO (CICLO DE VIDA Y CONFIGURACIÓN)

### 4.1 Planificación Ágil (Scrum)
- **Sprint 1 (Commit `d215dc3` - 30/09/2026):** Arquitectura base del MVP, motores de MET y presión iniciales, mapa multicapa libre (CyclOSM/OSM/Esri).
- **Sprint 2 (Commit `1735de0` - 01/10/2026):** Segunda vista del prototipo en 2 columnas, autenticación completa, garaje multi-bicicleta, ruteo ciclista OSRM y corrección de pendientes mediante Kernel Gaussiano.

### 4.2 Control de Versiones en Git / GitHub
- **Repositorio:** `https://github.com/RNaHx/CiclometricsWeb` (Rama: `main`).
- **Trazabilidad de Commits:**
  - `d215dc3`: *Initial release of CicloMetrics Web MVP* (+11.870 líneas, 54 archivos).
  - `1735de0`: *feat: login/register auth, 2-column layout, slope calculation fix, and real street routing* (+5.100 / -473 líneas, 27 archivos).

### 4.3 Gestión de la Configuración y Automatización
- **Scripts de Despliegue en 1 Clic:**
  - `iniciar_local.bat` / `iniciar_local.ps1`: Detecta Node.js, compila el frontend si es necesario (`npm run build`), abre el navegador en `http://localhost:5000` e inicia el backend de forma automatizada.
- **Scripts en `package.json` raíz:** Centraliza comandos `start`, `build`, `dev:frontend`, `dev:backend` y `test`.
- **Aseguramiento de Calidad:** Ejecución de `npm test` en backend con **12 de 12 pruebas aprobadas (100% PASS)** en `verifyCalculations.js`, verificando que las pendientes en curvas del Cerro San Cristóbal no superan el rango físico $[-30\%, +30\%]$.

---

## 5. CONCLUSIÓN Y PRÓXIMOS PASOS
La Segunda Vista del Prototipo consolida una solución funcional, ergonómica y numéricamente rigurosa. Para el Hito 3 se contempla el despliegue en servidor Cloud y pruebas de campo con ciclistas en ruta real.
