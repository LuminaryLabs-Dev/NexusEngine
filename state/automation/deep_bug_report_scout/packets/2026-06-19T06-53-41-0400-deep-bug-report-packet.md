# Deep Bug Report Packet: 2026-06-19T06:53:41-04:00

Timestamp: 2026-06-19T06:53:41-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-spatial-hazard-mobility-time`.
- Earlier deep packets already cover invalid SequenceNode deployment side effects, terrain cache retention, stale AR failure sessions, DSK install atomicity, SequenceNode boot/frame order, default camera crash, ActionMovementKit killY masking, duplicate direct kit ids, cleanup event lifetime, disposed SequenceNode mutation, renderer fallback mismatch, request/economy order, request defaults, cargo negative value, telemetry `historyLimit:0`, assistance/transfer/spatial-progress/input state machines, objective reset/completion, lifecycle accepted mutation, transport catch-up, schedule scale normalization, occupant reset/id uniqueness, facility/economy non-finite ledgers, resource-pressure restored-state contradictions, SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, and VehicleDynamics zero-capacity boost activation.
- Neighboring ecosystem state packet `2026-06-19T06-09-33-0400` says core is current on the latest release branch and available-checkout validation is green, but public proof, sibling latest-ref validation, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening gates remain open.
- Neighboring DSK architecture packet `2026-06-19T06-24-24-0400` keeps DSK promotion blocked by namespace, install, dependency, state-contract, service-call, operations-data, spatial/mobility, and resource-bound invariants.
- Neighboring ecosystem proof packet `2026-06-19T06-46-32-0400` says local targeted proof passes, sibling local checkouts remain behind fetched release refs, and the public DSK browser proof still stalls at `Booting...`.
- Neighboring domain idea packet `2026-06-19T06-00-34-0400` maps transition-state, immediate-threshold, hazard identity, and resource-bound policy into planning inventory.
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
  - `state/automation/deep_bug_report_scout/packets/2026-06-19T06-53-41-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T06-53-41-0400-deep-bug-node.md`
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
- Latest neighboring packets from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/timing-window-kit.js`
- `src/interaction-target-kit.js`
- `src/collectible-kit.js`
- `src/request-fulfillment-kit.js`
- `src/water-surface-kit.js`
- `src/route-field-kit.js`
- `src/world-physics-kit.js`
- `src/camera-occlusion-kit.js`
- `src/scenario-driver-kit.js`
- `src/engine.js`
- `src/surfaces.js`
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
- Existing-packet duplicate scan for `interaction`, `collectible`, `RequestFulfillment`, `TimingWindow`, `RouteField`, and `WaterSurface`.
  - Result: no prior deep packet reported TimingWindow result id overwrite, InteractionTarget repeated explicit completion, Collectible duplicate claim events, or RequestFulfillment generated request id collision.
- Inline Node probe: TimingWindow action identity.
  - Result: an action without an id and `windowId:"strike"` produced result id `"strike"` because active window state overwrote generated action id.
- Inline Node probe: InteractionTarget explicit completed target.
  - Result: event surface saw `InteractionTargetCompleted` batches `[["switch-a"], ["switch-a"]]` after two explicit inputs against a one-count target.
- Inline Node probe: Collectible duplicate claim.
  - Result: event surface saw `CollectibleClaimed` batches `[["coin-a"], ["coin-a"]]` after claiming the same id twice.
- Inline Node probe: RequestFulfillment generated id collision.
  - Result: initial request id `request-2` plus `create({ kind:"manual" })` produced ids `["request-2", "request-2"]`.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around SequenceNode boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Prior deep packet `2026-06-18T22-52-38-0400`: avoided duplicates around request/economy order, request default reward, cargo negative value, and telemetry `historyLimit:0`.
- Prior deep packet `2026-06-18T23-53-22-0400`: avoided duplicates around assistance terminal state, transfer constraints, restored progress counts, and input edge semantics.
- Prior deep packet `2026-06-19T00-54-03-0400`: avoided duplicates around objective reset/completion idempotency, lifecycle accepted mutation, transport catch-up, and schedule scale normalization.
- Prior deep packet `2026-06-19T01-53-53-0400`: avoided duplicates around occupant reset/id uniqueness, facility/economy non-finite transactions, and resource-pressure restored-state contradictions.
- Prior deep packet `2026-06-19T05-53-25-0400`: avoided duplicates around SpatialScale entry suppression, ScenarioDuration zero-time inert state, HazardField generated id collisions, and VehicleDynamics zero-capacity boost.

