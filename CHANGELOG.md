# Changelog - CicloMetrics Web

Todas las versiones y cambios notables de este proyecto están documentados en este archivo siguiendo estrictamente las especificaciones de [Semantic Versioning (SemVer 2.0.0)](https://semver.org/lang/es/) y el estándar [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

El formato de versión utilizado es:
`MAJOR.MINOR.PATCH`
- **MAJOR**: Cambios incompatibles o reestructuración mayor de la arquitectura.
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás (`feat`).
- **PATCH**: Correcciones de errores y mantenimiento compatible hacia atrás (`fix`, `chore`).

---

## [1.6.2] - 2026-11-04
### Changed
- **Versionamiento Semántico Centralizado**: Corrección del identificador de versión en la interfaz web (de la etiqueta estática `WEB V1.0` al identificador dinámico `v1.6.2`).
- Sincronización de versiones en `package.json`, `frontend/package.json` (`1.6.2`), `backend/package.json` (`1.6.2`) y endpoint `/api/health`.
- Creación de módulo de configuración centralizada de versión [`frontend/src/config/version.js`](file:///c:/Users/ricar/OneDrive/Desktop/CiclometricsWeb/frontend/src/config/version.js) y `CHANGELOG.md`.

---

## [1.6.1] - 2026-11-04
### Fixed
- **Registro de Bicicletas**: Eliminación de la creación automática de bicicletas por defecto al registrarse un nuevo usuario. Ahora el usuario inicia con 0 bicicletas y las registra manualmente según su equipamiento real (`commit 24ba996`).
- Purga de caché local de bicicletas al cerrar sesión para evitar herencia de datos entre cuentas.

---

## [1.6.0] - 2026-11-04
### Added
- **Rediseño de Privacidad y Cookies**: Adaptación del banner de cookies a formato dock inferior horizontal, eliminando la etiqueta de primera sesión e integrando botones estilo píldora (`Configurar cookies`, `Rechazar opcionales`, `Aceptar todas`) (`commit f42d594`).
- **Precisión Biométrica**: Soporte de peso corporal con hasta 2 cifras decimales (por ejemplo, `62.02 kg`) tanto en inputs como en los esquemas de validación y cálculo del backend.

---

## [1.5.1] - 2026-11-04
### Removed
- **Cuentas de Prueba**: Eliminación definitiva de credenciales demo prellenadas (`ricardo@ciclometrics.cl`) tanto en la interfaz de usuario como en los motores de persistencia JSON y MongoDB Atlas (`commit 3ef61d5`).

---

## [1.5.0] - 2026-10-30
### Added
- **Modo Despejar Vista**: Botón interactivo para ocultar todas las superposiciones flotantes del mapa (chips de rutas, capas y banner inferior), permitiendo visualizar exclusivamente el trazado vial y los controles de zoom (`commit 1b8b8e9`).

---

## [1.4.0] - 2026-10-30
### Added
- **Autocompletado Predictivo de Direcciones**: Buscador estilo Google Maps en origen y destino con catálogo de hitos ciclistas de Santiago y consulta en vivo a Nominatim OpenStreetMap Chile (`commit 823ef94`).

---

## [1.3.5] - 2026-10-30
### Fixed
- **UI / Capas Cartográficas**: Corrección de recorte visual (clipping izquierdo) en el menú desplegable de selección de capas del mapa (`commit 023c60b`).

---

## [1.3.4] - 2026-10-30
### Fixed
- **Planificación Dinámica de Rutas**: Geocodificación y cálculo de rutas personalizadas con OSRM y altimetría Open-Meteo Elevation API al buscar por direcciones escritas (`commit 70d2a91`).

---

## [1.3.3] - 2026-10-30
### Fixed
- **Resiliencia de Persistencia**: Saneamiento de `MONGODB_URI` en entornos Serverless de Vercel y sincronización ante reinicios de contenedores efímeros (`commit edf1328`).

---

## [1.3.2] - 2026-10-30
### Fixed
- **Consentimiento de Cookies**: Persistencia de la aceptación en MongoDB Atlas y cliente para evitar reaparición del banner al recargar (`commit a036088`).

---

## [1.3.1] - 2026-10-30
### Fixed
- **Calibración Altimétrica**: Calibración de la ruta Antonio Varas -> Cerro San Cristóbal alineada con Google Maps (213 m ascenso) y perfil MyCols (6.3% pendiente máx, 818 m cumbre) (`commit fb432d8`).

---

## [1.3.0] - 2026-10-30
### Added
- **Persistencia de Rutas y Biometría**: Sincronización y persistencia de rutas calculadas (`saveRoute: true`) y actualización de bicicletas en MongoDB Atlas (`commit 56da499`).

---

## [1.2.3] - 2026-10-30
### Changed
- Configuración de arquitectura monorepo con Vercel Services (`frontend` Vite + `backend` Express) (`commit adde1f4`).

---

## [1.2.2] - 2026-10-30
### Security
- Exclusión y protección estricta de todos los archivos de entorno `.env*` en `.gitignore` y `.vercelignore` (`commit 2e273e0`).

---

## [1.2.1] - 2026-10-30
### Changed
- Exclusión de herramientas y scripts locales (`.agents/`, `iniciar_local.*`) del repositorio público (`commit 9e5fe83`).

---

## [1.2.0] - 2026-10-30
### Added
- Seguridad de contraseñas con derivación criptográfica `scrypt` + `salt`.
- Modal de Términos de Uso y Política de Tratamiento de Datos (Ley N° 21.719).
- Adaptador de persistencia MongoDB Atlas con caché de conexiones (`commit 8293113`).

---

## [1.1.0] - 2026-10-01
### Added
- Sistema completo de autenticación y registro de usuarios con biometría.
- Dashboard de 2 columnas con mapa interactivo Leaflet y perfil altimétrico.
- Motor de ruteo ciclista real OSRM por calles (`commit 1735de0`).

---

## [1.0.0] - 2026-09-30
### Added
- **Lanzamiento Inicial MVP**: Plataforma inteligente de planificación ciclista CicloMetrics Web (`commit d215dc3`).
- Modelo físico-biomecánico (MET según Ainsworth et al., presiones Frank Berto/Schwalbe).
- Mitigación altimétrica RT-02 y validación estricta de entradas RT-03.
