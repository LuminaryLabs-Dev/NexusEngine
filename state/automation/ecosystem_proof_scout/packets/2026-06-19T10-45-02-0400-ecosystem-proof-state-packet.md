# Ecosystem Proof State Packet

Timestamp: 2026-06-19T10:45:02-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; core and ProtoKits remain latest-ref aligned and validation-green, Experiments targeted local proof passes but remains 22 commits behind fetched `origin/0.0.2`, public browser proof still stalls at `Booting...`, and state-signal contract hardening now joins the DSK promotion proof boundary.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-proof-011`.
- Latest proof packet `2026-06-19T09-44-04-0400` said core and ProtoKits were latest-ref aligned and validation-green, Experiments remained 22 commits behind fetched `origin/0.0.2`, public browser proof still failed at module loading, and source-state hardening constrained DSK promotion claims.
- Latest ecosystem state packet/node `2026-06-19T10-10-19-0400` confirmed core and ProtoKits green, Experiments latest-ref drift, public proof module 404s, aggregate DSK smoke omission, npm/package policy gaps, and source-state plus state-signal hardening gates.
- Latest DSK architecture packet/node `2026-06-19T10-23-10-0400` keeps DSK promotion gated by install, dependency, state, service-call, operations, spatial/mobility, receipt, bridge, source-state, and state-signal fixtures.
- Latest deep bug packet/node `2026-06-19T09-54-20-0400` adds signal/state gaps: ForestPlacement count-only invalidation, Interaction held repeats, Shrine/LightCombat transition issues, ScenarioDriver axis handling, and CameraOcclusion source mutation.
- Latest domain idea packet/node `2026-06-19T10-02-21-0400` converts those bugs into state signal contract planning rows.
- State packets were context only. Live source, fetched refs, commands, public URLs, and Playwright launch-state output are authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Preflight timestamp: `2026-06-19T14:38:27.423Z`.
- NexusEngine local branch `0.0.2` at `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits local branch `0.0.2` at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`, matching `origin/0.0.2`; ahead/behind `0/0`.
- Experiments local branch `0.0.2` at `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f`; fetched `origin/0.0.2` is `6a4982ec59a06b5e0c7c12a56da58eed15866b0f`; ahead/behind `0/22`.
- Core package metadata remains `nexusengine@0.1.0`; raw public branch `0.0.2/package.json` is reachable.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Commands run
- NexusEngine: `npm run automation:preflight` -> passed; latest branch `0.0.2`; required GitHub/raw/jsDelivr links OK; optional npm metadata 404.
- NexusEngine/ProtoKits/Experiments: `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`.
- NexusEngine: `npm test` -> passed 8 smoke tests.
- ProtoKits: `npm run check` -> passed; checked 294 JavaScript modules, imported 236 ProtoKit indexes, skipped 2 remote URL forwarders, and ran the listed smoke chain through fluid/water kit composition.
- ProtoKits targeted: `node tests/dsk-first-wave.test.mjs` -> passed.
- Experiments targeted: `node tests/dsk-first-wave-experiment-smoke.mjs` -> passed on the available local checkout.
- Experiments aggregate `npm run check` was not run because local and fetched scripts start with `npm run generate:flat-routes`, which writes generated route artifacts outside this lane's write scope.
- Experiments fetched ref inspection: `git show origin/0.0.2:package.json`, `git show origin/0.0.2:experiments/dsk-first-wave-proof/index.html`, and `git show origin/0.0.2:experiments/dsk-first-wave-proof/src/proof.js`.
- Public URL checks: direct `curl -L -s -o /dev/null -w "%{http_code}"`.
- Human-view browser check: Playwright CLI opened the public DSK proof route and captured visible snapshot plus console output. Temporary `.playwright-cli` files were removed after evidence capture.
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
- Direct-import aliases remain present: `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- Targeted first-wave DSK migration test passed and still proves direct `createN...Kit()` usage, `engine.n.*` APIs, compatibility `engine.*` APIs, serializable snapshots, and missing-token failure.
- ProtoKits aggregate `npm run check` passed again this run.
- Compatibility shim risk remains: old injected-runtime and legacy `engine.*` APIs are intentional migration support, but no removal condition was found in this scout pass.

