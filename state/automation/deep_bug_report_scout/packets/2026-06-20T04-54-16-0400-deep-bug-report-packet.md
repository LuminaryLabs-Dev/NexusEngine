# Deep Bug Report Packet: 2026-06-20T04:54:16-04:00

Timestamp: 2026-06-20T04:54:16-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for public query/read-model isolation across request, cargo, landmark, affordance, hazard, and water helpers

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-20-fishing-boundary-identity-content`.
- Recent deep packets already cover Fishing/ReefRescue content boundaries, runtime identity/lifecycle ownership, duplicate provider/binding diagnostics, SequenceNode registry/history/install lifecycle, AR launch source mismatches, legacy sequence replay, AR raw DOM insertion, registry/surface snapshot aliasing, RouteField live nearest-marker queries, and WaterSurface/RouteField nested source-config leaks.
- Latest ecosystem state/proof packets keep module-source/public browser proof blocked separately from local runtime hardening; public DSK proof remains a module-source issue, not evidence that query read models are safe.
- Latest DSK architecture packet keeps content-boundary/objective rows, runtime identity/lifecycle rows, and read-model isolation as hardening inventory after base runtime failure-boundary work.
- Latest domain idea packet maps content-boundary/objective findings into planning inventory and keeps query snapshot isolation as an existing family.
- State packets were context only. Live source, docs, tests, preflight, git refs, duplicate scans, and focused probes were authority for this run.

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
- Worktree had pre-existing modified docs/automation trackers and many untracked prior automation artifacts before this run.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/request-fulfillment-kit.js`, `src/cargo-manifest-kit.js`, `src/landmark-guidance-kit.js`, `src/environmental-affordance-kit.js`, `src/hazard-field-kit.js`, `src/water-surface-kit.js`, `src/route-field-kit.js`, `src/index.js`, `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified docs/automation trackers and untracked prior automation artifacts.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan for RouteField, WaterSurface, query snapshot isolation, `nearestOpen`, `queryNearestOpenRequest`, `queryNearestCargo`, `queryNearestLandmark`, `queryNearbyAffordances`, `queryHazardCircle`, and query result mutation.
- Inline Node probe: engine query methods for RequestFulfillment, CargoManifest, LandmarkGuidance, RouteField, and WaterSurface.
  - Result: mutating returned request/cargo/landmark/route/water-hazard objects changed live state or stored live `lastQuery` objects.
- Inline Node probe: exported pure query helpers.
  - Result: mutating nested `metadata` or `hazard` objects from `queryNearestOpenRequest`, `queryNearestCargo`, `queryNearestLandmark`, `queryNearbyAffordances`, `queryHazardCircle`, and `queryWaterSurface` changed caller-owned source state.

## Existing bug packets checked
- Prior deep packets through `2026-06-20T03-55-08-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover RouteField live nearest-marker results, event/resource surface snapshot aliasing, SpatialRoom live getters, shader/material descriptor aliasing, WaterSurface/RouteField source-config leaks, and broad query snapshot isolation as a future fixture row.
- No prior deep packet isolated RequestFulfillment/CargoManifest engine query results, public exported helper shallow clones, LandmarkGuidance engine nearest result, HazardField collision query results, or WaterSurface hazard arrays as current live-object read-model hazards.

## Executive summary
- Current smoke tests still pass, but public query/read-model surfaces remain mutable by callers.
- `RequestFulfillment.nearestOpen()` and `CargoManifest.nearestAvailable()` return live request/item objects; Cargo `availableItems()` returns live lists too.
- `queryNearestOpenRequest()`, `queryNearestCargo()`, `queryNearestLandmark()`, `queryNearbyAffordances()`, and `queryHazardCircle()` shallow-copy only the top-level record, so nested `metadata` remains shared with caller state.
- `WaterSurface.query()` and `queryWaterSurface()` return live hazard objects from matching zones, and the engine stores that same mutable result as `lastQuery`.
- `LandmarkGuidance.nearest()` stores and returns the live landmark result, extending the older RouteField read-model issue to another guidance surface.

## Deep bug reports

