# Ecosystem Proof State Packet

Timestamp: 2026-06-23T06:38:41-0400
Automation: Nexus Realtime: Ecosystem Proof State Packet
Scope: NexusRealtime core, NexusRealtime-ProtoKits, NexusRealtime-Experiments
Result: partial; core remains commit-aligned with the preflight-resolved release ref and smoke-green, but ecosystem proof remains red across ProtoKits local-vs-release-vs-main policy, ProtoKits targeted package resolution, Experiments aggregate route validation, Experiments targeted DSK API installation, npm metadata, package-version policy, optional ProtoKits CDN availability, and public browser module loading.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Latest proof root before this run: `ecosystem-proof-035`, which kept core parity separate from ProtoKits target policy, package resolution, Experiments route/API failures, npm/package policy, public browser imports, DSK Extension Service Ownership, and ownership boundaries.
- Latest ecosystem state packet/node `2026-06-23T06-06-22-0400` reconfirmed the same proof blockers, added widened sibling `origin/main` drift, and recorded an optional ProtoKits jsDelivr `scan-survey-kit` 502 while raw GitHub returned 200.
- Latest DSK architecture packet/node `2026-06-23T06-17-21-0400` kept Runtime Failure Boundary, DSK Extension Service Ownership, Host Graph Lifecycle Ownership, and Host Public State Ownership as hardening inventory separate from proof-route, module-source, and public distribution gates.
- Latest deep bug packet/node `2026-06-22T18-49-24-0400` added Host Public State Ownership evidence around mutable `host.provides`, public `adapterRecords`, record/lifecycle disagreement, and mount side-effect leaks.
- Latest domain idea packet/node `2026-06-22T19-04-12-0400` mapped Host Public State Ownership under Host Graph Lifecycle Ownership instead of creating a duplicate proof lane.
- State packets were context only. Live source, docs, tests, git refs, preflight, sibling checks, disposable release layout, public URLs, and Playwright launch-state inspection were authority for this run.

## Latest branch
- `npm run automation:preflight` passed at `2026-06-23T10:33:45.402Z`.
- Preflight resolved `latestReleaseBranch: 0.0.2`.
- Branch status: `current-differs-from-latest-release-branch`.
- Remote branches observed: `0.0.1`, `0.0.2`, `main`.
- NexusRealtime local branch `main`, `origin/main`, and `origin/0.0.2` all resolved to `6c450b3073825ddd495979474f57342556658972`.
- Core ahead/behind against `origin/0.0.2`: `0 0`.
- Core ahead/behind against `origin/main`: `0 0`.
- Core package metadata: `nexusrealtime@0.1.0`.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime`
- `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`

## Commands run
- NexusRealtime: `npm run automation:preflight` -> passed; latest branch `0.0.2`; required GitHub/raw/jsDelivr links OK; optional npm metadata 404.
- NexusRealtime: `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD origin/main origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/main`.
- NexusRealtime: `npm test` -> passed 9 smoke tests, including `host-smoke ok`.
- ProtoKits available checkout: `git fetch --prune origin`; local clean `main` at `a23664b8e346482df773aeff9c0793919ba04ccb`; `origin/main` at `476178b6baba291dbe39f7261b8c37255adf9a8f`; `origin/0.0.2` at `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`; ahead/behind vs release `103 0`; ahead/behind vs main `0 30`; package `@luminarylabs/nexusrealtime-protokits@0.0.2`.
- ProtoKits available checkout: `npm run check` -> passed after checking 470 JavaScript modules.
- ProtoKits available checkout: `node tests/dsk-first-wave.test.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- Experiments available checkout: `git fetch --prune origin`; local clean `main` at `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; `origin/0.0.2` at the same commit; `origin/main` at `9fb36c4cec023df8df427b681855ed1fa5cfb03c`; ahead/behind vs release `0 0`; ahead/behind vs main `0 29`; package `@luminarylabs/nexusrealtime-experiments@0.0.2`.
- Experiments available checkout: `npm run check` -> failed after generating 100 promoted application route wrappers and gallery data for 124 routes; `tests/canonical-game-routes-smoke.mjs` failed with `the-open-above-v2 route should not be versioned`.
- Experiments available targeted: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
- Disposable `/tmp` release layout with core, ProtoKits, and Experiments extracted at `origin/0.0.2`: ProtoKits `npm run check` passed after 411 JavaScript modules; ProtoKits targeted first-wave test failed with missing package `nexusrealtime`; Experiments `npm run check` failed at `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`; Experiments targeted DSK smoke failed with missing `engine.n.zoneField`. Disposable artifacts were removed.
- Public URL checks used Node `fetch`.
- Human-view validation used Playwright CLI. Mandatory question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Answer: yes; launch-state inspection was required. Snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console output showed module 404s. Screenshot and `.playwright-cli` artifacts were removed.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusRealtime` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusRealtime/0.0.2/package.json` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@0.0.2/src/index.js` -> 200.
- `https://registry.npmjs.org/nexusrealtime` -> 404 optional preflight link.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/` -> 200 by fetch and Playwright navigation; visible state remained `Booting...`.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/protokits/scan-survey-kit/index.js` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 502.
- `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime/src/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js` -> 404.

