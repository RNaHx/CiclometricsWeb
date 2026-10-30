# 🏛️ CicloMetrics Web — Estado de Arquitectura y Memoria Persistente

> **Documento Vivo de Arquitectura (Inspirado en los principios de memoria persistente de ECC)**  
> **Última Actualización**: Octubre 2026  
> **Propósito**: Preservar el contexto arquitectónico, los contratos de API y las invariantes físicas entre sesiones para desarrolladores y agentes autónomos (`orchestrator`, `backend`, `frontend`, `qa`).

---

## 1. 📐 Visión General del Sistema

**CicloMetrics Web** es una plataforma de planificación inteligente de rutas ciclistas que combina:
- **Biometría individual del usuario** (peso, altura, edad, nivel).
- **Especificaciones técnicas de la bicicleta** (tipo, peso, rodado, ancho de neumático, rango PSI).
- **Topografía geoespacial real** (elevación DEM, perfiles altimétricos continuos, pendiente por tramos).
- **Motor físico-mecánico predictivo** para calcular gasto calórico (kCal), velocidad estimada de pedaleo (ETA) y presión recomendada de inflado (PSI).

---

## 2. 🧩 Stack Tecnológico y Estructura

```
CiclometricsWeb/
├── .agents/
│   └── agents/               # Equipo de agentes autónomos (Orchestrator, Backend, Frontend, QA)
├── api/
│   └── index.js              # Entrypoint Serverless Function para Vercel (/api/*)
├── backend/
│   ├── data/store.json       # Respaldo JSON atómico con lock de concurrencia para desarrollo/tests
│   ├── src/
│   │   ├── calculators/      # Motor físico: metCalculator, tirePressureCalculator, elevationInterpolator, routeAnalyzer
│   │   ├── controllers/      # authController, profileController, routeController, bicycleController
│   │   ├── models/           # Validadores estrictos y sanitizadores (validators.js)
│   │   ├── routes/           # Router central (apiRoutes.js)
│   │   ├── services/         # profileService, routeService, passwordService
│   │   └── storage/          # mongoStore.js (MongoDB Atlas) y jsonStore.js (HybridStore)
│   └── tests/
│       ├── verifyCalculations.js   # 12 pruebas de modelos físicos e interpolación
│       └── verifyApiEndpoints.js   # 15 pruebas de integración API y endpoints REST
├── docs/                     # Documentación técnica, memorias e informes de título
├── frontend/
│   ├── src/
│   │   ├── components/       # UI estilo ciclocomputador, mapas Leaflet, perfil altimétrico SVG
│   │   └── services/api.js   # Cliente desacoplado con sesión Bearer y modo offline fallback
│   └── package.json          # React 19, Vite, Tailwind CSS v4, Lucide Icons, Leaflet
└── vercel.json               # Configuración de despliegue unificado en Vercel (Frontend + API Serverless)
```

---

## 3. 🔬 Modelos Físicos e Invariantes Críticas

Cualquier modificación en el código debe respetar estrictamente estas leyes físicas y algoritmos:

### A. Gasto Calórico (kCal) — Compendio Ainsworth et al. (2011)
El gasto calórico no utiliza promedios planos. Se calcula tramo a tramo según la pendiente ($\theta$):
- **Pendiente pronunciada ($> 4\%$)**: $MET = 14.0$, velocidad de referencia reducida.
- **Pendiente moderada ($2\% \le \theta \le 4\%$)**: $MET = 10.0$.
- **Terreno plano ($-1\% \le \theta < 2\%$)**: $MET = 8.0$.
- **Descenso suave ($-3\% \le \theta < -1\%$)**: $MET = 6.0$.
- **Descenso pronunciado ($<-3\%$)**: $MET = 3.5$.

$$\text{kCal} = MET \times (M_{\text{usuario}} + M_{\text{bicicleta}}) \times \Delta t_{\text{horas}}$$

### B. Presión de Neumáticos (PSI) — Frank Berto (15% Drop) & Schwalbe (2022)
- Distribución de carga: **40% rueda delantera**, **60% rueda trasera** del peso del sistema ($M_{\text{total}} = M_{\text{usuario}} + M_{\text{bicicleta}}$).
- Factores por ancho de neumático ($mm$) y rodado.
- **Invariante de seguridad**: La presión resultante **siempre** queda acotada dentro del rango $[\text{psi\_min}, \text{psi\_max}]$ de la cubierta.

### C. Mitigaciones Topográficas (RT-02 y RT-03)
- **RT-02 (Interpolación Continua)**: Los vacíos o valores `NaN` devueltos por el proveedor DEM se interpolan linealmente entre puntos válidos adyacentes; los extremos se propagan por borde.
- **RT-03 (Filtro de Ruido y Pendientes Irreales)**: El suavizado de ventana móvil (`smoothElevationProfile`) elimina artefactos del modelo DEM que produzcan pendientes irreales ($|\text{pendiente}| > 30\%$).

---

## 4. 📡 Contratos de la API REST

