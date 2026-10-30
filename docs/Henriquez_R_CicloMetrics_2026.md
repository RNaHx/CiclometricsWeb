# Universidad Andrés Bello
## Facultad de Ingeniería — Escuela de Informática
### Carrera: Ingeniería en Computación e Informática

---

# CicloMetrics Web: Plataforma de Planificación Inteligente de Rutas Ciclistas basada en Perfiles Biométricos y Análisis Topográfico para Optimizar el Rendimiento y Seguridad

### Trabajo de Titulación para optar al título de Ingeniero en Computación e Informática y Licenciado en Ciencias de la Ingeniería

**Autor:** Ricardo Ignacio Henríquez Novoa  
**Profesor Guía:** Félix Gonzalo Burgos González  
**Santiago, Chile — 04 de octubre de 2026** *(Hito 2 - Documento Consolidado y Continuación de Hito 1)*

---

## DECLARACIÓN DE ORIGINALIDAD Y USO DE INTELIGENCIA ARTIFICIAL

Quien suscribe en calidad de autor del trabajo de titulación presentado para su evaluación, declara que el contenido es original y las fuentes están debidamente acreditadas bajo Normas APA 7ª edición. Se reconoce el uso de herramientas de IA:

| Finalidad | Declaración de Uso | Nombre de Herramienta(s) |
| :--- | :--- | :--- |
| **Revisión de fuentes** | Apoyo para analizar teorías de MET y física de rodadura. | • Google Gemini / Perplexity AI |
| **Revisión de Redacción** | Mejora de redacción académica y consistencia de estilo. | • Google Gemini / Perplexity AI |
| **Verificación de Datos** | Validación de modelos matemáticos y tolerancias físicas. | • Google Gemini / Perplexity AI |
| **Generación de Códigos** | Optimización de algoritmos de cálculo y suavizado gaussiano. | • Google Antigravity / AI Studio |
| **Recursos Multimediales** | Generación de diagramas de procesos y esquemas UML. | • Mermaid.ai |

*Firma del Autor:* _______________________________________  
**Ricardo Ignacio Henríquez Novoa** (04 de octubre de 2026)

---

## RESUMEN EJECUTIVO
CicloMetrics Web es una plataforma de navegación predictiva que supera las limitaciones de los sistemas convencionales (e.g., Google Maps), los cuales calculan rutas ciclistas bajo velocidades vehiculares estáticas ignorando la biometría del usuario y la mecánica de la bicicleta. 

En este Hito 2, se consolida la propuesta metodológica y técnica integrando tres núcleos: (1) un modelo bioenergético basado en Equivalentes Metabólicos (MET) dinámicos ponderados por micro-pendiente y masa total ($M_{\text{ciclista}} + M_{\text{bici}}$); (2) un modelo físico de presión óptima de neumáticos (regla del 15% drop de Frank Berto y Schwalbe, con reparto 40% delantero / 60% trasero acotado por seguridad); y (3) un algoritmo de suavizado altimétrico con **Kernel Gaussiano adaptativo** (ventana de 80 m, $\sigma \approx 32\text{ m}$) que elimina errores de discretización DEM satelital (resolviendo la anomalía de pendientes espurias de hasta $-105.5\%$) y acota los gradientes a $[-30\%, +30\%]$. Se formalizan diez Requerimientos Funcionales, seis No Funcionales, el modelamiento de datos NoSQL y los diagramas de procesos del sistema.

---

## CAPÍTULO I: INTRODUCCIÓN

### 1.1 Contexto y Motivación
El crecimiento del ciclismo urbano en el Gran Santiago demanda herramientas que consideren el relieve geográfico y las capacidades físicas individuales. Los navegadores vehiculares genéricos asumen velocidades cinemáticas fijas (12–15 km/h), provocando fatiga imprevista en pendientes pronunciadas y aumentando el riesgo de siniestros viales.