### 1. RequestFulfillment query results expose live request metadata through engine and exported helpers
- Severity: medium
- Owner: request/logistics query read models
- Evidence files and line references:
  - `src/request-fulfillment-kit.js:25` stores `metadata` by reference during normalization.
  - `src/request-fulfillment-kit.js:74-80` builds nearest results with the live `request` object.
  - `src/request-fulfillment-kit.js:110-111` returns that live nearest result from `engine.requestFulfillment.nearestOpen()`.
  - `src/request-fulfillment-kit.js:144-146` shallow-copies the request in `queryNearestOpenRequest()` but keeps nested metadata references.
- Reproduction path: query nearest open request, mutate `result.request.metadata.nested.value`, then inspect source state.
- Probe result: engine query mutation changed live `RequestFulfillmentState.requests[0].metadata.nested.value` to `42`; exported helper mutation changed caller state to `10`.
- Expected behavior: query APIs should return clone/frozen read models or clearly document mutable live-state handles.
- Actual behavior: public read queries expose mutable request objects or nested request metadata.
- Why it matters: route planners, proof dashboards, and AI adapters can corrupt request state while only reading nearest work.
- Validation needed: request query isolation fixtures for engine method, exported helper, nested metadata, returned distance, and last-event payloads.
- Suggested fix direction: structured-clone or freeze returned query records, and keep exported helpers deep-clone-safe.
- Blocks DSK promotion: promotion-adjacent for logistics read-model proof.

### 2. CargoManifest read APIs return live item records and shallow exported clones
- Severity: medium
- Owner: cargo/logistics query read models
- Evidence files and line references:
  - `src/cargo-manifest-kit.js:31` stores `metadata` by reference during normalization.
  - `src/cargo-manifest-kit.js:77-85` returns available item objects directly in nearest calculations.
  - `src/cargo-manifest-kit.js:103-109` exposes live item arrays from `availableItems()` and live nearest item entries from `nearestAvailable()`.
  - `src/cargo-manifest-kit.js:179-181` shallow-copies the item in `queryNearestCargo()` while preserving nested metadata references.
- Reproduction path: call `engine.cargoManifest.nearestAvailable()` and `engine.cargoManifest.availableItems()`, mutate returned nested metadata, then inspect `CargoManifestState`.
- Probe result: nearest result mutation changed live cargo metadata to `55`; available list mutation changed it to `66`; exported helper mutation changed caller state to `20`.
- Expected behavior: read APIs should not mutate manifest state unless a command like `pickUp()` or `deposit()` is called.
- Actual behavior: callers can mutate cargo state through read results without command receipts, capacity checks, or condition events.
- Why it matters: inventory UIs and proof agents can alter item metadata outside the manifest command contract.
- Validation needed: cargo read-model fixtures for `availableItems`, `nearestAvailable`, `queryNearestCargo`, nested metadata, and carried/deposited item result isolation.
- Suggested fix direction: return cloned items from read APIs and keep command APIs as the only mutation path.
- Blocks DSK promotion: promotion-adjacent for logistics proof and inventory safety.

### 3. LandmarkGuidance and EnvironmentalAffordance exported query helpers shallow-copy nested metadata
- Severity: medium
- Owner: spatial guidance and affordance query read models
- Evidence files and line references:
  - `src/landmark-guidance-kit.js:26` stores landmark metadata by reference.
  - `src/landmark-guidance-kit.js:47-52` builds nearest results with the live landmark object.
  - `src/landmark-guidance-kit.js:79-83` stores and returns the live query as `lastQuery`.
  - `src/landmark-guidance-kit.js:137-139` shallow-copies the landmark in `queryNearestLandmark()`.
  - `src/environmental-affordance-kit.js:26` stores affordance metadata by reference.
  - `src/environmental-affordance-kit.js:42-49` builds nearby results with live affordance objects.
  - `src/environmental-affordance-kit.js:112-113` shallow-copies affordances in `queryNearbyAffordances()`.
- Reproduction path: mutate metadata nested under engine `landmarkGuidance.nearest()` and exported helper results.
- Probe result: engine landmark query mutation changed live state and `lastQuery` to `77`; exported landmark helper changed caller state to `30`; exported affordance helper changed caller state to `40`.
- Expected behavior: public proximity/guidance read helpers should return isolated read models.
- Actual behavior: top-level spread cloning leaves nested metadata shared, and the engine landmark query returns the live object directly.
- Why it matters: spatial guidance and AR inspection surfaces can corrupt authored metadata while computing nearest/nearby readouts.
- Validation needed: landmark/affordance query isolation fixtures for engine methods, exported helpers, nested metadata, `lastQuery`, and transition events.
- Suggested fix direction: deep-clone/freeze query records, or explicitly split mutable internal state from external read snapshots.
- Blocks DSK promotion: promotion-adjacent for spatial/AR read-model proof.

