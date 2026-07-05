# Ecosystem Proof State Packet

Timestamp: 2026-06-19T07:42:18-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; local latest-ref proof is green across all three repos and sibling drift is resolved for this run, but public browser proof still stalls at `Booting...`, Experiments aggregate validation still omits the DSK first-wave smoke, npm metadata remains unavailable, and DSK hardening gates have expanded to receipt integrity.

## Lane Goal
- Audit proof coverage across core, ProtoKits, Experiments, public routes, and DSK expansion ideas.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-proof-008`.
- Latest proof packet `2026-06-19T06-46-32-0400` said core was aligned and available-checkout validation passed, but sibling checkouts were behind fetched `origin/0.0.2`, the public proof route stalled at `Booting...`, and aggregate DSK smoke coverage remained separate.
- Latest ecosystem state node `2026-06-19T07-11-00-0400` superseded the sibling-behind state: ProtoKits and Experiments were clean/aligned on latest release refs and validation-green, while public proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening gates remained open.
- Latest DSK architecture node `2026-06-19T07-24-53-0400` added receipt identity, event idempotency, claim policy, and request identity to the DSK promotion fixture plan.
- Latest deep bug node `2026-06-19T06-53-41-0400` found timing receipt id overwrite, repeated interaction completion events, duplicate collectible claim events, and generated request id collisions.
- Latest domain idea node `2026-06-19T07-01-13-0400` converted receipt bugs into receipt integrity planning inventory.
- State packets were used for context only. Live source, fetched refs, commands, public URLs, and Playwright output are authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- NexusEngine local branch `0.0.2` at `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits local branch `0.0.2` at `40d70b93bef6a0e88dadc48067aa4fd2844284f8`, matching `origin/0.0.2`; ahead/behind `0/0`.
- Experiments local branch `0.0.2` at `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f`, matching `origin/0.0.2`; ahead/behind `0/0`.
- Core package metadata remains `nexusengine@0.1.0`; raw public branch `0.0.2/package.json` is reachable.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Commands run
- NexusEngine: `npm run automation:preflight` -> passed; latest branch `0.0.2`; required GitHub/raw/jsDelivr links OK; optional npm metadata 404.
- NexusEngine/ProtoKits/Experiments: `git fetch --prune origin`, `git status --short --branch`, `git rev-parse HEAD`, `git rev-parse origin/0.0.2`, `git rev-list --left-right --count HEAD...origin/0.0.2`.
- NexusEngine: `npm test` -> passed 8 smoke tests.
- ProtoKits: `npm run check` -> passed syntax, import smoke, and listed test chain including `tests/fluid-water-kits.test.mjs`; targeted `node tests/dsk-first-wave.test.mjs` -> passed.
- Experiments: `npm run check` -> passed listed smoke chain after generating 100 flat route wrappers; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` -> passed.
- Experiments cleanup: validation-generated untracked flat-route wrapper directories were removed and generated formatting on tracked `experiments/tideglass-salvage/index.html` was restored; final sibling status was clean.
- Public URL checks: direct `curl -L -s -o /dev/null -w "%{http_code}"`.
- Human-view browser check: Playwright opened the public DSK proof route, captured visible text, screenshot, console, failed requests, and 404 responses; temporary `/tmp` screenshot was removed.
- Targeted `rg` and `git show origin/0.0.2:...` scans checked DSK imports, `engine.n.*`, public import maps, aggregate check scripts, first-wave ledger state, stale pins, docs boundaries, and proof coverage inventory.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200 by preflight.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200 by preflight.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200 by preflight.
- `https://registry.npmjs.org/nexusengine` -> 404 optional preflight link.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 200 by curl; Playwright-visible state remained `Booting...`.
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
- Ledger still says all first-wave kits install through `nexus-dsk-adapter`, return `defineDomainServiceKit()` objects, keep old injected-runtime calls as migration shims, and defer promotion into core.
- Direct-import aliases remain present: `createNZoneFieldKit`, `createNScanSurveyKit`, `createNRouteCheckpointKit`, `createNResourcePressureKit`, `createNHazardDirectorKit`, `createNTokenRegistryKit`, and `createNCompletionLedgerKit`.
- ProtoKits latest local validation now includes expanded fluid/water kit composition via `tests/fluid-water-kits.test.mjs`.
- Compatibility shim risk remains: old injected-runtime and legacy `engine.*` APIs are intentional migration support, but no removal condition was found in this scout pass.

