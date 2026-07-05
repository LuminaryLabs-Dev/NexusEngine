# Deep Bug Report Packet: 2026-06-19T09:54:20-04:00

Timestamp: 2026-06-19T09:54:20-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-config-ledger-pursuit-state`.
- Earlier deep packets already cover invalid SequenceNode deployment side effects, terrain cache retention, stale AR failure sessions, DSK install atomicity, SequenceNode boot/frame order, default camera crash, ActionMovementKit killY masking, duplicate direct kit ids, cleanup event lifetime, disposed SequenceNode mutation, renderer fallback mismatch, request/economy order, request defaults, cargo negative value, telemetry `historyLimit:0`, assistance/transfer/spatial-progress/input state machines, objective reset/completion, lifecycle accepted mutation, transport catch-up, schedule scale normalization, occupant reset/id uniqueness, facility/economy non-finite ledgers, resource-pressure restored-state contradictions, SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, VehicleDynamics zero-capacity boost activation, receipt identity/event idempotency/request-id bugs, AR/objective bridge phase, wrapper state ownership, dataset/reset leakage, Economy ledger zero retention, and PursuitPressure initial caught-state contradictions.
- Neighboring ecosystem state packet `2026-06-19T09-12-09-0400` says core and ProtoKits remain release-aligned and validation-green, while Experiments latest-ref validation, browser-complete public proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening/source-state gates remain open.
- Neighboring DSK architecture packet/node `2026-06-19T09-25-20-0400` keeps source-state integrity, namespace, install, dependency, state-contract, service-call, operations, spatial/mobility, receipt, bridge, step, and wrapper-state gates open.
- Neighboring ecosystem proof packet/node `2026-06-19T09-44-04-0400` keeps public browser proof stuck at `Booting...`, separates target/local proof from public proof, and points proof route ownership to Experiments.
- Neighboring domain idea packet/node `2026-06-19T09-00-53-0400` maps source-state integrity into authored-source isolation, reset-source policy, retention-limit policy, initial-terminal receipts, and proof rows.
- These packets were used for context only. Live source, docs, tests, probes, and preflight are authority for this run.

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
- This lane wrote only:
  - `state/automation/deep_bug_report_scout/packets/2026-06-19T09-54-20-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T09-54-20-0400-deep-bug-node.md`
  - `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`

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
- Latest three current-lane packets and nodes.
- Latest neighboring packets and nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/forest-placement-kit.js`
- `src/interaction-kit.js`
- `src/shrine-puzzle-kit.js`
- `src/light-combat-kit.js`
- `src/scenario-driver-kit.js`
- `src/camera-occlusion-kit.js`
- `src/world-physics-kit.js`
- `src/companion-command-kit.js`
- `src/corruption-world-kit.js`
- `src/reef-rescue-kit.js`
- `src/spatial-room-kit.js`
- `src/tree-runner-kit.js`
- `tests/procedural-navigation-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan for `ForestPlacement`, `Interaction`, `Shrine`, `LightCombat`, `ScenarioDriver`, `CameraOcclusion`, `routeLength`, and related invariant terms.
  - Result: no prior deep packet reported ForestPlacement same-length route invalidation, base Interaction held gather/activate repeats, Shrine charged-repeat receipts, LightCombat initial zero-health inconsistency, ScenarioDriver `z`-axis steering, or CameraOcclusion cumulative `lookAt` mutation.
- Inline Node probe: ForestPlacement route invalidation.
  - Result: changing route contents from far away to same-length route through focus left signature unchanged, version `1`, and descriptor count unchanged at `2`.
- Inline Node probe: Interaction held gather/activate.
  - Result: holding `gather:true` and `activate:true` for three ticks emitted three `interaction-gathered` and three `interaction-activated` batches; inventory rose to `3`.
- Inline Node probe: Shrine charged repeat.
  - Result: with enough relic seeds and companion arrived, three ticks emitted three `shrine-charged` batches while state stayed `{ charged:true, opened:false }`.
- Inline Node probe: LightCombat initial zero health.
  - Result: `createLightCombatKit({ enemyHealth:0 })` initialized `{ enemyHealth:0, enemyDefeated:false }`; one tick emitted no defeated event.
- Inline Node probe: ScenarioDriver `z`-axis steering.
  - Result: `steerToward({ x:0, z:0 }, { x:0, z:10 })` returned `{ x:0, y:0, boost:false }`.
- Inline Node probe: CameraOcclusion cumulative `lookAt` mutation.
  - Result: two occlusion ticks lifted camera to `y:28.4631` and mutated `lookAt.y` to `3.3233`.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around SequenceNode boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Prior deep packet `2026-06-18T22-52-38-0400`: avoided duplicates around request/economy order, request default reward, cargo negative value, and telemetry `historyLimit:0`.
- Prior deep packet `2026-06-18T23-53-22-0400`: avoided duplicates around assistance terminal state, transfer constraints, restored progress counts, and input edge semantics.
- Prior deep packet `2026-06-19T00-54-03-0400`: avoided duplicates around objective reset/completion idempotency, lifecycle accepted mutation, transport catch-up, and schedule scale normalization.
- Prior deep packet `2026-06-19T01-53-53-0400`: avoided duplicates around occupant reset/id uniqueness, facility/economy non-finite transactions, and resource-pressure restored-state contradictions.
- Prior deep packet `2026-06-19T05-53-25-0400`: avoided duplicates around SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, and VehicleDynamics zero-capacity boost.
- Prior deep packet `2026-06-19T06-53-41-0400`: avoided duplicates around TimingWindow receipt identity, InteractionTarget completion idempotency, Collectible claim idempotency, and RequestFulfillment generated id collisions.
- Prior deep packet `2026-06-19T07-53-41-0400`: avoided duplicates around AR/objective bridge phase, missing step-completion events, and wrapper-owned state.
- Prior deep packet `2026-06-19T08-56-02-0400`: avoided duplicates around dataset/reset leakage, Economy ledger zero retention, and PursuitPressure initial caught contradictions.

## Executive summary
- Current smoke tests still pass, but world placement, base interaction, puzzle, combat, validation driver, and camera safety kits have untested invalidation and state-transition bugs.
- Highest-impact bug: ForestPlacementKit's rebuild signature ignores route coordinates and several route/filter parameters, so same-length route edits can leave stale prop descriptors and stale route snapshots.
- Base InteractionKit repeats gather and activation receipts every tick while input is held; this is separate from the already-reported InputIntent and InteractionTarget idempotency gaps.
- ShrinePuzzleKit repeats `ShrineCharged` every tick after charged prerequisites hold, and LightCombatKit can start with zero health but `enemyDefeated:false`.
- ScenarioDriverKit ignores `z` when callers use normal `{ x, z }` points, producing a zero steering vector for forward 3D route targets.
- CameraOcclusionKit mutates `cameraState.lookAt.y` cumulatively while resolving terrain-line clearance, so camera safety can permanently drift the look target instead of only adjusting camera position or a derived view.

## Deep bug reports

### 1. ForestPlacementKit skips rebuilds when route contents change without route length changing
- Severity: high
- Owner: world-placement / route-readable streaming descriptors
- Evidence files and line references:
  - `src/forest-placement-kit.js:37-45` computes descriptor route distance from route coordinates.
  - `src/forest-placement-kit.js:93-123` uses route distance, route safe width, route accent width, and max slope to decide descriptor inclusion and tags.
  - `src/forest-placement-kit.js:154-166` builds the invalidation signature from `activeRadius`, `focusChunk`, `placementsPerChunk`, `routeLength`, and `seed`, omitting route coordinates, route safe width, route accent width, max slope, chunk size changes after focus chunk collision, and terrain query identity.
  - `tests/procedural-navigation-smoke.mjs` does not cover ForestPlacementKit.
- Reproduction path:
  - Install `createForestPlacementKit({ placementsPerChunk:2, activeRadius:0, routeSafeWidth:100, route:[farRouteWith2Points] })`.
  - Tick once; descriptor count is `2`.
  - Replace `forest-placement-input.route` with a same-length route through the focus chunk.
  - Tick again.
  - Probe result: signature stayed equal, version stayed `1`, and descriptor count stayed `2`, even though the new route should have invalidated descriptors.
- Expected behavior:
  - Any route-content or route-filter change that affects descriptor selection, tags, or snapshot route should rebuild the placement snapshot.
- Actual behavior:
  - Same-length route edits are ignored because `routeLength` is the only route signal in the signature.
- Why it matters for production scaling:
  - Streaming route-aware worlds can show stale props on paths, fail to clear safety corridors, or keep old route readability descriptors after route replans.
- Validation needed:
  - Add ForestPlacement smokes for same-length route coordinate edits, route safe/accent width edits, max slope edits, and terrain query changes.
- Suggested fix direction:
  - Include a stable route content signature plus relevant placement/filter config in the invalidation signature, or compute a normalized descriptor input hash.
- Blocks DSK promotion:
  - Yes for route-aware world placement / streaming descriptor DSKs.

### 2. InteractionKit repeats gather and activate events every tick while input is held
- Severity: medium
- Owner: base interaction / inventory / prompt domain
- Evidence files and line references:
  - `src/interaction-kit.js:49-53` increments `inventory.relicSeeds` and emits `interaction-gathered` whenever `input.gather` is true.
  - `src/interaction-kit.js:56-60` emits `interaction-activated` whenever `input.activate` is true.
  - `src/interaction-kit.js:83-98` initializes no previous-input edge state or per-target activation receipt.
  - `tests/procedural-navigation-smoke.mjs` does not exercise base InteractionKit or CharacterInteractionKit.
- Reproduction path:
  - Install `createInteractionKit({ maxRelicSeeds:5 })`.
  - Subscribe to `Gathered` and `Activated`.
  - Hold `input.gather = true`, `input.activate = true`, `input.target = "lever"` for three ticks.
  - Probe result: gathered counts emitted `1`, `2`, `3`; activated emitted `"lever"` three times; inventory reached `3`.
- Expected behavior:
  - One-shot gather and activate actions should consume edge-triggered input, require explicit repeated action calls, or emit separate held/duplicate receipts.
- Actual behavior:
  - Held input performs repeated gathers and activations at tick rate.
- Why it matters for production scaling:
  - Product hosts that bind key-down/touch-held states into this kit can duplicate inventory gains, activations, telemetry, and objective fanout.
- Validation needed:
  - Add InteractionKit smokes for held gather, held activate, max inventory behavior, target changes, and CharacterInteractionKit compatibility behavior.
- Suggested fix direction:
  - Track previous gather/activate state or expose explicit command APIs with accepted/rejected receipts.
- Blocks DSK promotion:
  - Promotion-adjacent for interaction/inventory DSKs; this adds a base interaction edge-semantics blocker separate from InputIntentKit.

### 3. ShrinePuzzleKit repeats charged receipts and LightCombatKit can start defeated by health but not by state
- Severity: medium
- Owner: puzzle/combat state-transition receipts
- Evidence files and line references:
  - `src/shrine-puzzle-kit.js:23-25` emits `ShrineCharged` whenever prerequisites are true, even if `state.charged` was already true.
  - `src/shrine-puzzle-kit.js:41-46` initializes no charged receipt guard beyond the mutable `charged` boolean.
  - `src/light-combat-kit.js:24-31` only marks enemy defeated after a strike edge.
  - `src/light-combat-kit.js:44-48` initializes `enemyHealth` directly from options while always setting `enemyDefeated:false`.
  - `tests/procedural-navigation-smoke.mjs` does not cover ShrinePuzzleKit or LightCombatKit.
- Reproduction path:
  - Shrine: install `createShrinePuzzleKit({ requiredSeeds:1 })`, set `input.relicSeeds=1` and `input.companionArrived=true`, tick three times.
  - Probe result: three `shrine-charged` batches while state stayed `{ charged:true, opened:false }`.
  - Combat: install `createLightCombatKit({ enemyHealth:0 })`, tick once.
  - Probe result: state stayed `{ enemyHealth:0, enemyDefeated:false }` and no `EnemyDefeated` event emitted.
- Expected behavior:
  - `ShrineCharged` should emit only on false-to-true charged transition.
  - Initial combat state should normalize `enemyDefeated` from `enemyHealth <= 0`, reject invalid initial health, or emit/record an initial defeated receipt.
- Actual behavior:
  - Shrine charged receipts repeat at tick rate, and combat can start in contradictory terminal state.
- Why it matters for production scaling:
  - Puzzle gates and combat validations use receipts for unlocks, proof rows, audio, rewards, and telemetry; repeated charge receipts and hidden initial defeated state make proof ambiguous.
- Validation needed:
  - Add ShrinePuzzle smokes for charged transition idempotency and open transition.
  - Add LightCombat smokes for zero/negative/non-finite initial health, defeat events, and post-defeat input.
- Suggested fix direction:
  - Emit shrine charged only when `!wasCharged && state.charged`; normalize or validate combat initial health.
- Blocks DSK promotion:
  - Promotion-adjacent for puzzle/combat DSKs and any proof harness that treats transition receipts as authoritative.

### 4. ScenarioDriverKit ignores `z` coordinates for normal 3D route points
- Severity: high
- Owner: validation driver / mobility scenario helpers
- Evidence files and line references:
  - `src/scenario-driver-kit.js:19-27` computes steering from `to.x - from.x` and `to.y - from.y` only.
  - `tests/procedural-navigation-smoke.mjs:325-333` validates `ScenarioDriverKit` only with `{ x, y }` route-field marker data.
  - `README.md` describes `ScenarioDriverKit` as deterministic validation steering helpers, but does not clarify 2D `{ x, y }` only semantics.
- Reproduction path:
  - Install `createScenarioDriverKit()`.
  - Call `engine.scenarioDriver.steerToward({ x:0, z:0 }, { x:0, z:10 })`.
  - Probe result: returned `{ x:0, y:0, boost:false }` and stored that zero intent.
- Expected behavior:
  - For normal engine/world coordinates, `steerToward` should support `{ x, z }`, or clearly expose a 2D-only `{ x, y }` API name/adapter.
- Actual behavior:
  - Forward `z`-axis targets produce no steering intent.
- Why it matters for production scaling:
  - Validation and harness lanes can falsely pass or stall when testing 3D world, route, camera, terrain, or mobility scenarios that use `{ x, z }` points.
- Validation needed:
  - Add ScenarioDriver smokes for `{ x, y }`, `{ x, z }`, mixed marker inputs, zero-length targets, and boost distance.
- Suggested fix direction:
  - Normalize route points using `z ?? y`, return a consistent axis contract, and document or adapt downstream consumers.
- Blocks DSK promotion:
  - Yes for validation-driver helpers used to prove 3D mobility, terrain, and route DSKs.

### 5. CameraOcclusionKit cumulatively mutates `lookAt.y` while resolving terrain line clearance
- Severity: medium
- Owner: camera safety / view-state adjustment
- Evidence files and line references:
  - `src/camera-occlusion-kit.js:84-88` computes line intrusion and directly increments `cameraState.lookAt.y`.
  - `src/camera-occlusion-kit.js:106-113` writes adjusted camera state but stores no base look target, original look target, or derived occlusion look target.
  - `tests/procedural-navigation-smoke.mjs:174-198` exercises CameraKit terrain volumes but not CameraOcclusionKit.
- Reproduction path:
  - Create a resource-backed camera state `{ position:{ x:0, y:1, z:10 }, lookAt:{ x:0, y:0, z:0 } }`.
  - Install `createCameraOcclusionKit({ cameraStateResource, groundHeightAt:() => 10, lineClearance:2, minGroundClearance:0, maxLiftPerSecond:1000 })`.
  - Tick twice.
  - Probe result: camera position rose to `y:28.4631` and `lookAt.y` permanently mutated to `3.3233`.
- Expected behavior:
  - Occlusion should adjust camera position and/or derived view output without permanently drifting the source look target each tick.
- Actual behavior:
  - The source `lookAt` is mutated upward during line-clearance resolution and becomes part of the next tick's input.
- Why it matters for production scaling:
  - Long sessions with repeated terrain-line occlusion can drift aim/framing, break authored camera targets, and make camera safety state hard to reset or replay.
- Validation needed:
  - Add CameraOcclusion smokes for line clearance, repeated ticks, obstruction removal, source lookAt stability, and reset/base camera recomputation.
- Suggested fix direction:
  - Keep `lookAt` immutable for occlusion input, write an `occlusionLookAt`/derived output, or require CameraKit to recompute base lookAt before occlusion.
- Blocks DSK promotion:
  - Promotion-adjacent for camera safety and traversal proof surfaces.

## Domain and kit expansion risks
- Route-aware placement services need descriptor invalidation signatures that include content, not only counts.
- Base interaction services need explicit edge/held/repeat semantics before they feed inventory, objectives, or telemetry.
- Puzzle/combat services need transition-only receipts and initial terminal-state normalization.
- Scenario validation helpers need a single coordinate convention across `{ x, y }` route-field domains and `{ x, z }` terrain/world domains.
- Camera safety services need clear source-state versus derived-adjustment ownership.

## Cross-cutting risks
- Count-only signatures hide meaningful dataset changes.
- Several kits use level-triggered booleans for one-shot receipts.
- Initial terminal-state contradictions now appear across pressure and combat-style domains.
- Axis conventions are inconsistent across route/logistics and terrain/3D mobility helpers.
- Runtime safety adjustments can mutate source view state instead of producing derived state.

## Missing validation
- ForestPlacement same-length route coordinate changes and route/filter config invalidation.
- InteractionKit and CharacterInteractionKit held input semantics.
- ShrinePuzzle transition-only charged receipts.
- LightCombat zero/negative/non-finite initial health normalization.
- ScenarioDriver `{ x, z }` steering and boost behavior.
- CameraOcclusion repeated terrain-line ticks and source lookAt stability.

## DSK promotion blockers
- Route-aware placement DSKs are blocked by stale descriptor invalidation.
- Interaction/inventory DSKs should wait for explicit edge/held/repeat semantics.
- Puzzle/combat DSKs should wait for transition-only receipts and initial terminal-state normalization.
- Validation-driver helpers are blocked for 3D proof while `{ x, z }` steering is ignored.
- Camera safety DSKs should wait for source/derived camera-state separation.
- Existing install, namespace, public proof, source-state, bridge-state, receipt identity, idempotency, generated-id, terrain, renderer, AR session, and operations-domain blockers from prior lanes remain open.

## Suggested next review item
- Review edge/held/transition semantics across base InteractionKit, ShrinePuzzleKit, LightCombatKit, and other small state-machine kits before using them as proof surfaces.

## Not claimed
- This packet does not edit source, tests, README, docs, package metadata, public claims, `.agent`, or repo `memory.md`.
- This packet does not fix ForestPlacement, Interaction, ShrinePuzzle, LightCombat, ScenarioDriver, or CameraOcclusion.
- This packet does not claim public browser proof works.
- This packet does not supersede prior DSK install, public proof, source-state, bridge-state, receipt identity, event idempotency, generated-id, terrain, renderer, AR session, or operations-domain findings.
