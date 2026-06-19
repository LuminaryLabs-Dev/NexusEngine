# Master Ecosystem State Tracker

## Current Root Lessons
- id: ecosystem-root-001
- status: open
- latest packet: none yet
- latest node: none yet
- summary: NexusRealtime ecosystem automation must compare against the latest remote release branch and include core, ProtoKits, Experiments, DSK ledgers, and public proof routes.
- id: ecosystem-root-002
- status: open
- latest packet: `state/automation/ecosystem_state_scout/packets/2026-06-18T20-07-25-0400-ecosystem-state-packet.md`
- latest node: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-18T20-07-25-0400-ecosystem-state-node.md`
- summary: Core `0.0.2` is public-link reachable and test-clean locally, but DSK ecosystem proof is not review-stable until dirty behind-origin sibling repos are reconciled.

## Branch Tree
- parent: ecosystem-root-001
- child: latest-branch-public-link-preflight
- relationship: required preflight for every run
- look further: `npm run automation:preflight`
- parent: ecosystem-root-002
- child: sibling-branch-reconciliation
- relationship: needed before promoting local DSK first-wave proof claims
- look further: `NexusRealtime-ProtoKits` behind 69 and `NexusRealtime-Experiments` behind 38 on `0.0.2`
- parent: ecosystem-root-002
- child: public-consumption-wording
- relationship: GitHub/raw/jsDelivr available while npm registry metadata is 404
- look further: `README.md`, `package.json`, npm registry, jsDelivr release URL

## Open Search Branches
- branch: dsk-ledger-proof-drift
- owner: ecosystem_state_scout
- priority: high
- next files: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`, sibling ProtoKits ledger, sibling Experiments proof route
- branch: sibling-branch-reconciliation
- owner: ecosystem_state_scout
- priority: high
- next files: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/docs/DSK-FIRST-WAVE-LEDGER.md`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/`
- branch: public-consumption-wording
- owner: ecosystem_state_scout
- priority: medium
- next files: `README.md`, `package.json`, public GitHub/raw/jsDelivr/npm endpoint results

## Resolved Or Superseded
- id: none
- reason:
- evidence:
