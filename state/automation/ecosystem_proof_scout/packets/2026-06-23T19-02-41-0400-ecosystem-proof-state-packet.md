# Ecosystem Proof State Packet

Timestamp: 2026-06-23T19:02:41-0400
Automation: Nexus Realtime: Ecosystem Proof State Packet
Scope: NexusRealtime core, NexusRealtime-ProtoKits, NexusRealtime-Experiments
Result: partial; core remains commit-aligned with the preflight-resolved release ref and smoke-green, but ecosystem proof remains red. New live drift: ProtoKits local aggregate validation is now red, ProtoKits local `main` is 140 commits ahead of `origin/0.0.2` and 11 behind `origin/main`, Experiments local `main` is now 67 commits ahead of `origin/0.0.2` and 50 behind `origin/main`, and the optional ProtoKits jsDelivr `scan-survey-kit` path now returns 200.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Latest proof root before this run: `ecosystem-proof-036`, which kept core release-ref equality separate from ProtoKits target policy, package resolution, Experiments route/API failures, npm/package policy, optional CDN availability, public browser imports, DSK/host hardening, and ownership boundaries.
- Latest ecosystem state packet/node `2026-06-23T06-06-22-0400` reported core parity plus red proof gates, ProtoKits local/release/main split, Experiments release/main split, public `Booting...`, npm 404, and optional ProtoKits jsDelivr 502.
- Latest DSK architecture packet/node `2026-06-23T06-17-21-0400` kept DSK Extension Service Ownership, Runtime Failure Boundary, and Host Public State Ownership as core hardening inventory separate from proof-route and distribution gates.
- Latest deep bug packet/node `2026-06-23T06-49-16-0400` added Composer Proof Ownership evidence: mutable composer nested arrays, supplied-composer handoff bypass, and `engine.game` proof metadata drift.
- Latest domain idea packet/node `2026-06-23T07-02-55-0400` mapped composer read-model handoff under Composition Proof Ownership, not public proof.
- State packets were context only. Live source, docs, tests, git refs, preflight, sibling checks, public URLs, and Playwright launch-state inspection were authority for this run.

## Latest branch
- `npm run automation:preflight` passed at `2026-06-23T22:58:45.004Z`.
- Preflight resolved `latestReleaseBranch: 0.0.2`.
- Branch status: `current-differs-from-latest-release-branch`.
- Remote branches observed: `0.0.1`, `0.0.2`, `main`.
- Required core public links passed; optional npm metadata returned 404.
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
- ProtoKits: `git fetch --prune origin`; local clean `main` at `4c571ea238a4692880ce1e47830bcf092d4b9ea3`; `origin/main` at `1ec419e207a001a8347eba99c065bda2a6c5bc53`; `origin/0.0.2` at `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`; ahead/behind vs release `140 0`; ahead/behind vs main `0 11`; package `@luminarylabs/nexusrealtime-protokits@0.0.2`.
- ProtoKits local: `npm run check` -> failed after syntax-checking 477 JavaScript modules; `tests/generic-promotion-gate-smoke.test.mjs` failed `pressure emits warning transition` with actual `0`, expected `1`.
- ProtoKits local: `node tests/dsk-first-wave.test.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- Experiments: `git fetch --prune origin`; local clean `main` at `2e66120391fa9d88e3c6a27e16bb59c82ad95a4a`; `origin/main` at `0508a2af3c47857187f7d31cf898d061d65d8b37`; `origin/0.0.2` at `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; ahead/behind vs release `67 0`; ahead/behind vs main `0 50`; package `@luminarylabs/nexusrealtime-experiments@0.0.2`.
- Experiments local archive: `npm run check` -> failed at `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`.
- Experiments local checkout: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
- Disposable side-by-side `origin/0.0.2` release layout: ProtoKits `npm run check` passed after 411 JavaScript modules; ProtoKits targeted first-wave test failed with missing package `nexusrealtime`; Experiments `npm run check` failed at `tests/canonical-game-routes-smoke.mjs`; Experiments targeted DSK smoke failed with missing `engine.n.zoneField`. Disposable artifacts were removed.
- Public URL checks used Node `fetch`.
- Human-view validation used Playwright CLI. Mandatory question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Answer: yes; public proof route launch-state inspection was required. Snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console showed deployed sibling module 404s. Transient `.playwright-cli` artifacts were removed.

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
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200; previous optional 502 not reproduced.
- `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime/src/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js` -> 404.

