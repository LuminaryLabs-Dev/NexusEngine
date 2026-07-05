# Ecosystem Proof State Packet

Timestamp: 2026-06-20T01:59:45-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; core remains green, but ProtoKits local/fetched checks, Experiments targeted DSK checks, and public browser proof are blocked by unresolved module-source/package resolution.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-proof-024`.
- Latest proof packet/node `2026-06-19T22-40-52-0400` kept local available-checkout proof, fetched-ref proof, aggregate proof, targeted DSK proof, browser proof, npm availability, package-version policy, and hardening rows separate.
- Latest ecosystem state packet/node `2026-06-19T22-10-08-0400` kept distribution proof blocked on module-source strategy.
- Latest DSK architecture packet/node `2026-06-19T22-25-35-0400` added proof-signal integrity as tranche 8, without replacing runtime failure-boundary or distribution proof.
- Latest deep bug packet/node `2026-06-19T21-55-21-0400` found ARExperience terminal receipt, WebXR hit-test failure, negative tick time, and finite spatial-scale proof-signal gaps.
- Latest domain idea packet/node `2026-06-20T00-00-47-0400` found no new durable idea family; repeated module-source, public-browser, fetched-ref, package-version, and aggregate-vs-targeted signals map to existing Proof Readiness Queue inventory.
- State packets were context only. Live source, docs, git refs, commands, public URLs, and Playwright launch state are authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Preflight timestamp: `2026-06-20T05:53:02.203Z`.
- Branch status: `current-is-latest-release-branch`.
- Remote branches observed: `0.0.1`, `0.0.2`, `main`.
- NexusEngine local branch `0.0.2` at `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits local branch `0.0.2` at `f006fa3bbe5721b0aa073de2bca08a452bd8e492`; final fetched `origin/0.0.2` used for this packet was `b1d69099392a144a999cac824d344c403fe762d8`; ahead/behind `0/31`.
- Experiments local branch `0.0.2` at `799fad882461502faa84b132f70de011e7dbe0cb`; fetched `origin/0.0.2` was `eaeec53bc44e13136e18af37ed4c3f0755b57e60`; ahead/behind `0/3`.
- ProtoKits `origin/0.0.2` moved during this run; the final fetched ref above is a point-in-time snapshot.
- Core package metadata remains `nexusengine@0.1.0`; raw public branch `0.0.2/package.json` is reachable.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Commands run
- NexusEngine: `npm run automation:preflight` -> passed; latest branch `0.0.2`; required GitHub/raw/jsDelivr links OK; optional npm metadata 404.
- NexusEngine/ProtoKits/Experiments: `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`.
- NexusEngine: `npm test` -> passed 8 smoke tests.
- ProtoKits local available checkout: `npm run check` -> failed after checking 330 JavaScript modules; `smoke:imports` reported 110 failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine` from `protokits/nexus-dsk-adapter/index.js`.
- ProtoKits local available checkout: `node tests/dsk-first-wave.test.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- ProtoKits disposable fetched-ref extraction at final fetched `origin/0.0.2` `b1d69099392a144a999cac824d344c403fe762d8`: `npm run check` -> failed after checking 358 JavaScript modules; `smoke:imports` reported 110 failures rooted in missing package `nexusengine`.
- ProtoKits disposable fetched-ref targeted DSK smoke: `node tests/dsk-first-wave.test.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- Experiments local available checkout: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed because sibling ProtoKits imports package `nexusengine`, which is not resolvable.
- Experiments disposable fetched-ref extraction at `origin/0.0.2` `eaeec53bc44e13136e18af37ed4c3f0755b57e60`: `npm run check` -> passed after generating 100 flat route wrappers in the disposable directory.
- Experiments disposable fetched-ref targeted DSK smoke: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed because `experiments/dsk-first-wave-proof/src/proof.js` imports `../../../../NexusEngine/src/index.js`, resolving to missing `/private/tmp/NexusEngine/src/index.js`.
- Public URL checks used direct `curl -L -s -o /dev/null -w "%{http_code}"`.
- Human-view validation used Playwright CLI. Snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console/network output showed 404s for sibling NexusEngine and ProtoKits module paths. Playwright browser and scratch artifacts were closed/removed.
- Targeted `rg`/file inspections checked DSK aliases, `engine.n.*`, direct package imports, proof route import maps, Experiments aggregate scripts, and ownership docs.

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
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine/src/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-foundation/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js` -> 404.

