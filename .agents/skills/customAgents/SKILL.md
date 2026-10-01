---
name: customAgents
description: >-
  Guía completa y protocolo para crear, configurar, gestionar e invocar subagentes
  personalizados (custom subagents) en Antigravity. Utilízala cuando el usuario
  quiera definir un nuevo agente especializado, crear archivos .md de agentes,
  configurar frontmatter de subagentes, delegar tareas concurrentes o administrar agentes vía invoke_subagent y el panel /agents.
---

# Habilidad: Custom Agents (Subagentes Personalizados en Antigravity)

Esta habilidad proporciona las directrices oficiales, especificaciones de esquema, ubicaciones de archivos y mejores prácticas para crear y operar **subagentes personalizados** en Google Antigravity.

---

## 1. Concepto y Arquitectura

Los subagentes permiten delegar tareas concurrentes en segundo plano (análisis estático, refactorización masiva, suites de pruebas, barridos de investigación) sin bloquear el hilo principal de desarrollo ni saturar el contexto de la conversación principal.

### Características Clave:
- **Aislamiento de contexto**: El subagente inicia con su propio contexto limpio; no hereda todo el historial de conversación anterior del agente principal, sólo el prompt inicial y las instrucciones del sistema configuradas.
- **Modos de espacio de trabajo (`Workspace`)**:
  - `inherit` (predeterminado): Comparte el mismo directorio de trabajo del agente principal.
  - `branch`: Crea un árbol de trabajo Git aislado (*git worktree*) para cambios experimentales o paralelos.
  - `share`: Comparte el almacenamiento subyacente sin duplicar archivos.
- **Ciclo de vida asíncrono**: Los subagentes operan en segundo plano en tres estados posibles:
  1. `Running`: Ejecutando herramientas y razonamiento activo.
  2. `Idle`: Ha finalizado su turno y espera mensajes. Se reactiva automáticamente al recibir un mensaje (`send_message`).
  3. `Killed`: Terminado permanentemente.
- **Límite de anidamiento**: Máximo **10 niveles** de profundidad de subagentes para prevenir recursiones infinitas.

---

## 2. Ubicaciones y Descubrimiento (Discovery)

Antigravity escanea automáticamente archivos `.md` de agentes en las siguientes rutas según su alcance:

| Alcance | Ruta | Propósito |
| :--- | :--- | :--- |
| **Workspace (Proyecto)** | `.agents/agents/<name>.md`<br>o `.agents/agents/<name>/agent.md` | Específico del proyecto, versionable en Git y compartido con el equipo. |
| **Global (Máquina)** | `~/.gemini/config/agents/<name>.md`<br>o `~/.gemini/config/agents/<name>/agent.md` | Disponible globalmente en todos los proyectos del desarrollador. |
| **Plugins** | `plugins/<plugin_name>/agents/` | Empaquetado como parte de un plugin distribuible. |

> [!IMPORTANT]
> Para mantener la configuración confinada únicamente al proyecto actual, guarda siempre las definiciones en el directorio `.agents/agents/` de la raíz del proyecto.

---

## 3. Formato del Archivo del Agente (`.md`)

Un subagente se define en un archivo Markdown compuesto por:
1. **Frontmatter YAML**: Metadatos, herramientas permitidas, modelo, y políticas de ejecución.
2. **Cuerpo Markdown**: System Prompt e instrucciones operativas (guidelines).

### Campos del Frontmatter YAML:

| Campo | Tipo | Obligatorio | Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `name` | `string` | **Sí** | - | Identificador único del agente (en minúsculas con guiones, ej. `security-auditor`). |
| `description` | `string` | **Sí** | - | Descripción detallada que utiliza el planificador/orquestador para decidir cuándo delegar tareas a este agente. |
| `tools` | `string[]` | No | `[]` | Lista explícita de herramientas permitidas (ej. `view_file`, `replace_file_content`, `grep_search`, `run_command`). |
| `mainAgent` | `boolean` | No | `true` | Si es `true`, puede seleccionarse como agente principal en la interfaz de chat y panel `/agents`. |
| `subagent` | `boolean` | No | `true` | Si es `true`, permite ser invocado programáticamente mediante la herramienta `invoke_subagent`. |
| `model` | `string` | No | `inherit` | Nivel de modelo al ser invocado: `inherit`, `flash`, o `pro`. |
| `commandExecutionPolicy` | `string` | No | `sandbox` | Política de ejecución de comandos de terminal: `off`, `auto`, `eager`, `sandbox`. |
| `skills` / `plugins` | `string[]` | No | `[]` | Lista de skills requeridas (ej. `skills/customAgents`, `skills/testing`) o dependencias de plugins. |
| `mcpServers` | `object[]` | No | `[]` | Configuración de servidores Model Context Protocol dedicados para este agente. |

