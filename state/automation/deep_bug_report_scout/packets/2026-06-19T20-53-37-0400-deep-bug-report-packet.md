# Deep Bug Report Packet: 2026-06-19T20:53:37-04:00

Timestamp: 2026-06-19T20:53:37-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for AR launch capability contracts and spatial room read-model isolation

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-legacy-sequence-ar-dom-compat`.
- Recent deep packets already cover DSK install/scheduler failure boundaries, modern and legacy sequence cleanup/replay issues, AR lifecycle cleanup, AR raw DOM insertion, registry/surface aliasing, route query live-object mutation, and many domain-kit receipt/reset/id bugs.
- Latest ecosystem state/proof packets keep public module-source strategy as the shared proof blocker across fetched ProtoKits, fetched Experiments, and public browser proof.
- Latest DSK architecture and domain idea packets classify legacy compatibility and AR content-safety as hardening inventory separate from distribution proof.
- These packets were context only. Live source, docs, tests, preflight, git refs, and focused probes were authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404
- Current `HEAD` and `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- Ahead/behind against `origin/0.0.2`: `0 0`

## Current branch
- `0.0.2`, tracking `origin/0.0.2`
- Worktree had pre-existing modified/untracked automation and planning files before this run.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/ar-launcher.js`, `src/ar-device.js`, `src/ar-kit.js`, `src/ar-modes/fallback-preview.js`, `src/ar-modes/camera-overlay.js`, `src/ar-modes/page-marker.js`, `src/ar-modes/webxr-plane.js`, `src/ar-session.js`, `src/spatial-room-kit.js`, `src/greybox-building-kit.js`, `src/render-descriptor-kit.js`, `src/engine.js`, `src/ecs.js`, `src/surfaces.js`, `src/index.js`
- `tests/run-all.mjs`, `tests/public-api-freeze.mjs`, `tests/domain-service-kit-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan for AR launch fallback/stop/content safety, AR support state, preferred modes, live read models, and spatial room descriptor mutation.
- Inline Node probe: AR launch runtime without `createARKit()`.
  - Result: `createARLaunchRuntime({ engine })` returned a runtime, but `start()` threw `Cannot read properties of undefined (reading 'startSession')`.
- Inline Node probe: AR launcher support state aliasing.
  - Result: mutating `runtime.getState().support.supported` changed live `ARSupportState` to `"mutated"`.
- Inline Node probe: AR preferred mode fallback.
  - Result: `chooseARMode(device, ["unknown-mode"])` silently returned `fallback-preview` with reason `always_available`.
- Inline Node probe: SpatialRoom public getters.
  - Result: mutating `engine.spatialRoom.getActiveBuilding().rooms[0]` and `getAnchor("a")` changed live `SpatialRoomState`.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T19-54-18-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover AR selected-mode start fallback, camera-overlay partial stream cleanup, AR launch stop state cleanup, AR renderer raw HTML insertion, route query live-object mutation, spatial room descriptor normalization/source leaks, surface snapshot aliasing, and renderer/registry aliasing.
- No prior deep packet reported AR launch runtime missing-AR-kit precondition failures, mutable `getState().support` leaking into `ARSupportState`, preferred-mode lists being overridden by fallback, or SpatialRoom public getters returning live building/anchor state.

## Executive summary
- Current smoke tests still pass, but AR launch capability contracts and SpatialRoom read APIs have fresh precondition, fallback-policy, and read-model isolation gaps.
- `createARLaunchRuntime()` can be created against a plain engine without `createARKit()`, then throws during `start()` when mode code calls `engine.ar.startSession()`.
- `runtime.getState().support` returns the live `ARSupportState` object, so render/update consumers can mutate support truth while inspecting it.
- `chooseARMode()` silently falls back to `fallback-preview` even when callers supply an explicit preferred-mode list that excludes fallback or contains unknown modes.
- SpatialRoom `getActiveBuilding()` and `getAnchor()` return live objects, so public read calls can mutate world state despite the presence of a cloned `snapshot()` API.