## ProtoKits migration state
- Available ProtoKits remains clean and aggregate-green, but it is not release-ref proof or latest-main proof.
- Local ProtoKits `main` is 103 commits ahead of `origin/0.0.2` and 30 commits behind `origin/main`.
- Local aggregate validation passed at 470 JavaScript modules; disposable `origin/0.0.2` aggregate validation passed at 411 JavaScript modules.
- Local and disposable targeted first-wave DSK proof still fail before assertions because `tests/dsk-first-wave.test.mjs` imports bare package `nexusrealtime`.
- First-wave ledger remains public on raw `0.0.2` and lists seven promoted-candidate kits with `engine.n.*` APIs; no first-wave kit is marked half migrated.
- Direct-import aliases remain present for `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- The equivalent jsDelivr proof path for `scan-survey-kit` currently returns 502 while raw GitHub returns 200, so CDN-backed ProtoKits proof is not clean.
- The proof still needs an explicit package/workspace/CDN/link model for `nexusrealtime`.

## Experiment proof state
- Available Experiments is clean and release-ref aligned with `origin/0.0.2`, but it is 29 commits behind `origin/main`.
- Local and disposable `origin/0.0.2` aggregate `npm run check` still fails at `tests/canonical-game-routes-smoke.mjs` because `the-open-above-v2` is still versioned.
- Local and disposable targeted DSK smoke fail after proof execution starts because `engine.n.zoneField` is undefined at `experiments/dsk-first-wave-proof/src/proof.js:23`.
- `tests/dsk-first-wave-experiment-smoke.mjs` still remains outside aggregate `npm run check`.
- Public proof route loads HTML but remains human-visible stuck at `Booting...`.
- Playwright console output showed 404s for deployed `NexusRealtime/src/index.js`, ProtoKits `domain-foundation`, ProtoKits `domain-service-kits`, and favicon.
- Proof route source still uses sibling-relative imports:
  - import map maps `nexusrealtime` to `../../../NexusRealtime/src/index.js`.
  - `src/proof.js` imports core from `../../../../NexusRealtime/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusRealtime-ProtoKits/protokits/...`.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs` as part of core `npm test`.
- Core host-surface smoke remains green in the dirty local checkout; this is live checkout context, not release/public proof.
- ProtoKits local aggregate health is green on development `main`; release-ref aggregate health is green in disposable `origin/0.0.2`; targeted first-wave DSK coverage is still unproven in both because `nexusrealtime` is unresolved.
- Experiments aggregate proof is red independent of targeted DSK proof.
- Experiments targeted DSK proof is red because expected promoted APIs are missing under `engine.n`.
- Browser/public proof is red because deployed sibling module paths 404 and the visible page remains `Booting...`.
- DSK Extension Service Ownership, Host Graph Lifecycle Ownership, Host Public State Ownership, Domain Command Config Ownership, and Telemetry Command Evidence Ownership remain separate hardening inventory; they do not fix package resolution, route naming, `engine.n` API installation, npm metadata, package-version policy, optional ProtoKits CDN availability, or public imports.

## Runtime ownership drift
- `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` still keep the split explicit: core owns runtime/DSK/composer primitives, ProtoKits owns reusable domain kits, and Experiments owns playable/browser proof.
- Current failures do not justify moving browser proof routes or reusable ProtoKit implementation into NexusRealtime core.
- Host Public State Ownership is core validation-surface inventory because it concerns `Nexus.Host`, but it does not change the module-source or public proof blockers.
- DSK Extension Service Ownership belongs in core hardening because it concerns `extendDomainServiceKit()`, but it does not fix the public proof route.
- New reusable kit implementation still belongs in ProtoKits by default.
- New playable/browser proof still belongs in Experiments by default.
- Dirty host/docs/source work in core needs release-policy handling before it can be used in public/package claims.
- Core branch/package policy remains unresolved: branch `0.0.2` serves package metadata `0.1.0`.

