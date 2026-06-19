# Public Link Scout Automation Prompt

```text
GOAL:
Audit NexusRealtime public consumption paths: GitHub branches, raw source URLs, CDN import-map URLs, package metadata, README claims, and sibling experiment links.

RUN CONFIG:
- Environment: local
- Workspace: /Users/crimsonwheeler/Documents/GitHub/NexusRealtime
- Output lane: state/automation/public_link_scout/reports/
- Knowledge node lane: state/automation/public_link_scout/knowledge_nodes/
- Master tracker: state/automation/public_link_scout/master_public_links.md

PROCESS:
1. Use agent-it mentality: read .agent/start-here.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, README.md, and memory.md.
2. Run npm run automation:preflight. Use latestReleaseBranch as the public branch target.
3. Check public URLs from the preflight and scan README.md, memory.md, examples, docs, and sibling ProtoKits/Experiments docs for GitHub/CDN/Page links.
4. Classify each link as required, optional, stale, private/local-only, or unresolved.
5. Find import-map risks, hardcoded old branches, missing latest-branch wording, broken raw URLs, stale CDN references, package-name mismatch, and public docs that imply unavailable deployments.
6. Write one timestamped report to state/automation/public_link_scout/reports/.
7. Write one timestamped knowledge node to state/automation/public_link_scout/knowledge_nodes/ using the node contract.
8. Update state/automation/public_link_scout/master_public_links.md.
9. Do not edit public docs or package metadata from this lane.

REPORT MUST INCLUDE:
- Scope
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