## Deep bug reports

### 1. AR launch runtime does not enforce `createARKit()` precondition
- Severity: medium
- Owner: AR launch/runtime composition contract
- Evidence files and line references:
  - `src/ar-launcher.js:25-37` validates only that an engine exists.
  - `src/ar-launcher.js:87-98` calls the selected mode `start()` without checking `engine.ar`.
  - `src/ar-modes/fallback-preview.js:4-7` calls `engine.ar.startSession()`, `detectPlane()`, and `placeAnchor()` unguarded.
  - `src/ar-modes/camera-overlay.js:29-31` also calls `engine.ar.*` unguarded on success.
- Reproduction path: create a plain `createEngine()` with no AR kit, call `createARLaunchRuntime({ engine })`, then `runtime.start()`.
- Probe result: runtime creation succeeded, then `start()` threw `Cannot read properties of undefined (reading 'startSession')`.
- Expected behavior: launch runtime should reject missing AR kit up front or install/require the AR resources explicitly.
- Actual behavior: capability state can be written, then mode startup crashes later on `engine.ar`.
- Why it matters: host apps can pass preflight and create a launcher while missing the required runtime kit, causing QR/public AR pages to fail at start instead of reporting a clear composition error.
- Validation needed: AR launcher fixtures for plain engine, ARKit-installed engine, fallback-preview, camera-overlay, page-marker, and webxr-plane preconditions.
- Suggested fix direction: assert `engine.ar` and required AR resources/events during launcher creation, or make launcher install/compose `createARKit()` explicitly.
- Blocks DSK promotion: promotion-adjacent for AR proof composition and host integration diagnostics.

### 2. AR launcher state exposes mutable `ARSupportState`
- Severity: medium
- Owner: AR launch read-model isolation
- Evidence files and line references:
  - `src/ar-launcher.js:44-50` writes support state as a normal mutable object.
  - `src/ar-launcher.js:52-64` returns `support: engine.world.getResource(ARSupportState)` directly from `getState()`.
  - `src/ar-launcher.js:67-77` passes the same state object to `render` and `onUpdate`.
- Reproduction path: create an AR launch runtime, call `runtime.getState()`, mutate `state.support.supported`, then read `engine.world.getResource(ARSupportState)`.
- Probe result: `ARSupportState.supported` changed to `"mutated"` through the external state object.
- Expected behavior: launch state exposed to render/update consumers should be cloned or immutable.
- Actual behavior: observers can change AR support truth outside ECS/AR APIs.
- Why it matters: UI renderers, proof harnesses, and host update callbacks receive launch state for display but can accidentally corrupt support state and diagnostics.
- Validation needed: AR launcher state snapshot isolation fixtures for support, placement, objective, interactions, collectibles, and render descriptors.
- Suggested fix direction: return cloned/frozen read models from `getState()` and pass cloned state into `render`/`onUpdate`.
- Blocks DSK promotion: yes for browser/AR proof read-model integrity.

### 3. Explicit AR preferred-mode lists are overridden by fallback
- Severity: medium
- Owner: AR mode selection policy
- Evidence files and line references:
  - `src/ar-device.js:76-79` treats non-empty `preferredModes` as the requested set.
  - `src/ar-device.js:81` still returns `"fallback-preview"` when none of the requested modes are supported.
  - `src/ar-device.js:82-86` reports the fallback reason from device reasons, not that the caller's explicit request was unsupported/unknown.
