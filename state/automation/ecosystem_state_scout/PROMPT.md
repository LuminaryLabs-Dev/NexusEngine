# Ecosystem State Scout Automation Prompt

```text
GOAL:
Audit NexusEngine ecosystem state across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, and proof paths.

RUN CONFIG:
- Environment: local
- Workspace: /Users/crimsonwheeler/Documents/GitHub/NexusEngine
- Output lane: state/automation/ecosystem_state_scout/packets/
- Knowledge node lane: state/automation/ecosystem_state_scout/knowledge_nodes/
- Master tracker: state/automation/ecosystem_state_scout/master_ecosystem_state.md

PROCESS:
1. Start by restating this lane goal in the packet draft: audit NexusEngine ecosystem state, drift, and proof readiness.
2. Use agent-it mentality: read .agent/start-here.md, .agent/operating-model.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, and memory.md.
3. Read surrounding state context before new analysis: current lane master tracker, latest 1-3 current lane packets/nodes, and latest 1-2 packets/nodes from dsk_architecture_scout, ecosystem_proof_scout, deep_bug_report_scout, and domain_kit_idea_expander when present.
4. Run npm run automation:preflight. Use latestReleaseBranch as the branch comparison target.
5. Inspect current git branch/status, package.json, README.md, memory.md, docs/described_examples.md, docs/domain_ideas.md, docs/kits_ideas.md, docs/how-to-protokit.md, docs/how-to-experiment.md, src/index.js, src/domain-service-kit.js, tests, and any local DSK/proof docs.
6. If sibling repos are present, inspect NexusEngine-ProtoKits and NexusEngine-Experiments branch/status plus their DSK ledgers/proof routes.
7. Find state drift: stale branch claims, missing validation links, DSK ledger mismatch, public proof mismatch, untracked proof docs, or stale memory.
8. Write one timestamped packet to state/automation/ecosystem_state_scout/packets/.
9. Write one timestamped knowledge node to state/automation/ecosystem_state_scout/knowledge_nodes/ using the node contract.
10. Update state/automation/ecosystem_state_scout/master_ecosystem_state.md.
11. Do not edit source, tests, public docs, package metadata, or canonical memory from this lane.

PACKET MUST INCLUDE:
- Scope
- Lane Goal
- Prior State Context
- Agent Workspace State
- Latest Branch Preflight
- Public Links Checked
- Files Inspected
- Ecosystem Findings
- Domain And Kit Expansion Signals
- Evidence
- Suggested Canonical Updates
- Knowledge Nodes
- Master Tracker Updates
- Not Claimed
```
