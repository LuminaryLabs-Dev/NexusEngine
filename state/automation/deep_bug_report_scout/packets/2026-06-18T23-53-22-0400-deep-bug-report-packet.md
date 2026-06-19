# Deep Bug Report Packet: 2026-06-18T23:53:22-04:00

Timestamp: 2026-06-18T23:53:22-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for NexusRealtime runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: operations/logistics kit composition from `2026-06-18T22-52-38-0400`, including request/economy event order, default request economics, cargo negative value, and telemetry retention.
- Earlier current-lane packets already cover invalid SequenceNode deployment side effects, TerrainKit retention, stale AR failure sessions, DSK install atomicity, SequenceNode boot/frame ordering, default camera crash, ActionMovementKit killY ordering, duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Neighboring ecosystem state packet `2026-06-18T23-08-42-0400` says core, ProtoKits, and Experiments are aligned on latest release branch `0.0.2`; local tests pass; required public links pass; npm metadata remains 404; public DSK proof is HTTP-visible but browser-stuck at `Booting...`.
- Neighboring DSK architecture packet `2026-06-18T23-23-35-0400` keeps DSK hardening risks open around namespace safety, failed-install atomicity, direct dependency policy, and reset/snapshot contract enforcement.
- Neighboring ecosystem proof packet `2026-06-18T23-39-46-0400` says local/raw proof remains green, but public browser proof is blocked by missing module paths and DSK proof coverage needs explicit targeted commands.
- Domain kit idea expander packet `2026-06-18T23-01-44-0400` adds governance, event handoff, proof surface, retention, and accounting ideas as planning inventory, not implementation claims.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404

## Current branch
- `0.0.2`, tracking `origin/0.0.2`
- Worktree had pre-existing modified/untracked automation/doc artifacts before this run.
- This lane wrote only:
  - `state/automation/deep_bug_report_scout/packets/2026-06-18T23-53-22-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-18T23-53-22-0400-deep-bug-node.md`
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
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/README.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/deep_bug_report_scout/PROMPT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest three current-lane packets and nodes.
- Latest neighboring packets and nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/assistance-target-kit.js`
- `src/transfer-zone-kit.js`
- `src/landmark-guidance-kit.js`
- `src/environmental-affordance-kit.js`
- `src/input-intent-kit.js`
- `src/resource-pressure-kit.js`
- `src/timing-window-kit.js`
- `src/scenario-duration-kit.js`
- `src/scenario-driver-kit.js`
- `src/route-field-kit.js`
- `src/vehicle-dynamics-kit.js`
- `src/water-surface-kit.js`
- `src/spatial-scale-kit.js`
- `src/pursuit-pressure-kit.js`
- `tests/procedural-navigation-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `git status --short`
  - Result: pre-existing modified/untracked automation/doc artifacts were present.
- `git branch --show-current`
  - Result: `0.0.2`.
- `git ls-remote --heads origin`
  - Result: remote heads include `0.0.1`, `0.0.2`, and `main`; latest release branch resolved by preflight is `0.0.2`.
- `npm test`
  - Result: passed 8 smoke tests.
- Inline Node probe: AssistanceTargetKit lost target completed after loss.
  - Result: after decay target had `lost:true`; after `complete("victim")`, same target had `status:"completed"`, `completed:true`, and `lost:true`, with both counts active.
- Inline Node probe: TransferZoneKit accepts/capacity constraints.
  - Result: zone configured with `accepts:["cargo"]` and `capacity:1` accepted one passenger and two cargo transfers; `completedCount:3`.
- Inline Node probe: LandmarkGuidanceKit initial counts.
  - Result: two initial landmarks with `discovered/reached/completed` flags produced `discoveredCount:0`, `reachedCount:0`, `completedCount:0`.
- Inline Node probe: EnvironmentalAffordanceKit initial counts.
  - Result: one initial completed affordance produced `completedCount:0`.
- Inline Node probe: InputIntentKit held action.
  - Result: calling `inputIntent.set({ primary:true })` twice emitted two `InputActionPressed` events and left `sequence:2`.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around invalid SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around engine SequenceNode boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Prior deep packet `2026-06-18T22-52-38-0400`: avoided duplicates around request/economy order, request default reward, cargo negative value, and telemetry `historyLimit:0`.
- Neighboring architecture/proof/state packets checked for public proof and DSK hardening context.

## Executive summary
- Existing smoke tests pass, but newer recovery, transfer, spatial interaction, and input kits have state-machine edge cases that are not covered by current happy-path tests.
- Highest-impact bug: AssistanceTargetKit allows a target that has already become `lost` to be completed later, leaving the same target both lost and completed.
- TransferZoneKit records `accepts`, `dwellSeconds`, and `capacity`, but `transfer()` ignores all of them, so invalid payloads and over-capacity transfers are completed through the public API.
- LandmarkGuidanceKit and EnvironmentalAffordanceKit normalize initial completed/discovered flags but initialize aggregate counts to zero, so snapshots are internally inconsistent until a later mutation recomputes counts.
- InputIntentKit emits `InputActionPressed` every time a held action is set, not only on false-to-true transitions, which can double-trigger one-shot actions in hosts that submit per-frame input state.