## Experiment proof state
- Local targeted DSK proof passes on the available Experiments checkout: `node tests/dsk-first-wave-experiment-smoke.mjs`.
- The available Experiments checkout is clean but behind fetched `origin/0.0.2` by 22 commits, so this does not prove latest-ref Experiments validation.
- Local aggregate `check` still omits `tests/dsk-first-wave-experiment-smoke.mjs` and includes `tests/fluid-water-lab-static-smoke.mjs`.
- Fetched `origin/0.0.2` aggregate `check` still omits `tests/dsk-first-wave-experiment-smoke.mjs` and includes `tests/tropical-island-scene-static-smoke.mjs`.
- Public proof route loads its HTML but remains human-visible stuck at `Booting...`.
- Playwright snapshot showed the heading, description, and `Booting...`; console output showed 404s for sibling NexusEngine and ProtoKits module paths plus favicon.
- Local and fetched proof files still import from sibling relative paths:
  - import map maps `nexusengine` to `../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports `../../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusEngine-ProtoKits/protokits/...`.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs` as part of core `npm test`.
- ProtoKits first-wave service coverage is green through aggregate `npm run check`, targeted DSK smoke, and public raw-file visibility.
- Experiments first-wave proof is green only as a targeted local available-checkout smoke; it is not aggregate proof, latest-ref proof, or browser-complete public proof.
- Expanded proof inventory now includes state-signal contracts alongside source-state integrity, bridge-state ownership, receipt integrity, spatial/mobility, operations data, and public distribution categories.
- Coverage categories remain separate: local command proof, latest release-ref command proof, aggregate command proof, targeted DSK command proof, raw-public file proof, CDN import proof, npm availability, and browser-complete human proof.

## Runtime ownership drift
- `docs/how-to-protokit.md` and `docs/how-to-experiment.md` still keep the core/ProtoKits/Experiments split explicit: core owns runtime/DSK/composer primitives, ProtoKits owns reusable implementation, and Experiments owns playable/browser proof.
- New reusable kit implementations should target ProtoKits by default.
- New playable/browser proofs should target Experiments by default.
- Core should stay focused on ECS/runtime/DSK/composer primitives, invariants, exports, and validation.
- Current public proof blockers do not justify moving product routes, browser proof wiring, or reusable implementation into core.
- Source-state, state-signal, bridge phase, step receipt, delegated action, wrapper-state, operations, and spatial proof rows belong in runtime hardening/fixture planning before broad DSK promotion claims.

## Broken/stale proof paths
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
- Stale public pins remain visible in Experiments scans, including `main`, `0.0.1`, and commit-pinned CDN references in legacy routes/configs.
- Branch/package mismatch remains: release branch `0.0.2` serves core package version `0.1.0`.
- Optional npm metadata remains 404, so npm-backed consumption is not proven.
- Experiments latest-ref validation remains open because fetched `origin/0.0.2` is ahead of the clean local checkout.

## Risks
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Aggregate validation can stay green while omitting the DSK first-wave proof smoke.
- Available-checkout targeted proof can be mistaken for latest-ref proof when Experiments is behind fetched release ref.
- Validation commands that generate flat routes can violate scout-lane write boundaries unless run in a disposable worktree or paired with explicit cleanup policy.
- Compatibility shims can blur the difference between promoted `engine.n.*` DSK APIs and legacy `engine.*` migration APIs.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.
- DSK first-wave migration proof should not be mistaken for production-hardening proof; namespace, install, dependency, state contract, receipt, bridge, wrapper-state, source-state, state-signal, operations, and spatial gates remain open.

## Blockers
- Experiments must be fast-forwarded or separately validated at fetched `origin/0.0.2` before latest-ref ecosystem proof can be claimed.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, or build-step import mapping.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as a required targeted command.
- Experiments aggregate validation still writes generated flat-route artifacts and was not run in this lane.
- npm metadata for `nexusengine` is unavailable.
- DSK promotion hardening lacks executable fixture coverage for state-signal contracts plus the earlier namespace, install, dependency, state, receipt, bridge, wrapper, source-state, operations, and spatial gates.

## Suggested next review item
- Validate Experiments fetched `origin/0.0.2` in a disposable worktree, then choose the public module-loading strategy for `experiments/dsk-first-wave-proof/index.html` and `src/proof.js`.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim Experiments fetched `origin/0.0.2` was locally validated.
- This packet does not claim Experiments aggregate `npm run check` was run.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not promote ProtoKits into core or retire compatibility shims.
- This packet does not claim DSK hardening blockers are fixed.