## ProtoKits migration state
- Available ProtoKits is clean, but local aggregate validation is no longer green.
- Local ProtoKits `main` is 140 commits ahead of `origin/0.0.2` and 11 commits behind `origin/main`.
- Local `npm run check` fails before first-wave targeted proof: `generic-promotion-gate-smoke.test.mjs` expects one `PressureWarning` event but receives zero.
- Local and disposable targeted first-wave DSK proof still fail before assertions because `tests/dsk-first-wave.test.mjs` imports bare package `nexusrealtime`.
- Disposable `origin/0.0.2` aggregate proof remains green.
- First-wave ledger remains public on raw `0.0.2` and lists seven promoted-candidate kits with `engine.n.*` APIs; no first-wave kit is marked half migrated.
- Direct-import aliases remain present for `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- The equivalent jsDelivr proof path for `scan-survey-kit` now returns 200, so CDN availability for that checked path is not currently a blocker.
- The proof still needs an explicit package/workspace/CDN/link model for `nexusrealtime`.

## Experiment proof state
- Available Experiments is clean but no longer release-ref aligned: local `main` is 67 commits ahead of `origin/0.0.2` and 50 behind `origin/main`.
- Local archive and disposable `origin/0.0.2` aggregate `npm run check` still fail at `tests/canonical-game-routes-smoke.mjs` because `the-open-above-v2` is still versioned.
- Local real sibling layout and disposable release layout targeted DSK smoke both fail because `engine.n.zoneField` is undefined at `experiments/dsk-first-wave-proof/src/proof.js:23`.
- `tests/dsk-first-wave-experiment-smoke.mjs` still remains outside aggregate `npm run check`.
- Public proof route loads HTML but remains human-visible stuck at `Booting...`.
- Playwright console output showed 404s for deployed `NexusRealtime/src/index.js`, ProtoKits `domain-foundation`, ProtoKits `domain-service-kits`, and favicon.
- Proof route source still uses sibling-relative imports:
  - import map maps `nexusrealtime` to `../../../NexusRealtime/src/index.js`.
  - `src/proof.js` imports core from `../../../../NexusRealtime/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusRealtime-ProtoKits/protokits/...`.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs` as part of core `npm test`.
- Core host-surface smoke remains green in the dirty local checkout; this is local evidence, not release/public proof.
- ProtoKits release-ref aggregate proof is green, but ProtoKits local aggregate proof is now red and targeted first-wave proof is still unresolved in both local and release layouts.
- Experiments aggregate proof is red independent of targeted DSK proof.
- Experiments targeted DSK proof is red because expected promoted APIs are missing under `engine.n`.
- Browser/public proof is red because deployed sibling module paths 404 and the visible page remains `Booting...`.
- DSK Extension Service Ownership, Host Graph Lifecycle Ownership, Host Public State Ownership, Composition Proof Ownership, Domain Command Config Ownership, and Telemetry Command Evidence Ownership remain separate hardening inventory; they do not fix package resolution, route naming, `engine.n` API installation, npm metadata, package-version policy, or public imports.

## Runtime ownership drift
- `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` still keep the split explicit: core owns runtime/DSK/composer primitives, ProtoKits owns reusable domain kits, and Experiments owns playable/browser proof.
- Current failures do not justify moving browser proof routes or reusable ProtoKit implementation into NexusRealtime core.
- Composer read-model handoff is core validation-surface inventory because it concerns `createGameKitComposer()` and `createRealtimeGame({ composer })`, but it does not change module-source or public proof blockers.
- New reusable kit implementation still belongs in ProtoKits by default.
- New playable/browser proof still belongs in Experiments by default.
- Dirty core host/docs/source work needs release-policy handling before it can be used in public/package claims.
- Core branch/package policy remains unresolved: branch `0.0.2` serves package metadata `0.1.0`.

