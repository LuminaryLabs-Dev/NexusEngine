# Deep Bug Report Packet: 2026-06-18T22:52:38-04:00

Timestamp: 2026-06-18T22:52:38-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for NexusRealtime runtime and reusable operations/logistics kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: install/lifecycle invariants from `2026-06-18T21-52-29-0400`, including duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Earlier current-lane packets already cover invalid SequenceNode deployment side effects, TerrainKit retention, stale AR failure sessions, DSK install atomicity, SequenceNode boot/frame ordering, default camera crash, and ActionMovementKit killY ordering.
- Neighboring ecosystem state packet `2026-06-18T22-08-40-0400` says core is on latest release branch `0.0.2`, local tests pass, required public links pass, npm metadata is 404, and expansion docs are advisory/untracked.
- Neighboring DSK architecture packet `2026-06-18T22-23-28-0400` keeps DSK hardening risks open: namespace safety, failed-install atomicity, direct-install dependency policy, and reset/snapshot contract enforcement.
- Neighboring ecosystem proof packet `2026-06-18T22-40-48-0400` says local/raw proof is green, but public browser proof route remains runtime-broken on missing module paths.
- Domain kit idea expander has a master tracker but no prior packet/node yet; current idea docs are planning inventory, not implementation claims.

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
  - `state/automation/deep_bug_report_scout/packets/2026-06-18T22-52-38-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-18T22-52-38-0400-deep-bug-node.md`
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
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/deep_bug_report_scout/PROMPT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- `state/automation/deep_bug_report_scout/packets/2026-06-18T21-52-29-0400-deep-bug-report-packet.md`
- `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-18T21-52-29-0400-deep-bug-node.md`
- `state/automation/ecosystem_state_scout/packets/2026-06-18T22-08-40-0400-ecosystem-state-packet.md`
- `state/automation/dsk_architecture_scout/packets/2026-06-18T22-23-28-0400-dsk-architecture-state-packet.md`
- `state/automation/ecosystem_proof_scout/packets/2026-06-18T22-40-48-0400-ecosystem-proof-state-packet.md`
- `state/automation/domain_kit_idea_expander/master_domain_kit_idea_expansion.md`
- `src/ecs.js`
- `src/engine.js`
- `src/runtime-kit.js`
- `src/domain-service-kit.js`
- `src/index.js`
- `src/economy-kit.js`
- `src/request-queue-kit.js`
- `src/cargo-manifest-kit.js`
- `src/hazard-field-kit.js`
- `src/telemetry-kit.js`
- `src/surfaces.js`
- `tests/run-all.mjs`
- `tests/domain-service-kit-smoke.mjs`
- `tests/procedural-navigation-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` with pre-existing modified/untracked automation/doc artifacts.
- Inline Node probe: RequestQueueKit reward with kits `[createEconomyKit(), createRequestQueueKit()]`.
  - Result: `{ "afterAdd": 0, "afterFulfill": 0, "afterExtraTick": 0, "ledger": [] }`.
- Inline Node probe: RequestQueueKit reward with kits `[createRequestQueueKit(), createEconomyKit()]`.
  - Result: reward applied: `{ "afterFulfill": 10, "ledger":[{"amount":10,"source":"request-fulfilled"}] }`.
- Inline Node probe: RequestQueueKit `defaultReward` on an added request without explicit reward.
  - Result: request fulfilled with `reward:null` and `cash:0`.
- Inline Node probe: CargoManifestKit fully degraded cargo with `conditionValueMultiplier: 2`.
  - Result: deposit returned `{ "value": -100, "deliveredValue": -100, "quotaComplete": false }`.
- Inline Node probe: TelemetryKit with `historyLimit: 0`.
  - Result: after two ticks plus manual snapshot, `snapshots.length === 3`.
- `npm test`
  - Result: passed 8 smoke tests.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around invalid SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around engine SequenceNode boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Neighboring architecture/proof packets checked for DSK hardening and public proof blockers.

## Executive summary
- Existing smoke tests pass, but four additional operations/logistics kit bugs reproduce through public exports.
- Highest-impact bug: RequestQueueKit economy rewards are install-order dependent because RequestQueueKit and EconomyKit both run in `resolve`; when EconomyKit is installed first, reward events are emitted after the economy system has already read events and are cleared at tick end.
- CargoManifestKit can deposit negative value when `conditionValueMultiplier > 1` and item condition is low, causing delivered value to decrease and quota progress to regress.
- TelemetryKit treats `historyLimit: 0` as unbounded because `slice(-0)` returns the full array, so a config that should keep no history keeps all snapshots.
- These are not DSK contract bugs by themselves, but they are DSK promotion blockers for operations/logistics domains because they undermine deterministic cross-domain composition, non-negative accounting, and bounded diagnostics.

