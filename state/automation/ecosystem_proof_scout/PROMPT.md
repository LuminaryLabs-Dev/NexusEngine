# Ecosystem Proof State Automation Prompt

```text
GOAL:
Build one reviewable ecosystem proof state packet for NexusEngine, ProtoKits, and Experiments.

RUN CONFIG:
- Environment: local
- Workspace: /Users/crimsonwheeler/Documents/GitHub/NexusEngine
- Output lane: state/automation/ecosystem_proof_scout/packets/
- Knowledge node lane: state/automation/ecosystem_proof_scout/knowledge_nodes/
- Master tracker: state/automation/ecosystem_proof_scout/master_ecosystem_proof.md

PROCESS:
1. Start by restating this lane goal in the packet draft: audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.
2. Use agent-it mentality: read .agent/start-here.md, .agent/operating-model.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, memory.md, and state/automation/AUTOMATION_MANIFEST.md.
3. Read surrounding state context before new analysis: current lane master tracker, latest 1-3 current lane packets/nodes, and latest 1-2 packets/nodes from ecosystem_state_scout, dsk_architecture_scout, deep_bug_report_scout, and domain_kit_idea_expander when present.
4. Run npm run automation:preflight. Use latestReleaseBranch as the branch comparison target.
5. Inspect available NexusEngine, NexusEngine-ProtoKits, and NexusEngine-Experiments checkouts.
6. Check ProtoKits direct-import DSK state, createN...Kit aliases, compatibility shim risks, first-wave ledger status, engine.n.* usage, Experiments proof routes, browser import maps, renderer-vs-runtime ownership drift, stale branch names, missing validation commands, described/domain/kit idea proof coverage, docs/how-to-experiment.md alignment, and whether new reusable kit proof work belongs in NexusEngine-ProtoKits or NexusEngine-Experiments rather than core.
7. Write one timestamped packet to state/automation/ecosystem_proof_scout/packets/.
8. Write one timestamped knowledge node to state/automation/ecosystem_proof_scout/knowledge_nodes/ using the node contract.
9. Update state/automation/ecosystem_proof_scout/master_ecosystem_proof.md.
10. Do not edit core, ProtoKits, Experiments, docs, examples, package metadata, memory, or public claims from this lane.

PACKET MUST INCLUDE:
- Timestamp
- Lane Goal
- Prior State Context
- Latest branch
- Repos inspected
- Commands run
- Public links checked
- ProtoKits migration state
- Experiment proof state
- Domain and kit proof coverage
- Runtime ownership drift
- Broken/stale proof paths
- Risks
- Blockers
- Suggested next review item
- Not claimed
```
