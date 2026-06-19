# Knowledge Nodes: ecosystem proof scout 2026-06-18T19-40-32-0400

## Root Lesson
- id: ecosystem-proof-001
- statement: Local DSK ecosystem proofs pass, but the reviewable public/remote proof state is not yet aligned with `0.0.2`.
- why it matters: Future claims should distinguish local green checks from public proof routes and raw branch artifacts.

## Child Nodes
- id: ecosystem-proof-001-a
  parent: ecosystem-proof-001
  lesson: NexusRealtime core is aligned to latest release branch and passes its smoke suite.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `npm test` passed 8 smoke tests.
  look further: Check whether the optional npm registry 404 is intentional before any npm consumption claim.
- id: ecosystem-proof-001-b
  parent: ecosystem-proof-001
  lesson: ProtoKits first-wave DSK migration is locally coherent but not public-reviewable from the sampled `0.0.2` raw URL.
  evidence: `npm run check` passed; `docs/DSK-FIRST-WAVE-LEDGER.md` lists seven promoted candidates; raw `0.0.2` ledger URL returned 404.
  look further: Compare local uncommitted migration files against `origin/0.0.2` before deciding whether to publish or rebase.
- id: ecosystem-proof-001-c
  parent: ecosystem-proof-001
  lesson: Experiments has a local DSK proof route and smoke test, but the public GitHub Pages proof path is missing.
  evidence: `npm run check` passed `DSK first-wave experiment smoke`; public proof route returned 404.
  look further: Determine whether GitHub Pages is built from a branch that lacks `experiments/dsk-first-wave-proof/`.
- id: ecosystem-proof-001-d
  parent: ecosystem-proof-001
  lesson: Stale `main` and `0.0.1` CDN pins remain available across ProtoKits and Experiments.
  evidence: Targeted `rg` found stale pins; sampled jsDelivr URLs returned 200.
  look further: Audit whether those pins are intentional legacy demos or stale proof paths.

## Related Nodes
- source: state/automation/dsk_architecture_scout/packets/2026-06-18T19-22-58-0400-dsk-architecture-state-packet.md
- relationship: predecessor
- reason: The DSK architecture packet appears to be the earlier local evidence pass for the same contract family.

## Next Search Branches
- branch: public-proof-alignment
- files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`, public GitHub Pages output
- question: Why are local passing DSK proof artifacts absent from sampled public/raw `0.0.2` URLs?
- branch: stale-cdn-pins
- files or folders: `NexusRealtime-ProtoKits/README.md`, `NexusRealtime-ProtoKits/protokits/**/README.md`, `NexusRealtime-Experiments/experiments/**`
- question: Which `main` and `0.0.1` pins are intentionally legacy versus stale proof claims?
- branch: compatibility-shim-exit
- files or folders: `NexusRealtime-ProtoKits/protokits/nexus-dsk-adapter/index.js`, `NexusRealtime-ProtoKits/tests/dsk-first-wave.test.mjs`
- question: What condition retires old injected-runtime calls and `engine.*` compatibility APIs for first-wave DSKs?

## Not Claimed
- This node does not fix, publish, merge, rebase, or update public claims.
- This node does not prove the DSK proof route in a browser because the public route returned 404.
