# Ecosystem Proof State Packet

Timestamp: 2026-06-18T20:40:32-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; local proof remains green, public proof remains missing

## Latest branch
- NexusEngine preflight resolved `latestReleaseBranch: 0.0.2`.
- NexusEngine: local `0.0.2` at `2b3b66da33a2c561f0ad901604ba09404f747a82`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits: latest remote release branch is `0.0.2` at `089d9be00affd7cdb121c070fd05679383bc9934`; local `0.0.2` is `7f2e35222cf5180fe99e4a709c1d2d0aaf93eac4`; ahead/behind `0/69`.
- Experiments: latest remote release branch is `0.0.2` at `0cc2a76d9db452de36d06d4543b201e33087a079`; local `0.0.2` is `91addadb6bcec8470fcb23dc9364fc19adef4287`; ahead/behind `0/38`.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Commands run
- NexusEngine: `npm run automation:preflight` -> passed; required public links OK; optional npm metadata 404.
- NexusEngine: `npm test` -> passed 8 smoke tests.
- ProtoKits: `npm run check` -> passed syntax, import smoke, and ProtoKit tests including first-wave DSK migration.
- Experiments: `npm run check` -> passed syntax/static/content/proof checks; static smoke still emitted legacy HTML warnings and exited 0.
- Branch checks: `git status --short --branch`, `git rev-parse`, `git rev-list --left-right --count HEAD...origin/0.0.2`, `git ls-remote --heads origin`, `git ls-tree -r --name-only origin/0.0.2`.
- Evidence searches: targeted `rg` for DSK aliases, `engine.n.*`, import maps, stale public pins, and renderer/runtime ownership.
- Public checks: targeted `curl -L -s -o /dev/null -w '%{http_code}'`.
- Human-view check: Playwright CLI opened the public DSK proof route and snapshot showed GitHub Pages `404` / `File not found`; generated Playwright snapshot/log artifacts were removed to preserve the lane write boundary.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200.
- `https://registry.npmjs.org/nexusengine` -> 404; optional preflight link.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/` -> 200.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 404 by curl and visible Playwright check.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 404.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 404.
- Sampled stale pins with specific kit files returned 200 for `NexusEngine@main`, `NexusEngine@0.0.1`, `NexusEngine-ProtoKits@main`, and `NexusEngine-ProtoKits@0.0.1`.
- Non-file aggregate probe `NexusEngine-ProtoKits@main/protokits/index.js` returned 404 and should not be used as a public proof URL.

## ProtoKits migration state
- Direct-import DSK adapter exists locally at `protokits/nexus-dsk-adapter/index.js` and imports bare `nexusengine`.
- Adapter supports direct-import and old injected-runtime call modes, and wraps first-wave kits into `defineDomainServiceKit()` when available.
- `createN...Kit` aliases exist for zone-field, scan-survey, route-checkpoint, resource-pressure, hazard-director, token-registry, and completion-ledger.
- `tests/dsk-first-wave.test.mjs` proves direct `createN...Kit()` use, legacy compatibility calls, `engine.n.*` installation, serializable snapshots, `engine.*` compatibility APIs, and missing-token failure.
- Local first-wave ledger says no first-wave kit is half migrated and core promotion is deferred.
- Remote/public proof remains not reviewable: local DSK proof files are absent from the `origin/0.0.2` tree and sampled raw `0.0.2` URLs return 404.

## Experiment proof state
- Local `experiments/dsk-first-wave-proof/` exists and is covered by `tests/dsk-first-wave-experiment-smoke.mjs`.
- The proof composes first-wave `createN...Kit()` aliases through `createRealtimeGame()`, ticks the engine, and reads promoted APIs under `engine.n.*`.
- Local proof HTML declares a browser import map for bare `nexusengine`, but maps to the sibling local source path `../../../NexusEngine/src/index.js`.
- Experiments `npm run check` passes the DSK first-wave smoke locally.
- Public GitHub Pages proof route is visibly 404, and raw `origin/0.0.2` proof HTML is 404, so this remains local-only proof.

## Runtime ownership drift
- NexusEngine core still owns the generic DSK contract and passes `domain-service-kit-smoke`.
- The first-wave DSK proof keeps runtime behavior in NexusEngine/ProtoKits; Experiments hosts the proof page and smoke route.
- Known drift watch remains: `experiments/next-ledge/src/session.js` defines `engine.nextLedge` in the host while ProtoKits contains reusable next-ledge/tether traversal kits. This is outside the DSK first-wave proof but remains an ownership item.
- Renderer ownership in inspected Experiments docs still says renderers stay presentation-only; no new DSK proof renderer drift was found.

## Broken/stale proof paths
- Published DSK proof route is missing: GitHub Pages returns visible 404.
- Raw `0.0.2` DSK proof files are missing for both ProtoKits ledger and Experiments proof route.
- ProtoKits and Experiments still contain public URLs pinned to `main` and `0.0.1`; sampled specific kit URLs resolve, but they bypass the latest `0.0.2` proof target.
- ProtoKits and Experiments package metadata still reports `0.0.1` while the release branch under review is `0.0.2`.

## Risks
- Local green checks can still be mistaken for public proof.
- ProtoKits and Experiments remain behind `origin/0.0.2` while carrying uncommitted proof/migration files.
- Compatibility shims keep direct-import and injected-runtime call paths alive, plus `engine.n.*` and legacy `engine.*` APIs.
- Stale public pins resolve successfully, which can hide that latest-branch proof routes are not public.
- Optional npm package metadata is 404, so npm consumption should not be claimed.

## Blockers
- DSK proof route and first-wave ledger are not visible at sampled public/raw `0.0.2` URLs.
- ProtoKits and Experiments are not locally aligned with `origin/0.0.2`.
- Scout lane rules did not allow source fixes, publishing, rebasing, package metadata edits, or public claim edits.

## Suggested next review item
- Inspect the gap between local uncommitted proof files and `origin/0.0.2` in ProtoKits/Experiments, then decide whether the next action is a publish/sync plan or a remote-only proof audit.

## Not claimed
- No source, tests, docs, package metadata, memory, release branches, public claims, or proof routes were fixed.
- No deployment, push, release, npm publication, or browser success proof was performed.
- The Playwright check proves the public DSK route is visibly missing; it does not prove local proof UI quality.
