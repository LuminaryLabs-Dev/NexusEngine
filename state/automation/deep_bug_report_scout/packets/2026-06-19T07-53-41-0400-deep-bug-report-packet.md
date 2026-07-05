# Deep Bug Report Packet: 2026-06-19T07:53:41-04:00

Timestamp: 2026-06-19T07:53:41-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-receipt-identity-idempotency`.
- Earlier deep packets already cover invalid SequenceNode deployment side effects, terrain cache retention, stale AR failure sessions, DSK install atomicity, SequenceNode boot/frame order, default camera crash, ActionMovementKit killY masking, duplicate direct kit ids, cleanup event lifetime, disposed SequenceNode mutation, renderer fallback mismatch, request/economy order, request defaults, cargo negative value, telemetry `historyLimit:0`, assistance/transfer/spatial-progress/input state machines, objective reset/completion, lifecycle accepted mutation, transport catch-up, schedule scale normalization, occupant reset/id uniqueness, facility/economy non-finite ledgers, resource-pressure restored-state contradictions, SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, VehicleDynamics zero-capacity boost activation, and receipt identity/event idempotency/request-id bugs.
- Neighboring ecosystem state packet `2026-06-19T07-11-00-0400` says core, ProtoKits, and Experiments are clean/aligned and validation-green, but public browser proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening gates remain open.
- Neighboring DSK architecture packet `2026-06-19T07-24-53-0400` adds receipt identity, event idempotency, claim policy, and request identity to DSK hardening gates.
- Neighboring ecosystem proof packet `2026-06-19T07-42-18-0400` keeps public proof stuck at `Booting...` and separates local/targeted proof from public-browser proof.
- Neighboring domain idea packet `2026-06-19T07-01-13-0400` maps receipt integrity into planning inventory.
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
  - `state/automation/deep_bug_report_scout/packets/2026-06-19T07-53-41-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T07-53-41-0400-deep-bug-node.md`
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
- `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/deep_bug_report_scout/PROMPT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest three current-lane packets and nodes.
- Latest neighboring packets and nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/surface-placement-kit.js`
- `src/objective-flow-kit.js`
- `src/ar-kit.js`
- `src/ar-experience-kit.js`
- `src/symbol-alignment-kit.js`
- `src/lock-and-socket-kit.js`
- `src/reveal-light-kit.js`
- `src/sorting-kit.js`
- `src/moving-target-kit.js`
- `src/micro-platformer-kit.js`
- `src/shrine-puzzle-kit.js`
- `src/interaction-target-kit.js`
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
- Existing-packet duplicate scan for `surfacePlacement`, `ARExperience`, `microPlatformer`, `symbolAlignment`, `lockAndSocket`, `revealLight`, `sorting`, `movingTargets`, `inert`, and step-completion event terms.
  - Result: no prior deep packet reported inert AR anchor placement bridging, missing step-completion events, or puzzle/platformer wrapper state that never changes after delegated actions.
- Inline Node probe: raw AR anchor to surface placement bridge.
  - Result: `engine.ar.placeAnchor({ anchor })` plus an extra `tick(0)` left ObjectiveFlow place-step progress at `0`.
- Inline Node probe: ObjectiveFlow and ARExperience step-completion events.
  - Result: first steps completed and advanced to index `1`, but `ObjectiveStepCompleted` and `ARStepCompleted` event surfaces emitted no batches.
- Inline Node probe: puzzle/platformer delegated wrappers.
  - Result: delegated `InteractionTargetKit` actions completed targets, but SymbolAlignment, LockAndSocket, RevealLight, Sorting, MovingTarget, and MicroPlatformer state stayed unchanged.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around SequenceNode boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Prior deep packet `2026-06-18T22-52-38-0400`: avoided duplicates around request/economy order, request default reward, cargo negative value, and telemetry `historyLimit:0`.
- Prior deep packet `2026-06-18T23-53-22-0400`: avoided duplicates around assistance terminal state, transfer constraints, restored progress counts, and input edge semantics.
- Prior deep packet `2026-06-19T00-54-03-0400`: avoided duplicates around objective reset/completion repeat, lifecycle accepted mutation, transport catch-up, and schedule scale normalization.
- Prior deep packet `2026-06-19T01-53-53-0400`: avoided duplicates around occupant reset/id uniqueness, facility/economy non-finite transactions, and resource-pressure restored-state contradictions.
- Prior deep packet `2026-06-19T05-53-25-0400`: avoided duplicates around SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, and VehicleDynamics zero-capacity boost.
- Prior deep packet `2026-06-19T06-53-41-0400`: avoided duplicates around TimingWindow result id overwrite, InteractionTarget repeated completion, Collectible duplicate claim events, and RequestFulfillment generated request id collision.

## Executive summary
- Current smoke tests still pass, but AR placement, objective/AR step receipts, and several puzzle/platformer wrappers have broken action bridges that current tests do not cover.
- Highest-impact bug: `SurfacePlacementKit` listens for `ARAnchorPlaced` during `resolve` and emits `ObjectiveFlowAction` after ObjectiveFlow's `simulate` phase has already run, so raw AR placement events are cleared before they can advance objectives.
- ObjectiveFlowKit and ARExperienceKit define step-completion events but never emit them on normal step transitions because they test the pre-action step object after replacing state.
- Several public wrapper kits delegate actions into InteractionTargetKit but never update their own advertised progress fields, making their domain APIs effectively inert.

## Deep bug reports

### 1. SurfacePlacementKit raw AR anchor bridge never advances ObjectiveFlow
- Severity: high
- Owner: AR/objective placement bridge
- Evidence files and line references:
  - `src/surface-placement-kit.js:8-11` reads `ARAnchorPlaced` and emits `ObjectiveFlowAction` from a `resolve` phase system.
  - `src/surface-placement-kit.js:18-20` registers that bridge in `resolve`.
  - `src/objective-flow-kit.js:115-117` processes ObjectiveFlow actions in `simulate`, which has already passed when the bridge emits.
  - `src/ar-kit.js:147-150` `engine.ar.placeAnchor()` emits `ARAnchorPlaced` and ticks immediately.
- Reproduction path:
  - Install `createARKit()`, `createObjectiveFlowKit({ steps:[{ id:"place", requiredAction:"place", target:1 }] })`, and `createSurfacePlacementKit()`.
  - Call `engine.ar.placeAnchor({ anchor:{ id:"raw-anchor" } })`.
  - Tick once more with `engine.tick(0)`.
  - Probe result: ObjectiveFlow place progress stayed `0`.
- Expected behavior:
  - Raw AR anchor placement should advance the configured place objective through the bridge, or the bridge should not claim to own anchor-to-objective progress.
- Actual behavior:
  - The bridge emits too late in the tick and the action is cleared before ObjectiveFlow can read it.
- Why it matters for production scaling:
  - AR training and placement flows can appear placed in AR state while objective, collectible, telemetry, or proof state remains stuck.
- Validation needed:
  - Add an AR placement smoke where `engine.ar.placeAnchor()` alone advances ObjectiveFlow, plus a check that `surfacePlacement.place()` and raw AR placement have the same semantics.
- Suggested fix direction:
  - Move the bridge to an earlier phase than ObjectiveFlow, process ObjectiveFlow in a later phase, or call the ObjectiveFlow API directly from the placement service without relying on same-tick event relay.
- Blocks DSK promotion:
  - Yes for AR placement/objective bridge promotion and public browser proof readiness.

### 2. ObjectiveFlowKit and ARExperienceKit never emit step-completion transition events
- Severity: medium
- Owner: objective/AR flow receipts
- Evidence files and line references:
  - `src/objective-flow-kit.js:90-96` captures `previousStep` before applying an action, then checks `previousStep.complete` after state replacement.
  - `src/ar-experience-kit.js:103-109` uses the same pre-action step comparison for `ARStepCompleted`.
  - `tests/procedural-navigation-smoke.mjs` covers final objective state but not `ObjectiveStepCompleted` or `ARStepCompleted` event surfaces.
- Reproduction path:
  - Install a two-step ObjectiveFlow with first step target `1`, subscribe to `ObjectiveStepCompleted`, and call `objectiveFlow.action("go")`.
  - Install a two-step ARExperience with first step target `1`, subscribe to `ARStepCompleted`, and call `arExperience.action("go")`.
  - Probe result: both flows advanced to step index `1` with the first step complete, but both event arrays were empty.
- Expected behavior:
  - Completing a step and advancing to the next step should emit the corresponding step-completion event once.
- Actual behavior:
  - The completed copy lives in the new `state.steps`; the captured `previousStep` is the old incomplete object, so the event guard never passes.
- Why it matters for production scaling:
  - Step receipts drive tutorials, AR lessons, telemetry, unlocks, proof rows, and SequenceNode bridges. Missing receipts force consumers to poll state or miss transitions entirely.
- Validation needed:
  - Add ObjectiveFlow and ARExperience smokes for step completion events, final step completion, and no duplicate step event on later ticks.
- Suggested fix direction:
  - Compare previous and next state by step id/progress, or capture `wasComplete` before the action and emit when `!wasComplete && completedStep.complete`.
- Blocks DSK promotion:
  - Promotion-adjacent for objective, AR lesson, telemetry, and sequence bridge services.

### 3. Puzzle and micro-platformer wrapper kits expose inert domain state after delegated actions
- Severity: medium
- Owner: puzzle/interaction wrapper domains
- Evidence files and line references:
  - `src/symbol-alignment-kit.js:18-24` delegates `align()` to InteractionTargetKit but never updates `SymbolAlignmentState.aligned`.
  - `src/lock-and-socket-kit.js:19-29` delegates `light()`/`unlock()` but never updates `filled` or `unlocked`.
  - `src/reveal-light-kit.js:19-25` delegates `pulse()` but never updates `pulses` or `overexposure`.
  - `src/sorting-kit.js:18-24` delegates `sort()` but never updates `sorted`.
  - `src/moving-target-kit.js:18-24` delegates `catch()` but never updates target/catch state.
  - `src/micro-platformer-kit.js:20-30` delegates `jump()`/`enter()` but never updates `jumps`, `failures`, or `goalReached`.
- Reproduction path:
  - Install InteractionTargetKit targets for `align`, `unlock`, `pulse`, `sort`, `catch`, `jump`, and `enter`.
  - Install the wrapper kits and call their public APIs.
  - Probe result: InteractionTarget state completed delegated targets, but each wrapper resource stayed at its initial counters/flags.
- Expected behavior:
  - Public domain APIs should either update their advertised state or expose themselves explicitly as stateless action adapters.
- Actual behavior:
  - The methods return domain state that never reflects the delegated action.
- Why it matters for production scaling:
  - Puzzle, platformer, AR lesson, and proof hosts can read apparently valid kit snapshots and conclude that no progress occurred even though InteractionTargetKit completed the underlying target.
- Validation needed:
  - Add focused smokes for each wrapper's public API, state mutation contract, and delegated InteractionTarget behavior.
- Suggested fix direction:
  - Add small systems or direct mutations that reconcile InteractionTarget completions into wrapper-owned state, or remove/rename progress fields so wrappers are not advertised as stateful domains.
- Blocks DSK promotion:
  - Yes for these wrappers as promoted puzzle/platformer services; they currently lack a coherent owned-state contract.

## Domain and kit expansion risks
- AR placement domains need a single owner for anchor-to-objective progress so mode-specific AR placement and generic surface placement do not diverge.
- Objective and AR lesson domains need transition receipt fixtures before telemetry, SequenceNode, or public proof surfaces depend on step events.
- Puzzle/platformer wrapper domains need a clear decision: stateless adapter over InteractionTargetKit, or stateful DSK with owned progress fields and reset/snapshot policy.

## Cross-cutting risks
- Event bridges that emit after their consumers' scheduler phase can silently drop work at tick cleanup.
- Public APIs may return authoritative-looking state even when all real progress is delegated elsewhere.
- Current tests emphasize final happy-path state but do not assert bridge events, step receipts, or wrapper-owned state.

## Missing validation
- Raw `ARAnchorPlaced` to ObjectiveFlow placement progress.
- ObjectiveFlow `ObjectiveStepCompleted` transition event.
- ARExperience `ARStepCompleted` transition event.
- Puzzle wrapper state mutation after delegated interaction completion.
- MicroPlatformer public API mutation or explicit stateless-adapter contract.

## DSK promotion blockers
- AR placement/objective bridge semantics are not promotion-ready because raw AR placement does not advance objectives.
- Objective/AR step receipts are not promotion-ready because transition events are missing.
- Puzzle/platformer wrappers are not promotion-ready because their state ownership is incoherent.
- Existing install, namespace, public proof, receipt identity, idempotency, and generated-id blockers from prior lanes remain open.

## Suggested next review item
- Review bridge phase contracts across AR, ObjectiveFlow, ARExperience, InteractionTarget, and wrapper kits: every emitted event should have a same-tick consumer or an explicit next-tick persistence policy.

## Not claimed
- This packet does not edit source, tests, README, docs, package metadata, public claims, `.agent`, or repo `memory.md`.
- This packet does not fix AR placement, ObjectiveFlow, ARExperience, puzzle wrappers, or MicroPlatformer.
- This packet does not claim public browser proof works.
- This packet does not supersede prior DSK install, public proof, receipt identity, idempotency, generated-id, terrain, renderer, AR session, or operations-domain findings.