## Deep bug reports

### 1. RequestQueueKit economy rewards are install-order dependent
- Severity: high
- Owner: operations kits / scheduler event contract
- Evidence files and line references:
  - `src/request-queue-kit.js:40-47` emits `EconomyTransactionRequest`.
  - `src/request-queue-kit.js:58` emits rewards from fulfillment.
  - `src/request-queue-kit.js:129` installs `requestQueueSystem` in the `resolve` phase.
  - `src/economy-kit.js:51-60` reads economy transaction requests in its own `resolve` system.
  - `src/ecs.js:349-369` runs systems in phase insertion order, drains the journal, then clears all events.
  - `tests/procedural-navigation-smoke.mjs:252-268` covers one management kit order only: economy before request queue.
- Reproduction path:
  - `createEngine({ kits: [createEconomyKit(), createRequestQueueKit()] })`
  - Add and fulfill a request with `{ reward: { account:"cash", amount:10 } }`.
  - Probe result: economy cash remains `0` and ledger remains empty even after an extra tick.
  - Reverse kit order to `[createRequestQueueKit(), createEconomyKit()]`.
  - Probe result: economy cash becomes `10` and ledger records one transaction.
- Expected behavior:
  - Request rewards should apply deterministically regardless of kit install order, or the dependency/phase contract should force a safe order.
- Actual behavior:
  - Reward events emitted by RequestQueueKit are lost when EconomyKit's same-phase system has already run.
- Why it matters for production scaling:
  - Described examples compose operations, economy, cargo, requests, queues, and telemetry as reusable domains. Same-phase cross-domain events will become order-sensitive as kit graphs grow.
- Validation needed:
  - Add an existing-suite-compatible composition smoke that asserts request reward behavior for both `[economy, requestQueue]` and `[requestQueue, economy]`.
- Suggested fix direction:
  - Move emitted economy requests into a phase the economy system consumes later, split economy transaction processing into a later phase, or declare/enforce phase/dependency ordering for cross-domain events.
- Blocks DSK promotion:
  - Yes for operations/logistics DSK promotion. DSK service graphs need install-order-independent event handoff or explicit dependency ordering.

### 2. RequestQueueKit defaultReward is not applied to manually added/default requests
- Severity: medium
- Owner: operations kits
- Evidence files and line references:
  - `src/request-queue-kit.js:21` normalizes request reward to `request.reward ?? null`.
  - `src/request-queue-kit.js:31-33` stores `defaultReward` and `defaultPenalty`.
  - `src/request-queue-kit.js:76-78` manually added requests are normalized without receiving `state.defaultReward`.
  - `src/request-queue-kit.js:80-89` occupant-created requests do receive `state.defaultReward` and `state.defaultPenalty`.
  - `README.md:432` describes RequestQueueKit as supporting optional economy rewards or penalties.
- Reproduction path:
  - `createRequestQueueKit({ defaultReward:{ account:"cash", amount:15 } })`
  - `engine.requestQueue.add({ id:"no-reward" })`
  - `engine.requestQueue.fulfill("no-reward")`
  - Probe result: fulfilled request has `reward:null` and economy cash remains `0`.
- Expected behavior:
  - A `defaultReward` should either apply consistently to requests without explicit rewards or be renamed/documented as occupant-need-only.
- Actual behavior:
  - Defaults apply to OccupantFlow-derived needs but not to initial/manual queue requests.
- Why it matters for production scaling:
  - Logistics and service-flow hosts can silently lose default economic outcomes depending on which API path creates requests.
- Validation needed:
  - Add a smoke for initial dataset requests, manual `add()`, and OccupantNeed-created requests with default reward/penalty.
- Suggested fix direction:
  - Pass default reward/penalty into `normalizeRequest()` for initial/manual request paths.
- Blocks DSK promotion:
  - Promotion-adjacent. It blocks consistent RequestQueue service semantics.

### 3. CargoManifestKit can deposit negative cargo value
- Severity: medium
- Owner: logistics/cargo kit
- Evidence files and line references:
  - `src/cargo-manifest-kit.js:23` clamps base item value to non-negative.
  - `src/cargo-manifest-kit.js:28` clamps `conditionValueMultiplier` to `>= 0` but does not cap it.
  - `src/cargo-manifest-kit.js:134-137` computes deposited value as `item.value * (1 + (quality - 1) * multiplier)`.
  - `src/cargo-manifest-kit.js:140-141` adds that value to delivered progress and checks quota completion.
  - `tests/procedural-navigation-smoke.mjs:347-365` covers a happy path where degraded cargo remains positive.