## Deep bug reports

### 1. AssistanceTargetKit can complete targets that are already lost
- Severity: high
- Owner: assistance/recovery domain
- Evidence files and line references:
  - `src/assistance-target-kit.js:54-61` marks a decayed target as `lost`.
  - `src/assistance-target-kit.js:55` skips simulation for completed or lost targets, treating them as terminal for decay.
  - `src/assistance-target-kit.js:74-92` updates any matching target without rejecting terminal `lost` or `completed` states.
  - `src/assistance-target-kit.js:123-124` marks a target completed without clearing or checking `lost`.
  - `tests/procedural-navigation-smoke.mjs:336-344` covers happy-path stabilize/attach/complete only.
- Reproduction path:
  - Create one target with `urgency:1` and `decayPerSecond:2`.
  - Tick one second so it becomes lost.
  - Call `engine.assistanceTargets.complete("victim")`.
  - Probe result: target becomes `status:"completed"`, `completed:true`, `lost:true`; both `lostCount` and `completedCount` include it.
- Expected behavior:
  - Lost targets should either reject later completion/attachment/stabilization or transition through an explicit recovery path that clears `lost` and emits a recovery event.
- Actual behavior:
  - Public mutator APIs can make terminal state contradictory.
- Why it matters for production scaling:
  - Rescue/recovery domains can double-count failed and successful objectives, corrupt scenario completion, telemetry, reward logic, and proof snapshots.
- Validation needed:
  - Add an assistance target smoke for decay-to-lost followed by stabilize/attach/complete calls.
- Suggested fix direction:
  - Guard terminal states in `updateTarget()`, or introduce explicit lost recovery semantics that update counts and events consistently.
- Blocks DSK promotion:
  - Yes for emergency-response, assistance, recovery, and objective validation DSKs.

### 2. TransferZoneKit ignores accepts, dwellSeconds, and capacity during transfer
- Severity: high
- Owner: transfer/logistics domain
- Evidence files and line references:
  - `src/transfer-zone-kit.js:18-20` normalizes `accepts`, `dwellSeconds`, and `capacity`.
  - `src/transfer-zone-kit.js:30` initializes an `active` map, but no API updates it.
  - `src/transfer-zone-kit.js:60-69` `transfer()` completes immediately without checking payload kind, dwell state, position, or capacity.
  - `tests/procedural-navigation-smoke.mjs:319-344` covers one unconstrained transfer only.
- Reproduction path:
  - Create one zone with `accepts:["cargo"]` and `capacity:1`.
  - Call `transfer("dock", { kind:"passenger" })`, then two cargo transfers.
  - Probe result: all three complete; `completedCount:3`.
- Expected behavior:
  - Transfer should reject or defer payloads not listed in `accepts`, respect capacity, and either use dwell/active state or avoid exposing those config fields as operational constraints.
- Actual behavior:
  - Constraint fields are stored but unenforced.
- Why it matters for production scaling:
  - Logistics, rescue, evacuation, and extraction hosts can report invalid deliveries as completed while proof snapshots imply capacity/acceptance policy exists.
- Validation needed:
  - Add TransferZoneKit smokes for rejected kind, capacity overflow, and dwell progression if dwell is intended.
- Suggested fix direction:
  - Enforce constraints in `transfer()` or split immediate transfer from a `start/advance/complete` flow that owns active dwell and capacity.
- Blocks DSK promotion:
  - Yes for transfer, logistics, evacuation, and recovery DSKs.

### 3. Spatial progress kits initialize aggregate counts inconsistently with initial data
- Severity: medium
- Owner: spatial guidance / affordance domains
- Evidence files and line references:
  - `src/landmark-guidance-kit.js:23-25` preserves initial `discovered`, `reached`, and `completed` flags.
  - `src/landmark-guidance-kit.js:30-38` initializes `discoveredCount`, `reachedCount`, and `completedCount` to zero instead of deriving from landmarks.
  - `src/landmark-guidance-kit.js:55-62` has a correct count recompute helper, but it is only used by mutators.
  - `src/environmental-affordance-kit.js:22-25` preserves initial progress/completed flags.
  - `src/environmental-affordance-kit.js:30-35` initializes `completedCount` to zero instead of deriving from affordances.
  - `tests/procedural-navigation-smoke.mjs:385-404` covers only initially incomplete landmark/affordance data.
- Reproduction path:
  - Initialize LandmarkGuidanceKit with one completed landmark and one discovered landmark.
  - Initialize EnvironmentalAffordanceKit with one completed affordance.
  - Probe result: landmark counts all zero; affordance `completedCount:0`.
- Expected behavior:
  - Initial aggregate counts should match normalized initial entity flags.