## Experiment proof state
- Local targeted DSK proof passes: `node tests/dsk-first-wave-experiment-smoke.mjs`.
- Public proof route loads its HTML but remains human-visible stuck at `Booting...`.
- Playwright saw body text `DSK first-wave proof ... Booting...`, `#proof-status` as `Booting...`, and 404s for deployed sibling module paths.
- Fetched `origin/0.0.2` proof files still import from sibling relative paths:
  - import map maps `nexusengine` to `../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports `../../../../NexusEngine/src/index.js`.
  - `src/proof.js` imports ProtoKits from `../../../../NexusEngine-ProtoKits/protokits/...`.
- Experiments aggregate `npm run check` still does not list `tests/dsk-first-wave-experiment-smoke.mjs`; the DSK proof smoke remains targeted evidence.

## Domain and kit proof coverage
- Core DSK API smoke remains green through `tests/domain-service-kit-smoke.mjs`.
- ProtoKits first-wave service coverage is green locally and publicly raw-file visible, but public browser execution is not complete.
- Expanded ProtoKits fluid/water surfaces are now covered by latest local `npm run check`, not by the public first-wave proof route.
- Docs inventory now includes Proof Surface, Spatial Mobility Invariant, and Receipt Integrity domains plus proof coverage, spatial/mobility, and receipt-integrity proof kit ideas.
- Coverage categories remain separate: local command proof, latest-ref command proof, aggregate command proof, targeted DSK command proof, raw-public file proof, CDN import proof, npm availability, and browser-complete human proof.

## Runtime ownership drift
- `docs/how-to-protokit.md` and `docs/how-to-experiment.md` still keep core/ProtoKits/Experiments boundaries explicit.
- New reusable kit implementations should target ProtoKits by default.
- New playable/browser proofs should target Experiments by default.
- Core should stay focused on ECS/runtime/DSK/composer primitives, invariants, exports, and validation.
- Current proof blockers do not justify moving product routes or browser proof wiring into core.

## Broken/stale proof paths
- Broken public proof paths remain:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
- Stale public pins remain visible in Experiments scans, including `main` and `0.0.1` CDN references in legacy routes/configs.
- Branch/package mismatch remains: release branch `0.0.2` serves package version `0.1.0`.
- Optional npm metadata remains 404, so npm-backed consumption is not proven.

## Risks
- A public route returning HTTP 200 can still fail for users if module paths are not deployed.
- Aggregate Experiments validation can stay green while omitting the DSK first-wave proof smoke.
- Validation-generated flat-route wrappers can dirty Experiments unless cleanup is performed or the generator is made idempotent against tracked formatting.
- First-wave DSK migration proof should not be mistaken for production-hardening proof; DSK namespace, install rollback, dependency policy, spatial/mobility, operations data, and receipt integrity gates remain open.
- Compatibility shims may blur the difference between `engine.n.*` DSK APIs and legacy `engine.*` migration APIs.
- Public consumption language can overclaim if it does not distinguish GitHub/jsDelivr branch availability from npm registry availability.

## Blockers
- Public proof import-map/module source strategy is unresolved: CDN `0.0.2`, same-origin deployed assets, or build-step import mapping.
- `tests/dsk-first-wave-experiment-smoke.mjs` is not wired into Experiments aggregate validation or documented as a required targeted command.
- npm metadata for `nexusengine` is unavailable.
- DSK promotion hardening lacks executable fixture coverage for receipt identity and idempotency alongside earlier invariant gates.

## Suggested next review item
- Fix or choose the public module-loading strategy for `experiments/dsk-first-wave-proof/index.html` and `src/proof.js`, then wire/document `tests/dsk-first-wave-experiment-smoke.mjs` as required aggregate or targeted release evidence.

## Not claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not promote ProtoKits into core or retire compatibility shims.
- This packet does not claim DSK hardening blockers are fixed.
