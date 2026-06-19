# Deep Bug Report Packet: 2026-06-18T20:54:00-04:00

Timestamp: 2026-06-18T20:54:00-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for NexusRealtime runtime production risks

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`

## Current branch
- `0.0.2`, tracking `origin/0.0.2`
- `git diff --name-only origin/0.0.2...HEAD`: no output

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- `state/automation/deep_bug_report_scout/packets/2026-06-18T19-54-00-0400-deep-bug-report-packet.md`
- `state/automation/dsk_architecture_scout/*`
- `state/automation/ecosystem_*/*`
- `state/automation/runtime_bug_scout/*`
- `state/automation/public_link_scout/*`
- `src/ecs.js`
- `src/engine.js`
- `src/runtime-kit.js`
- `src/domain-service-kit.js`
- `src/game-kit-composer.js`
- `src/sequence-node.js`
- `src/sequence-node-kit.js`
- `src/terrain-kit.js`
- `src/world-physics-kit.js`
- `src/action-movement-kit.js`
- `src/character-camera-kit.js`
- `src/renderers.js`
- `src/ar-kit.js`
- `src/ar-session.js`
- `src/ar-renderer.js`
- `src/index.js`
- `tests/`

## Commands run
- `npm run automation:preflight`
  - Result: required public links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2`
- `git diff --stat origin/0.0.2...HEAD`
  - Result: no output.
- Inline Node probe: SequenceNode lifecycle surface frame duplication.
  - Result: direct engine drive wrote `framesSeen:1` after one tick; lifecycle-bound plus direct drive wrote `framesSeen:3` and finished.
- Inline Node probe: engine-level `sequenceNodes` with kit-provided custom type.
  - Result: `createEngine({ sequenceNodes, kits })` left node `running`, `completionMode:"manual"`, `driver:"event"`, `validateOk:false`; kit-first mount finished with `completionMode:"timeout"`, `driver:"frame"`, `validateOk:true`.
- Inline Node probe: `createCharacterCameraKit()` with default options.
  - Result: first tick threw `TypeError: NexusRealtime expected a resource definition.`
- Inline Node probe: `createActionMovementKit({ killY:-10 })` with player below kill plane.
  - Result: player y snapped to `1.2`, `respawns:0`, `grounded:true`.
- Inline Node probe: `createPhysicsKit({ killY:-10 })` with player below kill plane.
  - Result: physics respawned once, but final `fall` state was reset to inactive.

## Existing bug packets checked
- Prior deep packet:
  - `state/automation/deep_bug_report_scout/packets/2026-06-18T19-54-00-0400-deep-bug-report-packet.md`
  - Avoided duplicates: invalid `deploySequenceNode()` still installs kits/mounts nodes, TerrainKit cache retention, AR failure stale session, DSK install atomicity.
- DSK architecture packets:
  - Known: reserved `engine.n` keys, install rollback, direct-install dependency parity.
- Ecosystem/public-link/runtime trackers:
  - Known: npm metadata 404, public DSK proof route drift, sibling repo proof instability.

## Executive summary
- Existing tests still pass, but four additional production bugs reproduce through public APIs.
- Highest impact: engine startup mounts `sequenceNodes` before installing kits, so kit-provided SequenceNode types are not available when nodes normalize; valid custom graphs can become invalid, event-driven manual nodes.
- Scheduler/surface bridge risk: binding lifecycle surfaces while `driveSequenceNodesWithTick` is enabled can dispatch multiple frame events per engine tick and advance frame-driven SequenceNodes too fast.
- Default camera kit usage is crash-prone: installing `createCharacterCameraKit()` without an explicit character resource throws on tick.
- Action movement can mask kill-plane recovery by snapping a below-void player to ground before checking `killY`.

## Deep bug reports

### 1. Engine mounts SequenceNodes before kit-provided node types are installed
- Severity: high
- Owner: engine/sequence/runtime-kit
- Evidence files and line references:
  - `src/engine.js:349-364` mounts `options.sequenceNodes` before iterating `options.kits`.
  - `src/runtime-kit.js:186-193` registers kit `sequenceNodeTypes` and appends kit nodes only during kit install.
  - `src/sequence-node.js:905-915` normalizes nodes at mount time using the current library.
  - `src/sequence-node.js:241-246` derives default completion mode and driver from the library at normalization time.
- Reproduction path or likely trigger:
  - Define a runtime kit with `sequenceNodeTypes: [customType]`.
  - Call `createEngine({ sequenceNodes: { type:"customType" }, kits:[customTypeKit], autoStartSequenceNodes:true })`.
  - Probe result: early mount stayed `running`, `completionMode:"manual"`, `driver:"event"`, `validateOk:false`; mounting after kit install finished correctly.
- Expected behavior:
  - Engine-level `sequenceNodes` should see kit-provided type definitions before normalization, validation, and auto-start.
- Actual or suspected behavior:
  - Nodes normalize against the default library before kit installation, so custom type defaults and validation are lost.
- Why it matters for production scaling:
  - DSKs or product packages that ship custom SequenceNode types can fail only when consumers use the ergonomic `createEngine({ sequenceNodes, kits })` path.
  - The same graph works if mounted later, creating order-sensitive startup bugs that are hard to diagnose in browser hosts.
- Validation needed:
  - Add existing-suite-compatible smoke coverage for engine startup with `sequenceNodes` plus a kit-provided custom type.
- Suggested fix direction:
  - Install kits before mounting `options.sequenceNodes`, or pre-register `sequenceNodeTypes` from provided kits before normalization.
  - Validate mounted `options.sequenceNodes` after kit installation and fail before auto-start if invalid.
- Blocks DSK promotion:
  - Yes, for promoted DSKs that ship custom SequenceNode types or graphs.

### 2. Lifecycle-surface binding can triple frame-driven SequenceNode progress in one engine tick
- Severity: high
- Owner: engine/sequence/scheduler
- Evidence files and line references:
  - `src/engine.js:248-264` publishes both tick-start and tick-end lifecycle records to lifecycle surfaces.
  - `src/sequence-node.js:940-944` turns every lifecycle `tick` record into `api.frame(...)`.
  - `src/engine.js:271-287` also directly calls `engine.sequenceNodeRuntime.frame(...)` each tick when `driveSequenceNodesWithTick` is enabled.
  - `tests/sequence-node-frame-driver-smoke.mjs:39-59` covers direct ticking and manual ticking, but not lifecycle surface binding plus direct drive.
- Reproduction path or likely trigger:
  - Register a lifecycle surface with `topics:["tick"]`, bind it into the SequenceNode runtime, keep `driveSequenceNodesWithTick:true`.
  - Start a `frameCondition` node that increments `root.data.framesSeen` on frame events.
  - Probe result after one `engine.tick()`: direct drive wrote `framesSeen:1`; lifecycle-bound plus direct drive wrote `framesSeen:3` and finished.
- Expected behavior:
  - A single engine tick should advance frame-driven SequenceNodes once unless the caller opts into a separate manual frame source.
- Actual or suspected behavior:
  - The runtime receives one frame for tick-start lifecycle, one frame for tick-end lifecycle, and one direct engine frame.
- Why it matters for production scaling:
  - Browser hosts that bind lifecycle surfaces for observability can silently speed up timers, frame gates, objectives, telemetry, or cutscene sequencing.
  - The bug is topology-dependent: tests and simple hosts pass, while richer surface-bound hosts drift.
- Validation needed:
  - Add a smoke that binds a lifecycle surface and asserts frame-driven writes increment once per engine tick.
- Suggested fix direction:
  - Pick one frame source. Either suppress lifecycle `api.frame()` when direct engine driving is enabled, only frame on one lifecycle stage, or mark lifecycle-derived frames so duplicates are coalesced per engine frame.
- Blocks DSK promotion:
  - Yes for DSKs that rely on frame-driven SequenceNodes, timers, or lifecycle surface bridges.

### 3. Default CharacterCameraKit crashes on first tick without explicit characterStateResource
- Severity: medium
- Owner: camera
- Evidence files and line references:
  - `src/character-camera-kit.js:71-76` calls `world.getResource(options.characterStateResource)` before checking whether the option exists.
  - `src/ecs.js:225-227` requires a valid resource definition for `getResource`.
  - `src/character-camera-kit.js:145-183` initializes camera resources but does not provide or infer a character resource.
  - `src/index.js:234-237` exports `createCameraKit` and `createCharacterCameraKit` as public APIs.
- Reproduction path or likely trigger:
  - Call `createEngine({ kits:[createCharacterCameraKit()] })`, then `engine.tick()`.
  - Probe result: `TypeError: NexusRealtime expected a resource definition.`
- Expected behavior:
  - Default camera kit should be inert until a character resource is configured, or infer the canonical action movement `CharacterState` resource when installed together.
- Actual or suspected behavior:
  - The kit throws on every tick when `characterStateResource` is omitted.
- Why it matters for production scaling:
  - Public API defaults look installable but crash in minimal hosts and composition experiments.
  - This weakens the advertised kit-composition path for terrain/physics/camera stacks.
- Validation needed:
  - Add a smoke for camera-only install and camera-plus-movement install.
- Suggested fix direction:
  - Guard `options.characterStateResource` before calling `world.getResource`, return early when absent, and optionally support an explicit binding helper from movement kits.
- Blocks DSK promotion:
  - No for general DSK promotion; yes for camera or traversal-stack promotion.

### 4. ActionMovementKit killY recovery is masked by ground snap
- Severity: medium
- Owner: physics/camera
- Evidence files and line references:
  - `src/action-movement-kit.js:288-298` snaps the player to `targetY` and marks grounded before checking `killY`.
  - `src/action-movement-kit.js:300-302` performs the `killY` soft-respawn check after the snap.
  - `src/action-movement-kit.js:131-148` defines `softRespawn()` and increments `player.respawns`.
  - `src/world-physics-kit.js:197-200` also checks `killY` late, but the probe still respawned after emitting a fall event before its own `softRespawn()`.
- Reproduction path or likely trigger:
  - Install `createActionMovementKit({ killY:-10 })`.
  - Set `PlayerState.position.y = -100`.
  - Tick once.
  - Probe result: y snapped to `1.2`, `respawns:0`, `grounded:true`.
- Expected behavior:
  - A player below `killY` should soft-respawn before ground snap can recover them.
- Actual or suspected behavior:
  - The movement system treats the below-void position as merely below ground and snaps it to target ground height, bypassing recovery telemetry and respawn state.
- Why it matters for production scaling:
  - Long-running traversal games can lose fall/death/recovery events, objective failure conditions, and analytics if a bad terrain sample or async terrain update returns a normal ground height.
  - This masks serious route/terrain bugs as valid landings.
- Validation needed:
  - Add a movement smoke for below-kill-y input and assert `respawns` increments and `SoftRespawn` emits.
  - Decide whether physics and movement should share one kill-plane ordering rule.
- Suggested fix direction:
  - Check `killY` before ground snap and slope handling; preserve a clear fall reason in state after respawn.
- Blocks DSK promotion:
  - No for generic DSK; yes for traversal/locomotion domain promotion.

## Cross-cutting risks
- Startup order matters too much. Kit registration, graph normalization, and auto-start are not staged as a single atomic boot phase.
- Frame signals are not source-coalesced. Rich hosts that bind lifecycle surfaces can accidentally create multiple frame drivers.
- Several public kits have defaults that look composable but need explicit resource bindings to avoid crashes or incorrect recovery.
- Existing smoke tests are mostly happy-path and do not cover combined engine options, surface-bound SequenceNodes, or minimal public-kit installs.

## Missing validation
- No smoke for `createEngine({ sequenceNodes, kits })` with kit-provided SequenceNode types.
- No smoke for lifecycle-surface binding while direct SequenceNode tick driving is enabled.
- No smoke for default `createCharacterCameraKit()` installation.
- No smoke for ActionMovementKit kill-plane ordering.
- No browser/CDN import smoke was run in this pass beyond preflight public URL checks.

## DSK promotion blockers
- Blocking:
  - Engine startup order bug for DSKs that install SequenceNode types/graphs.
  - Lifecycle frame duplication for DSKs that rely on frame-driven SequenceNodes.
- Promotion-adjacent:
  - Camera default crash and movement killY masking for traversal/camera domain promotion.
- Still open from prior packets:
  - DSK/runtime install atomicity and rollback.
  - DSK namespace safety.
  - Direct install dependency parity.

## Suggested next review item
- Review `createEngine()` boot staging and SequenceNode frame source ownership together. The next fix pass should decide the canonical order for kit registration, graph normalization, surface binding, and frame driving before patching individual symptoms.

## Not claimed
- This packet does not fix bugs.
- This packet does not create tests.
- This packet does not edit source, tests, docs, package metadata, `memory.md`, or public claims.
- This packet does not prove browser-human-view behavior.
- This packet does not re-report the prior invalid-deploy, TerrainKit cache retention, AR stale session, or DSK rollback bugs as new findings.