## Broken/stale proof paths
- Branch-name proof is ambiguous: core local branch is `main`, but `HEAD`, `origin/main`, and `origin/0.0.2` are equal.
- ProtoKits available checkout is neither release-ref proof nor latest-main proof; local `main` is 140 commits ahead of `origin/0.0.2` and 11 behind `origin/main`.
- Experiments available checkout is neither release-ref proof nor latest-main proof; local `main` is 67 commits ahead of `origin/0.0.2` and 50 behind `origin/main`.
- ProtoKits local aggregate validation is red.
- ProtoKits targeted DSK proof is red locally and in disposable release layout.
- Experiments aggregate and targeted DSK proof are red locally and in disposable release layout.
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
- Optional npm metadata remains 404, so npm-backed consumption is not proven.

## Risks
- Prior confidence from ProtoKits local aggregate success is stale; local `npm run check` is now red before targeted DSK proof.
- ProtoKits local branch drift can inflate confidence because it is far ahead of release and still behind latest `origin/main`.
- Experiments local branch drift can inflate confidence because it is ahead of release but still behind latest `origin/main`.
- Commit parity can hide branch-name drift; release-proof policy needs to state whether branch checkout, resolved-ref equality, and clean worktrees are required.
- Aggregate validation can be green while targeted DSK proof remains red, as release-ref ProtoKits shows.
- Aggregate validation can also fail independently of targeted DSK proof, as Experiments and local ProtoKits now show.
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Targeted proof exposes an API-installation problem (`engine.n.zoneField`) separate from package resolution and public import 404s.
- Host, DSK extension, and composer hardening are real proof-surface risks, but treating them as distribution fixes would hide the still-open public/browser gates.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.

## Blockers
- Decide release-proof policy for local ProtoKits `main` vs `origin/main` vs preflight-resolved `origin/0.0.2`.
- Decide release-proof policy for local Experiments `main` vs `origin/main` vs preflight-resolved `origin/0.0.2`.
- Decide release-proof policy for core branch-name checkout versus commit equality against preflight `latestReleaseBranch`.
- Decide how dirty core host/docs/source work should be handled before later public/package claims reference it.
- ProtoKits local aggregate validation needs the `generic-pressure-loop` warning transition regression triaged if local/main proof is in scope.
- ProtoKits targeted first-wave DSK validation needs a package/workspace/CDN/link model that resolves `nexusrealtime`.
- Experiments aggregate validation needs the `the-open-above-v2` canonical route failure resolved before aggregate proof can be green.
- Experiments targeted DSK proof needs the expected first-wave APIs to install under `engine.n`, starting with `zoneField`.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, package/workspace dependency, or build-step import maps.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as required targeted evidence.
- npm metadata for `nexusrealtime` is unavailable.
- Core branch `0.0.2` still serves package metadata version `0.1.0`; release/package-version policy remains unclear.
- Host Public State Ownership, DSK Extension Service Ownership, and Composition Proof Ownership need executable fixtures, but those fixtures belong to non-scout hardening lanes and do not unblock public proof by themselves.

## Suggested next review item
- Choose the proof target policy first (`ProtoKits local main`, `ProtoKits origin/main`, `ProtoKits origin/0.0.2`, `Experiments local main`, `Experiments origin/main`, `Experiments origin/0.0.2`). If local/main proof is in scope, triage the new ProtoKits `generic-pressure-loop` warning-transition failure before the older targeted package-resolution proof; then choose one module-source strategy and fix Experiments `engine.n.zoneField` plus `the-open-above-v2` against that selected target model.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim dirty core host/docs/source work is release-ready.
- This packet does not claim local branch names match latest release branch names.
- This packet does not claim ProtoKits local `main` is release-ref proof or latest-main proof.
- This packet does not claim ProtoKits local aggregate validation passed.
- This packet does not claim ProtoKits targeted first-wave DSK validation passed.
- This packet does not claim Experiments local `main` is release-ref proof or latest-main proof.
- This packet does not claim Experiments aggregate validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not promote ProtoKits into core.
- This packet does not claim DSK Extension Service Ownership, Host Graph Lifecycle Ownership, Host Public State Ownership, Composition Proof Ownership, Domain Command Config Ownership, Telemetry Command Evidence Ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
