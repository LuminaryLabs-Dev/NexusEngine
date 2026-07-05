# Ecosystem Proof State Packet

Timestamp: 2026-06-20T02:40:59-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; core remains aligned and smoke-green, but DSK ecosystem proof remains blocked by one unresolved module-source strategy across local, fetched-ref, and public browser proof.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-proof-025`.
- Latest proof packet/node `2026-06-20T01-59-45-0400` established that local ProtoKits, local Experiments targeted DSK proof, ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof all fail around `nexusengine` package or sibling module resolution.
- Latest ecosystem state packet/node `2026-06-20T01-59-37-0400` recorded the same local available-checkout regression and kept npm/package-version/public route claims separate.
- Latest DSK architecture packet/node `2026-06-20T02-23-35-0400` added composition-proof ownership rows, but kept them separate from distribution/module-source proof.
- Latest deep bug packet/node `2026-06-20T01-55-55-0400` added duplicate capability providers, SequenceNode duplicate type overwrite, mutable event history, and AR launch device-source mismatch as runtime hardening inputs.
- Latest domain idea packet/node `2026-06-20T02-01-55-0400` mapped those runtime findings to a Composition Proof Ownership family, not to a distribution-proof fix.
- State packets were context only. Live source, docs, tests, git refs, public URLs, preflight, and Playwright launch state are authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Preflight timestamp: `2026-06-20T06:37:55.032Z`.
- Branch status: `current-is-latest-release-branch`.
- Remote branches observed: `0.0.1`, `0.0.2`, `main`.
- NexusEngine local branch `0.0.2` at `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits local branch `0.0.2` at `f006fa3bbe5721b0aa073de2bca08a452bd8e492`; fetched `origin/0.0.2` at `b1d69099392a144a999cac824d344c403fe762d8`; ahead/behind `0/31`.
- Experiments local branch `0.0.2` at `799fad882461502faa84b132f70de011e7dbe0cb`; fetched `origin/0.0.2` advanced during this pass to `81b39bccadf2cdf8269df24cd4970a5b2d7ebbd9`; ahead/behind `0/10`.
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
- Experiments local available checkout: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed because sibling ProtoKits imports package `nexusengine`, which is not resolvable.
- ProtoKits disposable fetched-ref extraction at `origin/0.0.2` `b1d69099392a144a999cac824d344c403fe762d8`: `npm run check` -> failed after checking 358 JavaScript modules; `smoke:imports` reported 110 failures rooted in missing package `nexusengine`.
- ProtoKits disposable fetched-ref targeted DSK smoke: `node tests/dsk-first-wave.test.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- Experiments disposable fetched-ref extraction at `origin/0.0.2` `81b39bccadf2cdf8269df24cd4970a5b2d7ebbd9`: `npm run check` -> passed after generating 100 flat route wrappers in the disposable directory.
- Experiments disposable fetched-ref targeted DSK smoke: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed because `experiments/dsk-first-wave-proof/src/proof.js` imports `../../../../NexusEngine/src/index.js`, resolving to missing `/private/tmp/NexusEngine/src/index.js`.
- Public URL checks used direct `curl -L -s -o /dev/null -w "%{http_code}"`.
- Human-view validation used the Playwright CLI wrapper. Snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for sibling NexusEngine and ProtoKits module paths. Playwright browser and scratch artifacts were closed/removed.
- Targeted file inspections checked ProtoKits package metadata, direct `nexusengine` imports, first-wave DSK tests, Experiments import maps, Experiments proof imports, and aggregate scripts.

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
- `protokits/nexus-dsk-adapter/index.js` imports `nexusengine` directly as a package.
- ProtoKits `package.json` remains `@luminarylabs/nexusengine-protokits@0.0.2` and does not declare a dependency that makes package `nexusengine` resolvable in the local or disposable release-ref checkouts.
- `tests/dsk-first-wave.test.mjs` also imports `nexusengine` directly before reaching first-wave assertions.
- Direct-import aliases remain present in the first-wave test: `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- Local available-checkout aggregate and targeted DSK proof remain blocked by the same package-resolution issue.
- Fetched ProtoKits `origin/0.0.2` remains 31 commits ahead of local and fails standalone validation on the same missing package.
- Compatibility shim risk remains: old injected-runtime and legacy `engine.*` APIs are intentional migration support, but no removal condition was found in this scout pass.

