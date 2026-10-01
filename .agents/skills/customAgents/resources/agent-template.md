---
name: your-agent-name
description: Clear, 2-3 sentence description of what this agent does and when the orchestrator should invoke it.
tools:
  - view_file
  - replace_file_content
  - write_to_file
  - grep_search
  - find_by_name
  - run_command
subagent: true
mainAgent: false
model: inherit
commandExecutionPolicy: sandbox
---

# System Prompt
[Describe the role, identity, and general objectives of this agent]

# Operating Instructions
1. [First instruction or protocol step]
2. [Second instruction, e.g. how to report findings or execute modifications]
3. [Safety constraints and boundary conditions]
