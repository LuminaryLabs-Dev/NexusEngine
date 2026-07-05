# Deep Bug Report Packet: 2026-06-19T08:56:02-04:00

Timestamp: 2026-06-19T08:56:02-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-bridge-phase-wrapper-state`.
- Earlier deep packets already cover invalid SequenceNode deployment side effects, terrain cache retention, stale AR failure sessions, DSK install atomicity, SequenceNode boot/frame order, default camera crash, ActionMovementKit killY masking, duplicate direct kit ids, cleanup event lifetime, disposed SequenceNode mutation, renderer fallback mismatch, request/economy order, request defaults, cargo negative value, telemetry `historyLimit:0`, assistance/transfer/spatial-progress/input state machines, objective reset/completion, lifecycle accepted mutation, transport catch-up, schedule scale normalization, occupant reset/id uniqueness, facility/economy non-finite ledgers, resource-pressure restored-state contradictions, SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, VehicleDynamics zero-capacity boost, receipt identity/idempotency/request-id bugs, AR/objective bridge phase, missing step receipts, and inert delegated wrapper state.
- Neighboring ecosystem state packet `2026-06-19T08-13-48-0400` says core and ProtoKits remain release-aligned and validation-green, while Experiments latest fetched ref, public browser proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening/bridge-state gates remain open.
- Neighboring DSK architecture packet `2026-06-19T08-23-23-0400` adds bridge phase delivery, step-transition receipts, delegated-action reconciliation, and wrapper state contracts to DSK promotion fixture gates.
- Neighboring ecosystem proof packet `2026-06-19T08-48-39-0400` keeps public DSK proof browser-stuck at `Booting...`, reopens Experiments latest-ref proof, and marks aggregate ProtoKits validation incomplete for that run.
- Neighboring domain idea packet `2026-06-19T08-00-55-0400` converts bridge/state bugs into planning inventory.
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
  - `state/automation/deep_bug_report_scout/packets/2026-06-19T08-56-02-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T08-56-02-0400-deep-bug-node.md`
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
- `state/automation/README.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/deep_bug_report_scout/PROMPT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest two current-lane packets and nodes.
- Latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`
- `tests/procedural-navigation-smoke.mjs`
- `src/water-surface-kit.js`
- `src/route-field-kit.js`
- `src/render-descriptor-kit.js`
- `src/economy-kit.js`
- `src/pursuit-pressure-kit.js`
- `src/scenario-driver-kit.js`
- `src/input-intent-kit.js`
- `src/engine.js`
- `src/surfaces.js`

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
- Existing-packet duplicate scan for `WaterSurface`, `RouteField`, `RenderDescriptor`, `metadata`, `ledgerLimit`, `EconomyKit`, `PursuitPressure`, `caught false`, `config mutation`, and `slice(-0)`.
  - Result: prior packets cover OccupantFlow mutable spawn-rule config, Facility/Economy non-finite ledgers, and Telemetry `slice(-0)`, but no prior deep packet reports WaterSurface/RouteField/RenderDescriptor nested config leaks, EconomyKit `ledgerLimit:0`, or PursuitPressure initial caught-state contradiction.
- Inline Node probe: nested config/reset leaks.
  - Result: mutating runtime nested metadata in WaterSurface and RouteField survived `reset()` and mutated caller config; mutating RenderDescriptor material metadata mutated caller config directly.
- Inline Node probe: EconomyKit ledger limit.
  - Result: `ledgerLimit:0` retained `transaction-1`; `ledgerLimit:-1` retained `transaction-2`.
- Inline Node probe: PursuitPressure initial caught state and drift recovery.
  - Result: initial state was `{ band:"caught", caught:false, distance:5 }`; after one recovery tick it became `{ band:"danger", caught:false, distance:10 }` with `caughtBatches:0` and `recoveredBatches:0`.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around SequenceNode boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Prior deep packet `2026-06-18T22-52-38-0400`: avoided duplicates around request/economy order, request default reward, cargo negative value, and TelemetryKit `historyLimit:0`.
- Prior deep packet `2026-06-18T23-53-22-0400`: avoided duplicates around assistance terminal state, transfer constraints, restored progress counts, and input edge semantics.
- Prior deep packet `2026-06-19T00-54-03-0400`: avoided duplicates around objective reset/completion, lifecycle accepted mutation, transport catch-up, and schedule scale normalization.
- Prior deep packet `2026-06-19T01-53-53-0400`: avoided duplicates around OccupantFlow mutable spawn-rule config, generated occupants, facility/economy non-finite transactions, and resource-pressure restored-state contradictions.
- Prior deep packet `2026-06-19T05-53-25-0400`: avoided duplicates around SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, and VehicleDynamics zero-capacity boost.
- Prior deep packet `2026-06-19T06-53-41-0400`: avoided duplicates around TimingWindow result id overwrite, InteractionTarget repeated completion, Collectible duplicate claim events, and RequestFulfillment generated request id collision.
- Prior deep packet `2026-06-19T07-53-41-0400`: avoided duplicates around AR/objective bridge phase, missing step-completion receipts, and inert delegated wrapper state.

## Executive summary
- Current smoke tests still pass, but reset/snapshot safety and validation-ledger semantics remain weak in less-covered route, water, render descriptor, economy, and pursuit-pressure surfaces.
- Highest-impact bug: WaterSurfaceKit and RouteFieldKit shallow-copy nested `metadata`, while RenderDescriptorKit stores caller-owned datasets directly. Runtime state mutations can mutate caller config and survive `reset()`.
- EconomyKit exposes a `ledgerLimit` option but `ledgerLimit:0` keeps the full ledger entry because `slice(-0)` is equivalent to `slice(0)`.
- PursuitPressureKit can initialize in the caught band with `caught:false`, then recover out of the caught band without ever emitting caught or recovered events.

## Deep bug reports

### 1. Nested authored metadata leaks into runtime state and reset output
- Severity: high
- Owner: state/reset/config isolation
- Evidence files and line references:
  - `src/water-surface-kit.js:11-25` normalizes zones but assigns `metadata: zone.metadata ?? {}` by reference.
  - `src/water-surface-kit.js:97-99` resets from the same captured config.
  - `src/route-field-kit.js:11-20` and `src/route-field-kit.js:23-31` assign marker/corridor metadata by reference.
  - `src/route-field-kit.js:78-80` resets from the same captured config.
  - `src/render-descriptor-kit.js:10-24` stores `building`, `scene`, `visual`, arrays, and `byId()` objects from caller datasets without cloning.
- Reproduction path:
  - Install WaterSurfaceKit with zone metadata `{ tags:["safe"] }`, mutate `world.getResource(WaterSurfaceState).zones[0].metadata.tags`, then call `engine.waterSurface.reset()`.
  - Install RouteFieldKit with marker metadata `{ tags:["route"] }`, mutate `RouteFieldState.markers[0].metadata.tags`, then call `engine.routeField.reset()`.
  - Install RenderDescriptorKit with material metadata `{ tags:["visual"] }`, mutate `engine.renderDescriptors.getState().materials["mat-a"].metadata.tags`.
  - Probe result: WaterSurface reset tags and caller config were `["safe","runtime"]`; RouteField reset tags and caller config were `["route","runtime"]`; RenderDescriptor caller config was `["visual","runtime"]`.
- Expected behavior:
  - Runtime state and reset output should be isolated from authored config, or APIs should explicitly document shared mutable datasets.
- Actual behavior:
  - Nested runtime mutations leak into original config and reset rebuilds from already-mutated nested data.
- Why it matters for production scaling:
  - Long-lived hosts, replay tests, saved-state restore, and DSK promotion fixtures need reset to rebuild from immutable authored data. Shared references make later runs depend on previous runtime mutation.
- Validation needed:
  - Add reset/config isolation smokes for nested metadata in water, route, render descriptor, and other dataset-driven kits.
- Suggested fix direction:
  - Clone nested metadata/datasets during normalization and snapshot reads, or freeze caller-owned authored config at install time and keep runtime state separate.
- Blocks DSK promotion:
  - Yes for dataset-heavy water, route, render/proof, and state/reset services.

### 2. EconomyKit `ledgerLimit:0` retains transactions instead of keeping no ledger
- Severity: medium
- Owner: economy/ledger retention
- Evidence files and line references:
  - `src/economy-kit.js:56` uses `.slice(-Number(request.ledgerLimit ?? 120))`.
  - `src/economy-kit.js:96-99` exposes `transact()` as the public service path.
  - Existing tests cover normal economy flow but not ledger retention limits.
- Reproduction path:
  - Install `createEconomyKit({ accounts:{ cash:10 } })`.
  - Call `engine.economy.transact({ amount:5, ledgerLimit:0 })`.
  - Probe result: ledger length was `1` with `transaction-1`.
  - Calling `ledgerLimit:-1` retained one transaction as well.
- Expected behavior:
  - `ledgerLimit:0` should retain no transactions, or zero/negative limits should be rejected or normalized consistently.
- Actual behavior:
  - JavaScript `slice(-0)` returns the full array, so zero keeps the transaction.
- Why it matters for production scaling:
  - Economy ledgers are proof and replay surfaces. Hosts that intentionally disable ledger retention can still retain transaction data and expose misleading proof/snapshot size.
- Validation needed:
  - Add EconomyKit ledger-limit smokes for `0`, negative, non-finite, and positive limits.
- Suggested fix direction:
  - Normalize retention limits before slicing; treat `0` as `[]`, reject negative/non-finite limits, or document a minimum retention of one.
- Blocks DSK promotion:
  - Promotion-adjacent for economy/ledger DSKs and proof-retention policy.

### 3. PursuitPressureKit can start caught without caught state or recovery receipts
- Severity: medium
- Owner: pursuit/recovery state machine
- Evidence files and line references:
  - `src/pursuit-pressure-kit.js:28-42` derives `band` from `startDistance` but always sets `caught:false`.
  - `src/pursuit-pressure-kit.js:45-68` skips all tick work only after `state.caught` is true, so an initially caught band can drift/recover before ever becoming caught.
  - `src/pursuit-pressure-kit.js:99-101` emits recovered only when previous `state.caught` was true.
- Reproduction path:
  - Install `createPursuitPressureKit({ startDistance:5, catchDistance:8, closeRatePerSecond:0, recoverRatePerSecond:5, maxDistance:50 })`.
  - Subscribe to `PursuitPressureCaught`, `PursuitPressureChanged`, and `PursuitPressureRecovered`.
  - Probe initial state: `{ band:"caught", caught:false, distance:5 }`.
  - Tick once.
  - Probe result: state became `{ band:"danger", caught:false, distance:10 }`, `changedBatches:1`, `caughtBatches:0`, and `recoveredBatches:0`.
- Expected behavior:
  - Initial caught-band state should either set `caught:true` and emit/record terminal caught state, or normalize start distance outside catch range. If it recovers from caught range, recovery receipts should reflect that transition.
- Actual behavior:
  - The state says caught by band but not by boolean; recovery drift can leave the caught zone without a caught or recovered receipt.
- Why it matters for production scaling:
  - Pursuit, rescue, courier, and pressure scenarios rely on terminal/recovered receipts for failure, restart, telemetry, and proof rows. Contradictory initial state can hide a failed scenario.
- Validation needed:
  - Add PursuitPressure smokes for initial distances below/equal/above catch distance, recovery out of caught range, and caught/recovered event pairs.
- Suggested fix direction:
  - Derive initial `caught` from `distance <= catchDistance`, emit an explicit initial-state receipt if needed, and define whether tick recovery is allowed after caught state.
- Blocks DSK promotion:
  - Promotion-adjacent for pursuit/pressure scenario services and recovery-state proof.

## Domain and kit expansion risks
- Dataset-driven domains need a shared immutable-config/reset policy, not one-off shallow normalization.
- Economy/proof ledgers need retention normalization distinct from telemetry history, because both have now shown `slice(-0)` style traps.
- Pressure/recovery domains need consistent initial-state derivation and receipt policy before being used as scenario pass/fail gates.

## Cross-cutting risks
- Shallow copies make reset look deterministic while retaining mutated nested data.
- Retention limit semantics can silently invert at zero across different proof/history surfaces.
- Band labels and terminal booleans can disagree when initial state is derived in two separate ways.

## Missing validation
- Nested config isolation for WaterSurface, RouteField, RenderDescriptor, and similar dataset kits.
- Economy ledger retention limits for zero, negative, and non-finite values.
- PursuitPressure initial caught-state consistency and caught/recovered event receipts.
- Reset-from-source proof across all dataset-heavy kits before DSK promotion.

## DSK promotion blockers
- Dataset-heavy kits are not reset/snapshot promotion-ready while nested authored config can be mutated by runtime state.
- Economy ledger retention is not proof-retention-ready while `ledgerLimit:0` keeps data.
- PursuitPressure terminal/recovery state is not scenario-proof-ready while initial caught state can be contradictory and eventless.
- Existing install, namespace, public proof, bridge-state, receipt identity, idempotency, generated-id, terrain, renderer, AR session, and operations-domain blockers from prior lanes remain open.

## Suggested next review item
- Review reset/config isolation across all dataset-driven kits, then add a small fixture that mutates nested runtime state, calls reset, and asserts original config plus reset state stay clean.

## Not claimed
- This packet does not edit source, tests, README, docs, package metadata, public claims, `.agent`, or repo `memory.md`.
- This packet does not fix WaterSurface, RouteField, RenderDescriptor, Economy, or PursuitPressure.
- This packet does not claim public browser proof works.
- This packet does not supersede prior DSK install, public proof, bridge-state, receipt identity, event idempotency, generated-id, terrain, renderer, AR session, or operations-domain findings.
