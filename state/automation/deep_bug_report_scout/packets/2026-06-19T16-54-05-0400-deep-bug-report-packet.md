# Deep Bug Report Packet: 2026-06-19T16:54:05-04:00

Timestamp: 2026-06-19T16:54:05-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine guidance, affordance, and route query API side effects

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-locomotion-terrain-ar-lifecycle`.
- Recent deep packets already cover DSK transaction/scheduler failure boundaries, navigation/procedural/physics integrity, AR lifecycle cleanup, terrain spline query/chunk parity, repeated held movement receipts, content/profile validation, source-state leaks in dataset-heavy kits, and initial count inconsistencies in LandmarkGuidance and EnvironmentalAffordance.
- Latest ecosystem state/proof packets say core remains current and validation-green, while module-source strategy still blocks ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof.
- Latest DSK architecture packet orders hardening as runtime failure-boundary fixtures first, lifecycle parity fixtures second, experience-edge fixtures third, and public module-source proof separately.
- Latest domain idea packet maps lifecycle parity and cleanup rows into planning inventory.
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
- This lane wrote only this packet, its knowledge node, and the lane master tracker update.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `package.json`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/deep_bug_report_scout/PROMPT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/index.js`
- `src/ecs.js`
- `src/engine.js`
- `src/surfaces.js`
- `src/action-movement-kit.js`
- `src/world-physics-kit.js`
- `src/character-camera-kit.js`
- `src/interaction-kit.js`
- `src/landmark-guidance-kit.js`
- `src/environmental-affordance-kit.js`
- `src/route-field-kit.js`
- `src/transport-route-kit.js`
- `src/water-surface-kit.js`
- `tests/procedural-navigation-smoke.mjs`
- `tests/run-all.mjs`

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
- Existing-packet duplicate scan for LandmarkGuidance, EnvironmentalAffordance, entered/completed receipts, live query mutation, nearest markers, and route/affordance query state.
- Inline Node probe: inactive/completed landmark API calls.
  - Result: one inactive completed landmark still emitted 1 `LandmarkDiscovered`, 1 `LandmarkReached`, and 1 `LandmarkActivated` after `discover()`, `reach()`, and `complete()`.
- Inline Node probe: repeated EnvironmentalAffordance proximity queries.
  - Result: three unchanged `nearby({x:0,y:0})` calls emitted 3 `AffordanceEntered` records.
- Inline Node probe: missing EnvironmentalAffordance activation.
  - Result: `activate("missing")` emitted no activation but set `activeAffordanceId:"missing"` and `lastEvent.affordance:null`.
- Inline Node probe: RouteField query result mutation.
  - Result: mutating `routeField.nearestMarker(...).marker.x` and `.metadata` changed live `RouteFieldState.markers[0]`.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T15-53-59-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover initial LandmarkGuidance/EnvironmentalAffordance count inconsistencies, SpatialScale entry suppression, InteractionTarget repeated completion, dataset metadata reference leaks, and route-field nested metadata reset leakage.
- No prior deep packet reported inactive/completed LandmarkGuidance APIs emitting transition receipts, EnvironmentalAffordance `nearby()` repeatedly emitting entered receipts for the same stationary affordance, missing affordance activation corrupting `activeAffordanceId`, or RouteField public query results exposing live marker objects for top-level mutation.

## Executive summary
- Current smoke tests still pass, but guidance/affordance/route query APIs have fresh state and receipt side effects.
- LandmarkGuidance mutation APIs ignore inactive/completed terminal state and emit transition receipts for a landmark that should be out of the active flow.
- EnvironmentalAffordance `nearby()` behaves like a query but emits `AffordanceEntered` every call for the same nearby affordance.
- EnvironmentalAffordance `activate("missing")` records a missing id as active state even though no affordance changed.
- RouteField `nearestMarker()` returns a live marker object; callers can mutate route state outside the kit API.

## Deep bug reports