- Reproduction path: call `chooseARMode(device, ["unknown-mode"])` or a device that only supports fallback with `preferredModes:["webxr-plane"]`.
- Probe result: unknown requested mode returned `{ mode:"fallback-preview", reason:"always_available" }`.
- Expected behavior: explicit mode lists should either be honored strictly or report a clear rejected/fallback diagnostic.
- Actual behavior: unsupported or misspelled explicit modes silently degrade to fallback.
- Why it matters: product pages that require WebXR/page-marker proof can look like they selected a valid fallback path while never exercising the requested AR capability.
- Validation needed: `chooseARMode()` fixtures for empty preferences, unsupported explicit modes, unknown modes, explicit fallback, and strict/no-fallback policy.
- Suggested fix direction: validate preferred mode names and return an explicit unsupported result unless fallback was requested or an option allows fallback.
- Blocks DSK promotion: promotion-adjacent for public proof claim accuracy.

### 4. SpatialRoom public getters expose live building and anchor objects
- Severity: medium
- Owner: spatial descriptor read-model isolation
- Evidence files and line references:
  - `src/spatial-room-kit.js:69-72` stores normalized buildings in live `SpatialRoomState`.
  - `src/spatial-room-kit.js:79-82` returns the live active building object.
  - `src/spatial-room-kit.js:88-90` returns live anchor objects from that building.
  - `src/spatial-room-kit.js:91-93` has a separate cloned `snapshot()` API, but normal getters bypass it.
- Reproduction path: install `createSpatialRoomKit()`, mutate the object returned by `getActiveBuilding()` and the object returned by `getAnchor(id)`, then inspect `SpatialRoomState`.
- Probe result: live state changed to `rooms[0].id:"mutated-room"` and anchor `x:99`.
- Expected behavior: read getters should return cloned read models or be named/documented as mutable mutation APIs.
- Actual behavior: read-named APIs mutate live spatial state by reference.
- Why it matters: AR placement, building renderers, proof panels, and host inspectors can corrupt room/anchor descriptors while reading them.
- Validation needed: SpatialRoom read API isolation fixtures for `getState()`, `getActiveBuilding()`, `getAnchor()`, `setActiveBuilding()`, and `snapshot()`.
- Suggested fix direction: make public getters return cloned/frozen descriptors, or restrict mutation to explicit setter/update APIs.
- Blocks DSK promotion: promotion-adjacent for spatial descriptor proof and AR placement reliability.

## Domain and kit expansion risks
- AR launch composition needs explicit required-kit/precondition diagnostics before public QR/AR proof routes rely on the launcher.
- AR support and mode selection need claim-safe read models and explicit fallback policy before browser proof can distinguish requested capability from degraded preview.
- Spatial room descriptor APIs need read-only snapshots for renderers and host inspectors, especially because spatial rooms feed AR placement and render descriptor flows.

## Cross-cutting risks
- Passing smoke tests does not cover AR launcher missing-kit preconditions, AR support read-model isolation, strict preferred-mode semantics, or SpatialRoom getter mutation.
- These bugs are separate from public module-source blockers; fixing imports would not prove AR launch correctness or descriptor read safety.
- Prior surface/query aliasing rows are related but not duplicates; this packet covers AR launch state and SpatialRoom public service getters.

## Missing validation
- AR launcher precondition tests with and without `createARKit()`.
- AR launcher `getState()` read-model isolation tests.
- AR preferred-mode strictness and unknown-mode diagnostics.
- SpatialRoom public getter isolation tests.
- Browser proof fixtures that assert fallback/degraded AR modes are labeled as fallback, not requested capability success.

## DSK promotion blockers
- Do not treat AR launcher creation as proof of AR readiness until required-kit preconditions are explicit.
- Do not expose launcher state to proof/render callbacks as mutable live resources.
- Do not use explicit AR preferred modes as claim evidence until unsupported requests cannot silently degrade to fallback.
- Do not let spatial/AR proof renderers read live room and anchor descriptors by mutable reference.

## Suggested next review item
- In a non-scout lane, add compact fixtures for AR launch preconditions, AR mode fallback policy, AR launch state isolation, and SpatialRoom getter isolation.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, DSK hardening, lifecycle parity, query/command semantics, experience-edge proof, read-model/orchestration isolation, compatibility/content-safety proof, or prior bug roots are fixed.