### 1.2 Discusión Bibliográfica y Marco Teórico
- **Gasto Calórico y MET:** Ainsworth et al. (2011) definen el Equivalente Metabólico en función de la intensidad. Para obtener exactitud en ruta, los MET deben multiplicarse por la masa combinada del sistema (ciclista más bicicleta) y variar tramo a tramo según la pendiente.
- **Física Mecánica del Neumático:** Berto (2007) y Schwalbe (2022) demuestran que la presión óptima produce una deflexión del 15% bajo carga estática, minimizando la resistencia a la rodadura sin sacrificar confort ni seguridad.
- **Ruido Altimétrico en DEM:** Zimmermann (2020) demuestra que las APIs de elevación satelital presentan errores discretos en distancias cortas ($<30\text{ m}$), generando gradientes artificiales extremos si no se aplica un filtro espacial continuo.

### 1.3 Contribución y Trabajo a Realizar
CicloMetrics Web implementa una plataforma web integral que unifica biometría, características mecánicas de la bicicleta y topografía filtrada en un motor de cálculo predictivo previo al inicio del trayecto.

---

## CAPÍTULO II: IDENTIFICACIÓN DEL PROBLEMA Y OBJETIVOS

### 2.1 Problemática y Diagrama de Ishikawa
La planificación ciclista actual es deficiente debido a cuatro causas raíz: algoritmos optimizados solo para automóviles, velocidades fijas sin conexión a la biometría, desconocimiento de la física del inflado y ruido digital en modelos DEM.

```text
  SOFTWARE: Rutas para autos | Sin cálculo de presión mecánica
  DATOS:    Velocidades cinemáticas fijas | Perfiles separados
  USUARIOS: Desconocimiento técnico | Múltiples aplicaciones inconexas
  ENTORNO:  Topografía variada en Santiago | Ruido DEM satelital
  ===> [ PLANIFICACIÓN DEFICIENTE Y FRAGMENTADA ]
```

### 2.2 Objetivos de la Investigación
- **Objetivo General:** Desarrollar una aplicación web funcional para ciclistas que, integrando APIs de geolocalización, análisis topográfico y perfiles biométricos y mecánicos, entregue métricas personalizadas de esfuerzo, tiempo estimado y presiones técnicas.
- **Objetivos Específicos:**
  1. **OE-01:** Diseñar y desarrollar la arquitectura cliente-servidor y almacenamiento seguro de usuarios y bicicletas.
  2. **OE-02:** Integrar servicios geoespaciales para extracción de rutas viales y datos altimétricos precisos.
  3. **OE-03:** Codificar el motor algorítmico de MET dinámico, suavizado gaussiano y presión de inflado.
  4. **OE-04:** Construir una interfaz interactiva con sincronización bidireccional mapa-altimetría y panel de control.

### 2.3 Métricas de Éxito
- **Almacenamiento:** 100% de atributos recuperados sin inconsistencias.
- **Latencia:** Trazado de ruta y perfil altimétrico en $< 2.0\text{ s}$.
- **Precisión:** Margen de error en kCal $< 15\%$; pendientes acotadas a $[-30\%, +30\%]$.
- **Usabilidad:** Tiempo de carga de interfaz $< 3.0\text{ s}$ en móvil y escritorio.

### 2.4 Marco Normativo
- **Ley N° 19.628 / 21.719:** Protección de datos personales (hashing de contraseñas con `bcrypt` y sanitización).
- **Ley N° 21.088 (Convivencia Vial):** Priorización de ciclovías y vías seguras mediante perfiles ciclistas.
- **Ley N° 17.336:** Respeto de licencias de software libre (MIT, OpenStreetMap, Leaflet).

---

## CAPÍTULO III: METODOLOGÍA Y GESTIÓN (BASE HITO 1)
- **Marco Metodológico:** SCRUM en ciclos de 2 semanas estructurado en 6 fases operativas (12 semanas totales).
- **Ruta Crítica:** Infraestructura y BD (Semanas 3-4) $\rightarrow$ Integración Geoespacial (Semanas 5-7) $\rightarrow$ Motor Algorítmico (Semanas 8-9).
- **Matriz de Riesgos:** RT-01 (Cuotas de APIs $\rightarrow$ migración a OpenStreetMap/OSRM); RT-02 (Ruido altimétrico $\rightarrow$ suavizado gaussiano); RT-03 (Inyección en perfiles $\rightarrow$ validación de esquemas); RT-04 (Filtración de datos $\rightarrow$ encriptación `bcrypt`).

