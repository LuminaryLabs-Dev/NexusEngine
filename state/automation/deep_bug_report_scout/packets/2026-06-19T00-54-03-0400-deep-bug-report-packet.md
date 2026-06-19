# Deep Bug Report Packet: 2026-06-19T00:54:03-04:00

Timestamp: 2026-06-19T00:54:03-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for NexusRealtime runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: recovery, transfer, spatial progress, and input state-machine bugs from `2026-06-18T23-53-22-0400`.
- Earlier deep packets already cover invalid SequenceNode deployment side effects, terrain cache retention, stale AR failure sessions, DSK install atomicity, SequenceNode boot/frame ordering, default camera crash, ActionMovementKit killY masking, duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, renderer fallback mismatch, request/economy order, request default rewards, cargo negative value, telemetry `historyLimit:0`, lost assistance target completion, transfer constraints, restored spatial counts, and repeated input pressed events.
- Neighboring ecosystem state packet `2026-06-19T00-11-28-0400` says core, ProtoKits, and Experiments remain aligned on latest release branch `0.0.2`; local proof is green; public browser proof remains stuck at `Booting...`; npm metadata remains 404.
- Neighboring DSK architecture packet `2026-06-19T00-23-44-0400` keeps DSK production use gated by namespace safety, install transactions, dependency policy, state contracts, and domain state-machine semantics.
- Neighboring ecosystem proof packet `2026-06-18T23-39-46-0400` says local/raw proof remains green, but public proof needs browser-complete module loading and explicit aggregate DSK proof coverage.
- Domain kit idea packet `2026-06-19T00-00-19-0400` turns the latest state-machine gaps into terminal-state, transfer-constraint, input-edge, and proof-coverage planning inventory.
- These packets are context only. Live source, docs, tests, and preflight are authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404