- Actual behavior:
  - Snapshots are internally inconsistent until a later mutator path recomputes counts.
- Why it matters for production scaling:
  - Saved scenarios, authored checkpoints, resumed sessions, and validation snapshots can start with false progress totals even though item flags are correct.
- Validation needed:
  - Add initial-data smokes for completed/discovered landmark and affordance datasets.
- Suggested fix direction:
  - Reuse count helpers during `initialState()` after normalization.
- Blocks DSK promotion:
  - Promotion-adjacent for puzzle, AR training, spatial guidance, and objective DSKs that support authored or restored progress state.

### 4. InputIntentKit emits pressed events repeatedly for held actions
- Severity: medium
- Owner: input/action domain
- Evidence files and line references:
  - `src/input-intent-kit.js:53` treats every active action in the submitted state as active.
  - `src/input-intent-kit.js:61-63` emits `InputActionPressed` for every active action on every `set()` call.
  - `src/input-intent-kit.js:26-33` initial state does not track previous action state separately from current intent.
  - `tests/procedural-navigation-smoke.mjs:371-376` checks only that a single input call sets `inputSeen`.
- Reproduction path:
  - Install InputIntentKit.
  - Add a system that counts `InputActionPressed`.
  - Call `engine.inputIntent.set({ primary:true })`, tick, then call the same state again and tick.
  - Probe result: two `InputActionPressed` events for one held action.
- Expected behavior:
  - A `Pressed` event should fire on false-to-true edges, while held state should remain available through `InputIntentState`.
- Actual behavior:
  - Held actions can produce repeated press events whenever hosts submit full state each frame.
- Why it matters for production scaling:
  - Hosts commonly submit current input state each frame. One-shot actions such as confirm, restart, pickup, attack, transfer, or objective activation can double-trigger.
- Validation needed:
  - Add an input smoke for press vs hold vs release transitions.
- Suggested fix direction:
  - Compare `normalized.actions` with `state.intent.actions`, emit `InputActionPressed` only for newly true actions, and optionally add `InputActionHeld` or leave hold state as resource data.
- Blocks DSK promotion:
  - Promotion-adjacent for interaction, traversal, transfer, and validation DSKs that map input events to one-shot actions.

## Domain and kit expansion risks
- Rescue/recovery examples depend on assistance targets, transfer zones, route fields, vehicle dynamics, and scenario telemetry composing with unambiguous terminal states.
- AR training and puzzle-adventure examples depend on authored/resumed landmark and affordance progress being count-consistent from the first snapshot.
- Logistics and evacuation examples depend on transfer zones enforcing constraints rather than only storing them as metadata.
- Input intent is a shared dependency for mobility, interaction, puzzle, transfer, and objective domains; repeated pressed events can turn otherwise deterministic kits into host-frame-rate-dependent behavior.

## Cross-cutting risks
- Several domain kits preserve detailed config or item flags but do not enforce the implied policy in their public mutators.
- Terminal state is not modeled consistently: `lost`, `completed`, and `active` can coexist without an explicit transition policy.
- Aggregate counters are derived in mutation paths but not in initial state paths.
- Event names imply edge semantics (`Pressed`) while APIs accept full-state updates and emit level-triggered events.

## Missing validation
- No smoke covers AssistanceTargetKit terminal lost-state mutation.
- No smoke covers TransferZoneKit `accepts`, `capacity`, or `dwellSeconds`.
- No smoke covers initial completed/discovered counts for LandmarkGuidanceKit or EnvironmentalAffordanceKit.
- No smoke covers InputIntentKit press/hold/release event semantics.
- Existing `npm test` passes, so none of these issues are caught today.
- No Playwright/human-view validation was applicable for this source-only scout lane beyond existing command validation.

## DSK promotion blockers
- Blocking for recovery/transfer domain promotion:
  - AssistanceTargetKit allows contradictory lost+completed terminal state.
  - TransferZoneKit ignores acceptance and capacity constraints.
- Promotion-adjacent:
  - Spatial guidance and affordance kits have inconsistent initial aggregate progress counts.
  - InputIntentKit press events are level-triggered and can double-trigger one-shot actions.
- Still open from prior packets:
  - DSK/runtime install atomicity and rollback.
  - DSK namespace safety.
  - Direct install dependency parity.
  - SequenceNode boot/frame source ordering.
  - Generic runtime kit duplicate id enforcement.
  - Operations/logistics same-phase event handoff.
  - Public proof browser route loading.

## Suggested next review item
- Review terminal-state and constraint-policy semantics across recovery/transfer/spatial interaction kits before promoting rescue, logistics, AR training, or puzzle DSK candidates.

## Not claimed
- This packet does not fix bugs.
- This packet does not create tests.
- This packet does not edit source, tests, docs, package metadata, `memory.md`, `.agent` files, or public claims.
- This packet does not claim browser human-view behavior was validated.
- This packet does not supersede prior DSK, SequenceNode, renderer, terrain, AR, operations, or public-proof findings.