### 1. LandmarkGuidance emits transition receipts for inactive completed landmarks
- Severity: medium
- Owner: spatial guidance terminal-state and receipt semantics
- Evidence files and line references:
  - `src/landmark-guidance-kit.js:22-25` preserves `active`, `discovered`, `reached`, and `completed` flags.
  - `src/landmark-guidance-kit.js:43-45` excludes inactive/completed landmarks from nearest active guidance.
  - `src/landmark-guidance-kit.js:85-121` updates any matching id in `discover()`, `reach()`, and `complete()` without rejecting inactive or already-completed landmarks.
- Reproduction path: create `createLandmarkGuidanceKit({ landmarks:[{ id:"a", active:false, discovered:true, reached:true, completed:true }] })`, subscribe to landmark event surfaces, call `discover("a")`, `reach("a")`, and `complete("a")`, then tick.
- Probe result: the inactive completed landmark emitted one `LandmarkDiscovered`, one `LandmarkReached`, and one `LandmarkActivated`; state also set `activeLandmarkId:"a"` during `reach()`.
- Expected behavior: inactive/completed landmarks should either reject state-changing calls, return a no-op diagnostic, or emit distinct duplicate/terminal receipts.
- Actual behavior: public APIs re-emit normal transition events for terminal inactive data.
- Why it matters: guidance, objective, AR training, and telemetry consumers can count completed/inactive landmarks as newly discovered, reached, or activated.
- Validation needed: LandmarkGuidance fixtures for inactive, already-discovered, already-reached, already-completed, missing, duplicate id, reset, and event-count behavior.
- Suggested fix direction: track previous flags and active/terminal state before mutation; emit only on false-to-true transitions or return explicit no-op results.
- Blocks DSK promotion: promotion-adjacent for spatial guidance domains.

### 2. EnvironmentalAffordance `nearby()` emits `AffordanceEntered` on every unchanged query
- Severity: medium
- Owner: proximity query versus entered-transition semantics
- Evidence files and line references:
  - `src/environmental-affordance-kit.js:42-49` computes nearby affordance results from current state.
  - `src/environmental-affordance-kit.js:74-80` stores `activeAffordanceId` and emits `AffordanceEntered` whenever a first result exists.
  - `src/environmental-affordance-kit.js:30-38` initializes no prior inside/entered state beyond `activeAffordanceId`.
- Reproduction path: create one affordance at `(0,0)`, subscribe to `AffordanceEntered`, call `nearby({x:0,y:0})` three times, then tick.
- Probe result: three identical queries emitted 3 `AffordanceEntered` records.
- Expected behavior: query APIs should be side-effect-free, or entered receipts should emit only when the active/inside affordance changes from outside to inside.
- Actual behavior: a passive proximity query doubles as a repeated transition event source.
- Why it matters: AR/object inspection/tutorial systems can overcount a stationary hover/proximity query as multiple entries, and proof harnesses cannot separate query refreshes from movement transitions.
- Validation needed: EnvironmentalAffordance fixtures for repeated same-position query, entered/exited transitions, active target changes, completed affordance filtering, and query-only snapshots.
- Suggested fix direction: split `nearby()` from transition processing, or compare previous active/inside state before emitting `AffordanceEntered`.
- Blocks DSK promotion: promotion-adjacent for spatial interaction and proximity domains.

### 3. EnvironmentalAffordance missing activation corrupts active state
- Severity: medium
- Owner: affordance command validation
- Evidence files and line references:
  - `src/environmental-affordance-kit.js:82-90` leaves `changed` null when no matching affordance exists.
  - `src/environmental-affordance-kit.js:91-92` still writes `activeAffordanceId: affordanceId` and `lastEvent.affordance:null`.
  - `src/environmental-affordance-kit.js:93-96` suppresses emitted events when nothing changed, so the state mutation has no receipt.
