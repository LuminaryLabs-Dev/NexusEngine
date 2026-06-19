# Runtime Bug Scout Automation Prompt

```text
GOAL:
Audit NexusRealtime runtime source for ECS, scheduler, runtime-kit, DSK contract, sequence, terrain, renderer, AR, and game-kit bugs.

RUN CONFIG:
- Environment: local
- Workspace: /Users/crimsonwheeler/Documents/GitHub/NexusRealtime
- Output lane: state/automation/runtime_bug_scout/findings/
- Knowledge node lane: state/automation/runtime_bug_scout/knowledge_nodes/
- Master tracker: state/automation/runtime_bug_scout/master_runtime_bugs.md

PROCESS:
1. Use agent-it mentality: read .agent/start-here.md, .agent/operating-model.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, and memory.md.
2. Run npm run automation:preflight. Use latestReleaseBranch as the branch comparison target.
3. Search existing runtime bug findings first, then branch only when a bug has a distinct owner, cause, or validation path.
4. Inspect actual source before writing findings: src/ecs.js, src/engine.js, src/runtime-kit.js, src/domain-service-kit.js, src/game-kit-composer.js, sequence files, terrain/physics/locomotion/camera/renderer/AR kits, and relevant tests.
5. Find ownership violations, missing reset/snapshot expectations, DSK token collisions, scheduler phase issues, serialization gaps, stale compatibility exports, renderer-owned simulation, public import risks, and missing edge tests.
6. For each finding, cite concrete files or tests and classify owner as ECS, engine, runtime-kit, DSK, composer, sequence, terrain, renderer, AR, or kit.
7. Write one timestamped packet to state/automation/runtime_bug_scout/findings/.
8. Write one timestamped knowledge node to state/automation/runtime_bug_scout/knowledge_nodes/ using the node contract.
9. Update state/automation/runtime_bug_scout/master_runtime_bugs.md.
10. Do not edit source, tests, public docs, package metadata, or canonical memory from this lane.

PACKET MUST INCLUDE:
- Scope
- Agent Workspace State
- Latest Branch Preflight
- Source Areas Inspected
- Runtime Findings
- Owner
- Evidence
- Validation Required
- Knowledge Nodes
- Master Tracker Updates
- Not Claimed
```