---

## CAPÍTULO IV: PROPUESTA DE SOLUCIÓN DETALLADA (HITO 2)

### 4.1 Modelo Bioenergético Dinámico (MET)
El gasto calórico total ($E_{\text{total}}$ en kCal) se calcula integrando tramo a tramo:

$$E_{\text{total}} = \sum_{i=1}^{n-1} \left( \text{MET}_i \times M_{\text{sistema}} \times \Delta t_i \right)$$

- $M_{\text{sistema}} = M_{\text{usuario}} + M_{\text{bicicleta}}$ (en kg).
- $\Delta t_i = \frac{d_i}{1000 \cdot v_i}$ (tiempo en horas; $d_i$ en metros, $v_i$ en km/h).
- Valores de $\text{MET}_i$ y velocidad $v_i$ por tramo:
  - $p_i < -2\%$ (bajada): $4.0\text{ MET}$, $35.0\text{ km/h}$.
  - $-2\% \le p_i \le +2\%$ (plano): $6.8\text{ MET}$, $22.0\text{ km/h}$.
  - $+2\% < p_i \le +6\%$ (subida moderada): $9.5\text{ MET}$, $14.0\text{ km/h}$.
  - $p_i > +6\%$ (subida empinada): $13.5\text{ MET}$, $8.5\text{ km/h}$.

### 4.2 Modelo Físico de Presión de Neumáticos (Regla 15% Drop)
Distribución estática: $M_{\text{delantera}} = M_{\text{sistema}} \times 0.40$, $M_{\text{trasera}} = M_{\text{sistema}} \times 0.60$.  
Presión teórica para un ancho de cubierta $w$ (en mm):

$$P_{\text{cruda}} = \frac{M_{\text{eje}}}{w \times 0.038} \times 1.55 \quad [\text{PSI}]$$

Acotada a los rangos certificados del fabricante: $P_{\text{recomendada}} = \min(\max(P_{\text{cruda}}, \text{PSI}_{\min}), \text{PSI}_{\max})$.

### 4.3 Suavizado Altimétrico con Kernel Gaussiano
Para eliminar pendientes ficticias de hasta $-105.5\%$, se aplica convolución espacial gaussiana sobre las cotas:

$$h_{\text{suavizada}}(s_i) = \frac{\sum_{j=1}^{n} h_j \cdot \exp\left(-\frac{(s_j - s_i)^2}{2\sigma^2}\right)}{\sum_{j=1}^{n} \exp\left(-\frac{(s_j - s_i)^2}{2\sigma^2}\right)}$$

- Ventana espacial: $D = 80\text{ m}$; $\sigma = \frac{D}{2.5} = 32\text{ m}$.
- Preservación de cotas de inicio y fin mediante *edge blending*.
- Cálculo de pendiente con ventana mínima segura ($40\text{ m}$) y clamp estricto a $[-30\%, +30\%]$.

---

## CAPÍTULO V: ANÁLISIS DE REQUERIMIENTOS Y ARQUITECTURA (HITO 2)

### 5.1 Requerimientos Funcionales (RF)
- **RF-01:** Autenticación y registro seguro con Bearer tokens.
- **RF-02:** Gestión del garaje multi-bicicleta (CRUD).
- **RF-03:** Selección de bicicleta activa con recálculo dinámico inmediato.
- **RF-04:** Trazado de ruta sobre red vial ciclista real con OSRM.
- **RF-05:** Extracción y suavizado gaussiano de altimetría.
- **RF-06:** Cálculo predictivo de gasto calórico tramo a tramo (kCal).
- **RF-07:** Estimación dinámica de tiempo de llegada (ETA).
- **RF-08:** Recomendación de presiones de inflado delantera y trasera (PSI).
- **RF-09:** Visualización interactiva con sincronización bidireccional mapa-SVG.
- **RF-10:** Modo Cockpit de manillar para smartphone.

