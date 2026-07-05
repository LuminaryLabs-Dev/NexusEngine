# Ecosystem Proof State Packet

Timestamp: 2026-06-19T17:39:50-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; core and local available-checkout proof are green, but fetched-ref and browser proof remain blocked by module-source resolution.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-proof-018`.
- Latest proof packet/node `2026-06-19T16-39-19-0400` kept the active blocker on module-source strategy: ProtoKits fetched-ref cannot resolve package `nexusengine`, Experiments fetched-ref targeted DSK proof cannot resolve sibling `NexusEngine`, and the public route remains stuck at `Booting...`.
- Latest ecosystem state packet/node `2026-06-19T17-10-00-0400` confirmed the same module-source blocker and added query/command semantics rows from neighboring lanes.
- Latest DSK architecture packet/node `2026-06-19T17-22-41-0400` split hardening into runtime failure-boundary, lifecycle parity, query/command semantics, experience-edge, and public module-source proof categories.
- Latest deep bug packet/node `2026-06-19T16-54-05-0400` added terminal LandmarkGuidance receipts, EnvironmentalAffordance query-versus-transition drift, missing activation state corruption, and RouteField live query mutation.
- Latest domain idea packet/node `2026-06-19T17-01-13-0400` mapped those rows into query-command semantics planning inventory.
- State packets were context only. Live source, fetched refs, commands, public URLs, and Playwright launch-state output are authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Preflight timestamp: `2026-06-19T21:37:19.451Z`.
- Branch status: `current-is-latest-release-branch`.
- Remote branches observed: `0.0.1`, `0.0.2`, `main`.
- NexusEngine local branch `0.0.2` at `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits local branch `0.0.2` at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`; fetched `origin/0.0.2` is `06f5f3bd35e3b4c2c24d49d4affbe026b0d92c8f`; ahead/behind `0/5`.
- Experiments local branch `0.0.2` at `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f`; fetched `origin/0.0.2` is `799fad882461502faa84b132f70de011e7dbe0cb`; ahead/behind `0/24`.
- Core package metadata remains `nexusengine@0.1.0`; raw public branch `0.0.2/package.json` is reachable.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Commands run
- NexusEngine: `npm run automation:preflight` -> passed; latest branch `0.0.2`; required GitHub/raw/jsDelivr links OK; optional npm metadata 404.
- NexusEngine/ProtoKits/Experiments: `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`.
- NexusEngine: `npm test` -> passed 8 smoke tests.
- ProtoKits local available checkout: `npm run check` -> passed; checked 294 JavaScript modules, imported 236 ProtoKit indexes, skipped 2 remote URL forwarders, and ran the local smoke chain through fluid/water kit composition.
- ProtoKits local available checkout: `node tests/dsk-first-wave.test.mjs` -> passed.
- Experiments local available checkout: `node tests/dsk-first-wave-experiment-smoke.mjs` -> passed.
- ProtoKits disposable fetched-ref extraction at `origin/0.0.2`: `npm run check` -> failed after checking 296 JavaScript modules because `smoke:imports` had 110 import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- ProtoKits disposable fetched-ref targeted DSK smoke: `node tests/dsk-first-wave.test.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- Experiments disposable fetched-ref extraction at `origin/0.0.2`: `npm run check` -> passed after generating 100 flat route wrappers in the disposable directory.
- Experiments disposable fetched-ref targeted DSK smoke: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed because `experiments/dsk-first-wave-proof/src/proof.js` imports `../../../../NexusEngine/src/index.js`, resolving to missing `/private/tmp/NexusEngine/src/index.js`.
- Public URL checks used direct `curl -L -s -o /dev/null -w "%{http_code}"`.
- Human-view validation used Playwright CLI. Snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for sibling NexusEngine and ProtoKits module paths. Playwright scratch artifacts were removed.
- Targeted `rg`/file inspections checked DSK aliases, `engine.n.*`, compatibility shims, public import maps, stale pins, aggregate scripts, proof coverage, and ownership docs.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200 by preflight.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200 by preflight.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200 by preflight.
- `https://registry.npmjs.org/nexusengine` -> 404 optional preflight link.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 200 by curl and Playwright navigation; visible state remained `Booting...`.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200.
- `https://luminarylabs-agents.github.io/NexusEngine/src/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js` -> 404.

