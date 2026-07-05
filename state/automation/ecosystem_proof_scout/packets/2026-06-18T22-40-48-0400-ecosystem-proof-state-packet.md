# Ecosystem Proof State Packet

Timestamp: 2026-06-18T22:40:48-0400
Automation: Nexus Engine: Ecosystem Proof State Packet
Scope: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
Result: partial; local and raw `0.0.2` proof remains green, public browser proof route still fails at runtime

## Latest branch
- NexusEngine preflight resolved `latestReleaseBranch: 0.0.2`.
- NexusEngine remote release branches: `0.0.1`, `0.0.2`, `main`; local branch `0.0.2` at `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`, matching `origin/0.0.2`; ahead/behind `0/0`.
- ProtoKits remote branches include `0.0.1`, `0.0.2`, `main`, `reaction-feedback-0.0.2`, `reaction-feedback-temp`; local branch `0.0.2` at `87888c9c0aa5b4dff67bd3438fe897ee22a95a7b`, matching `origin/0.0.2`; ahead/behind `0/0`.
- Experiments remote branches include `0.0.1`, `0.0.2`, `0.0.2-mirror-probe`, `main`; local branch `0.0.2` at `056a12f4f786e61326417943682fcae29cc254e1`, matching `origin/0.0.2`; ahead/behind `0/0`.
- NexusEngine worktree already contains unrelated automation/docs changes outside this lane; ProtoKits and Experiments worktrees were clean.

## Repos inspected
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`
- `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Commands run
- NexusEngine: `git fetch --prune origin`.
- ProtoKits: `git fetch --prune origin`.
- Experiments: `git fetch --prune origin`.
- NexusEngine: `npm run automation:preflight` -> passed; required public links OK; optional npm metadata returned 404.
- NexusEngine: `npm test` -> passed 8 smoke tests.
- ProtoKits: `npm run check` -> passed syntax, import smoke, and ProtoKit test chain including DSK/domain tests.
- Experiments: `npm run check` -> passed syntax/static/content/proof checks; static smoke warnings remain for legacy HTML pages and exited 0.
- Branch checks: `git status --short --branch`, `git rev-parse`, `git rev-list --left-right --count HEAD...origin/0.0.2`, `git ls-remote --heads origin`, `git ls-tree -r --name-only origin/0.0.2`.
- Evidence searches: targeted `rg`/file reads for DSK aliases, `engine.n.*`, first-wave ledger, import maps, stale branch pins, renderer/runtime ownership, and idea/proof coverage.
- Human-view check: Playwright CLI opened the public DSK proof route; snapshot showed `Booting...`, network requests showed 404 module loads, and generated `.playwright-cli` scratch artifacts were removed after evidence capture.

## Public links checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200.
- `https://registry.npmjs.org/nexusengine` -> 404; optional preflight link.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/` -> 200.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 200 by curl, but Playwright-visible proof remains stuck at `Booting...`.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200.
- Public proof runtime dependency paths still return 404:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`

## ProtoKits migration state
- Direct-import DSK adapter remains present at `protokits/nexus-dsk-adapter/index.js`, imports bare `nexusengine`, and is present on `origin/0.0.2`.
- Adapter still supports both direct-import and old injected-runtime call modes; it wraps first-wave kits into `defineDomainServiceKit()` when the runtime exposes that API.
- First-wave `createN...Kit` aliases remain present for zone-field, scan-survey, route-checkpoint, resource-pressure, hazard-director, token-registry, and completion-ledger.
- `docs/DSK-FIRST-WAVE-LEDGER.md` is present locally and on raw `0.0.2`; it says no first-wave kit is half migrated and promotion into core is deferred until a separate readiness pass chooses a candidate and thin shim removal condition.
- `tests/dsk-first-wave.test.mjs` still proves direct `createN...Kit()` use, legacy compatibility calls, `engine.n.*` install, compatibility `engine.*` APIs, serializable snapshots, and missing-token failure.

## Experiment proof state
- Local `experiments/dsk-first-wave-proof/` exists, is present in `origin/0.0.2`, and is covered by `tests/dsk-first-wave-experiment-smoke.mjs`.
- The proof composes first-wave `createN...Kit()` aliases through `createRealtimeGame()`, ticks the engine, and reads promoted APIs under `engine.n.*`.
- Experiments `npm run check` passes the DSK first-wave smoke locally.
- Public raw proof files exist, and the GitHub Pages route returns HTTP 200.
- Public GitHub Pages proof route is not a working browser proof: Playwright snapshot showed `Booting...`; requests for sibling `NexusEngine` and `NexusEngine-ProtoKits` module paths returned 404.
- Import-map/source issue remains visible in the current files:
  - `experiments/dsk-first-wave-proof/index.html` maps bare `nexusengine` to `../../../NexusEngine/src/index.js`.
  - `experiments/dsk-first-wave-proof/src/proof.js` imports `../../../../NexusEngine/src/index.js` and sibling ProtoKits paths.