## Executive summary
- Current smoke tests still pass, but timing, interaction, collectible, and request domains have identity/idempotency gaps not covered by existing proof.
- Highest-impact bug: TimingWindowKit constructs a generated action result id, then spreads active window state afterward, overwriting the result id with the window id.
- InteractionTargetKit emits completion every time an already-complete target is explicitly addressed.
- CollectibleKit emits claim events for already-collected ids through both direct claims and objective-completion processing.
- RequestFulfillmentKit can generate duplicate request ids when authored/restored requests already use generated-looking ids.

## Deep bug reports

### 1. TimingWindowKit overwrites action result ids with the active window id
- Severity: medium
- Owner: timing/action judgment domain
- Evidence files and line references:
  - `src/timing-window-kit.js:49-58` makes `evaluateWindow()` return an object containing `id: window.id`.
  - `src/timing-window-kit.js:72-78` sets `id: action.id ?? timing-*` and then spreads `active[windowId]`, overwriting the action/result id.
  - `tests/procedural-navigation-smoke.mjs:271-284` checks result quality, not result identity.
- Reproduction path:
  - Install `createTimingWindowKit({ windows:[{ id:"strike", intervalSeconds:1 }] })`.
  - Call `engine.timingWindows.action({ windowId:"strike" })`.
  - Probe result: `lastResult.id` is `"strike"`, not the generated `timing-0`; event surface also receives `"strike"`.
- Expected behavior:
  - `TimingWindowResolved.id` should preserve the action/result id, while the window id stays in `windowId`.
- Actual behavior:
  - The window evaluation object overwrites result identity.
- Why it matters for production scaling:
  - Timing/action DSKs need stable per-action receipts for replay, telemetry, reward attribution, and multi-actor action history.
- Validation needed:
  - Add TimingWindow smokes for explicit `action.id`, generated result ids, repeated same-window actions, and `windowId`/result-id separation.
- Suggested fix direction:
  - Spread active window fields before assigning result `id`, or remove `id` from the active evaluation snapshot.
- Blocks DSK promotion:
  - Promotion-adjacent for timing/action DSKs that expose accepted action receipts.

### 2. InteractionTargetKit repeats completion events for explicit completed targets
- Severity: high
- Owner: interaction/objective bridge domain
- Evidence files and line references:
  - `src/interaction-target-kit.js:56-59` lets explicit `targetId` select a target without checking `!target.complete`.
  - `src/interaction-target-kit.js:61-66` clamps progress at required count and emits `InteractionTargetCompleted` whenever `target.complete` is true.
  - `tests/procedural-navigation-smoke.mjs` does not cover InteractionTarget completion idempotency.
- Reproduction path:
  - Install one target `{ id:"switch-a", interaction:{ action:"tap", count:1 } }`.
  - Subscribe to `InteractionTargetCompleted`.
  - Call `interactionTargets.input("tap", { targetId:"switch-a" })` twice.
  - Probe result: completion batches were `[["switch-a"], ["switch-a"]]`.
- Expected behavior:
  - A target should emit completion only on the transition from incomplete to complete, or repeated explicit actions should return a rejected/already-complete receipt.
- Actual behavior:
  - Completed explicit targets keep re-emitting completion.
- Why it matters for production scaling:
  - AR training, puzzle, objective, and reward flows can duplicate unlocks, objective actions, telemetry, or collectibles when UI repeats a target action.
- Validation needed:
  - Add InteractionTarget smokes for explicit completed targets, implicit completed targets, reset after completion, and objective-flow action fanout.
- Suggested fix direction:
  - Track `wasComplete` before mutation and emit only when `!wasComplete && target.complete`; explicit selection should optionally reject completed targets.
- Blocks DSK promotion:
  - Yes for interaction/objective DSKs that use completion as a one-shot receipt.

### 3. CollectibleKit emits duplicate claim events for already-collected ids
- Severity: medium
- Owner: reward/collectible persistence domain
- Evidence files and line references:
  - `src/collectible-kit.js:43-49` adds objective-completion ids to a `Set`, but emits `CollectibleClaimed` unconditionally when an id is present.
  - `src/collectible-kit.js:73-79` direct `claim(id)` dedupes stored state with `Set`, but emits `CollectibleClaimed` unconditionally.
  - `src/collectible-kit.js:15` can initialize with already-collected ids from authored data or persisted storage.
- Reproduction path:
  - Install `createCollectibleKit({ rewards:[{ id:"coin-a" }] })`.
  - Subscribe to `CollectibleClaimed`.
  - Call `collectibles.claim("coin-a")` twice.
  - Probe result: claim batches were `[["coin-a"], ["coin-a"]]`, while state stayed `["coin-a"]`.