## ProtoKits migration state
- First-wave DSK ledger remains public on raw `0.0.2` and lists promoted-candidate kits: token-registry, completion-ledger, scan-survey, route-checkpoint, resource-pressure, zone-field, and hazard-director.
- Ledger still says all first-wave kits install through `nexus-dsk-adapter`, return `defineDomainServiceKit()` objects with the real NexusEngine runtime, keep old injected-runtime calls as migration shims, and defer promotion into core.
- Direct-import aliases remain present locally: `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- Local available-checkout first-wave migration test passed and still proves direct `createN...Kit()` usage, `engine.n.*` APIs, compatibility `engine.*` APIs, serializable snapshots, and missing-token failure.
- Fetched ProtoKits `origin/0.0.2` is 5 commits ahead and includes `node tests/universal-game-domain-kits.test.mjs` in aggregate validation, but disposable latest-ref aggregate and targeted DSK validation fail before source behavior can be assessed because `nexusengine` is not resolvable as a package.
- Compatibility shim risk remains: old injected-runtime and legacy `engine.*` APIs are intentional migration support, but no removal condition was found in this scout pass.

## Experiment proof state
- Local targeted DSK proof passes on the available Experiments checkout: `node tests/dsk-first-wave-experiment-smoke.mjs`.
- The available Experiments checkout is clean but behind fetched `origin/0.0.2` by 24 commits, so local targeted proof is not latest-ref proof.
- Fetched Experiments aggregate `npm run check` passed in a disposable extraction, including `tests/tropical-island-scene-static-smoke.mjs`, but still does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
- Fetched Experiments targeted DSK proof failed in a disposable extraction for the same sibling relative-path assumption used by the public browser route.
- Local aggregate `check` includes `tests/fluid-water-lab-static-smoke.mjs`; fetched aggregate `check` includes `tests/tropical-island-scene-static-smoke.mjs`.
- Public proof route loads HTML but remains human-visible stuck at `Booting...`.
- Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
- Local proof files still import from sibling relative paths:
  - import map maps `nexusengine` to `../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports `../../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusEngine-ProtoKits/protokits/...`.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs` as part of core `npm test`.
- ProtoKits first-wave service coverage is green on the local available checkout only; fetched latest-ref aggregate and targeted proof are blocked by standalone package resolution.
- Experiments first-wave proof is green only as a targeted local available-checkout smoke; it is not aggregate proof, latest-ref targeted proof, or browser-complete public proof.
- Fetched Experiments aggregate proof is green for the current aggregate script, but that script omits the DSK first-wave smoke.
- Expanded proof inventory now includes query/command semantics rows alongside lifecycle parity rows, experience-edge rows, runtime failure-boundary, traversal proof integrity, lifecycle/config, source-state integrity, state-signal contracts, bridge-state ownership, receipt integrity, spatial/mobility, operations data, and public distribution categories.
- Coverage categories remain separate: local command proof, latest release-ref command proof, aggregate command proof, targeted DSK command proof, raw-public file proof, CDN import proof, npm availability, browser-complete human proof, runtime hardening fixture proof, lifecycle parity proof, query/command semantics proof, and downstream experience-edge proof.

## Runtime ownership drift
- `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` still keep the core/ProtoKits/Experiments split explicit.
- New reusable kit implementations should target ProtoKits by default.
- New playable/browser proofs should target Experiments by default.
- Core should stay focused on ECS/runtime/DSK/composer primitives, invariants, exports, and validation.
- Current public proof blockers do not justify moving product routes, browser proof wiring, or reusable implementation into core.
- Runtime failure-boundary, lifecycle parity, query/command semantics, and experience-edge rows are validation concerns, but they are separate from the public route import strategy.

## Broken/stale proof paths
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
- Disposable latest-ref targeted proof failed on analogous sibling/package resolution paths.
- Stale public pins remain visible in Experiments and ProtoKits scans, including `main`, `0.0.1`, and legacy route/config CDN references.
- Branch/package mismatch remains: release branch `0.0.2` serves core package version `0.1.0`.
- Optional npm metadata remains 404, so npm-backed consumption is not proven.

## Risks
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Aggregate validation can stay green while omitting the DSK first-wave proof smoke.
- Available-checkout targeted proof can be mistaken for latest-ref proof when sibling repos are behind fetched release refs.
- Disposable validation can fail because package/sibling resolution is not modeled; that must be reported separately from source regression.
- Validation commands that generate flat routes can violate scout-lane write boundaries unless run in disposable directories or paired with cleanup policy.
- Compatibility shims can blur promoted `engine.n.*` DSK APIs and legacy `engine.*` migration APIs.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.
- DSK first-wave migration proof should not be mistaken for production-hardening proof; base runtime failure-boundary, lifecycle parity, query/command semantics, experience-edge, namespace/install/dependency/state/receipt/bridge/wrapper/source-state/state-signal/operations/spatial/traversal/lifecycle rows remain open.

## Blockers
- ProtoKits fetched `origin/0.0.2` needs validation in an environment that resolves `nexusengine`, or package/dependency metadata needs to make standalone validation possible.
- Experiments fetched `origin/0.0.2` needs targeted DSK validation with a sibling layout or revised module-source strategy.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, package/workspace dependency, or build-step import mapping.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as a required targeted command.
- npm metadata for `nexusengine` is unavailable.
- DSK promotion hardening lacks executable fixture coverage for runtime failure-boundary rows, lifecycle parity rows, query/command semantics rows, experience-edge rows, and earlier namespace/install/dependency/state/receipt/bridge/wrapper/source-state/state-signal/operations/spatial/traversal/lifecycle rows.

## Suggested next review item
- Define one module-source strategy, then validate ProtoKits fetched-ref package resolution, Experiments fetched-ref targeted DSK smoke, and public browser loading against that same model.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim ProtoKits fetched `origin/0.0.2` passed validation.
- This packet does not claim Experiments fetched `origin/0.0.2` passed targeted DSK validation.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not promote ProtoKits into core or retire compatibility shims.
- This packet does not claim DSK hardening, lifecycle parity, query/command semantics, or experience-edge blockers are fixed.
