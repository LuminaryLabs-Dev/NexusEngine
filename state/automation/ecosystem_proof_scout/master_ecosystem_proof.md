# Master Ecosystem Proof Tracker

## Current Root Lessons
- id: ecosystem-proof-002
- status: active
- latest packet: `state/automation/ecosystem_proof_scout/packets/2026-06-18T20-40-32-0400-ecosystem-proof-state-packet.md`
- latest node: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T20-40-32-0400-ecosystem-proof-node.md`
- summary: Local DSK ecosystem validations still pass, but public/raw `0.0.2` proof paths remain missing and the public proof route visibly 404s.
- id: ecosystem-proof-001
- status: superseded-by-refresh
- latest packet: `state/automation/ecosystem_proof_scout/packets/2026-06-18T19-40-32-0400-ecosystem-proof-state-packet.md`
- latest node: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T19-40-32-0400-ecosystem-proof-node.md`
- summary: Local DSK ecosystem proofs pass, but public/raw `0.0.2` proof artifacts are missing or stale.

## Branch Tree
- parent: ecosystem-proof-002
- child: ecosystem-proof-002-a
- relationship: core-aligned
- look further: Optional npm registry 404 before npm consumption claims.
- parent: ecosystem-proof-002
- child: ecosystem-proof-002-b
- relationship: local-protokits-proof
- look further: Local uncommitted first-wave DSK files versus `origin/0.0.2`.
- parent: ecosystem-proof-002
- child: ecosystem-proof-002-c
- relationship: local-experiments-proof
- look further: GitHub Pages build source for missing DSK proof route.
- parent: ecosystem-proof-002
- child: ecosystem-proof-002-d
- relationship: stale-public-pins
- look further: Classify `main` and `0.0.1` CDN pins as intentional legacy or stale proof paths.
- parent: ecosystem-proof-002
- child: ecosystem-proof-002-e
- relationship: import-map-public-shape
- look further: Decide public proof import-map target for bare `nexusrealtime`.
- parent: ecosystem-proof-001
- child: ecosystem-proof-001-a
- relationship: core-aligned
- look further: Optional npm registry 404 before npm consumption claims.
- parent: ecosystem-proof-001
- child: ecosystem-proof-001-b
- relationship: local-protokits-proof
- look further: Local uncommitted ProtoKits proof work versus `origin/0.0.2`.
- parent: ecosystem-proof-001
- child: ecosystem-proof-001-c
- relationship: local-experiments-proof
- look further: GitHub Pages and raw branch absence for DSK proof route.
- parent: ecosystem-proof-001
- child: ecosystem-proof-001-d
- relationship: stale-public-pins
- look further: Decide which `main`/`0.0.1` CDN pins remain valid legacy demos.

## Open Search Branches
- branch: local-to-public-proof-sync
- owner: next scout
- priority: high
- next files: ProtoKits local uncommitted DSK proof files, Experiments local proof route, `origin/0.0.2` trees, GitHub Pages build source.
- branch: import-map-public-shape
- owner: next scout
- priority: high
- next files: `experiments/dsk-first-wave-proof/index.html`, ProtoKits README import-map guidance, public CDN URLs.
- branch: stale-cdn-pins
- owner: next scout
- priority: medium
- next files: ProtoKits README/docs/demos and Experiments configs/sessions using `main` or `0.0.1`.
- branch: compatibility-shim-exit
- owner: next scout
- priority: medium
- next files: `protokits/nexus-dsk-adapter/index.js`, first-wave DSK tests, DSK ledger.

## Resolved Or Superseded
- id: ecosystem-proof-001
- reason: superseded by 2026-06-18T20-40-32 refresh with the same local-green/public-missing result plus Playwright visible 404 evidence.
- evidence: `state/automation/ecosystem_proof_scout/packets/2026-06-18T20-40-32-0400-ecosystem-proof-state-packet.md`