> [!WARNING]
> **Validación de herramientas**: Si se especifica un nombre de herramienta incorrecto o mal escrito en la lista `tools`, el proceso del subagente puede quedar suspendido (*hang*). Verifica siempre la ortografía exacta de herramientas nativas como `view_file`, `replace_file_content`, `write_to_file`, `grep_search`, `find_by_name`, `run_command`, etc.

---

## 4. Estructura y Ejemplo de Archivo de Agente

### Plantilla Base:
```markdown
---
name: my-specialist-agent
description: Experto en [área específica]. Úsalo para [casos de uso concretos].
tools:
  - view_file
  - replace_file_content
  - write_to_file
  - grep_search
  - find_by_name
  - run_command
subagent: true
mainAgent: false
model: pro
commandExecutionPolicy: sandbox
skills:
  - skills/customAgents
---

# System Prompt
Eres un agente especializado en [dominio]. Tu propósito fundamental es [meta principal].

# Directrices de Trabajo
1. Analiza exhaustivamente el código antes de proponer modificaciones.
2. Mantén la consistencia arquitectónica del proyecto.
3. Proporciona explicaciones claras y verificables.
```

---

## 5. Formas de Invocación y Gestión

### A. Invocación Programática (`invoke_subagent`)
El agente principal lanza subagentes mediante la herramienta `invoke_subagent`:
```json
{
  "Subagents": [
    {
      "TypeName": "code-auditor",
      "Role": "Security Auditor",
      "Prompt": "Audita los controladores de autenticación en src/auth/ para identificar vectores de inyección SQL y reporta tus hallazgos.",
      "Workspace": "inherit",
      "Model": "pro"
    }
  ]
}
```

### B. Creación Dinámica en Sesión (`define_subagent`)
Si se requiere un agente temporal durante una conversación sin guardarlo previamente en disco:
```json
{
  "name": "temp-linter",
  "description": "Subagente transitorio para verificación de estilo",
  "system_prompt": "Revisa y corrige errores de formato según PEP8.",
  "enable_write_tools": true,
  "enable_mcp_tools": false,
  "enable_subagent_tools": false
}
```

### C. Comunicación Inter-Agentes (`send_message`)
Los agentes interactúan usando su `conversationID`:
- Enviar nuevas instrucciones o seguimiento.
- Al enviar un mensaje a un subagente en estado `Idle`, este se **reactiva automáticamente**.

### D. Gestión y Monitoreo (`manage_subagents` y Panel `/agents`)
- Desde herramientas: `manage_subagents` con acciones `list`, `kill`, `kill_all`.
- En la interfaz de usuario:
  - Comando `/agents` para abrir el Agent Manager interactivo.
  - Atajo `Alt+J` en CLI para navegación rápida (*teleport*).
  - Confirmaciones rápidas con `Ctrl+K`.

---

## 6. Procedimiento Paso a Paso para Crear un Nuevo Custom Agent en este Proyecto

Cuando el usuario solicite un nuevo agente:
1. **Determinar el rol y alcance**: Identificar el objetivo, herramientas indispensables y modelo recomendado (`flash` para búsquedas/tareas rápidas, `pro` para refactorizaciones complejas o arquitectura).
2. **Crear el archivo en el proyecto**: Escribir en `.agents/agents/<nombre-agente>.md`.
3. **Completar Frontmatter YAML**:
   - `name`: Nombre único representativo.
   - `description`: Descripción clara orientada al planificador.
   - `tools`: Lista precisa y válida de herramientas.
   - `subagent: true`.
4. **Redactar el System Prompt**:
   - Definir personalidad, contexto y responsabilidades.
   - Incluir restricciones de seguridad y directrices de salida estructurada.
5. **Verificar el registro**: Confirmar que el archivo esté creado correctamente en `.agents/agents/` listo para ser detectado por el motor de Antigravity.
