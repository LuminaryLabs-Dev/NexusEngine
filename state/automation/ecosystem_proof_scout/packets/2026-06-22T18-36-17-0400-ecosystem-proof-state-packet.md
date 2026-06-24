# Ecosystem Proof State Packet

Timestamp: 2026-06-22T18:36:17-0400
Automation: Nexus Realtime: Ecosystem Proof State Packet
Scope: NexusRealtime core, NexusRealtime-ProtoKits, NexusRealtime-Experiments
Result: partial; core is still commit-aligned with the preflight-resolved release ref and smoke-green, but ecosystem proof remains red across ProtoKits local-vs-release separation, targeted package resolution, Experiments aggregate route validation, Experiments targeted DSK API installation, npm metadata, package-version policy, and public browser module loading. Fresh DSK Extension Service Ownership evidence is hardening inventory only.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Latest proof root before this run: `ecosystem-proof-034`, which split proof into ProtoKits local-vs-release policy, core branch/ref policy, dirty host boundary, package resolution, Experiments aggregate route validation, targeted DSK API installation, npm/package policy, public browser imports, hardening inventory, and ownership boundaries.
- Latest ecosystem state packet/node `2026-06-22T18-07-07-0400` reconfirmed the same release/public proof blockers and added DSK Extension Service Ownership as fresh core hardening inventory.
- Latest DSK architecture packet/node `2026-06-22T18-19-08-0400` confirmed `extendDomainServiceKit()` token/API parity, extension install atomicity, and extension definition identity as DSK hardening rows, not distribution proof fixes.
- Latest deep bug packet/node `2026-06-22T06-49-01-0400` supplied extension service bug evidence.
- Latest domain idea packet/node `2026-06-22T07-03-20-0400` mapped DSK Extension Service Ownership into planning inventory, separate from package/import/route proof.
- State packets were context only. Live source, docs, tests, git refs, public URLs, preflight, disposable release layout, and Playwright launch-state inspection were authority for this run.

## Latest branch
- `npm run automation:preflight` passed at `2026-06-22T22:33:41.284Z`.
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
- ProtoKits available checkout: `git fetch --prune origin`; local `main` at `a23664b8e346482df773aeff9c0793919ba04ccb`; `origin/main` at `3322f1f8b2c2fa4f6c2b5b6a6bea5fa90f583a47`; `origin/0.0.2` at `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`; ahead/behind vs release `103 0`; ahead/behind vs main `1 0`; package `@luminarylabs/nexusrealtime-protokits@0.0.2`.
- ProtoKits available checkout: `npm run check` -> passed after checking 470 JavaScript modules.
- ProtoKits available checkout: `node tests/dsk-first-wave.test.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- Experiments available checkout: `git fetch --prune origin`; local `main` at `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; `origin/0.0.2` at the same commit; `origin/main` at `6d047bb11806e3430084ddca0fb49a28f0f17a3e`; ahead/behind vs release `0 0`; ahead/behind vs main `0 4`; package `@luminarylabs/nexusrealtime-experiments@0.0.2`.
- Experiments available targeted: `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
- Disposable release layout with core, ProtoKits, and Experiments extracted at `origin/0.0.2`: ProtoKits `npm run check` -> passed after 411 JavaScript modules; ProtoKits targeted first-wave test -> failed with missing package `nexusrealtime`; Experiments `npm run check` -> failed at `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`; Experiments targeted DSK smoke -> failed with missing `engine.n.zoneField`.
- Public URL checks used Node `fetch`.
- Human-view validation used Playwright CLI. Mandatory question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Answer: yes; launch-state inspection was required. Snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console/network output showed module 404s. Temporary `/tmp/.playwright-cli` artifacts and disposable release layout artifacts were removed.

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
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200.
- `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime/src/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js` -> 404.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js` -> 404.

