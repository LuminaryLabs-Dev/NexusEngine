# Ecosystem Proof State Packet

Timestamp: 2026-06-21T06:36:07-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; core commit parity with the latest release ref is stable and smoke-green, but ecosystem proof remains red across ProtoKits targeted package resolution, Experiments aggregate route validation, Experiments targeted DSK API installation, npm metadata, and public browser module loading.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current proof tracker was stale before this run: it still listed `ecosystem-proof-030` as active even though packet/node `2026-06-20T18-41-30-0400` existed as `ecosystem-proof-031`.
- Latest proof packet/node `2026-06-20T18-41-30-0400` separated available-checkout health from release-ref proof and kept public browser proof at `Booting...`.
- Latest ecosystem state packet/node `2026-06-21T06-05-46-0400` sharpened the blocker set: core branch-name drift but commit parity, ProtoKits targeted `nexusengine` package failure, Experiments aggregate route failure, Experiments targeted `engine.n.zoneField` failure, npm 404, and public module 404s.
- Latest DSK architecture packet/node `2026-06-21T06-19-09-0400` kept branch-name drift as release-proof policy and telemetry/command ownership as hardening inventory, not module-source proof.
- Latest deep bug packet/node `2026-06-20T17-54-14-0400` kept telemetry selected-value, RequestQueue/TransportRoute command metadata, and InputIntent frame ownership as hardening inputs.
- Latest domain idea packet/node `2026-06-20T19-02-02-0400` deferred duplicate idea rows because Proof Readiness Queue and Telemetry Command Evidence Ownership already own the evidence.
- State packets were context only. Live source, docs, tests, git refs, public URLs, preflight, disposable release layouts, and Playwright launch state were authority.

## Latest branch
- `npm run automation:preflight` passed at `2026-06-21T10:32:33.245Z`.
- Preflight resolved `latestReleaseBranch: 0.0.2`.
- Branch status: `current-differs-from-latest-release-branch`.
- Remote branches observed: `0.0.1`, `0.0.2`, `main`.
- NexusEngine local branch `main` at `ff97ba47af4197952eca0aded593d66e1a0e4887`.
- `origin/main` and `origin/0.0.2` both resolved to `ff97ba47af4197952eca0aded593d66e1a0e4887`.
- Core ahead/behind against `origin/0.0.2`: `0 0`.
- Core package metadata: `nexusengine@0.1.0`.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Commands run
- NexusEngine: `npm run automation:preflight` -> passed; latest branch `0.0.2`; required GitHub/raw/jsDelivr links OK; optional npm metadata 404.
- NexusEngine: `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD origin/main origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`.
- NexusEngine: `npm test` -> passed 8 smoke tests.
- ProtoKits available checkout: `git fetch --prune origin`; local `main` at `d94b43889dd0eb22df041e49b4efda30e7db375f`; `origin/0.0.2` at `264d4b6e53035ef4507b43bed72351a006cb0c20`; ahead/behind `21 0`; package `@luminarylabs/nexusengine-protokits@0.0.2`.
- ProtoKits available checkout: `npm run check` -> passed; syntax checked 398 JavaScript modules and ran `tests/scoped-rpg-domain-kits-batch-02.test.mjs`.
- ProtoKits available checkout: `node tests/dsk-first-wave.test.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- Experiments available checkout: `git fetch --prune origin`; local `main` at `0e8ccf63a2383edbd55d15f3d81d4b802f6771c8`; `origin/0.0.2` at `b845d402b5933bd2f0491483f2287661e9256c52`; ahead/behind `9 0`; package `@luminarylabs/nexusengine-experiments@0.0.2`.
- Experiments available aggregate: `npm run check` in a disposable local `HEAD` extraction -> failed in `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`.
- Experiments available targeted: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
- Disposable release layout with core, ProtoKits, and Experiments extracted at `origin/0.0.2`: ProtoKits `npm run check` -> passed after 385 JavaScript modules; ProtoKits targeted first-wave test -> failed with missing package `nexusengine`; Experiments `npm run check` -> failed at canonical route smoke; Experiments targeted DSK smoke -> failed with missing `engine.n.zoneField`.
- Public URL checks used Node `fetch`.
- Human-view validation used Playwright CLI. Mandatory question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Answer: yes; launch-state inspection was required. Snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console showed module 404s.
- A first Experiments aggregate attempt accidentally ran in the real sibling checkout and generated route files; that checkout was clean immediately before the command, and the generated artifacts were removed/restored before this packet. The disposable rerun reproduced the same aggregate failure.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200.
- `https://registry.npmjs.org/nexusengine` -> 404 optional preflight link.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 200 by fetch and Playwright navigation; visible state remained `Booting...`.
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
- Available ProtoKits is on `main`, not the latest release branch name, and is 21 commits ahead of `origin/0.0.2`.
- Local and detached `origin/0.0.2` aggregate checks passed, so aggregate ProtoKits health is no longer the active failure.
- Local and detached targeted first-wave DSK proof still fails before assertions because `tests/dsk-first-wave.test.mjs` imports bare package `nexusengine`.
- First-wave ledger remains public on raw `0.0.2` and says the seven promoted-candidate kits are not half migrated.
- Direct-import aliases are present in source/test files, including `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- The proof still needs an explicit package/workspace/CDN/link model for `nexusengine`.

## Experiment proof state
- Available Experiments is on `main`, not the latest release branch name, and is 9 commits ahead of `origin/0.0.2`.
- Local and detached aggregate `npm run check` fail at `tests/canonical-game-routes-smoke.mjs` because `the-open-above-v2` is still versioned.
- Local and detached targeted DSK smoke no longer fails only on missing sibling files; with sibling source available, it reaches proof execution and then fails because `engine.n.zoneField` is undefined at `experiments/dsk-first-wave-proof/src/proof.js:23`.
- `tests/dsk-first-wave-experiment-smoke.mjs` still remains outside aggregate `npm run check`.
- Public proof route loads HTML but remains human-visible stuck at `Booting...`.
- Playwright console showed 404s for deployed `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, ProtoKits `domain-service-kits`, and favicon.
- Proof route source still uses sibling-relative imports:
  - import map maps `nexusengine` to `../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports core from `../../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusEngine-ProtoKits/protokits/...`.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs` as part of core `npm test`.
