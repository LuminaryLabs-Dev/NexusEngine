# Ecosystem Proof State Packet

Timestamp: 2026-06-19T13:40:31-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; core and local available-checkout DSK proof are green, but latest sibling release-ref proof and public browser proof remain blocked by module-source resolution.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-proof-014`.
- Latest proof packet/node `2026-06-19T12-39-48-0400` said core and local available-checkout DSK proof were green, while ProtoKits fetched-ref proof could not resolve package `nexusengine`, Experiments fetched-ref targeted DSK proof could not resolve sibling `NexusEngine`, and public browser proof stalled at `Booting...`.
- Latest ecosystem state node `2026-06-19T13-09-40-0400` confirmed the same module-source blocker across ProtoKits fetched-ref, Experiments targeted fetched-ref, and public browser proof.
- Latest DSK architecture node `2026-06-19T13-24-43-0400` adds traversal proof integrity rows: traversal cost policy, navmesh identity, procedural signature taxonomy, and recovery receipt/state consistency.
- Latest deep bug node `2026-06-19T12-54-22-0400` reports negative path costs, duplicate navmesh/waypoint ids, procedural signatures omitting algorithm descriptors, and duplicate/stale WorldPhysics recovery receipts/state.
- Latest domain idea node `2026-06-19T13-01-05-0400` maps those traversal bugs into advisory proof inventory.
- State packets were used for context only. Live source, fetched refs, commands, public URLs, and Playwright launch-state output are authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Preflight timestamp: `2026-06-19T17:37:52.080Z`.
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
- ProtoKits disposable fetched-ref worktree at `origin/0.0.2`: `npm run check` -> failed after checking 296 JavaScript modules because `smoke:imports` had 110 import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- ProtoKits disposable fetched-ref targeted DSK smoke: `node tests/dsk-first-wave.test.mjs` -> failed immediately with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- Experiments disposable fetched-ref worktree at `origin/0.0.2`: `npm run check` -> passed after generating 100 flat route wrappers.
- Experiments disposable fetched-ref targeted DSK smoke: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed because `experiments/dsk-first-wave-proof/src/proof.js` imports `../../../../NexusEngine/src/index.js`, resolving to missing `/private/tmp/.../NexusEngine/src/index.js`.
- Public URL checks used direct `curl -L -s -o /dev/null -w "%{http_code}"`.
- Human-view validation asked whether launch-state inspection was needed; yes, because public browser proof is user-visible. Playwright opened the public DSK proof route, captured snapshot/console/request state, then temporary `/tmp` artifacts were removed.
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
- First-wave DSK ledger remains public on raw `0.0.2` and lists seven `promoted-candidate` kits: token-registry, completion-ledger, scan-survey, route-checkpoint, resource-pressure, zone-field, and hazard-director.
- Ledger still says all first-wave kits install through `nexus-dsk-adapter`, return `defineDomainServiceKit()` objects with the real NexusEngine runtime, keep old injected-runtime calls as migration shims, and defer promotion into core.
- Direct-import aliases remain present locally: `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- Local available-checkout first-wave migration test passed and still proves direct `createN...Kit()` usage, `engine.n.*` APIs, compatibility `engine.*` APIs, serializable snapshots, and missing-token failure.
- Fetched ProtoKits `origin/0.0.2` is 5 commits ahead and includes more modules than the local checkout, but disposable latest-ref aggregate and targeted DSK validation fail before source behavior can be assessed because `nexusengine` is not resolvable as a package.
- Compatibility shim risk remains: old injected-runtime and legacy `engine.*` APIs are intentional migration support, but no removal condition was found in this scout pass.

## Experiment proof state
- Local targeted DSK proof passes on the available Experiments checkout: `node tests/dsk-first-wave-experiment-smoke.mjs`.
- The available Experiments checkout is clean but behind fetched `origin/0.0.2` by 24 commits, so local targeted proof is not latest-ref proof.
- Fetched Experiments aggregate `npm run check` passed in a disposable worktree, including `tests/tropical-island-scene-static-smoke.mjs`, but still does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
- Fetched Experiments targeted DSK proof failed in a disposable worktree for the same sibling relative-path assumption used by the public browser route.
- Local aggregate `check` includes `tests/fluid-water-lab-static-smoke.mjs`; fetched aggregate `check` includes `tests/tropical-island-scene-static-smoke.mjs`.
- Public proof route loads its HTML but remains human-visible stuck at `Booting...`.
- Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console/request output showed 404s for sibling NexusEngine and ProtoKits module paths plus favicon.
- Local and fetched proof files still import from sibling relative paths:
  - import map maps `nexusengine` to `../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports `../../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusEngine-ProtoKits/protokits/...`.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs` as part of core `npm test`.