## Domain and kit proof coverage
- Described example docs now exist in core under `examples/described-examples/`, but these are advisory docs, not executable proof routes.
- Existing core tests cover several reusable domains indirectly, including procedural/navigation, management/logistics, water/vehicle/recovery, scenario driver, resource pressure, timing windows, and telemetry.
- Current public proof route only validates first-wave DSK service APIs: `zoneField`, `scanSurvey`, `routeCheckpoint`, `resourcePressure`, `hazardDirector`, and `completionLedger`.
- Idea domains with no exact executable proof-path match found by this run's filename/token scan: `world-space`, `boundary`, `object-inspection`, `mobility`, and `replicated-state`.
- Kit ideas with no exact core/ProtoKit/Experiment match found: `world-space-kit`, `boundary-policy-kit`, `glass-boundary-kit`, `terrain-data-kit`, `terrain-streaming-kit`, `terrain-renderer-kit`, `water-volume-kit`, `fish-school-kit`, `locomotion-kit`, and `object-inspection-kit`.
- Kit ideas with core implementations but no ProtoKit/Experiment proof path found include `spatial-scale-kit`, `forest-placement-kit`, `fish-tank-kit`, `water-surface-kit`, `pathfinding-kit`, `vehicle-dynamics-kit`, `tree-runner-kit`, `interaction-target-kit`, `symbol-alignment-kit`, `lock-and-socket-kit`, `reveal-light-kit`, `cargo-manifest-kit`, `request-fulfillment-kit`, `request-queue-kit`, `facility-operations-kit`, `hazard-field-kit`, `timing-window-kit`, `scenario-driver-kit`, and `telemetry-kit`.
- Coverage classification is filename/token based and should be treated as a scout map, not a final architecture audit.

## Runtime ownership drift
- No new DSK proof renderer-vs-runtime drift was found; the DSK proof route is runtime/API-only and renderer presentation is limited to page text.
- Core still owns the generic DSK contract; ProtoKits owns first-wave DSK implementations/adapters; Experiments owns the proof page and route smoke.
- DSK hardening risks from the neighboring architecture lane still apply before broad promotion: `engine.n` namespace safety, failed-install atomicity, direct dependency policy, and enforceable state contract coverage.
- Broader Experiments routes still mix public `@main` and `@0.0.1` CDN pins with local fallback paths; these are not the DSK proof blocker but can blur latest-release proof claims.

## Broken/stale proof paths
- Public DSK proof route remains HTTP-visible but runtime-broken because browser module imports resolve to missing sibling GitHub Pages paths.
- Optional npm package metadata still returns 404, so npm consumption remains unproved.
- ProtoKits README/docs/demos still contain many `@main` public CDN examples and some `@0.0.1` examples outside the new DSK import-map guidance.
- Experiments still contains stale or non-latest pins in routes/configs including `games/signal-bastion`, `games/next-ledge-grapple`, `experiments/the-open-above`, `experiments/the-open-above-v2`, `experiments/next-ledge`, `experiments/fogline-relay`, `experiments/zombie-orchard`, and shared domain-foundation config.

## Risks
- A reviewer can still mistake route HTTP 200 and raw file availability for a working public browser proof.
- Local tests import sibling workspace files and do not exercise GitHub Pages module resolution.
- Compatibility shims keep direct-import, injected-runtime, `engine.n.*`, and legacy `engine.*` APIs alive; removal criteria are not yet proven.
- Expansion idea docs now imply many future DSK surfaces, but only a narrow first-wave subset has a public proof route.

## Blockers
- Public DSK proof route must load NexusEngine and ProtoKits from public-safe URLs, same-origin deployed assets, or a build-step import map before a public browser proof can be claimed.
- Scout lane rules did not allow source fixes, publishing, package metadata edits, public claim edits, or new tests.

## Suggested next review item
- Review and choose the public module-loading strategy for `experiments/dsk-first-wave-proof/index.html` and `experiments/dsk-first-wave-proof/src/proof.js`: CDN `0.0.2`, deployed same-origin assets, or a build-step mapping.

## Not claimed
- No source, tests, docs, package metadata, memory, release branches, public claims, or proof routes were fixed.
- No deployment, push, release, npm publication, or package publication was performed.
- HTTP 200 for the public proof route is not claimed as a working browser proof.
