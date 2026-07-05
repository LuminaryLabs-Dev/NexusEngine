# Public Link Scout Automation Prompt

```text
GOAL:
Audit NexusEngine public consumption paths: GitHub branches, raw source URLs, CDN import-map URLs, package metadata, README claims, and sibling experiment links.

RUN CONFIG:
- Environment: local
- Workspace: /Users/crimsonwheeler/Documents/GitHub/NexusEngine
- Output lane: state/automation/public_link_scout/reports/
- Knowledge node lane: state/automation/public_link_scout/knowledge_nodes/
- Master tracker: state/automation/public_link_scout/master_public_links.md

PROCESS:
1. Start by restating this lane goal in the report draft: audit public consumption links and public proof drift.
2. Use agent-it mentality: read .agent/start-here.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, README.md, and memory.md.
3. Read surrounding state context before new analysis: current lane master tracker, latest 1-3 current lane reports/nodes, and latest 1-2 packets/nodes from ecosystem_state_scout, ecosystem_proof_scout, and domain_kit_idea_expander when present.
4. Run npm run automation:preflight. Use latestReleaseBranch as the public branch target.
5. Check public URLs from the preflight and scan README.md, memory.md, examples, docs/described_examples.md, docs/domain_ideas.md, docs/kits_ideas.md, docs/how-to-protokit.md, and sibling ProtoKits/Experiments docs for GitHub/CDN/Page links.
6. Classify each link as required, optional, stale, private/local-only, or unresolved.
7. Find import-map risks, hardcoded old branches, missing latest-branch wording, broken raw URLs, stale CDN references, package-name mismatch, and public docs that imply unavailable deployments.
8. Write one timestamped report to state/automation/public_link_scout/reports/.
9. Write one timestamped knowledge node to state/automation/public_link_scout/knowledge_nodes/ using the node contract.
10. Update state/automation/public_link_scout/master_public_links.md.
11. Do not edit public docs or package metadata from this lane.

REPORT MUST INCLUDE:
- Scope
- Lane Goal
- Prior State Context
- Agent Workspace State
- Latest Branch Preflight
- Links Checked
- Link Findings
- Evidence
- Suggested Canonical Updates
- Knowledge Nodes
- Master Tracker Updates
- Not Claimed
```