### 5.2 Requerimientos No Funcionales (RNF)
- **RNF-01 (Rendimiento):** Respuesta de análisis $< 2.0\text{ s}$ en trayectos urbanos estándar.
- **RNF-02 (Precisión):** Margen de error kCal $< 15\%$; pendientes acotadas a $[-30\%, +30\%]$.
- **RNF-03 (Usabilidad):** Tiempo de carga de frontend $< 3.0\text{ s}$; diseño adaptativo.
- **RNF-04 (Seguridad):** Hashing `bcrypt`, exclusión de contraseñas en respuestas JSON.
- **RNF-05 (Resiliencia):** Modo offline de contingencia en frontend (`ErrorBoundary`).
- **RNF-06 (Cartografía):** Capas libres sin marcas de agua (CyclOSM, OSM, Esri).

### 5.3 Diagrama de Componentes de la Arquitectura
```text
  FRONTEND (React 18 + Vite + Tailwind v4)
  [ Navbar | MetricsHeaderBar | RoutePlanningCard | BicyclesListCard ]
  [ InteractiveMap (Leaflet)  | ElevationProfileChart (SVG) | PredictiveHud ]
         |
         v (REST / Bearer Token)
  BACKEND (Node.js + Express)
  [ authController | bicycleController | routeController | validators ]
  [ Calculators: smoothElevationProfile (Gauss) | metCalculator | tirePressureCalculator ]
         |                                |
         v                                v
  [ jsonStore (store.json) ]    [ SERVICIOS EXTERNOS: OSRM | Open-Meteo ]
```

---

## CAPÍTULO VI: ESTRUCTURA DE DATOS Y PROCESOS (HITO 2)

### 6.1 Modelamiento de Datos (NoSQL)
- **Users:** `{ id, nombre, email, password, biometria: { peso, altura, edad, nivel } }`
- **Bicycles:** `{ id, userId, nombre, tipo, peso, rodado, ancho_neumatico, psi_min, psi_max }`
- **Route_Analysis:** `{ distancia_km, tiempo_estimado_min, kcal_quemadas, desnivel_positivo_m, psi_delantero, psi_trasero, perfil_altimetrico: [{ distancia_m, elevacion_m, suavizado }] }`

### 6.2 Flujo del Proceso Altimétrico Gaussiano
```text
[ Puntos GPS ] ---> [ ¿Cotas nulas? ] --(Sí)--> [ Interpolación lineal ]
                             | (No)                    |
                             +-------------------------+
                             v
                 [ Kernel Gaussiano (80 m, sigma = 32 m) ]
                             v
                 [ Ventana segura >= 40 m y Clamp +-30% ]
                             v
                 [ Perfil altimétrico continuo validado ]
```

---

## REFERENCIAS BIBLIOGRÁFICAS
- Ainsworth, B. E., et al. (2011). 2011 Compendium of Physical Activities. *Medicine & Science in Sports & Exercise*, 43(8), 1575–1581.
- Berto, F. (2007). *Tire Pressure and Performance: The 15% Drop Rule for Bicycle Tires*. Vintage Bicycle Press.
- Chile. (1999). *Ley N° 19.628: Sobre protección de la vida privada*. Diario Oficial de Chile.
- Chile. (2018). *Ley N° 21.088: Ley de Convivencia Vial*. Diario Oficial de Chile.
- Chile. (2024). *Ley N° 21.719: Regula el tratamiento y protección de datos personales*. Diario Oficial de Chile.
- Sagaris, L. (2018). Citizen participation for sustainable transport in Santiago. *Journal of Transport Geography*, 67, 124–134.
- Schwalbe. (2022). *Rolling Resistance Technical White Paper*. Schwalbe Tires.
- Zimmermann, M. (2020). Accuracy of Elevation APIs for Physical Effort Estimation in Urban Cycling. *Proc. ICSMC*, 45–58.