## Experiment proof state
- Local targeted DSK proof still fails in the available Experiments checkout through sibling ProtoKits because package `nexusengine` is not resolvable.
- The available Experiments checkout is now 10 commits behind fetched `origin/0.0.2`, so local targeted proof is neither green nor latest-ref proof.
- Fetched Experiments aggregate `npm run check` passed in a disposable extraction at `81b39bccadf2cdf8269df24cd4970a5b2d7ebbd9`, including `tropical-island-scene-static-smoke` and 100 generated flat route wrappers.
- Fetched Experiments aggregate still does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
- Fetched Experiments targeted DSK proof failed in a disposable extraction for the sibling relative-path assumption used by the public browser route.
- Public proof route loads HTML but remains human-visible stuck at `Booting...`.
- Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
- Local proof files still import from sibling relative paths:
  - import map maps `nexusengine` to `../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports `../../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusEngine-ProtoKits/protokits/...`.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs` as part of core `npm test`.
- ProtoKits first-wave service coverage is blocked locally and at the fetched release ref by unresolved `nexusengine` package resolution.
- Experiments first-wave proof is blocked locally by ProtoKits package resolution and blocked at fetched-ref/public routes by sibling-relative module paths.
- Fetched Experiments aggregate proof is green for the current aggregate script, but that script omits the DSK first-wave smoke.
- Expanded proof inventory still includes module-source, aggregate-vs-targeted parity, public browser proof, npm availability, package-version policy, proof-readiness queueing, proof-signal integrity, AR/spatial read-model, composition-proof ownership, compatibility/content-safety, read-model/orchestration, lifecycle parity, query/command semantics, experience-edge, runtime failure-boundary, traversal proof integrity, lifecycle/config, source-state integrity, state-signal contracts, bridge-state ownership, receipt integrity, spatial/mobility, operations data, and public distribution categories.

## Runtime ownership drift
- `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` still keep the core/ProtoKits/Experiments split explicit.
- New reusable kit implementations should target ProtoKits by default.
- New playable/browser proofs should target Experiments by default.
- Core should stay focused on ECS/runtime/DSK/composer primitives, invariants, exports, and validation.
- Current blockers do not justify moving browser routes, reusable implementation, package-resolution shims, or proof-readiness checklist tooling into core.
- Composition-proof ownership, proof-signal integrity, and AR/spatial hardening are validation concerns, but they are separate from the public route import strategy and package-source strategy.

## Broken/stale proof paths
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
- Local ProtoKits and Experiments targeted DSK checks fail before proof execution because package `nexusengine` is unresolved.
- Disposable latest-ref targeted proof still fails on analogous package/sibling module resolution paths.
- Branch/package mismatch remains: release branch `0.0.2` serves core package version `0.1.0`.
- Optional npm metadata remains 404, so npm-backed consumption is not proven.

## Risks
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Aggregate validation can stay green while omitting the DSK first-wave proof smoke.
- Available-checkout targeted proof can regress independently of core validation when sibling package resolution changes.
- Disposable validation can fail because package/sibling resolution is not modeled; that must be reported separately from source regression.
- Experiments release refs moved during this run, so sibling evidence must keep a fetched-ref timestamp/hash.
- Compatibility shims can blur promoted `engine.n.*` DSK APIs and legacy `engine.*` migration APIs.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.
- Composition-proof, proof-signal, and AR/spatial hardening rows can improve evidence quality, but fixing them would not prove module-source, npm, package-version, public route, or fetched-ref validation.

## Blockers
- ProtoKits local and fetched `origin/0.0.2` validation need a package/workspace/CDN/link model that resolves `nexusengine`.
- Experiments local targeted DSK proof needs the sibling ProtoKits package-resolution issue resolved.
- Experiments fetched `origin/0.0.2` needs targeted DSK validation with a sibling layout or revised module-source strategy.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, package/workspace dependency, or build-step import mapping.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as a required targeted command.
- npm metadata for `nexusengine` is unavailable.
- Branch `0.0.2` still serves package metadata version `0.1.0`; the release/package-version policy remains unclear.
- DSK promotion hardening lacks executable fixture coverage for runtime failure-boundary, composition-proof ownership, proof-signal, AR/spatial, and earlier rows.

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
- This packet does not claim composition-proof ownership, proof-signal integrity, or AR/spatial rows are fixed.
- This packet does not claim proof-readiness queueing is executable proof.