## Broken/stale proof paths
- Branch-name proof is ambiguous: core local branch is `main`, but `HEAD`, `origin/main`, and `origin/0.0.2` are equal.
- ProtoKits available checkout is not release-ref proof or latest-main proof; local `main` is 103 commits ahead of `origin/0.0.2` and 30 behind `origin/main`.
- Experiments local `main` matches `origin/0.0.2`, but remains 29 commits behind `origin/main`.
- ProtoKits targeted DSK proof is red locally and in disposable release layout.
- Experiments aggregate and targeted DSK proof are red locally and in disposable release layout.
- Optional ProtoKits jsDelivr proof path is red while raw GitHub is green.
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
- Optional npm metadata remains 404, so npm-backed consumption is not proven.

## Risks
- ProtoKits local aggregate success can inflate confidence because local `main` is 103 commits ahead of the preflight release target and 30 commits behind `origin/main`.
- Experiments release-ref alignment can inflate confidence because `origin/main` is now 29 commits ahead and may contain different route/proof state.
- Dirty core host/docs/source work can inflate local smoke confidence without being committed, release-policy approved, or public-consumption-ready.
- Commit parity can hide branch-name drift; the release-proof policy needs to say whether branch checkout or resolved-ref equality is authoritative.
- Aggregate validation can be green while targeted DSK proof remains red, as ProtoKits shows.
- Aggregate validation can also fail independently of targeted DSK proof, as Experiments shows.
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Targeted proof exposes an API-installation problem (`engine.n.zoneField`) that is separate from package resolution and public import 404s.
- Optional ProtoKits CDN failure means raw-GitHub availability and CDN availability must be reported separately.
- Host Public State Ownership and DSK Extension Service Ownership are confirmed hardening inventory, but treating either as a proof fix would hide the still-open distribution and browser gates.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.

## Blockers
- Decide release-proof policy for local ProtoKits `main` vs `origin/main` vs preflight-resolved `origin/0.0.2`.
- Decide whether Experiments proof should stay pinned to `origin/0.0.2` or also inspect the widened `origin/main` drift.
- Decide release-proof policy for core branch-name checkout versus commit equality against preflight `latestReleaseBranch`.
- Decide how dirty core host/docs/source work should be handled before later public/package claims reference it.
- ProtoKits targeted first-wave DSK validation needs a package/workspace/CDN/link model that resolves `nexusrealtime`.
- Experiments aggregate validation needs the `the-open-above-v2` canonical route failure resolved before aggregate proof can be green.
- Experiments targeted DSK proof needs the expected first-wave APIs to install under `engine.n`, starting with `zoneField`.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, package/workspace dependency, or build-step import maps.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as required targeted evidence.
- npm metadata for `nexusrealtime` is unavailable.
- Core branch `0.0.2` still serves package metadata version `0.1.0`; release/package-version policy remains unclear.
- Optional ProtoKits jsDelivr `scan-survey-kit` path returns 502 and needs recheck before CDN-backed proof claims.
- Host Public State Ownership and DSK Extension Service Ownership need executable fixtures, but those fixtures belong to non-scout hardening lanes and do not unblock public proof by themselves.

## Suggested next review item
- Choose the proof target policy first (`ProtoKits local main`, `ProtoKits origin/main`, `ProtoKits origin/0.0.2`, and whether Experiments origin/main drift is in scope), then choose one module-source strategy and fix the narrower Experiments `engine.n.zoneField` targeted proof failure plus `the-open-above-v2` canonical route failure against that model. Recheck optional ProtoKits jsDelivr availability before any CDN-backed ProtoKits proof claim.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim dirty core host/docs/source work is release-ready.
- This packet does not claim local branch names match latest release branch names.
- This packet does not claim ProtoKits local `main` is release-ref proof or latest-main proof.
- This packet does not claim ProtoKits targeted first-wave DSK validation passed.
- This packet does not claim Experiments aggregate validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability or ProtoKits CDN availability.
- This packet does not promote ProtoKits into core.
- This packet does not claim DSK Extension Service Ownership, Host Graph Lifecycle Ownership, Host Public State Ownership, Domain Command Config Ownership, Telemetry Command Evidence Ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
