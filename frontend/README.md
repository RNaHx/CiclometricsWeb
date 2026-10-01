# CicloMetrics Web - Frontend (Fase 2)

Interfaz moderna de usuario (UI/UX) para **CicloMetrics Web**, especializada en predicción biomecánica, altimetría interactiva, cálculo dinámico de gasto energético (MET Ainsworth) y presiones óptimas de inflado (Schwalbe 15% drop).

---

## 🚴 Componentes Principales

1. **`Navbar` (`src/components/Navbar.jsx`)**:
   - Selector de tema (Modo Claro / Modo Oscuro) con persistencia en `localStorage`.
   - Indicador de estado de conexión de la API Backend en tiempo real (`Online`, `Conectando`, `Modo Autónomo`).
   - Acceso rápido a biometría del ciclista y conmutador para el **Modo Manillar (Cockpit Móvil)**.

2. **`InteractiveMap` (`src/components/InteractiveMap.jsx`)**:
   - Integración nativa con **Leaflet** y tiles vectoriales/ráster de alta fidelidad sin requerir API keys de pago.
   - Rutas ciclistas emblemáticas de Santiago (investigación Hito 1):
     * *Subida Cerro San Cristóbal / El Pobre Diablo* (Escalada técnica de montaña, ~4.9 km, +290m).
     * *Ciclovía Ribereña Mapocho 42K* (Corredor fluvial continuo, ~12.2 km, llano/falso llano).
     * *Ruta Urbana Providencia - Centro Cívico Alameda* (Conmutación diaria con desnivel descendente, ~6.4 km).
     * *Desafío Cuesta La Dormida* (Ascenso de media montaña, ~13.8 km, +805m).
   - Modo de creación de ruta interactiva: Clic sobre el mapa para establecer origen y destino personalizados con interpolación altimétrica.
   - Marcador interactivo sincronizado en tiempo real con el cursor del gráfico de elevación.

3. **`ElevationProfileChart` (`src/components/ElevationProfileChart.jsx`)**:
   - Gráfico topográfico responsivo renderizado en SVG con gradientes deportivos de alto contraste.
   - Muestra distancia acumulada (km) vs altitud sobre el nivel del mar (m s.n.m.).
   - Cursor táctil/hover que calcula e informa la pendiente puntual (%) clasificada con código de colores según nivel de esfuerzo (Bajada, Plano, Moderada, Empinada).

4. **`PredictiveHud` (`src/components/PredictiveHud.jsx`)**:
   - **Gasto Calórico**: Estimación precisa en kCal basada en el Compendio de Actividades Físicas de Ainsworth et al. (2011) considerando la masa total ($M_{\text{ciclista}} + M_{\text{bicicleta}}$).
   - **Tiempo Estimado de Llegada (ETA)**: Adaptado a la velocidad promedio resultante de la pendiente tramo a tramo.
   - **Presión Óptima de Neumáticos**: Barra de rango visual `[psi_min, psi_max]` con regla de Schwalbe (2022) para distribución 40% delantera y 60% trasera.
   - **Desglose de Tramos**: Gráfico segmentado y tarjetas de resumen para bajada (< -2%), plano (-2% a 2%), subida moderada (2% a 6%) y subida pronunciada (> 6%).

5. **`ProfileModal` (`src/components/ProfileModal.jsx`)**:
   - Formulario accesible para biometría: peso, altura, edad, género.
   - Configuración de bicicleta: tipo (Ruta, Montaña/MTB, Urbana, Gravel), peso (kg), rodado (26", 27.5", 29", 700c), ancho de cubierta (mm) y límites del fabricante `[psi_min, psi_max]`.
   - Plantillas rápidas de 1-clic y sincronización bidireccional mediante `POST /api/profile`.

6. **`CockpitView` (`src/components/CockpitView.jsx`)**:
   - Modo de pantalla completa tipo ciclocomputador (Garmin / Wahoo) de tipografía gigante y ultra-alto contraste, diseñado para smartphone montado en manillar.

---

## 🛠️ Ejecución y Pruebas

### 1. Iniciar en modo desarrollo
```bash
cd frontend
npm install
npm run dev
```
La aplicación correrá en `http://localhost:3000`.

### 2. Compilar para producción
```bash
npm run build
```
Genera la compilación optimizada en `frontend/dist/`.

---

## 🔌 Conexión con el Backend

El frontend utiliza un proxy inverso en `vite.config.js` que redirige las peticiones `/api/*` al servidor backend en `http://localhost:5000`.
Si el backend no está iniciado, el frontend activa de forma transparente un motor físico-mecánico local idéntico para que todas las vistas, métricas y mapas funcionen de inmediato.