## ProtoKits migration state
- Available ProtoKits remains clean and aggregate-green, but it is development-state proof, not release-ref proof.
- Local ProtoKits `main` is 103 commits ahead of `origin/0.0.2` and 1 commit ahead of `origin/main`.
- Local aggregate validation passed at 470 JavaScript modules; disposable `origin/0.0.2` aggregate validation passed at 411 JavaScript modules.
- Local and disposable targeted first-wave DSK proof still fail before assertions because `tests/dsk-first-wave.test.mjs` imports bare package `nexusrealtime`.
- First-wave ledger remains public on raw `0.0.2` and says the seven promoted-candidate kits are not half migrated.
- Direct-import aliases remain present for `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- The proof still needs an explicit package/workspace/CDN/link model for `nexusrealtime`.

## Experiment proof state
- Available Experiments is clean and release-ref aligned with `origin/0.0.2`, but remains 4 commits behind `origin/main`.
- Disposable `origin/0.0.2` aggregate `npm run check` still fails at `tests/canonical-game-routes-smoke.mjs` because `the-open-above-v2` is still versioned.
- Local and disposable targeted DSK smoke fail after module resolution reaches proof execution because `engine.n.zoneField` is undefined at `experiments/dsk-first-wave-proof/src/proof.js:23`.
- `tests/dsk-first-wave-experiment-smoke.mjs` still remains outside aggregate `npm run check`.
- Public proof route loads HTML but remains human-visible stuck at `Booting...`.
- Playwright console/network output showed 404s for deployed `NexusRealtime/src/index.js`, ProtoKits `domain-foundation`, ProtoKits `domain-service-kits`, and favicon.
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
- DSK Extension Service Ownership, Host Graph Lifecycle Ownership, Domain Command Config Ownership, and Telemetry Command Evidence Ownership remain separate hardening inventory; they do not fix package resolution, route naming, `engine.n` API installation, npm metadata, package-version policy, or public imports.

## Runtime ownership drift
- `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, and `docs/protokit-experiment-loop.md` still keep the split explicit: core owns runtime/DSK/composer primitives, ProtoKits owns reusable domain kits, and Experiments owns playable/browser proof.
- Current failures do not justify moving browser proof routes or reusable ProtoKit implementation into NexusRealtime core.
- DSK extension contract fixes belong in core only because they are runtime/validation invariants.
- New reusable kit implementation still belongs in ProtoKits by default.
- New playable/browser proof still belongs in Experiments by default.
- Dirty host-surface work in core needs release-policy handling before it can be used in public/package claims.
- Core branch/package policy remains unresolved: branch `0.0.2` serves package metadata `0.1.0`.

## Broken/stale proof paths
- Branch-name proof is ambiguous: core local branch is `main`, but `HEAD`, `origin/main`, and `origin/0.0.2` are equal.
- ProtoKits available checkout is not release-ref proof; local `main` is 103 commits ahead of `origin/0.0.2`.
- Experiments local `main` matches `origin/0.0.2`, but remains 4 commits behind `origin/main`.
- ProtoKits targeted DSK proof is red locally and in disposable release layout.
- Experiments aggregate and targeted DSK proof are red in disposable release layout.
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
- Optional npm metadata remains 404, so npm-backed consumption is not proven.

## Risks
- ProtoKits local aggregate success can inflate confidence because local `main` is 103 commits ahead of the preflight release target.
- Dirty core host-surface work can inflate local smoke confidence without being committed, release-policy approved, or public-consumption-ready.
- Commit parity can hide branch-name drift; the release-proof policy needs to say whether branch checkout or resolved-ref equality is authoritative.
- Aggregate validation can be green while targeted DSK proof remains red, as ProtoKits shows.
- Aggregate validation can also fail independently of targeted DSK proof, as Experiments shows.
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Targeted proof exposes an API-installation problem (`engine.n.zoneField`) that is separate from package resolution and public import 404s.
- DSK Extension Service Ownership is now confirmed hardening inventory, but treating it as a proof fix would hide the still-open distribution and browser gates.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.

## Blockers
- Decide release-proof policy for local ProtoKits `main` vs `origin/main` vs preflight-resolved `origin/0.0.2`.
- Decide release-proof policy for core branch-name checkout versus commit equality against preflight `latestReleaseBranch`.
- Decide how dirty core host-surface work should be handled before later public/package claims reference it.
- ProtoKits targeted first-wave DSK validation needs a package/workspace/CDN/link model that resolves `nexusrealtime`.
- Experiments aggregate validation needs the `the-open-above-v2` canonical route failure resolved before aggregate proof can be green.
- Experiments targeted DSK proof needs the expected first-wave APIs to install under `engine.n`, starting with `zoneField`.
- Public proof import-map/module source strategy remains unresolved: CDN `0.0.2`, same-origin deployed assets, package/workspace dependency, or build-step import maps.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as required targeted evidence.
- npm metadata for `nexusrealtime` is unavailable.
- Core branch `0.0.2` still serves package metadata version `0.1.0`; release/package-version policy remains unclear.
- DSK Extension Service Ownership needs executable fixtures, but those fixtures belong to a non-scout hardening lane and do not unblock public proof by themselves.

## Suggested next review item
- Choose the proof target policy for ProtoKits first (`local main`, `origin/main`, or `origin/0.0.2`), then choose one module-source strategy and fix the narrower Experiments `engine.n.zoneField` targeted proof failure plus `the-open-above-v2` canonical route failure against that model. Keep DSK Extension Service Ownership in the separate hardening queue.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim dirty core host-surface work is release-ready.
- This packet does not claim local branch names match latest release branch names.
- This packet does not claim ProtoKits local `main` is release-ref proof.
- This packet does not claim ProtoKits targeted first-wave DSK validation passed.
- This packet does not claim Experiments aggregate validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not promote ProtoKits into core.
- This packet does not claim DSK Extension Service Ownership, host graph lifecycle ownership, domain command/config ownership, telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
