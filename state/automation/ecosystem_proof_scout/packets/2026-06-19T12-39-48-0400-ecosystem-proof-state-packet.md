# Ecosystem Proof State Packet

Timestamp: 2026-06-19T12:39:48-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; core is latest-ref aligned and test-green, local available-checkout DSK proof passes, Experiments fetched-ref aggregate check passes in a disposable worktree, but ProtoKits fetched-ref validation is blocked by missing standalone `nexusengine` package resolution, Experiments fetched-ref targeted DSK proof is blocked by sibling relative paths, and public browser proof still stalls at `Booting...`.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-proof-013`.
- Latest proof packet/node `2026-06-19T11-40-11-0400` said core was latest-ref aligned and validation-green, both sibling fetched release refs were ahead of local checkouts, local available-checkout DSK proof passed, public browser proof stalled at `Booting...`, aggregate Experiments DSK proof remained separate, and runtime hardening gates remained open.
- Latest ecosystem state packet/node `2026-06-19T12-08-54-0400` confirmed the same sibling drift and kept public proof, aggregate DSK coverage, npm/package policy, generated-route validation, and DSK hardening fixtures open.
- Latest DSK architecture packet/node `2026-06-19T12-23-47-0400` adds lifecycle/config fixture rows: command lifecycle receipts, elapsed-rate semantics, descriptor normalization/source isolation, and finite generated geometry.
- Latest deep bug packet/node `2026-06-19T11-55-07-0400` reports CompanionCommand, CorruptionWorld, SpatialRoom, and TreeRunner lifecycle/config bugs.
- Latest domain idea packet/node `2026-06-19T12-01-34-0400` maps those lifecycle/config gaps into proof-row planning inventory.
- State packets were used for context only. Live source, fetched refs, commands, public URLs, and Playwright launch-state output are authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Preflight timestamp: `2026-06-19T16:35:58.533Z`.
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
- NexusEngine: `npm test` -> passed 8 smoke tests.
- NexusEngine/ProtoKits/Experiments: `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`.
- ProtoKits local available checkout: `npm run check` -> passed; checked 294 JavaScript modules, imported 236 ProtoKit indexes, skipped 2 remote URL forwarders, and ran the local smoke chain through fluid/water kit composition.
- ProtoKits local available checkout: `node tests/dsk-first-wave.test.mjs` -> passed.
- Experiments local available checkout: `node tests/dsk-first-wave-experiment-smoke.mjs` -> passed.
- ProtoKits disposable fetched-ref worktree at `origin/0.0.2`: `npm run check` -> failed after syntax passed because `smoke:imports` could not resolve package `nexusengine`; targeted `node tests/dsk-first-wave.test.mjs` also failed with `ERR_MODULE_NOT_FOUND` for `nexusengine`. Scratch worktree was removed.
- Experiments disposable fetched-ref worktree at `origin/0.0.2`: `npm run check` -> passed after generating 100 flat route wrappers; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed because `experiments/dsk-first-wave-proof/src/proof.js` imports `../../../../NexusEngine/src/index.js`, resolving to missing `/private/tmp/NexusEngine/src/index.js`. Scratch worktree was removed.
- Public URL checks used direct `curl -L -s -o /dev/null -w "%{http_code}"`.
- Human-view validation used Playwright CLI from `/tmp`: opened the public DSK proof route, captured snapshot/console/network state, then closed the browser and removed `/tmp/.playwright-cli`.
- Targeted `rg`/file inspections checked DSK aliases, `engine.n.*`, compatibility shims, public import maps, stale pins, aggregate scripts, proof coverage, and docs/how-to-experiment.md alignment.

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
- Fetched ProtoKits `origin/0.0.2` is 5 commits ahead and its aggregate `test` script adds `node tests/universal-game-domain-kits.test.mjs`.
- Disposable latest-ref validation did not prove the fetched ref because the detached worktree lacked package-level `nexusengine` resolution; this is a validation-environment blocker and a public/distribution signal, not a confirmed source regression in the main local checkout.
- Compatibility shim risk remains: old injected-runtime and legacy `engine.*` APIs are intentional migration support, but no removal condition was found in this scout pass.

## Experiment proof state
- Local targeted DSK proof passes on the available Experiments checkout: `node tests/dsk-first-wave-experiment-smoke.mjs`.
- The available Experiments checkout is clean but behind fetched `origin/0.0.2` by 24 commits, so local targeted proof is not latest-ref proof.
- Fetched Experiments aggregate `npm run check` passed in a disposable worktree, including `tests/tropical-island-scene-static-smoke.mjs`, but it still does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
- Fetched Experiments targeted DSK proof failed in a disposable worktree for the same sibling relative-path assumption used by the public browser route.
- Local aggregate `check` still includes `tests/fluid-water-lab-static-smoke.mjs`; fetched aggregate `check` includes `tests/tropical-island-scene-static-smoke.mjs`.
- Public proof route loads its HTML but remains human-visible stuck at `Booting...`.
- Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console/network output showed 404s for sibling NexusEngine and ProtoKits module paths plus favicon.
- Local proof files still import from sibling relative paths:
  - import map maps `nexusengine` to `../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports `../../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusEngine-ProtoKits/protokits/...`.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs` as part of core `npm test`.
- ProtoKits first-wave service coverage is green on the local available checkout only; fetched latest-ref proof is blocked by standalone package resolution.
- Experiments first-wave proof is green only as a targeted local available-checkout smoke; it is not aggregate proof, latest-ref targeted proof, or browser-complete public proof.
- Fetched Experiments aggregate proof is green for the current aggregate script, but that script omits the DSK first-wave smoke.
- Expanded proof inventory now includes service lifecycle/config rows alongside source-state integrity, state-signal contracts, bridge-state ownership, receipt integrity, spatial/mobility, operations data, and public distribution categories.
- Coverage categories remain separate: local command proof, latest release-ref command proof, aggregate command proof, targeted DSK command proof, raw-public file proof, CDN import proof, npm availability, and browser-complete human proof.

## Runtime ownership drift
- `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` still keep the core/ProtoKits/Experiments split explicit.
- New reusable kit implementations should target ProtoKits by default.
- New playable/browser proofs should target Experiments by default.
- Core should stay focused on ECS/runtime/DSK/composer primitives, invariants, exports, and validation.
- Current public proof blockers do not justify moving product routes, browser proof wiring, or reusable implementation into core.
- Fetched Experiments includes tropical-island-scene and local prototype/fallback module work; treat that as experiment proof material until reusable boundaries are extracted to ProtoKits.
- Lifecycle/config hardening rows should feed runtime fixture planning, not broaden public proof or promotion claims.

## Broken/stale proof paths
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
- Disposable latest-ref targeted proof failed on analogous sibling relative paths.
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
- DSK first-wave migration proof should not be mistaken for production-hardening proof; namespace, install, dependency, state contract, receipt, bridge, wrapper-state, source-state, state-signal, operations, spatial, and lifecycle/config gates remain open.

## Blockers
- ProtoKits fetched `origin/0.0.2` needs validation in an environment that resolves `nexusengine`, or package/dependency metadata needs to make standalone validation possible.
- Experiments fetched `origin/0.0.2` needs targeted DSK validation with a sibling layout or revised module-source strategy.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, or build-step import mapping.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as a required targeted command.
- npm metadata for `nexusengine` is unavailable.
- DSK promotion hardening lacks executable fixture coverage for lifecycle/config rows plus the earlier namespace, install, dependency, state, receipt, bridge, wrapper, source-state, state-signal, operations, and spatial gates.

## Suggested next review item
- Fix the DSK proof module-source strategy once, then validate both public browser loading and disposable fetched-ref targeted smokes with the same resolution model.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim ProtoKits fetched `origin/0.0.2` passed validation.
- This packet does not claim Experiments fetched `origin/0.0.2` passed targeted DSK validation.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not promote ProtoKits into core or retire compatibility shims.
- This packet does not claim DSK hardening blockers are fixed.