- Reproduction path: create one affordance with id `door`, call `activate("missing", 1)`, then inspect `EnvironmentalAffordanceState`.
- Probe result: no activation/completion events emitted, but state became `activeAffordanceId:"missing"` with `lastEvent:{ type:"activated", affordance:null }`.
- Expected behavior: unknown ids should leave active state unchanged and return an explicit rejected/no-op result.
- Actual behavior: invalid commands can move active state to a nonexistent affordance.
- Why it matters: prompts, focus state, tutorials, and proof harnesses can point users or validators at a target that does not exist.
- Validation needed: affordance activation fixtures for missing ids, inactive ids, completed ids, duplicate ids, zero/negative amounts, and rejected-command receipts.
- Suggested fix direction: compute `changed` first; only update active state and last event for accepted activations, or add explicit rejected command state.
- Blocks DSK promotion: yes for command-driven affordance services that expose active target state.

### 4. RouteField public nearest-marker query returns live mutable marker objects
- Severity: medium
- Owner: route query snapshot isolation
- Evidence files and line references:
  - `src/route-field-kit.js:44-50` returns `{ marker, distance }` where `marker` is the live object from `state.markers`.
  - `src/route-field-kit.js:66-70` stores that same result in `lastQuery` and returns it to the caller.
  - `src/route-field-kit.js:91-92` exports `queryNearestRouteMarker()` with the same live-object behavior.
- Reproduction path: call `engine.routeField.nearestMarker({x:0,y:0})`, mutate `result.marker.x` and `result.marker.metadata`, then inspect `RouteFieldState`.
- Probe result: `RouteFieldState.markers[0].x` changed to `999` and metadata gained `external:true` without calling `setMarkerActive()` or reset.
- Expected behavior: public query results should be immutable snapshots or cloned data.
- Actual behavior: external callers can mutate route-field state through a query result.
- Why it matters: route selection, scenario validation, telemetry, and replay proof can be corrupted by renderer/UI/debug code that treats query results as local objects.
- Validation needed: query isolation fixtures for RouteField markers/corridors, LandmarkGuidance nearest results, EnvironmentalAffordance nearby results, WaterSurface query output, and exported pure query helpers.
- Suggested fix direction: return cloned marker/corridor records from query APIs and store cloned `lastQuery` snapshots.
- Blocks DSK promotion: promotion-adjacent for route/mobility services.

## Domain and kit expansion risks
- Spatial guidance services need terminal-state and duplicate-action semantics before proof consumers can trust discovery/reach/activation events.
- Proximity services need a query-versus-transition contract so passive polling cannot emit repeated entry receipts.
- Command-driven affordance services need accepted/rejected command state and should not corrupt active ids on unknown targets.
- Route/query services need snapshot isolation so host UI and renderers cannot mutate core state through read APIs.

## Cross-cutting risks
- Passing smoke tests does not cover query side effects, terminal-state event idempotency, missing-command active-state corruption, or read API immutability.
- These bugs are distinct from public module-source blockers; fixing browser imports would not prove query/receipt correctness.
- Prior dataset metadata leakage findings remain related but narrower: this packet adds top-level live-object mutation through public query return values.

## Missing validation
- LandmarkGuidance terminal-state idempotency and event-count fixtures.
- EnvironmentalAffordance repeated query versus entered-transition fixtures.
- EnvironmentalAffordance rejected activation fixtures.
- RouteField query snapshot isolation fixtures.
- Cross-kit query immutability fixtures for every public `nearest`, `nearby`, and `query*` helper.

## DSK promotion blockers
- Do not promote spatial guidance or affordance DSKs until terminal-state and missing-command semantics are explicit.
- Do not use proximity event surfaces as proof evidence until query refreshes and entered transitions are separated.
- Do not rely on route query outputs as replay/proof state until public query APIs return isolated snapshots.

## Suggested next review item
- In a non-scout lane, add a compact query/command semantics fixture set covering LandmarkGuidance terminal calls, EnvironmentalAffordance repeated nearby/missing activation, and RouteField query isolation.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, DSK hardening, lifecycle parity, experience-edge proof, or prior bug roots are fixed.
