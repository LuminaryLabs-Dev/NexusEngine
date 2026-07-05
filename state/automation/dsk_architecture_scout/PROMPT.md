# DSK Architecture State Automation Prompt

```text
GOAL:
Build one reviewable DSK architecture state packet for long-term NexusEngine production viability.

RUN CONFIG:
- Environment: local
- Workspace: /Users/crimsonwheeler/Documents/GitHub/NexusEngine
- Output lane: state/automation/dsk_architecture_scout/packets/
- Knowledge node lane: state/automation/dsk_architecture_scout/knowledge_nodes/
- Master tracker: state/automation/dsk_architecture_scout/master_dsk_architecture.md

PROCESS:
1. Start by restating this lane goal in the packet draft: audit DSK architecture, contracts, invariants, scaling, and promotion risk.
2. Use agent-it mentality: read .agent/start-here.md, .agent/operating-model.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, memory.md, and state/automation/AUTOMATION_MANIFEST.md.
3. Read surrounding state context before new analysis: current lane master tracker, latest 1-3 current lane packets/nodes, and latest 1-2 packets/nodes from ecosystem_state_scout, ecosystem_proof_scout, deep_bug_report_scout, and domain_kit_idea_expander when present.
4. Run npm run automation:preflight. Use latestReleaseBranch as the branch comparison target.
5. Inspect src/domain-service-kit.js, src/runtime-kit.js, src/game-kit-composer.js, src/index.js, tests/domain-service-kit-smoke.mjs, tests/public-api-freeze.mjs, tests/run-all.mjs, README.md, memory.md, docs/described_examples.md, docs/domain_ideas.md, docs/kits_ideas.md, and docs/how-to-protokit.md.
6. Evaluate RuntimeKit vs DomainServiceKit boundary, n: token correctness, n-<domain>-kit id stability, engine.n.<api> namespace safety, duplicate install behavior, dependency/token errors, reset/snapshot/serialization expectations, domain/service/path ownership, linear scaling risks, async-readiness gaps, test holes, promotion risks, and whether new kit work is being routed to ProtoKits instead of core.
7. Write one timestamped packet to state/automation/dsk_architecture_scout/packets/.
8. Write one timestamped knowledge node to state/automation/dsk_architecture_scout/knowledge_nodes/ using the node contract.
9. Update state/automation/dsk_architecture_scout/master_dsk_architecture.md.
10. Do not edit source, tests, docs, examples, package metadata, memory, or public claims from this lane.

PACKET MUST INCLUDE:
- Timestamp
- Lane Goal
- Prior State Context
- Latest branch
- Files inspected
- Commands run
- DSK contract state
- Invariant coverage
- Domain and kit expansion architecture notes
- Scaling risks
- Bug candidates
- Missing tests
- Promotion risks
- Suggested next review item
- Not claimed
```