### 4. HazardField and WaterSurface public query helpers leak nested hazard objects
- Severity: medium
- Owner: hazard/water read-model isolation
- Evidence files and line references:
  - `src/hazard-field-kit.js:55` stores hazard metadata by reference.
  - `src/hazard-field-kit.js:148-156` returns live hazard objects from `circleCollisions()`.
  - `src/hazard-field-kit.js:180-188` stores live collisions in `lastCollision` and returns them from `checkCircle()`.
  - `src/hazard-field-kit.js:203-204` shallow-copies hazards in `queryHazardCircle()`, preserving nested metadata.
  - `src/water-surface-kit.js:23` stores `hazard` by reference on zones.
  - `src/water-surface-kit.js:41-64` returns matching zone hazard objects directly from `querySurface()`.
  - `src/water-surface-kit.js:91-95` stores the same query result as `lastQuery`, and `src/water-surface-kit.js:110-111` exports it unchanged.
- Reproduction path: mutate nested metadata/hazard values from `engine.hazardField.checkCircle()`, `queryHazardCircle()`, `engine.waterSurface.query()`, and `queryWaterSurface()`.
- Probe result: exported hazard helper mutation changed caller state to `50`; water query/helper mutation changed live/caller zone hazard values to `77` and `60`.
- Expected behavior: collision and water-zone queries should return immutable read models, not live hazard descriptors.
- Actual behavior: hazard and water queries leak nested hazard objects and can persist those leaked objects into `lastCollision`/`lastQuery`.
- Why it matters: collision inspectors, water simulation UI, and proof agents can alter hazard metadata without spawning/collision command receipts.
- Validation needed: hazard/water query isolation fixtures for engine methods, exported helpers, nested metadata, `lastCollision`, `lastQuery`, and reset behavior.
- Suggested fix direction: clone/freeze collision and water query results; store cloned read models for `lastCollision` and `lastQuery`.
- Blocks DSK promotion: promotion-adjacent for hazard/water proof and read-model integrity.

## Domain and kit expansion risks
- Query snapshot isolation should cover every exported read helper, not only RouteField and engine surfaces.
- Logistics and spatial proof routes need a consistent rule: query methods return isolated read models; command methods mutate state and emit receipts.
- Shallow top-level spread cloning is not enough for metadata-heavy authored datasets.
- `lastQuery` and `lastCollision` fields should be treated as proof snapshots, not aliases to mutable caller results.

## Cross-cutting risks
- Passing smoke tests does not cover query-result mutation, nested metadata aliasing, or `lastQuery`/`lastCollision` isolation.
- This does not replace earlier source-state isolation bugs; those cover caller-owned config/reset leakage. This packet covers public read APIs and exported helper return values.
- This does not fix public module-source proof; fetched/browser failures remain separate distribution blockers.

## Missing validation
- Public exported query helper isolation fixtures for request, cargo, landmark, affordance, hazard, and water.
- Engine query method isolation fixtures for RequestFulfillment, CargoManifest, LandmarkGuidance, HazardField, and WaterSurface.
- `lastQuery`/`lastCollision` clone/freeze fixtures.
- Nested metadata and nested hazard clone/freeze fixtures across generic DSK read surfaces.

## DSK promotion blockers
- Do not treat query helper output as proof-safe until nested metadata/hazard values are isolated.
- Do not promote logistics/spatial/hazard/water read models while read-only calls can mutate runtime or caller state.
- Do not use `lastQuery`/`lastCollision` as audit evidence until they are snapshots rather than aliases.

## Suggested next review item
- In a non-scout lane, add one compact query-read-model fixture that mutates returned nested metadata from all exported `query*` helpers and engine read methods, then harden clone/freeze behavior consistently.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, DSK hardening, query-read-model hardening, source-state isolation hardening, or any prior bug root is fixed.
