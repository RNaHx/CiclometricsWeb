# 🚴 CicloMetrics Web

> **Plataforma de Planificación Inteligente de Rutas Ciclistas basada en perfiles biométricos y análisis topográfico para optimizar el rendimiento y seguridad.**  
> *Proyecto de Título — Escuela de Informática, Universidad Andrés Bello (UNAB), Santiago de Chile.*

---

## 📋 Descripción del Proyecto

**CicloMetrics Web** es una plataforma web integral orientada a ciclistas urbanos y deportivos. Supera las limitaciones de los sistemas de navegación convencionales mediante un **motor de cálculo predictivo físico-mecánico** que cruza variables biométricas individuales con la topografía geoespacial real y las especificaciones técnicas de la bicicleta antes de iniciar la ruta.

### 🌟 Características Principales

- **🔥 Gasto Calórico Personalizado (kCal)**: Basado en el modelo de **Equivalentes Metabólicos (MET)** (*Ainsworth et al., 2011*) ponderado tramo a tramo según micro-variaciones de pendiente y el peso total del sistema ($M_{\text{ciclista}} + M_{\text{bicicleta}}$).
- **⏱️ Tiempo Estimado de Llegada (ETA) Dinámico**: Adaptación continua de velocidad real de pedaleo según la pendiente del terreno.
- **🚲 Presión Óptima de Neumáticos (PSI)**: Basado en la física de resistencia a la rodadura (*Schwalbe, 2022* / *Berto 15% drop rule*), con distribución de carga 40% delantera y 60% trasera acotada a límites de seguridad $[\text{psi\_min}, \text{psi\_max}]$.
- **🗺️ Cartografía y Trazados Reales sin Marcas de Agua**:
  - **🚲 CyclOSM**: Cartografía ciclista oficial sobre OpenStreetMap con ciclovías segregadas, pendientes y curvas de nivel.
  - **🗺️ OpenStreetMap Estándar**: Callejero urbano nítido.
  - **🛰️ Esri World Imagery**: Fotografía aérea y satelital de alta resolución.
  - Trazados sobre calles y ciclovías reales asistidos por el motor de ruteo ciclista **OSRM**.
  - Rutas emblemáticas de Santiago incluidas: *Subida Cerro San Cristóbal / El Pobre Diablo*, *Ciclovía Mapocho 42K*, *Ruta Urbana Providencia - Centro Cívico*, *Desafío Cuesta La Dormida*.
- **📈 Gráfico Altimétrico Sincronizado**: Perfil topográfico interactivo en SVG sincronizado bidireccionalmente con el mapa.
- **📱 Cockpit Móvil de Manillar**: Interfaz optimizada estilo ciclocomputador deportivo para smartphone en manillar.
- **🌓 Temas Claro y Oscuro**: Paleta deportiva de alto contraste con persistencia en `localStorage`.

---

## 🏗️ Arquitectura Técnica

- **Frontend**: React 18, Vite, Tailwind CSS v4, Leaflet / OpenStreetMap / CyclOSM, Lucide Icons.
- **Backend**: Node.js, Express.js, Persistencia JSON atómica con control de concurrencia y validación estricta de esquemas (Zod/Joi).
- **Modelos Físicos & APIs**: Algoritmos propios de MET e interpolación altimétrica continua (*Mitigación RT-02* y *RT-03*), Open-Meteo Elevation API y OSRM Bicycle Router.
- **Equipo de Agentes Autónomos**: Arquitectura modular en `.agents/agents/` coordinada por un **Orquestador** con subagentes especializados (`backend`, `frontend`, `qa`).

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- `npm`

### 1. Clonar el Repositorio
```bash
git clone https://github.com/<tu-usuario>/CiclometricsWeb.git
cd CiclometricsWeb
```

### 2. Iniciar el Servidor Backend (Puerto 5000)
```bash
cd backend
npm install
npm run dev
```

### 3. Iniciar el Cliente Frontend (Puerto 3000)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```

Abre tu navegador en `http://localhost:3000`.

---

## 🧪 Pruebas Automatizadas

Para ejecutar la suite de pruebas del motor de cálculo y la API:
```bash
cd backend
npm test
```

---

## 📄 Marco Legal y Referencias

- **Ley N° 19.628 / 21.719**: Protección de la Vida Privada y Datos Personales.
- **Ley N° 21.088**: Convivencia Vial en Chile.
- **Ainsworth et al. (2011)**: *Compendium of Physical Activities*.
- **Schwalbe (2022)**: *Bicycle Tire Physics & Rolling Resistance*.
