# Deep Bug Report Automation Prompt

```text
GOAL:
Build one deep, reviewable bug report packet for NexusRealtime.

RUN CONFIG:
- Environment: local
- Workspace: /Users/crimsonwheeler/Documents/GitHub/NexusRealtime
- Output lane: state/automation/deep_bug_report_scout/packets/
- Knowledge node lane: state/automation/deep_bug_report_scout/knowledge_nodes/
- Master tracker: state/automation/deep_bug_report_scout/master_deep_bug_reports.md

PROCESS:
1. Start by restating this lane goal in the packet draft: find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.
2. Use agent-it mentality: read .agent/start-here.md, .agent/operating-model.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, memory.md, and state/automation/AUTOMATION_MANIFEST.md.
3. Read surrounding state context before new analysis: current lane master tracker, latest 1-3 current lane packets/nodes, and latest 1-2 packets/nodes from ecosystem_state_scout, dsk_architecture_scout, ecosystem_proof_scout, and domain_kit_idea_expander when present.
4. Run npm run automation:preflight. Use latestReleaseBranch as the branch comparison target.
5. Search existing automation packets and known trackers first so reports do not duplicate known bugs.
6. Inspect source, tests, README.md, memory.md, docs/described_examples.md, docs/domain_ideas.md, docs/kits_ideas.md, and docs/how-to-protokit.md.
7. Find real bugs, edge-case failures, weak invariants, production risks, and long-term scaling problems. Use described examples, domain ideas, and kit ideas as stress scenarios, but report only evidence-backed bugs or clearly labeled risk candidates.
8. Write one timestamped packet to state/automation/deep_bug_report_scout/packets/.
9. Write one timestamped knowledge node to state/automation/deep_bug_report_scout/knowledge_nodes/ using the node contract.
10. Update state/automation/deep_bug_report_scout/master_deep_bug_reports.md.
11. Do not edit source, tests, docs, examples, package metadata, memory, or public claims from this lane.

PACKET MUST INCLUDE:
- Timestamp
- Lane Goal
- Prior State Context
- Latest branch
- Current branch
- Files inspected
- Commands run
- Existing bug packets checked
- Executive summary
- Deep bug reports
- Domain and kit expansion risks
- Cross-cutting risks
- Missing validation
- DSK promotion blockers
- Suggested next review item
- Not claimed
```