- Expected behavior:
  - Claim events should emit only when the collection state changes, or duplicate claims should emit an explicit already-claimed result through a separate receipt.
- Actual behavior:
  - Duplicate claims generate duplicate claim events even though stored state is idempotent.
- Why it matters for production scaling:
  - Reward, finale, persistence, and telemetry systems can double-count a collectible while saved state appears correct.
- Validation needed:
  - Add Collectible smokes for duplicate direct claims, duplicate objective completions, initially collected ids, and persisted ids.
- Suggested fix direction:
  - Check `collected.has(id)` before emitting; direct claim should return whether the claim was newly accepted.
- Blocks DSK promotion:
  - Promotion-adjacent for reward/collection DSKs and objective completion bridges.

### 4. RequestFulfillmentKit can generate duplicate request ids
- Severity: high
- Owner: request/logistics identity domain
- Evidence files and line references:
  - `src/request-fulfillment-kit.js:14-26` generates fallback ids as `request-${index + 1}`.
  - `src/request-fulfillment-kit.js:37` normalizes initial requests without deriving the next generated sequence from existing ids.
  - `src/request-fulfillment-kit.js:98-104` creates new manual requests with `state.requests.length` and appends without collision checks.
  - `tests/procedural-navigation-smoke.mjs:367-383` covers one authored request completion, not generated id uniqueness.
- Reproduction path:
  - Install `createRequestFulfillmentKit({ requests:[{ id:"request-2" }] })`.
  - Call `requestFulfillment.create({ kind:"manual" })`.
  - Probe result: ids become `["request-2", "request-2"]`.
- Expected behavior:
  - Generated request ids should be collision-free across authored, restored, and manual requests.
- Actual behavior:
  - Manual creation can duplicate an existing request id.
- Why it matters for production scaling:
  - Courier, service-flow, rescue, and logistics graphs need unique request ids for nearest queries, completion, expiry, rewards, telemetry, and replay.
- Validation needed:
  - Add RequestFulfillment smokes for generated id allocation with authored/restored ids, manual request creation, completion by duplicate id, and expiry attribution.
- Suggested fix direction:
  - Initialize a sequence from existing ids or allocate generated ids through collision checks before appending.
- Blocks DSK promotion:
  - Yes for request/logistics DSK promotion because request identity is a cross-domain contract.

## Domain and kit expansion risks
- Timing/action services need receipt identity separate from window identity before action scoring feeds rewards, telemetry, or replay.
- Interaction services need one-shot completion guards before UI, AR, or objective flows consume completion events.
- Collectible/reward services need event idempotency that matches stored-state idempotency.
- Request/logistics services need stable generated identity across authored, restored, and manually created data.

## Cross-cutting risks
- Several kits store idempotent state while emitting non-idempotent events.
- Generated ids are still commonly based on array length or current elapsed time rather than collision-checked allocators.
- Result receipts can be corrupted by object spread order when query snapshots and event receipts share field names.
- Current smoke tests mostly prove happy-path state mutation, not event identity or one-shot receipt contracts.

## Missing validation
- TimingWindow explicit and generated result id preservation.
- TimingWindow multiple actions against the same window in one elapsed-time bucket.
- InteractionTarget explicit input against already-complete targets.
- InteractionTarget reset and completion re-entry semantics.
- Collectible duplicate direct claim and duplicate objective-completion claim behavior.
- Collectible initially collected and persisted-id claim behavior.
- RequestFulfillment generated id uniqueness with authored/restored ids.
- Completion/expiry attribution when duplicate request ids exist.

## DSK promotion blockers
- Request/logistics DSK promotion is blocked by generated request id collisions.
- Interaction/objective DSK promotion is blocked by repeated completion receipts for already-complete explicit targets.
- Timing/action and collectible/reward DSK promotion should wait for receipt identity and idempotent event fixtures.
- Existing install/namespace/public proof blockers from neighboring lanes remain open; this packet adds receipt-identity and event-idempotency blockers, not replacements.

## Suggested next review item
- Add focused receipt-identity/idempotency smokes for TimingWindow, InteractionTarget, Collectible, and RequestFulfillment before broad timing, interaction, reward, or logistics DSK promotion claims.

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, or deployments were edited.
- Passing `npm test` does not prove timing, interaction, collectible, or request DSK readiness.
- This packet does not claim browser UX, public proof completion, npm publication, async execution, worker/network readiness, or broad domain graph promotion.
