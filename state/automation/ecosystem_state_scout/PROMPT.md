# Ecosystem State Scout Automation Prompt

```text
GOAL:
Audit NexusRealtime ecosystem state across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, and proof paths.

RUN CONFIG:
- Environment: local
- Workspace: /Users/crimsonwheeler/Documents/GitHub/NexusRealtime
- Output lane: state/automation/ecosystem_state_scout/packets/
- Knowledge node lane: state/automation/ecosystem_state_scout/knowledge_nodes/
- Master tracker: state/automation/ecosystem_state_scout/master_ecosystem_state.md

PROCESS:
1. Use agent-it mentality: read .agent/start-here.md, .agent/operating-model.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, and memory.md.
2. Run npm run automation:preflight. Use latestReleaseBranch as the branch comparison target.
3. Inspect current git branch/status, package.json, README.md, memory.md, src/index.js, src/domain-service-kit.js, tests, and any local DSK/proof docs.
4. If sibling repos are present, inspect NexusRealtime-ProtoKits and NexusRealtime-Experiments branch/status plus their DSK ledgers/proof routes.
5. Find state drift: stale branch claims, missing validation links, DSK ledger mismatch, public proof mismatch, untracked proof docs, or stale memory.
6. Write one timestamped packet to state/automation/ecosystem_state_scout/packets/.
7. Write one timestamped knowledge node to state/automation/ecosystem_state_scout/knowledge_nodes/ using the node contract.
8. Update state/automation/ecosystem_state_scout/master_ecosystem_state.md.
9. Do not edit source, tests, public docs, package metadata, or canonical memory from this lane.

PACKET MUST INCLUDE:
- Scope
- Agent Workspace State
- Latest Branch Preflight
- Public Links Checked
- Files Inspected
- Ecosystem Findings
- Evidence
- Suggested Canonical Updates
- Knowledge Nodes
- Master Tracker Updates
- Not Claimed
```
