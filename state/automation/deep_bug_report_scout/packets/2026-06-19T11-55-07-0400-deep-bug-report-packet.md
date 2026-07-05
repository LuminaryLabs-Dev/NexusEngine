# Deep Bug Report Packet: 2026-06-19T11:55:07-04:00

Timestamp: 2026-06-19T11:55:07-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-placement-interaction-driver-camera`.
- Earlier deep packets already cover SequenceNode deployment side effects, terrain cache retention, stale AR failure sessions, DSK install atomicity, boot/frame order, default camera crash, ActionMovement killY masking, duplicate kit ids, cleanup event lifetime, disposed SequenceNode mutation, renderer fallback mismatch, request/economy order, request defaults, cargo negative value, telemetry/economy zero retention, assistance/transfer/spatial-progress/input state machines, objective reset/completion, lifecycle accepted mutation, transport catch-up, schedule scale normalization, occupant reset/id uniqueness, facility/economy non-finite ledgers, resource-pressure restored-state contradictions, SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, VehicleDynamics zero-capacity boost, receipt identity/idempotency/request-id bugs, AR/objective bridge phase, missing step receipts, inert wrapper state, dataset/reset leakage, PursuitPressure initial caught contradictions, ForestPlacement invalidation, base Interaction held repeats, Shrine/LightCombat transition gaps, ScenarioDriver axis loss, and CameraOcclusion source mutation.
- Neighboring ecosystem state packet/node `2026-06-19T11-08-56-0400` says core and ProtoKits remain validation-green while Experiments latest ref, public browser proof, aggregate DSK proof, npm metadata, package-version policy, and DSK hardening remain open.
- Neighboring DSK architecture packet/node `2026-06-19T11-23-07-0400` says the next high-value non-scout work is executable hardening fixtures for namespace/install/dependency plus source-state and state-signal contracts.
- Neighboring ecosystem proof packet/node `2026-06-19T11-40-11-0400` says core remains latest-ref aligned and green, but both sibling release refs are ahead of local checkouts and public proof still stalls at `Booting...`.
- Neighboring domain idea packet/node `2026-06-19T10-02-21-0400` maps state-signal issues into descriptor invalidation, action repeat, transition receipt, coordinate, and derived-state planning rows.
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
  - `state/automation/deep_bug_report_scout/packets/2026-06-19T11-55-07-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T11-55-07-0400-deep-bug-node.md`
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
- `src/companion-command-kit.js`
- `src/corruption-world-kit.js`
- `src/spatial-room-kit.js`
- `src/greybox-building-kit.js`
- `src/tree-runner-kit.js`
- `src/reef-rescue-kit.js`
- `src/pathfinding-kit.js`
- `src/navmesh-kit.js`
- `src/procedural-kit.js`
- `src/character-ragdoll-kit.js`
- `src/index.js`
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
- Existing-packet duplicate scan for `Companion`, `Corruption`, `SpatialRoom`, `spatial room`, `TreeRunner`, `tree-runner`, `laneCount`, `cleanseRate`, and related terms.
  - Result: prior packets mention `tree-runner-kit.js` as inspected and cover SpatialScale anchor-entry, but no prior deep packet reports CompanionCommand one-shot lockout, CorruptionWorld frame-rate dependence, SpatialRoom normalization/source leaks, or TreeRunner invalid generation bounds.
- Inline Node probe: CompanionCommand second command.
  - Result: after first command arrived at `node-a`, a second command to `node-b` emitted no second command/arrival and state remained `{ commanded:true, arrived:true, target:"node-a" }`.
- Inline Node probe: CorruptionWorld one-second cleanse at different tick rates.
  - Result: 60 ticks at `1/60` with `cleanseRate:0.1` cleansed the rift after 11 progress events; 10 ticks at `0.1` left `riftCleansed:false` with progress `0.9999999999999999`.
- Inline Node probe: SpatialRoom anchor normalization and source mutation.
  - Result: anchor `x` remained string `"bad-x"` and `y`/`z` remained strings after normalization; mutating runtime building, connection, and anchor metadata also mutated caller-owned config arrays.
- Inline Node probe: TreeRunner invalid generation bounds.
  - Result: `initialBranches:0` threw `TypeError: Cannot read properties of undefined (reading 'x')`; `laneCount:0` created branch/player coordinates that serialized as `null` because runtime values were `NaN`.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Prior deep packet `2026-06-18T22-52-38-0400`: avoided duplicates around request/economy order, request default reward, cargo negative value, and telemetry `historyLimit:0`.
- Prior deep packet `2026-06-18T23-53-22-0400`: avoided duplicates around assistance terminal state, transfer constraints, restored progress counts, and input edge semantics.
- Prior deep packet `2026-06-19T00-54-03-0400`: avoided duplicates around objective reset/completion, lifecycle accepted mutation, transport catch-up, and schedule scale normalization.
- Prior deep packet `2026-06-19T01-53-53-0400`: avoided duplicates around OccupantFlow mutable config, generated occupants, non-finite facility/economy transactions, and resource-pressure restored-state contradictions.
- Prior deep packet `2026-06-19T05-53-25-0400`: avoided duplicates around SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, and VehicleDynamics zero-capacity boost.
- Prior deep packet `2026-06-19T06-53-41-0400`: avoided duplicates around TimingWindow identity, InteractionTarget idempotency, Collectible claim idempotency, and RequestFulfillment id collisions.
- Prior deep packet `2026-06-19T07-53-41-0400`: avoided duplicates around AR/objective bridge phase, missing step receipts, and inert wrapper state.
- Prior deep packet `2026-06-19T08-56-02-0400`: avoided duplicates around nested config leaks in water/route/render descriptor, Economy ledger zero retention, and PursuitPressure initial caught contradictions.
- Prior deep packet `2026-06-19T09-54-20-0400`: avoided duplicates around ForestPlacement route invalidation, base Interaction held repeats, Shrine/LightCombat transition gaps, ScenarioDriver axis loss, and CameraOcclusion source mutation.

## Executive summary
- Current smoke tests still pass, but companion, world-state, spatial-room, and tree-runner kits expose untested lifecycle reuse, time-step, normalization, and config-bound bugs.
- Highest-impact bug: SpatialRoomKit claims to normalize reusable room/building descriptors, but anchor spreads restore caller values after numeric conversion and dataset metadata/connections/props are kept by reference.
- CompanionCommandKit can only accept one command for the lifetime of the engine because `state.commanded` and `state.arrived` never reset for a new target.
- CorruptionWorldKit increments cleanse progress once per tick instead of by `delta`, so identical elapsed time can produce different completion state and event counts by frame rate.
- TreeRunnerKit accepts invalid `initialBranches` and `laneCount` values, leading to init-time crashes or `NaN`/JSON-null coordinates.

## Deep bug reports

### 1. CompanionCommandKit ignores later commands after the first arrival
- Severity: medium
- Owner: companion/action lifecycle
- Evidence files and line references:
  - `src/companion-command-kit.js:23-28` accepts a command only when `!state.commanded`.
  - `src/companion-command-kit.js:30-35` sets `arrived:true` but never returns to a ready state.
  - `src/companion-command-kit.js:45-53` initializes no command id, edge state, reset method, or per-command completion receipt.
- Reproduction path:
  - Install `createCompanionCommandKit({ speed:100 })`.
  - Set `input.command=true`, `target:"node-a"`, tick once.
  - Clear command, tick once, then set `input.command=true`, `target:"node-b"`, and tick again.
  - Probe result: command and arrival events only mention `node-a`; state remains `{ commanded:true, arrived:true, target:"node-a" }`.
- Expected behavior:
  - A reusable companion command service should accept a new command after arrival, reject it with an explicit receipt, or expose a reset/clear-command API.
- Actual behavior:
  - The first command permanently locks command acceptance.
- Why it matters for production scaling:
  - Companion, assistance, AR guide, puzzle helper, and training flows commonly require multiple targets in one session; later objectives can silently stop responding.
- Validation needed:
  - Add CompanionCommand smokes for second target after arrival, command changes before arrival, duplicate command attempts, and explicit reset behavior.
- Suggested fix direction:
  - Track command ids and transition state per target, or clear `commanded/arrived` when a new accepted target differs from the completed target.
- Blocks DSK promotion:
  - Promotion-adjacent for companion/guide/assistance services.

### 2. CorruptionWorldKit cleanse progress is frame-rate dependent
- Severity: medium
- Owner: world-state/progression timing
- Evidence files and line references:
  - `src/corruption-world-kit.js:23-30` adds `state.cleanseRate` once per system run and never multiplies by `world.__nexusClock.delta`.
  - `src/corruption-world-kit.js:39` runs the system every `resolve` phase.
  - `src/corruption-world-kit.js:42-46` stores `cleanseRate` as an option without units or normalization.
- Reproduction path:
  - Run two engines with `createCorruptionWorldKit({ cleanseRate:0.1 })` and held `cleanse:true`, `shrineOpened:true`.
  - Tick one engine 60 times at `1/60`, and another 10 times at `0.1`.
  - Probe result: 60Hz run cleansed the rift after 11 progress events; 10Hz run had the same elapsed second but stayed `riftCleansed:false` at progress `0.9999999999999999`.
- Expected behavior:
  - Time-based progression should depend on elapsed time, not frame count, or clearly be named as per-tick progress.
- Actual behavior:
  - Higher tick rates cleanse much faster and can change terminal events for the same elapsed duration.
- Why it matters for production scaling:
  - Proof harnesses, browser frame rates, headless tests, and slow devices can disagree on objective completion and telemetry.
- Validation needed:
  - Add CorruptionWorld smokes that compare equal elapsed time across different deltas and cover floating-point terminal thresholds.
- Suggested fix direction:
  - Treat `cleanseRate` as per-second and multiply by `delta`, or rename/normalize the option as per-tick and document fixed-step requirements.
- Blocks DSK promotion:
  - Yes for world-state/progression services that need deterministic elapsed-time proof.

### 3. SpatialRoomKit keeps non-normalized anchors and caller-owned descriptor references
- Severity: high
- Owner: spatial-room/descriptors/source-state integrity
- Evidence files and line references:
  - `src/spatial-room-kit.js:10-20` computes numeric anchor coordinates, then spreads `...anchor` after them, allowing original non-numeric/string values to overwrite normalized numbers.
  - `src/spatial-room-kit.js:38-42` stores floor/walls/ceiling/lighting/anchors without deep cloning nested objects.
  - `src/spatial-room-kit.js:46-58` stores `connections`, `props`, and `metadata` by reference.
  - `src/spatial-room-kit.js:91-92` snapshots the active building by JSON clone, but the live runtime state is already sharing caller-owned nested data.
- Reproduction path:
  - Install `createSpatialRoomKit()` with an anchor `{ x:"bad-x", y:"2", z:"3", metadata:{ tags:["source"] } }`, connection metadata, and building metadata.
  - Mutate runtime state metadata arrays.
  - Probe result: anchor retained `x:"bad-x"`, `y:"2"`, `z:"3"`; caller config metadata arrays became `["building","runtime"]`, `["door","runtime"]`, and `["source","runtime"]`.
- Expected behavior:
  - Normalization should keep canonical numeric coordinates and isolate runtime descriptors from caller-authored config.
- Actual behavior:
  - Invalid/string anchor fields survive normalization, and runtime descriptor mutation leaks into caller config.
- Why it matters for production scaling:
  - Spatial/AR/building proof can produce non-finite or string geometry, while reset/replay can depend on previous runtime mutations to authored data.
- Validation needed:
  - Add SpatialRoom and GreyboxBuilding smokes for numeric anchor normalization, metadata clone isolation, active-building switch safety, and snapshot/source separation.
- Suggested fix direction:
  - Spread `anchor` before normalized fields or pick allowed fields explicitly, and deep-clone/freeze authored descriptor datasets at install time.
- Blocks DSK promotion:
  - Yes for spatial room/building descriptor DSKs and AR training room proof.

### 4. TreeRunnerKit accepts invalid generation bounds that crash or emit NaN coordinates
- Severity: medium
- Owner: traversal/runner config normalization
- Evidence files and line references:
  - `src/tree-runner-kit.js:13-18` computes lane position with modulo `laneCount`, so `laneCount:0` produces `NaN`.
  - `src/tree-runner-kit.js:34-37` trusts requested branch count without a minimum.
  - `src/tree-runner-kit.js:190-197` stores `laneCount` and calls `ensureBranches(run, options.initialBranches ?? 24)` without validating positive lane/branch bounds.
  - `src/tree-runner-kit.js:198-212` dereferences `first.x`, `first.y`, and `first.z` even when no branch was generated.
- Reproduction path:
  - Install `createTreeRunnerKit({ initialBranches:0 })`.
  - Probe result: init throws `TypeError: Cannot read properties of undefined (reading 'x')`.
  - Install `createTreeRunnerKit({ laneCount:0, initialBranches:2 })`.
  - Probe result: first branch/player coordinates serialize as `null` because runtime `x` values are `NaN`.
- Expected behavior:
  - Invalid config should be rejected or normalized to safe positive lane and branch counts.
- Actual behavior:
  - One invalid count crashes install; another silently poisons traversal state with non-finite coordinates.
- Why it matters for production scaling:
  - Generated traversal/runner proofs need deterministic geometry; non-finite coordinates can break renderers, physics, telemetry, and saved snapshots.
- Validation needed:
  - Add TreeRunner smokes for `initialBranches`, `laneCount`, `spacing`, `visibleAhead`, speed bounds, and finite branch/player coordinates.
- Suggested fix direction:
  - Clamp or reject `laneCount < 1`, `initialBranches < 1`, non-finite spacing, and non-finite movement config before branch generation.
- Blocks DSK promotion:
  - Promotion-adjacent for runner/traversal services and generated-route proof.

## Domain and kit expansion risks
- Companion/guide services need reusable command lifecycle semantics: accepted, ignored, retargeted, arrived, reset, and duplicate receipts.
- World-state progression services need per-second versus per-tick policy before proof harnesses compare elapsed time.
- Spatial descriptor services need canonical normalization plus source-state isolation before AR/room/building proof can trust geometry.
- Generated traversal services need config-bound and finite-coordinate policies before renderer, physics, telemetry, and replay consumers depend on snapshots.

## Cross-cutting risks
- Several reusable services still lack explicit command/action lifecycle state after terminal events.
- Time-dependent kits can mix tick-count and elapsed-time semantics.
- Descriptor normalization can appear to sanitize data while later spread/reference choices restore invalid or mutable source values.
- Invalid config can enter public snapshots as non-finite geometry instead of failing early.

## Missing validation
- CompanionCommand second-command and retargeting behavior.
- CorruptionWorld equal-elapsed-time behavior across different deltas.
- SpatialRoom numeric normalization and source-state isolation.
- TreeRunner config bounds and finite branch/player coordinates.
- Aggregate DSK hardening fixtures that group command lifecycle, time-step policy, source-state isolation, and finite geometry under promotion readiness.

## DSK promotion blockers
- SpatialRoom-style descriptor services are not promotion-ready while runtime state shares caller-owned descriptor objects and accepts invalid anchor coordinates.
- CorruptionWorld-style progression services are not proof-ready while equal elapsed time can produce different terminal state by tick rate.
- Companion/guide services are not reusable-flow-ready while first command arrival permanently blocks later commands.
- TreeRunner/traversal generation is not proof-ready while invalid config can crash install or emit non-finite coordinates.
- Existing install, namespace, public proof, source-state, state-signal, bridge-state, receipt identity, idempotency, generated-id, terrain, renderer, AR session, operations, and spatial/mobility blockers from prior lanes remain open.

## Suggested next review item
- Review reusable service lifecycle/config normalization across small kits: command terminal states, per-second progression, descriptor source isolation, and finite generated geometry.

## Not claimed
- This packet does not edit source, tests, README, docs, package metadata, public claims, `.agent`, or repo `memory.md`.
- This packet does not fix CompanionCommand, CorruptionWorld, SpatialRoom, GreyboxBuilding, or TreeRunner.
- This packet does not claim public browser proof works.
- This packet does not supersede prior DSK install, public proof, source-state, state-signal, bridge-state, receipt identity, event idempotency, generated-id, terrain, renderer, AR session, operations, or spatial/mobility findings.