- ProtoKits aggregate health is green locally and at detached `origin/0.0.2`, but targeted first-wave DSK coverage is still unproven because `nexusengine` is unresolved.
- Experiments aggregate proof is red independent of targeted DSK proof.
- Experiments targeted DSK proof is red because expected promoted APIs are missing under `engine.n`.
- Browser/public proof is red because deployed sibling module paths 404 and the visible page remains `Booting...`.
- Telemetry/command evidence ownership and DSK runtime failure-boundary rows remain separate hardening inventory; they do not fix package resolution, route naming, `engine.n` API installation, npm metadata, or public imports.

## Runtime ownership drift
- `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` still keep the split explicit: core owns runtime/DSK/composer primitives, ProtoKits owns reusable domain kits, and Experiments owns playable/browser proof.
- Current failures do not justify moving browser proof routes or reusable ProtoKit implementation into NexusEngine core.
- New reusable kit implementation still belongs in ProtoKits by default.
- New playable/browser proof still belongs in Experiments by default.
- Core branch/package policy remains unresolved: branch `0.0.2` serves package metadata `0.1.0`.

## Broken/stale proof paths
- Branch-name proof is ambiguous: core `main` equals `origin/0.0.2`, but preflight correctly reports branch-name drift.
- ProtoKits local `main` is ahead of `origin/0.0.2`; aggregate is green, targeted DSK proof is red.
- Experiments local `main` is ahead of `origin/0.0.2`; aggregate and targeted DSK proof are red.
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
- Optional npm metadata remains 404, so npm-backed consumption is not proven.

## Risks
- Commit parity can hide branch-name drift; the release-proof policy needs to say whether branch checkout or resolved-ref equality is authoritative.
- Aggregate validation can be green while targeted DSK proof remains red, as ProtoKits now shows.
- Aggregate validation can also fail independently of targeted DSK proof, as Experiments now shows.
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Targeted proof now exposes an API-installation problem (`engine.n.zoneField`) that is separate from package resolution and public import 404s.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.

## Blockers
- Decide release-proof policy for branch-name checkout versus commit equality against preflight `latestReleaseBranch`.
- ProtoKits targeted first-wave DSK validation needs a package/workspace/CDN/link model that resolves `nexusengine`.
- Experiments aggregate validation needs the `the-open-above-v2` canonical route failure resolved before aggregate proof can be green.
- Experiments targeted DSK proof needs the expected first-wave APIs to install under `engine.n`, starting with `zoneField`.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, package/workspace dependency, or build-step import maps.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as required targeted evidence.
- npm metadata for `nexusengine` is unavailable.
- Core branch `0.0.2` still serves package metadata version `0.1.0`; release/package-version policy remains unclear.

## Suggested next review item
- Choose one module-source strategy and one release-proof policy, then fix the narrower Experiments `engine.n.zoneField` targeted proof failure and canonical `the-open-above-v2` aggregate route failure against that model.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim branch names match latest release branch names.
- This packet does not claim ProtoKits targeted first-wave DSK validation passed.
- This packet does not claim Experiments aggregate validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not promote ProtoKits into core.
- This packet does not claim telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