- ProtoKits first-wave service coverage is green on the local available checkout only; fetched latest-ref aggregate and targeted proof are blocked by standalone package resolution.
- Experiments first-wave proof is green only as a targeted local available-checkout smoke; it is not aggregate proof, latest-ref targeted proof, or browser-complete public proof.
- Fetched Experiments aggregate proof is green for the current aggregate script, but that script omits the DSK first-wave smoke.
- Expanded proof inventory now includes traversal proof integrity rows alongside lifecycle/config, source-state integrity, state-signal contracts, bridge-state ownership, receipt integrity, spatial/mobility, operations data, and public distribution categories.
- Coverage categories remain separate: local command proof, latest release-ref command proof, aggregate command proof, targeted DSK command proof, raw-public file proof, CDN import proof, npm availability, and browser-complete human proof.

## Runtime ownership drift
- `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` still keep the core/ProtoKits/Experiments split explicit.
- New reusable kit implementations should target ProtoKits by default.
- New playable/browser proofs should target Experiments by default.
- Core should stay focused on ECS/runtime/DSK/composer primitives, invariants, exports, and validation.
- Current public proof blockers do not justify moving product routes, browser proof wiring, or reusable implementation into core.
- Fetched Experiments includes tropical-island-scene and local prototype/fallback module work; treat that as experiment proof material until reusable boundaries are extracted to ProtoKits.
- Traversal hardening rows should feed runtime fixture planning, not broaden public proof or promotion claims.

## Broken/stale proof paths
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
- Disposable latest-ref targeted proof failed on analogous sibling/package resolution paths.
- Stale public pins remain visible in Experiments scans, including `main`, `0.0.1`, and commit-pinned CDN references in legacy routes/configs.
- Branch/package mismatch remains: release branch `0.0.2` serves core package version `0.1.0`.
- Optional npm metadata remains 404, so npm-backed consumption is not proven.

## Risks
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Aggregate validation can stay green while omitting the DSK first-wave proof smoke.
- Available-checkout targeted proof can be mistaken for latest-ref proof when sibling repos are behind fetched release refs.
- Disposable validation can fail because package/sibling resolution is not modeled; that must be reported separately from source regression.
- Validation commands that generate flat routes can violate scout-lane write boundaries unless run in disposable worktrees or paired with cleanup policy.
- Compatibility shims can blur promoted `engine.n.*` DSK APIs and legacy `engine.*` migration APIs.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.
- DSK first-wave migration proof should not be mistaken for production-hardening proof; namespace, install, dependency, state contract, receipt, bridge, wrapper-state, source-state, state-signal, operations, spatial, lifecycle/config, and traversal gates remain open.

## Blockers
- ProtoKits fetched `origin/0.0.2` needs validation in an environment that resolves `nexusengine`, or package/dependency metadata needs to make standalone validation possible.
- Experiments fetched `origin/0.0.2` needs targeted DSK validation with a sibling layout or revised module-source strategy.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, or build-step import mapping.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as a required targeted command.
- npm metadata for `nexusengine` is unavailable.
- DSK promotion hardening lacks executable fixture coverage for traversal proof integrity rows plus the earlier namespace, install, dependency, state, receipt, bridge, wrapper, source-state, state-signal, operations, spatial, and lifecycle/config gates.

## Suggested next review item
- Define the module-source strategy once, then validate ProtoKits fetched-ref package resolution, Experiments fetched-ref targeted DSK smoke, and public browser loading against that same model.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim ProtoKits fetched `origin/0.0.2` passed validation.
- This packet does not claim Experiments fetched `origin/0.0.2` passed targeted DSK validation.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not promote ProtoKits into core or retire compatibility shims.
- This packet does not claim DSK hardening blockers are fixed.
