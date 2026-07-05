# Deep Bug Report Packet: 2026-06-19T05:53:25-04:00

Timestamp: 2026-06-19T05:53:25-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-occupant-facility-pressure`.
- Earlier deep packets already cover invalid SequenceNode deployment side effects, terrain cache retention, stale AR failure sessions, DSK install atomicity, SequenceNode boot/frame order, default camera crash, ActionMovementKit killY masking, duplicate direct kit ids, cleanup event lifetime, disposed SequenceNode mutation, renderer fallback mismatch, request/economy order, request defaults, cargo negative value, telemetry `historyLimit:0`, assistance/transfer/spatial-progress/input state machines, objective reset/completion, lifecycle accepted mutation, transport catch-up, schedule scale normalization, occupant reset/id uniqueness, facility/economy non-finite ledgers, and resource-pressure restored-state contradictions.
- Neighboring DSK architecture packet `2026-06-19T05-40-58-0400` says current `origin/0.0.2` is test-green but DSK promotion is blocked by namespace, install, dependency, state-contract, service-call, and operations data invariants.
- Neighboring ecosystem proof packet `2026-06-19T05-42-20-0400` says core is release-aligned and local proof smokes pass, but sibling checkouts are behind fetched release refs and the public browser proof still stalls on missing module paths.
- Neighboring ecosystem state packet `2026-06-19T01-11-04-0400` keeps public browser proof, aggregate DSK proof coverage, npm metadata, and package-version policy open.
- Neighboring domain idea packet `2026-06-19T02-02-08-0400` maps operations data integrity into planning inventory.
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
- Worktree had pre-existing modified/untracked neighboring automation lane files before this run.
- This lane wrote only:
  - `state/automation/deep_bug_report_scout/packets/2026-06-19T05-53-25-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T05-53-25-0400-deep-bug-node.md`
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
- Latest current-lane packet and node.
- Latest neighboring packets and nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/spatial-scale-kit.js`
- `src/scenario-duration-kit.js`
- `src/hazard-field-kit.js`
- `src/vehicle-dynamics-kit.js`
- `src/timing-window-kit.js`
- `src/request-fulfillment-kit.js`
- `src/cargo-manifest-kit.js`
- `src/route-field-kit.js`
- `src/water-surface-kit.js`
- `tests/procedural-navigation-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked neighboring automation lane files.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan:
  - Result: no prior deep packet reported SpatialScale anchor-entry suppression, ScenarioDuration zero-duration inert state, HazardField generated id collisions, or VehicleDynamics zero-max boost activation.
- Inline Node probe: SpatialScale outside-nearest then inside transition.
  - Result: final `activeAnchorId:"anchor-a"` and `inside:true`, but `SpatialScaleAnchorEntered` event count was `0`.
- Inline Node probe: VehicleDynamics boost with `{ start:100, max:0 }`.
  - Result: after one boosted tick, `boost:{ value:0, max:0, active:true }`, velocity `x:100`, position `x:100`, and `lastInput.boost:true`.
- Inline Node probe: ScenarioDuration with `durationSeconds:0` and checkpoint at `0`.
  - Result: initial and zero-delta tick both stayed `completed:false`, checkpoint `reached:false`, completed events `0`; a later positive tick completed it.
- Inline Node probe: HazardField with initial `pulse-1` plus spawn rule `id:"pulse"`.
  - Result: hazard ids after one tick were `["pulse-1","pulse-1"]`.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around invalid SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around engine SequenceNode boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Prior deep packet `2026-06-18T22-52-38-0400`: avoided duplicates around request/economy order, request default reward, cargo negative value, and telemetry `historyLimit:0`.
- Prior deep packet `2026-06-18T23-53-22-0400`: avoided duplicates around assistance terminal state, transfer constraints, restored progress counts, and input edge semantics.
- Prior deep packet `2026-06-19T00-54-03-0400`: avoided duplicates around objective reset/completion idempotency, lifecycle accepted mutation, transport catch-up, and schedule scale normalization.
- Prior deep packet `2026-06-19T01-53-53-0400`: avoided duplicates around occupant reset/id uniqueness, facility/economy non-finite transactions, and resource-pressure restored-state contradictions.

## Executive summary
- Current smoke tests still pass, but spatial, scenario, hazard, and vehicle domains have event-transition, zero-duration, identity, and boost-state edge cases not covered by existing proof.
- Highest-impact bug: SpatialScaleKit stores the nearest anchor id even while outside its radius, then suppresses `SpatialScaleAnchorEntered` when the subject later moves inside that same anchor.
- ScenarioDurationKit cannot complete a zero-duration scenario or zero-second checkpoint on initialization or zero-delta validation ticks.
- HazardFieldKit starts generated `nextSequence` at `1` without checking initial hazards, so spawned hazards can duplicate authored ids.
- VehicleDynamicsKit allows `boost.value` to exceed `boost.max` at initialization and grants one boosted frame even when max boost capacity is zero.

## Deep bug reports

### 1. SpatialScaleKit suppresses anchor-entered events after an outside-nearest query
- Severity: high
- Owner: spatial guidance / event transition domain
- Evidence files and line references:
  - `src/spatial-scale-kit.js:29-43` initializes `activeAnchorId:null` and `activeBand:null`.
  - `src/spatial-scale-kit.js:51-59` returns the nearest anchor even when `inside:false`.
  - `src/spatial-scale-kit.js:85-95` stores `activeAnchorId` from the nearest anchor and emits `SpatialScaleAnchorEntered` only when the inside anchor id differs from prior `activeAnchorId`.
  - `tests/procedural-navigation-smoke.mjs:385-397` covers a direct near/inside classification but not outside-to-inside entry events.
- Reproduction path:
  - Create one anchor at `{ x:0, y:0, radius:5 }`.
  - Call `setSubject({ x:20, y:0 })`; this records `activeAnchorId:"anchor-a"` while outside.
  - Call `setSubject({ x:0, y:0 })`; the latest query is inside the anchor.
  - Probe result: `activeAnchorId:"anchor-a"`, `inside:true`, `SpatialScaleAnchorEntered` count `0`.
- Expected behavior:
  - Entering the radius from outside should emit `SpatialScaleAnchorEntered`, even if the same anchor was already nearest.
- Actual behavior:
  - Nearest-anchor state is conflated with inside-anchor state and the entry transition is missed.
- Why it matters for production scaling:
  - AR training, spatial guidance, proximity onboarding, accessibility bands, and inspection triggers can silently miss first-entry logic.
- Validation needed:
  - Add SpatialScale transition smokes for outside-nearest to inside, inside to outside, and changing nearest anchors while outside.
- Suggested fix direction:
  - Track nearest anchor and inside/entered anchor separately, or compare previous `inside` state instead of only previous anchor id.
- Blocks DSK promotion:
  - Yes for spatial guidance DSKs that depend on reliable entry events.

### 2. ScenarioDurationKit zero-duration scenarios stay incomplete until positive time advances
- Severity: medium
- Owner: scenario/time validation domain
- Evidence files and line references:
  - `src/scenario-duration-kit.js:22-36` always initializes `completed:false` and checkpoints with `reached:false`, even when `durationSeconds` and checkpoint `atSeconds` are zero.
  - `src/scenario-duration-kit.js:39-43` returns early for zero-delta ticks.
  - `src/scenario-duration-kit.js:53-56` completes only during a positive-delta system pass.
  - `tests/procedural-navigation-smoke.mjs:367-379` covers a five-second checkpoint but not zero-duration or zero-time checkpoints.
- Reproduction path:
  - Install `createScenarioDurationKit({ durationSeconds:0, checkpoints:[{ id:"start", atSeconds:0 }] })`.
  - Read initial state and then tick `0`.
  - Probe result: initial and zero-delta tick both show `completed:false`, checkpoint `reached:false`, and zero completion events. A later `tick(0.001)` completes.
- Expected behavior:
  - A zero-duration scenario should be complete at initialization or after a zero-delta validation tick, and zero-time checkpoints should be reached deterministically.
- Actual behavior:
  - Completion and checkpoint state require positive elapsed time even when thresholds are zero.
- Why it matters for production scaling:
  - Proof harnesses, instant tutorials, scenario gates, and reset validation often use zero-duration phases as immediate pass/fail or setup gates.
- Validation needed:
  - Add ScenarioDuration smokes for zero duration, zero-time checkpoint, reset from completed zero-duration state, and event behavior on zero-delta validation ticks.
- Suggested fix direction:
  - Derive initial checkpoint/completion state from normalized thresholds or allow zero-delta ticks to process threshold transitions without advancing elapsed time.
- Blocks DSK promotion:
  - Promotion-adjacent for scenario/time DSKs that need deterministic immediate gates.

### 3. HazardFieldKit can generate duplicate hazard ids when authored hazards use generated-looking ids
- Severity: high
- Owner: hazard field / stable identity domain
- Evidence files and line references:
  - `src/hazard-field-kit.js:86-100` normalizes initial hazards but always sets `nextSequence:1`.
  - `src/hazard-field-kit.js:59-83` generates spawned ids as `${rule.id}-${state.nextSequence}`.
  - `src/hazard-field-kit.js:132-141` pushes generated hazards without checking for existing ids.
  - `tests/procedural-navigation-smoke.mjs:288-304` covers hazard spawning and movement but not id uniqueness with authored hazards.
- Reproduction path:
  - Create initial hazard `{ id:"pulse-1" }`.
  - Add spawn rule `{ id:"pulse", intervalSeconds:1 }`.
  - Tick one second.
  - Probe result: hazard ids were `["pulse-1","pulse-1"]`.
- Expected behavior:
  - Generated hazard ids should be collision-free across authored, restored, and spawned hazards.
- Actual behavior:
  - `nextSequence` starts at one and can duplicate existing hazard ids.
- Why it matters for production scaling:
  - Rescue, aquarium, and logistics hazard graphs need stable ids for collision attribution, telemetry, replay, and removal policies.
- Validation needed:
  - Add HazardField smokes for initial hazards plus generated hazards, restored state, and multiple spawn rules sharing id prefixes.
- Suggested fix direction:
  - Initialize `nextSequence` from existing ids or allocate generated ids through a collision check against current hazards.
- Blocks DSK promotion:
  - Yes for hazard/director DSK promotion because stable identity is required for cross-domain telemetry and collision ownership.

### 4. VehicleDynamicsKit grants boosted motion with zero max boost capacity
- Severity: medium
- Owner: mobility / vehicle dynamics domain
- Evidence files and line references:
  - `src/vehicle-dynamics-kit.js:40-43` initializes `boost.value` and `boost.max` independently without clamping value to max.
  - `src/vehicle-dynamics-kit.js:69-82` computes `wantsBoost` from `boost.value > 0`, not from capacity normalized against max, then marks boost active.
  - `src/vehicle-dynamics-kit.js:71-76` applies boosted acceleration before clamping boost value back to max.
  - `tests/procedural-navigation-smoke.mjs:306-335` covers normal vehicle movement on water but not zero-capacity or exhausted boost.
- Reproduction path:
  - Install `createVehicleDynamicsKit({ boost:{ start:100, max:0 }, profile:{ acceleration:10, boostMultiplier:10, drag:0 } })`.
  - Emit `{ x:1, boost:true }` and tick one second.
  - Probe result: `boost:{ value:0, max:0, active:true }`, velocity `x:100`, position `x:100`, and `lastInput.boost:true`.
- Expected behavior:
  - A zero-capacity boost meter should never apply boosted acceleration or report active boost.
- Actual behavior:
  - The first tick uses the unnormalized starting value to grant boosted acceleration, then clamps value to zero afterward.
- Why it matters for production scaling:
  - Mobility, rescue, and validation scenarios can use disabled boost, depleted boost, or replayed snapshots. A one-frame free boost breaks deterministic movement and tuning.
- Validation needed:
  - Add VehicleDynamics smokes for `boost.max:0`, `boost.start > max`, exhausted boost, and reset normalization.
- Suggested fix direction:
  - Normalize boost state at initialization and reset by clamping `value` to `[0,max]`, and compute `wantsBoost` from normalized available capacity.
- Blocks DSK promotion:
  - Promotion-adjacent for mobility DSKs because resource-bounded movement should be deterministic and config-safe.

## Domain and kit expansion risks
- Spatial guidance examples need separate nearest/inside/entered state before proximity services can safely trigger AR lessons, landmarks, or inspection gates.
- Scenario proof and validation kits need explicit zero-time policy for immediate gates, reset checks, and harness setup phases.
- Hazard/director services need stable generated identity across authored/restored/generated hazards.
- Vehicle and mobility kits need resource-bound normalization before broader rescue/logistics movement graphs rely on boost state.

## Cross-cutting risks
- Several domain kits still conflate query state with transition state.
- Stable generated ids are not consistently collision-checked across authored/restored datasets.
- Initial state normalization does not always enforce invariants that later systems assume.
- Zero-delta validation ticks are not uniformly able to settle immediate threshold state.

## Missing validation
- SpatialScale outside-nearest to inside entry event.
- SpatialScale nearest-anchor state versus inside-anchor state.
- ScenarioDuration zero duration and zero-time checkpoints.
- HazardField generated id uniqueness with initial/restored hazards.
- VehicleDynamics boost normalization for `start > max`, `max:0`, reset, and exhausted boost.
- Promotion fixtures for transition-state, immediate-time, stable-id, and resource-bound config policies.

## DSK promotion blockers
- Spatial guidance DSK promotion is blocked by missed anchor-entry transitions.
- Hazard/director DSK promotion is blocked by generated hazard id collisions.
- Scenario/time and mobility DSK promotion should wait for zero-time and boost-resource normalization policy fixtures.
- Existing install/namespace/public proof blockers from neighboring lanes remain open; this packet adds domain-transition and mobility-data blockers, not replacements.

## Suggested next review item
- Add focused transition/invariant smokes for SpatialScale entry events, HazardField id uniqueness, ScenarioDuration zero-time gates, and VehicleDynamics boost normalization before broad spatial/mobility/hazard DSK promotion claims.

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, or deployments were edited.
- Passing `npm test` does not prove spatial guidance, scenario/time, hazard, or mobility DSK readiness.
- This packet does not claim browser UX, public proof completion, npm publication, async execution, worker/network readiness, or broad domain graph promotion.
