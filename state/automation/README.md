# NexusRealtime Audit Automations

## Purpose

Local high-reasoning automations that track NexusRealtime ecosystem state, runtime bugs, public link drift, and long-term DSK/ProtoKits/Experiments issues through lane packets.

## Lanes

- `ecosystem_state_scout/`: core, ProtoKits, Experiments, branch, DSK ledger, and proof-route state drift.
- `runtime_bug_scout/`: ECS, scheduler, runtime-kit, DSK contract, sequence, terrain, renderer, AR, and game-kit source risks.
- `public_link_scout/`: GitHub branch naming, raw source availability, CDN import-map URLs, package/public consumption, and README public claims.

## Master Trackers

- `ecosystem_state_scout/master_ecosystem_state.md`
- `runtime_bug_scout/master_runtime_bugs.md`
- `public_link_scout/master_public_links.md`

## Rules

- Use `.agent/start-here.md` first.
- Run locally in `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime`.
- Run `npm run automation:preflight` at the start of every lane.
- Use the preflight `latestReleaseBranch` as the branch to compare against; do not hardcode `0.0.2`.
- Audit lanes write only inside their lane folders.
- Do not edit source, public claims, package metadata, tests, or canonical memory from audit lanes.
- Produce one timestamped packet, one timestamped knowledge-node file, and one update to the lane-local master tracker per run.
- Follow `KNOWLEDGE_NODE_CONTRACT.md` for hierarchical lesson expansion.

## Packet Format

- Scope
- Agent Workspace State
- Latest Branch Preflight
- Public Links Checked
- Files Inspected
- Findings
- Evidence
- Suggested Canonical Updates
- Knowledge Nodes
- Master Tracker Updates
- Not Claimed