## ProtoKits migration state
- First-wave DSK ledger remains public on raw `0.0.2`.
- Direct-import aliases remain present locally: `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- The migration test still asserts direct `createN...Kit()` usage, `engine.n.*` APIs, compatibility `engine.*` APIs, serializable snapshots, and missing-token failure, but it no longer reaches those assertions locally because package `nexusengine` cannot resolve.
- `protokits/nexus-dsk-adapter/index.js` imports `nexusengine` directly as a package. ProtoKits `package.json` does not provide a dependency that makes that package resolvable in this checkout.
- Local available-checkout aggregate and targeted DSK proof are now blocked by the same package-resolution issue previously seen mostly in disposable fetched-ref validation.
- Fetched ProtoKits `origin/0.0.2` is 31 commits ahead of local and also fails standalone validation on the same missing package.
- Compatibility shim risk remains: old injected-runtime and legacy `engine.*` APIs are intentional migration support, but no removal condition was found in this scout pass.

## Experiment proof state
- Local targeted DSK proof no longer passes in the available Experiments checkout; it fails through sibling ProtoKits because package `nexusengine` is not resolvable.
- The available Experiments checkout is 3 commits behind fetched `origin/0.0.2`, so local targeted proof is neither green nor latest-ref proof.
- Fetched Experiments aggregate `npm run check` passed in a disposable extraction, including `tropical-island-scene-static-smoke`, but still does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
- Fetched Experiments targeted DSK proof failed in a disposable extraction for the sibling relative-path assumption used by the public browser route.
- Public proof route loads HTML but remains human-visible stuck at `Booting...`.
- Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console/request output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
- Local proof files still import from sibling relative paths:
  - import map maps `nexusengine` to `../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports `../../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusEngine-ProtoKits/protokits/...`.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs` as part of core `npm test`.
- ProtoKits first-wave service coverage is currently blocked locally and at the fetched release ref by unresolved `nexusengine` package resolution.
- Experiments first-wave proof is blocked locally by ProtoKits package resolution and blocked at fetched-ref/public routes by sibling-relative module paths.
- Fetched Experiments aggregate proof is green for the current aggregate script, but that script omits the DSK first-wave smoke.
- Expanded proof inventory still includes proof-signal integrity, AR/spatial read-model, compatibility/content-safety, read-model/orchestration, proof-readiness queueing, query/command semantics, lifecycle parity, experience-edge, runtime failure-boundary, traversal proof integrity, lifecycle/config, source-state integrity, state-signal contracts, bridge-state ownership, receipt integrity, spatial/mobility, operations data, and public distribution categories.
- Coverage categories remain separate: local command proof, latest release-ref command proof, aggregate command proof, targeted DSK command proof, raw-public file proof, CDN import proof, npm availability, browser-complete human proof, runtime hardening fixture proof, lifecycle parity proof, query/command semantics proof, read-model/orchestration proof, AR/spatial proof, proof-signal proof, and downstream experience-edge proof.

## Runtime ownership drift
- `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` still keep the core/ProtoKits/Experiments split explicit.
- New reusable kit implementations should target ProtoKits by default.
- New playable/browser proofs should target Experiments by default.
- Core should stay focused on ECS/runtime/DSK/composer primitives, invariants, exports, and validation.
- Current blockers do not justify moving browser routes, reusable implementation, package-resolution shims, or proof-readiness checklist tooling into core.
- Proof-signal integrity and AR/spatial hardening are validation concerns, but they are separate from the public route import strategy and package-source strategy.

## Broken/stale proof paths
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
- Local ProtoKits and Experiments targeted DSK checks now fail before proof execution because package `nexusengine` is unresolved.
- Disposable latest-ref targeted proof still fails on analogous package/sibling module resolution paths.
- Branch/package mismatch remains: release branch `0.0.2` serves core package version `0.1.0`.
- Optional npm metadata remains 404, so npm-backed consumption is not proven.

## Risks
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Aggregate validation can stay green while omitting the DSK first-wave proof smoke.
- Available-checkout targeted proof can regress independently of core validation when sibling package resolution changes.
- Disposable validation can fail because package/sibling resolution is not modeled; that must be reported separately from source regression.
- ProtoKits release refs moved during this run, so sibling evidence must keep a fetched-ref timestamp/hash.
- Compatibility shims can blur promoted `engine.n.*` DSK APIs and legacy `engine.*` migration APIs.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.
- Proof-signal and AR/spatial hardening rows can improve evidence quality, but fixing them would not prove module-source, npm, package-version, public route, or fetched-ref validation.

## Blockers
- ProtoKits local and fetched `origin/0.0.2` validation need a package/workspace/CDN/link model that resolves `nexusengine`.
- Experiments local targeted DSK proof needs the sibling ProtoKits package-resolution issue resolved.
- Experiments fetched `origin/0.0.2` needs targeted DSK validation with a sibling layout or revised module-source strategy.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, package/workspace dependency, or build-step import mapping.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as a required targeted command.
- npm metadata for `nexusengine` is unavailable.
- Branch `0.0.2` still serves package metadata version `0.1.0`; the release/package-version policy remains unclear.
- DSK promotion hardening lacks executable fixture coverage for runtime failure-boundary, lifecycle parity, query/command semantics, experience-edge, read-model/orchestration, compatibility/content-safety, AR/spatial, proof-signal, and earlier namespace/install/dependency/state/receipt/bridge/wrapper/source-state/state-signal/operations/spatial/traversal/lifecycle rows.

## Suggested next review item
- Define one module-source strategy for `nexusengine`, then validate ProtoKits local/fetched package resolution, Experiments local/fetched targeted DSK smoke, and public browser loading against that same model.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim ProtoKits local or fetched `origin/0.0.2` passed validation.
- This packet does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not promote ProtoKits into core or retire compatibility shims.
- This packet does not claim proof-signal integrity or AR/spatial rows are fixed.
- This packet does not claim proof-readiness queueing is executable proof.