- Reproduction path:
  - Configure one carried item with `value:100`, `condition:0`, `conditionMax:100`, and `conditionValueMultiplier:2`.
  - Deposit it.
  - Probe result: `value:-100`, `deliveredValue:-100`, `quotaComplete:false`.
- Expected behavior:
  - Condition-adjusted cargo value should not become negative unless the API explicitly supports penalties.
- Actual behavior:
  - A high multiplier turns zero-condition cargo into negative delivered value.
- Why it matters for production scaling:
  - Cargo, rescue, courier, and logistics domains can regress quotas or score ledgers from a degraded item even though item value normalization promises non-negative base value.
- Validation needed:
  - Add a cargo smoke for low-condition cargo with multipliers above `1`.
- Suggested fix direction:
  - Clamp the condition-adjusted value at `0`, or cap `conditionValueMultiplier <= 1` if it is intended as a proportional value loss.
- Blocks DSK promotion:
  - Promotion-adjacent for logistics/cargo DSKs because accounting invariants should be non-negative and explicit.

### 4. TelemetryKit historyLimit 0 keeps all snapshots
- Severity: medium
- Owner: telemetry/diagnostics kit
- Evidence files and line references:
  - `src/telemetry-kit.js:51` stores system snapshots with `.slice(-Number(config.historyLimit ?? 60))`.
  - `src/telemetry-kit.js:70` stores manual snapshots with the same expression.
  - JavaScript `slice(-0)` is equivalent to `slice(0)`, so it returns the full array.
  - `README.md:433` presents TelemetryKit as validation and host diagnostics support.
- Reproduction path:
  - `createEngine({ kits:[createTelemetryKit({ historyLimit:0 })] })`
  - Tick twice and call `engine.telemetry.snapshot()`.
  - Probe result: `snapshots.length === 3`.
- Expected behavior:
  - `historyLimit:0` should keep zero historical snapshots, reject as invalid, or be normalized to a documented minimum.
- Actual behavior:
  - Zero behaves as unbounded growth for the current snapshot array.
- Why it matters for production scaling:
  - Long-running validation and host diagnostics can accidentally retain every snapshot despite a zero-history config.
- Validation needed:
  - Add TelemetryKit smoke coverage for `historyLimit:0`, `1`, negative, and non-finite values.
- Suggested fix direction:
  - Normalize `historyLimit` once with an integer clamp and special-case `0` before slicing.
- Blocks DSK promotion:
  - Not core DSK, but it blocks telemetry-backed proof and long-run validation confidence.

## Domain and kit expansion risks
- Operations/logistics described examples depend on EconomyKit, RequestQueueKit, CargoManifestKit, and TelemetryKit composing predictably.
- Current kit APIs expose useful generic services, but cross-kit event transfer is implicit and phase-sensitive.
- Advisory idea docs list service graphs where request, cargo, economy, and telemetry domains are central; these bugs should be fixed or explicitly documented before promoting them as DSK candidates.

## Cross-cutting risks
- Same-phase event consumers are order-sensitive because the scheduler does not replay events for systems that already ran in the phase.
- Default config semantics are inconsistent across input paths in RequestQueueKit.
- Numeric accounting APIs clamp some inputs but not final derived outputs.
- Diagnostic retention config is not normalized before array slicing.

## Missing validation
- No smoke covers RequestQueueKit rewards with both economy/request install orders.
- No smoke covers `defaultReward` for manually added or initial dataset requests.
- No smoke covers CargoManifestKit low-condition values with `conditionValueMultiplier > 1`.
- No smoke covers TelemetryKit `historyLimit` edge cases.
- Existing `npm test` passes, so none of these issues are caught today.

## DSK promotion blockers
- Blocking for operations/logistics DSK promotion:
  - RequestQueueKit economy reward event handoff depends on kit install order.
- Promotion-adjacent:
  - RequestQueueKit default reward semantics differ by request source.
  - CargoManifestKit can generate negative delivered value.
  - TelemetryKit zero-history config can retain unbounded snapshots.
- Still open from prior packets:
  - DSK/runtime install atomicity and rollback.
  - DSK namespace safety.
  - Direct install dependency parity.
  - SequenceNode boot/frame source ordering.
  - Generic runtime kit duplicate id enforcement.

## Suggested next review item
- Review scheduler phase policy for cross-domain emitted events, then harden RequestQueueKit/EconomyKit as the smallest operations-domain proof case.

## Not claimed
- This packet does not fix bugs.
- This packet does not create tests.
- This packet does not claim browser visual rendering was validated with Playwright.
- This packet does not prove npm publication readiness.
- This packet does not treat advisory domain/kit idea docs as canonical implementation state.
