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
1. Start by restating this lane goal in the packet draft: audit runtime bugs, edge cases, and production risks.
2. Use agent-it mentality: read .agent/start-here.md, .agent/operating-model.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, and memory.md.
3. Read surrounding state context before new analysis: current lane master tracker, latest 1-3 current lane findings/nodes, and latest 1-2 packets/nodes from ecosystem_state_scout, dsk_architecture_scout, ecosystem_proof_scout, deep_bug_report_scout, and domain_kit_idea_expander when present.
4. Run npm run automation:preflight. Use latestReleaseBranch as the branch comparison target.
5. Search existing runtime bug findings first, then branch only when a bug has a distinct owner, cause, or validation path.
6. Inspect actual source before writing findings: src/ecs.js, src/engine.js, src/runtime-kit.js, src/domain-service-kit.js, src/game-kit-composer.js, docs/described_examples.md, docs/domain_ideas.md, docs/kits_ideas.md, sequence files, terrain/physics/locomotion/camera/renderer/AR kits, and relevant tests.
7. Find ownership violations, missing reset/snapshot expectations, DSK token collisions, scheduler phase issues, serialization gaps, stale compatibility exports, renderer-owned simulation, path ownership gaps against described examples, public import risks, and missing edge tests.
8. For each finding, cite concrete files or tests and classify owner as ECS, engine, runtime-kit, DSK, composer, sequence, terrain, renderer, AR, or kit.
9. Write one timestamped packet to state/automation/runtime_bug_scout/findings/.
10. Write one timestamped knowledge node to state/automation/runtime_bug_scout/knowledge_nodes/ using the node contract.
11. Update state/automation/runtime_bug_scout/master_runtime_bugs.md.
12. Do not edit source, tests, public docs, package metadata, or canonical memory from this lane.

PACKET MUST INCLUDE:
- Scope
- Lane Goal
- Prior State Context
- Agent Workspace State
- Latest Branch Preflight
- Source Areas Inspected
- Runtime Findings
- Domain/Kits Expansion Risk
- Owner
- Evidence
- Validation Required
- Knowledge Nodes
- Master Tracker Updates
- Not Claimed
```