| Método | Endpoint | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servicio backend | Pública |
| `POST` | `/api/auth/register` | Registro de nuevo usuario y biometría | Pública |
| `POST` | `/api/auth/login` | Login con email y contraseña, retorna token | Pública |
| `POST` | `/api/auth/reset-password` | Restablecimiento directo de contraseña olvidada por correo | Pública |
| `GET` | `/api/auth/me` | Obtiene el perfil del usuario autenticado | `Bearer <token>` / `x-user-id` |
| `POST` | `/api/profile` | Crea perfil de usuario y bicicleta inicial | Pública |
| `GET` | `/api/profile/:id` | Consulta perfil de usuario y bicicletas | Pública / Privada |
| `GET` | `/api/bicycles` | Lista bicicletas (soporta filtro `?userId=...`) | Pública / Privada |
| `POST` | `/api/bicycles` | Registra una nueva bicicleta para el usuario | `Bearer <token>` |
| `DELETE` | `/api/bicycles/:id` | Elimina una bicicleta | `Bearer <token>` |
| `POST` | `/api/routes/calculate` | Ejecuta análisis físico-mecánico completo | Pública / Privada |

---

## 5. 🔒 Seguridad Criptográfica, Políticas de Contraseña y Marco Legal (Ley N° 19.628 & 21.719 / OWASP)

Para cumplir estrictamente con los estándares de seguridad y la legislación chilena de datos personales:
- **Política de Complejidad de Contraseñas (`validatePasswordStrength`)**: Toda contraseña creada en el registro o restablecimiento debe tener **mínimo 8 caracteres**, al menos **1 letra mayúscula (`[A-Z]`)**, **1 letra minúscula (`[a-z]`)**, **1 número (`[0-9]`)** y **1 carácter especial (`[\W_]`)**, además de requerir confirmación exacta (`confirmPassword`).
- **Visualización Segura "Mantener para Ver" (Hold-to-Reveal)**: Tanto en Login como en Registro y Recuperación, el botón de ojo revela la contraseña únicamente mientras el usuario mantiene presionado el botón (`onMouseDown`/`onTouchStart`) y la oculta de inmediato al soltarlo (`onMouseUp`/`onMouseLeave`/`onTouchEnd`/`onBlur`).
- **Hashing Criptográfico con Salt**: Implementado en `backend/src/services/passwordService.js` mediante la función nativa `crypto.scryptSync` (KDF de memoria intensiva) con un salt pseudoaleatorio de 16 bytes (`crypto.randomBytes(16)`).
- **Formato Almacenado**: `<salt_hex>:<hash_hex>`.
- **Protección contra Timing Attacks**: Verificación en tiempo constante usando `crypto.timingSafeEqual`.
- **Migración Progresiva Automática**: Los usuarios antiguos o semillas en texto plano se autentican de forma segura en su primer inicio de sesión y se migran automáticamente al formato hash con salt sin requerir intervención manual.
- **Términos de Uso, Tratamiento de Datos y Consentimiento de Cookies**:
  - `TermsAndPrivacyModal.jsx`: Modal nativo `<dialog>` con el documento legal completo (Términos de Uso, Política de Tratamiento de Datos Personales bajo Ley N° 19.628 y Ley N° 21.719, y Política de Cookies). Su aceptación (`acceptedTerms: true`) es obligatoria en frontend y backend para registrarse.
  - `CookieConsentBanner.jsx`: Banner que aparece al iniciar sesión por primera vez para solicitar permiso de almacenar las cookies técnicas de sesión (`ciclometrics_auth_token` y `ciclometrics_auth_user`, validez de 30 días, `SameSite=Lax`), permitiendo mantener la sesión iniciada sin volver a autenticarse cada vez que se abre la aplicación.
- **Exclusión en Respuestas**: La función `sanitizeUserResponse` garantiza que el hash nunca viaje en las respuestas de la API.

---

## 6. 👤 Credenciales y Datos Semilla para Desarrollo y Pruebas

Para garantizar que los tests y el modo de desarrollo sean reproducibles sin fricción:

- **Usuario Semilla**:
  - `id`: `user-ricardo-1`
  - `email`: `ricardo@ciclometrics.cl`
  - `password`: `password123`
  - `nombre`: `Ricardo Henríquez`
  - `biometría`: `{ peso: 75, altura: 178, edad: 30, genero: "masculino", nivel: "intermedio" }`
- **Bicicleta Semilla**:
  - `id`: `bike-ricardo-1`
  - `userId`: `user-ricardo-1`
  - `nombre`: `Bici Aro 29`
  - `tipo`: `mtb`, `peso`: 10 kg, `rodado`: `29`, `ancho`: 60 mm, `psi_min`: 30, `psi_max`: 70

---

## 6. 🛡️ Metodología de Desarrollo en Equipo (Ciclo ECC)

Todos los subagentes deben regirse por el flujo:
1. **Planificación**: Descomponer la tarea en tareas de backend y frontend sin cruzar límites de capas.
2. **Pruebas (TDD)**: Si se agrega una nueva función o endpoint, verificar o crear la prueba en `backend/tests/` primero.
3. **Implementación**: Modificar código preservando las invariantes físicas y esquemas validados.
4. **Revisión y Verificación (QA)**: Ejecutar `npm test` en backend y `npm run build` en frontend. Ningún cambio se da por finalizado sin todas las pruebas en verde.
