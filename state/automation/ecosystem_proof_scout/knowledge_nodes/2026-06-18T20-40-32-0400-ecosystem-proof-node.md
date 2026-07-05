# Knowledge Nodes: ecosystem proof scout 2026-06-18T20-40-32-0400

## Root Lesson
- id: ecosystem-proof-002
- statement: The ecosystem proof is still local-only: validations pass, but the latest public/raw `0.0.2` proof paths remain absent.
- why it matters: Reviewers need public route and raw branch evidence before any ecosystem proof claim can be treated as release-visible.

## Child Nodes
- id: ecosystem-proof-002-a
  parent: ecosystem-proof-002
  lesson: NexusEngine core remains aligned with latest release branch `0.0.2`.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; local HEAD equals `origin/0.0.2`; `npm test` passed 8 smoke tests.
  look further: Confirm whether optional npm registry 404 is intentional before npm-based consumption claims.
- id: ecosystem-proof-002-b
  parent: ecosystem-proof-002
  lesson: ProtoKits first-wave DSK migration is locally coherent but absent from `origin/0.0.2` proof paths.
  evidence: `npm run check` passed; local ledger and `nexus-dsk-adapter` exist; `git ls-tree origin/0.0.2` shows no sampled ledger/adapter/test proof paths; raw ledger URL returns 404.
  look further: Compare local uncommitted migration files against `origin/0.0.2` before publish or sync decisions.
- id: ecosystem-proof-002-c
  parent: ecosystem-proof-002
  lesson: Experiments proves `engine.n.*` locally, but public GitHub Pages still shows a visible 404 for the DSK proof route.
  evidence: `npm run check` passed; Playwright snapshot of the public proof route showed GitHub Pages `404` / `File not found`.
  look further: Determine which branch or build output feeds GitHub Pages and whether it lacks `experiments/dsk-first-wave-proof/`.
- id: ecosystem-proof-002-d
  parent: ecosystem-proof-002
  lesson: Stale CDN pins are available enough to mask latest-branch proof drift.
  evidence: Targeted `rg` found `main` and `0.0.1` pins; sampled specific kit URLs returned 200 while latest proof URLs returned 404.
  look further: Classify each public pin as intentional legacy, stale demo, or proof-blocking route.
- id: ecosystem-proof-002-e
  parent: ecosystem-proof-002
  lesson: The proof route's local import map is not a public CDN import map.
  evidence: `experiments/dsk-first-wave-proof/index.html` maps bare `nexusengine` to `../../../NexusEngine/src/index.js`; ProtoKits README separately documents a `0.0.2` CDN import map for browser hosts.
  look further: Decide whether the public proof should use sibling-repo local paths, GitHub Pages-relative paths, or CDN import maps.

## Related Nodes
- source: state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T19-40-32-0400-ecosystem-proof-node.md
- relationship: refreshes
- reason: This node rechecks the same local-vs-public DSK proof gap one hour later and adds visible Playwright 404 evidence.

## Next Search Branches
- branch: local-to-public-proof-sync
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, GitHub Pages build source
- question: What exact commits or generated outputs must contain the DSK proof route and first-wave ledger for public review?
- branch: import-map-public-shape
- files or folders: `experiments/dsk-first-wave-proof/index.html`, ProtoKits README import-map guidance, public CDN URLs
- question: Should the public proof map `nexusengine` to local sibling source or latest public CDN?
- branch: compatibility-shim-exit
- files or folders: `protokits/nexus-dsk-adapter/index.js`, `tests/dsk-first-wave.test.mjs`
- question: What condition retires old injected-runtime calls and legacy `engine.*` compatibility APIs?

## Not Claimed
- This node does not fix, publish, rebase, deploy, or update public claims.
- This node does not prove the public DSK proof route works; it records that it visibly fails.