## Current branch
- `0.0.2`, tracking `origin/0.0.2`
- `HEAD` and `origin/0.0.2`: `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`
- Ahead/behind against `origin/0.0.2`: `0 0`
- Worktree had pre-existing modified/untracked automation/doc artifacts before this run.
- This lane wrote only:
  - `state/automation/deep_bug_report_scout/packets/2026-06-19T00-54-03-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T00-54-03-0400-deep-bug-node.md`
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
- `src/objective-flow-kit.js`
- `src/lifecycle-progression-kit.js`
- `src/economy-kit.js`
- `src/transport-route-kit.js`
- `src/schedule-kit.js`
- `src/engine.js`
- `src/surfaces.js`
- `tests/procedural-navigation-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning docs.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Inline Node probe: ObjectiveFlowKit reset after progress.
  - Result: after completing step `a`, `reset()` returned `status:"intro"` and `currentStepIndex:0`, but step `a` still had `progress:1` and `complete:true`.
- Inline Node probe: ObjectiveFlowKit completion event surface after completion.
  - Result: subscribed `ObjectiveFlowCompleted` surface received 3 completion batches over action tick plus two later ticks.
- Inline Node probe: LifecycleProgressionKit blocked prerequisite with cost plus EconomyKit.
  - Result: item stayed `status:"planned"` with unmet prerequisite, but economy cash changed from `100` to `75` and ledger recorded a lifecycle charge.
- Inline Node probe: TransportRouteKit large delta over two-stop route.
  - Result: carrier with `speedStopsPerSecond:10` and `delta:1` moved from `A` only to `B`, kept rider onboard, and emitted no arrival at `C`.
- Inline Node probe: ScheduleKit invalid scale.
  - Result: `scale:"fast"` produced `elapsedSeconds: NaN`, no cycles, and a corrupted schedule snapshot.
- Earlier inline probe attempts had script-shape errors while reading events/snapshot fields; corrected probes above exited 0.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around invalid SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around engine SequenceNode boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Prior deep packet `2026-06-18T22-52-38-0400`: avoided duplicates around request/economy order, request default reward, cargo negative value, and telemetry `historyLimit:0`.
- Prior deep packet `2026-06-18T23-53-22-0400`: avoided duplicates around assistance terminal state, transfer constraints, restored progress counts, and input edge semantics.
- Neighboring architecture/proof/state/idea packets checked for DSK hardening and public proof context.

## Executive summary
- Existing smoke tests pass, but objective, lifecycle, transport, and schedule kits still have state-transition and numeric-invariant bugs not covered by current happy-path validation.
- Highest-impact bug: ObjectiveFlowKit reset can keep completed step progress, and the completed flow emits `ObjectiveFlowCompleted` on every later tick through event surfaces.
- LifecycleProgressionKit charges item cost before checking prerequisites, so a blocked start can spend currency while leaving the item planned.
- TransportRouteKit can under-travel for large deltas because it advances at most one stop per tick and discards leftover progress.
- ScheduleKit accepts non-finite scale values, which can corrupt `elapsedSeconds` with `NaN` and stall cycle emission.

## Deep bug reports

### 1. ObjectiveFlowKit reset preserves completed step progress and completion events repeat
- Severity: high
- Owner: objective/progression domain
- Evidence files and line references:
  - `src/objective-flow-kit.js:10-22` defaults `progress:0` and `complete:false`, then spreads `...step` afterward, so existing progress flags override reset defaults.
  - `src/objective-flow-kit.js:85-88` resets by calling `createState(previous)` where `previous` is the mutable runtime state, not the original config/dataset.
  - `src/objective-flow-kit.js:99-105` emits `ObjectiveFlowCompleted` every time the system runs while `state.completed` is true.
  - `src/objective-flow-kit.js:131-145` `reset()` and `complete()` both tick immediately, making these behaviors visible through public APIs.
  - `tests/procedural-navigation-smoke.mjs` covers many domain kits but does not exercise ObjectiveFlowKit reset or event-surface completion idempotency.
- Reproduction path:
  - Create an objective flow with steps `a` and `b`.
  - Complete step `a`, then call `engine.objectiveFlow.reset()`.
  - Probe result: reset returns intro/current step 0, but step `a` still has `progress:1` and `complete:true`.
  - Subscribe to an `ObjectiveFlowCompleted` event surface, complete a one-step flow, then tick twice.
  - Probe result: the surface receives 3 completion batches.
- Expected behavior:
  - Reset should rebuild from immutable config or scrub all runtime fields.
  - Completion event should emit only on the transition into completed state unless a repeat event is explicitly requested.
- Actual behavior:
  - Reset can leave completed steps inside an intro flow.
  - A completed flow publishes completion every later tick.
- Why it matters for production scaling:
  - Objective DSKs and AR/training flows need replayable reset semantics and one-shot completion events. Repeated completion can duplicate rewards, unlocks, telemetry, sequence transitions, or collectible grants.
- Validation needed:
  - Add existing-suite-compatible checks for reset after partial and full completion, and event-surface completion count after subsequent ticks.
- Suggested fix direction:
  - Preserve original normalized config separately, or reset by mapping steps through a runtime scrub that forces `progress:0` and `complete:false`.
  - Track completion edge emission with a `completionEmitted` flag or emit inside the transition branch in `applyAction()`.
- Blocks DSK promotion:
  - Yes for objective/progression DSK promotion. Reset/replay and one-shot event semantics are core promoted-service expectations.

### 2. LifecycleProgressionKit charges cost before blocked prerequisites are rejected
- Severity: high
- Owner: lifecycle/economy domain
- Evidence files and line references:
  - `src/lifecycle-progression-kit.js:33-35` defines prerequisite validation.
  - `src/lifecycle-progression-kit.js:38-46` rejects unmet prerequisites without starting the item.
  - `src/lifecycle-progression-kit.js:53-63` emits `EconomyTransactionRequest` for item cost before calling `startItem()`.
  - `src/economy-kit.js:51-60` applies economy transaction requests in `resolve`.
  - `tests/procedural-navigation-smoke.mjs` starts a valid lifecycle item but does not test rejected starts with costs.
- Reproduction path:
  - Create a lifecycle item with `prerequisites:["missing"]`, `cost:{ account:"cash", amount:25 }`, and `durationSeconds:0`.
  - Compose with EconomyKit account `cash:100`.
  - Call `engine.lifecycleProgression.start("locked")`.
  - Probe result: item remains `status:"planned"` and incomplete, but cash becomes `75` and ledger records the lifecycle charge.
- Expected behavior:
  - Costs should only be charged after the start request is accepted, or a rejected start should produce an explicit rejection event without economy mutation.
- Actual behavior:
  - A blocked lifecycle start mutates economy state.
- Why it matters for production scaling:
  - Upgrade, construction, training, and operations domains can drain accounts on invalid user actions, repeated automated attempts, or out-of-order service graphs.
- Validation needed:
  - Add lifecycle/economy smoke coverage for unmet prerequisites, unknown ids, already active/complete ids, insufficient funds, and valid starts.
- Suggested fix direction:
  - Validate item existence/status/prerequisites before emitting economy cost, and consider using an economy reservation/affordability handshake for starts that require funds.
- Blocks DSK promotion:
  - Yes for lifecycle/economy DSK promotion. Cross-domain mutations must be accepted-state atomic, not pre-validation side effects.

### 3. TransportRouteKit under-travels on large deltas and drops leftover progress
- Severity: medium
- Owner: transport/mobility domain
- Evidence files and line references:
  - `src/transport-route-kit.js:66-79` adds `delta * speedStopsPerSecond`, but only checks `if (progress >= 1)` once.
  - `src/transport-route-kit.js:76-79` resets progress to `0` after one stop, discarding excess movement.
  - `src/transport-route-kit.js:80-88` arrival only fires when the single advanced stop equals the target.
  - `tests/procedural-navigation-smoke.mjs` advances transport with many small ticks and does not test large-delta catch-up.
- Reproduction path:
  - Stops `A -> B -> C`, carrier at `A`, rider from `A` to `C`, `speedStopsPerSecond:10`.
  - Tick `1` second.
  - Probe result: carrier stops at `B`, target remains `C`, rider remains onboard, `lastArrival:null`.
- Expected behavior:
  - A delta large enough to traverse multiple stops should either advance through each reachable stop and emit arrivals, or clamp/record capped simulation behavior explicitly.
- Actual behavior:
  - The route advances at most one stop per tick and discards leftover progress.
- Why it matters for production scaling:
  - Background tabs, slow frames, save/load catch-up, and automation fast-forward can make transport simulations lag behind elapsed time and miss expected arrivals.
- Validation needed:
  - Add route tests for large delta, exact multiple-stop progress, non-looping end stops, and multiple onboard destinations.
- Suggested fix direction:
  - Use a while loop over accumulated progress, subtract one per crossed stop, and process board/exit decisions at each reached stop.
- Blocks DSK promotion:
  - Promotion-adjacent for transport/mobility DSKs that need deterministic catch-up and replay.

### 4. ScheduleKit accepts invalid scale and corrupts elapsed time with NaN
- Severity: medium
- Owner: schedule/operations domain
- Evidence files and line references:
  - `src/schedule-kit.js:18-24` stores `scale: Number(config.scale ?? 1)` without finite fallback.
  - `src/schedule-kit.js:33-36` multiplies finite delta by `Number(state.scale ?? 1)` and then writes the result into elapsed time.
  - `src/schedule-kit.js:40-60` compares cycles against corrupted elapsed time, so cycle emission stalls.
  - `tests/procedural-navigation-smoke.mjs` covers a valid schedule cycle only.
- Reproduction path:
  - Create `createScheduleKit({ scale:"fast", cycles:[{ id:"pulse", intervalSeconds:1 }] })`.
  - Tick one second.
  - Probe result: `elapsedSeconds` is `NaN`, `cycles[0].count` stays `0`, and `lastCycles` is empty.
- Expected behavior:
  - Invalid scale should normalize to `1`, clamp to a documented range, or throw during kit creation.
- Actual behavior:
  - Non-finite scale poisons schedule state and stops cycle progression.
- Why it matters for production scaling:
  - Schedule services are likely configuration-heavy. A single invalid serialized value can silently disable operations loops and produce non-serializable snapshots.
- Validation needed:
  - Add schedule normalization tests for non-numeric, `NaN`, `Infinity`, negative, zero, and fractional scale values.
- Suggested fix direction:
  - Reuse a finite-number helper for config and state scale normalization; decide whether negative/zero scales pause, reverse, or clamp.
- Blocks DSK promotion:
  - Promotion-adjacent. It blocks robust operations/schedule DSKs until numeric config invariants are explicit.

## Domain and kit expansion risks
- Objective and scenario domains need a reset/idempotency policy before they can support replay, AR lessons, training flows, or proof harnesses.
- Lifecycle/economy/service-flow domains need an accepted-state mutation boundary before they can safely compose with accounts, ledgers, and facility outputs.
- Transport/mobility domains need catch-up semantics for large deltas before background automation, browser tab throttling, and fast-forward validation can be trusted.
- Schedule/operations domains need numeric config normalization so idea-doc service graphs do not silently stall from bad serialized inputs.

## Cross-cutting risks
- Several kits still mutate other domains before local validation is complete.
- Repeated event emission after terminal states remains a recurring pattern risk across objective, request, lifecycle, and sequence surfaces.
- Current tests emphasize happy-path small ticks; large-delta and reset/replay invariants remain under-covered.
- Numeric config normalization is inconsistent across kits, increasing risk as docs encourage broader configuration-driven composition.

## Missing validation
- ObjectiveFlow reset after partial/full progress.
- ObjectiveFlow completion event idempotency through event surfaces.
- Lifecycle start rejection with costs and prerequisites.
- Lifecycle/economy affordability or reservation semantics.
- Transport multi-stop catch-up for large deltas.
- Schedule finite scale normalization.
- DSK promotion fixtures that combine reset, terminal events, accepted mutations, large-delta catch-up, and config validation.

## DSK promotion blockers
- Objective/progression DSK promotion is blocked by reset state leakage and repeated completion events.
- Lifecycle/economy DSK promotion is blocked by cost side effects before prerequisite acceptance.
- Transport and schedule DSK promotion is blocked until catch-up and numeric config policies are explicit and tested.
- Existing install/namespace/state-contract blockers from DSK architecture remain open; this packet adds domain-behavior blockers, not replacements.

## Suggested next review item
- Add a focused domain-invariant smoke group for ObjectiveFlowKit reset/completion idempotency and LifecycleProgressionKit accepted-state cost charging before expanding more operations/objective DSK claims.

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, or deployments were edited.
- Passing `npm test` does not prove objective/lifecycle/transport/schedule DSK readiness.
- This packet does not claim browser UX, public proof completion, npm publication, async execution, worker/network readiness, or broad domain graph promotion.
