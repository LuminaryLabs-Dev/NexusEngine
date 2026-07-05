# Ecosystem Proof State Packet

Timestamp: 2026-06-18T19:40:32-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; local proofs pass, public/remote proof state is not reviewable yet

## Latest branch
- Resolved from live remotes with `git ls-remote --heads origin`.
- Latest semver release branch: `0.0.2`.
- NexusEngine: local `0.0.2` at `2b3b66da33a2c561f0ad901604ba09404f747a82`, matching `origin/0.0.2`.
- ProtoKits: local `0.0.2` at `7f2e35222cf5180fe99e4a709c1d2d0aaf93eac4`; `origin/0.0.2` is `089d9be00affd7cdb121c070fd05679383bc9934`; local branch is behind 69 with uncommitted migration/proof files.
- Experiments: local `0.0.2` at `91addadb6bcec8470fcb23dc9364fc19adef4287`; `origin/0.0.2` is `0cc2a76d9db452de36d06d4543b201e33087a079`; local branch is behind 38 with uncommitted proof-route files.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Commands run
- NexusEngine: `npm run automation:preflight` -> passed; required public links OK.
- NexusEngine: `npm test` -> passed 8 smoke tests.
- ProtoKits: `npm run check` -> passed syntax, import smoke, and ProtoKit tests including first-wave DSK migration.
- Experiments: `npm run check` -> passed static/content/proof smoke checks; static smoke emitted legacy HTML warnings but exited 0.
- Branch/public checks: `git ls-remote --heads origin`, `git status --short --branch`, `git rev-parse`, `git merge-base --is-ancestor`, targeted `rg`, and sampled `curl` public URL checks.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200 by preflight.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200 by preflight.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200 by preflight and direct curl.
- `https://registry.npmjs.org/nexusengine` -> 404 by preflight; optional link.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/` -> 200.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 404.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 404.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 404.
- Sampled stale/stable CDN pins for `NexusEngine@main`, `NexusEngine@0.0.1`, `NexusEngine-ProtoKits@0.0.1`, and `NexusEngine-ProtoKits@main` -> 200; availability is OK, branch freshness is the risk.

## ProtoKits migration state
- Direct-import DSK path exists locally through `protokits/nexus-dsk-adapter/index.js`, which imports bare `nexusengine`, normalizes direct-import vs injected-runtime calls, and maps first-wave kits into `defineDomainServiceKit()` when available.
- `createN...Kit` aliases exist for zone-field, scan-survey, route-checkpoint, resource-pressure, hazard-director, token-registry, and completion-ledger.
- `tests/dsk-first-wave.test.mjs` proves `engine.n.*` installation, legacy `engine.*` compatibility, serializable snapshots, and missing-token failure.
- Local first-wave ledger says no first-wave kit is half migrated and promotion into core is deferred.
- Remote/public branch proof is not reviewable yet because raw `0.0.2` ledger lookup returned 404 and local ProtoKits is behind origin with uncommitted proof files.

## Experiment proof state
- Local `experiments/dsk-first-wave-proof/` exists and is covered by `tests/dsk-first-wave-experiment-smoke.mjs`.
- The proof uses an import map for bare `nexusengine`, imports first-wave ProtoKit N aliases, composes `createRealtimeGame()`, ticks the engine, and reads promoted APIs under `engine.n.*`.
- Local Experiments `npm run check` passes the DSK first-wave smoke.
- Public GitHub Pages proof route returns 404, and raw `origin/0.0.2` proof HTML returns 404, so the proof is local-only/unpublished from this review perspective.

## Runtime ownership drift
- Core NexusEngine owns the generic DSK contract under `src/domain-service-kit.js` and passes `tests/domain-service-kit-smoke.mjs`.
- The first-wave DSK proof keeps runtime behavior in NexusEngine/ProtoKits and uses Experiments as a host/proof route.
- Drift risk remains in older Experiments: `experiments/next-ledge/src/session.js` defines `engine.nextLedge` inside the experiment host even though ProtoKits contains next-ledge runtime kits; this is outside the new DSK proof but should stay on the ownership watchlist.

## Broken/stale proof paths
- Published DSK proof route is missing: `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 404.
- Raw branch proof files are missing for the sampled `0.0.2` URLs in ProtoKits and Experiments.
- Experiments still contains public URLs pinned to `NexusEngine@main`, `NexusEngine@0.0.1`, `NexusEngine-ProtoKits@main`, and `NexusEngine-ProtoKits@0.0.1`.
- ProtoKits README/docs/demos still contain many public URLs pinned to `main` or `0.0.1`.

## Risks
- Local green checks can be mistaken for public proof; sibling repos are behind remote and have uncommitted proof work.
- Stale public URLs are available and may continue to work while bypassing the latest `0.0.2` contract.
- Compatibility shims preserve old `createXKit(NexusEngine, config)` and `engine.*` APIs, which is useful for migration but leaves two valid call paths to audit.
- Optional npm package metadata is 404, so npm consumption should not be claimed.

## Blockers
- The DSK proof route and first-wave ledger are not visible at sampled public/raw `0.0.2` URLs.
- ProtoKits and Experiments are not locally aligned with `origin/0.0.2`; both are behind with uncommitted proof files.
- No source fixes or publishing were allowed in this scout lane.

## Suggested next review item
- Review why ProtoKits and Experiments local proof files are not present on public/raw `0.0.2`, then decide whether the next lane should be a publish/sync plan or a remote-branch proof audit.

## Not claimed
- No source, docs, package metadata, public claims, tests, or proof routes were fixed.
- No deployment, push, release, or npm publication was performed.
- No browser-human-view proof was claimed because the public DSK proof route returns 404; validation here is CLI plus public URL status.
