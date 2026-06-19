# Deep Bug Report Packet: 2026-06-19T01:53:53-04:00

Timestamp: 2026-06-19T01:53:53-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for NexusRealtime runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: objective/lifecycle/time/config invariants from `2026-06-19T00-54-03-0400`.
- Earlier deep packets already cover SequenceNode validation side effects, terrain retention, stale AR failure sessions, DSK install atomicity, SequenceNode boot/frame order, default camera crash, ActionMovementKit killY masking, duplicate direct kit ids, cleanup event lifetime, disposed SequenceNode mutation, renderer fallback mismatch, request/economy order, request defaults, cargo negative value, telemetry `historyLimit:0`, assistance/transfer/spatial/input state machines, objective reset/completion, lifecycle cost acceptance, transport large-delta, and schedule invalid scale.
- Neighboring ecosystem state packet `2026-06-19T01-11-04-0400` says core and sibling release `HEAD`s remain aligned and validation-green, but sibling worktree dirt, public browser proof, aggregate DSK proof coverage, npm metadata, and package-version policy remain open.
- Neighboring DSK architecture packet `2026-06-19T01-24-20-0400` keeps DSK promotion gated by namespace, install transaction, dependency, state-contract, accepted-mutation, idempotency, time, and config policy.
- Neighboring ecosystem proof packet `2026-06-19T01-44-00-0400` says local/raw proof remains green while public browser proof still stalls at `Booting...`.
- Neighboring domain idea packet `2026-06-19T01-00-48-0400` maps accepted mutation, completion idempotency, simulation time, and config normalization into planning inventory.
- These packets were used for context only. Live source, docs, tests, probes, and preflight are authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404

## Current branch
- `0.0.2`, tracking `origin/0.0.2`
- Worktree had pre-existing modified/untracked automation and planning docs before this run.
- This lane wrote only:
  - `state/automation/deep_bug_report_scout/packets/2026-06-19T01-53-53-0400-deep-bug-report-packet.md`
  - `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T01-53-53-0400-deep-bug-node.md`
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
- `src/occupant-flow-kit.js`
- `src/facility-operations-kit.js`
- `src/economy-kit.js`
- `src/resource-pressure-kit.js`
- `src/scenario-driver-kit.js`
- `src/scenario-duration-kit.js`
- `src/timing-window-kit.js`
- `src/request-fulfillment-kit.js`
- `src/hazard-field-kit.js`
- `src/vehicle-dynamics-kit.js`
- `src/water-surface-kit.js`
- `src/route-field-kit.js`
- `src/spatial-scale-kit.js`
- `tests/procedural-navigation-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning docs.
- Inline Node probe: OccupantFlowKit spawn rule reset.
  - Result: first tick spawned one occupant and mutated the external rule to `nextAt:11`; after `reset()` and another one-second tick, no occupant spawned because reset reused the mutated rule.
- Inline Node probe: OccupantFlowKit duplicate ids with initial occupants plus spawn rules.
  - Result: initial `occupant-1` plus spawned rule id produced `["occupant-1","occupant-1"]`.
- Inline Node probe: FacilityOperationsKit invalid output amount with EconomyKit.
  - Result: `amount: Number("bad")` became non-finite; JSON rendering shows `null`, and EconomyKit account `cash` plus ledger `after` became non-finite/null.
- Inline Node probe: ResourcePressureKit initial below-min resource.
  - Result: initial snapshot had `value:-5`, resource `depleted:false`, and top-level `depleted:[]`; after `tick(0)`, top-level `depleted:["oxygen"]` but the resource still had `depleted:false`.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`: avoided duplicates around invalid SequenceNode deployment, terrain cache retention, AR stale session, and DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`: avoided duplicates around engine SequenceNode boot order, frame duplication, default camera crash, and ActionMovementKit killY masking.
- Prior deep packet `2026-06-18T21-52-29-0400`: avoided duplicates around duplicate direct kit ids, cleanup event erasure, disposed SequenceNode mutation, and renderer fallback mismatch.
- Prior deep packet `2026-06-18T22-52-38-0400`: avoided duplicates around request/economy order, request default reward, cargo negative value, and telemetry `historyLimit:0`.
- Prior deep packet `2026-06-18T23-53-22-0400`: avoided duplicates around assistance terminal state, transfer constraints, restored progress counts, and input edge semantics.
- Prior deep packet `2026-06-19T00-54-03-0400`: avoided duplicates around objective reset/completion idempotency, lifecycle accepted mutation, transport catch-up, and schedule scale normalization.
- Neighboring architecture/proof/state/idea packets checked for DSK hardening and public proof context.

## Executive summary
- Existing smoke tests still pass, but occupant, facility/economy, and resource-pressure domains have replay, identity, numeric, and initial-state invariant bugs not covered by current happy-path tests.
- Highest-impact bug: OccupantFlowKit stores spawn-rule objects by reference and mutates `rule.nextAt`, so reset does not restore authored spawn timing and can also mutate caller config.
- OccupantFlowKit starts `nextSequence` at `1` even when initial occupants already exist, so generated occupants can duplicate existing ids.
- FacilityOperationsKit can emit non-finite output/upkeep economy transactions; EconomyKit accepts them and poisons account and ledger state.
- ResourcePressureKit can start below `min` with contradictory depletion state, then top-level and per-resource depletion flags disagree after a zero-delta tick.

## Deep bug reports

### 1. OccupantFlowKit reset reuses mutated spawn-rule timing
- Severity: high
- Owner: occupant/population domain
- Evidence files and line references:
  - `src/occupant-flow-kit.js:25-34` stores `spawnRules: dataset.spawnRules ?? []` without cloning or normalizing rule runtime fields.
  - `src/occupant-flow-kit.js:72-82` iterates `state.spawnRules` and writes `rule.nextAt = nextAt + interval`, mutating the same rule object.
  - `src/occupant-flow-kit.js:131-133` reset calls `initialState(config)`, which reuses the already-mutated config object.
  - `tests/procedural-navigation-smoke.mjs:230-269` covers one occupant happy path but not reset/replay behavior.
- Reproduction path:
  - Create `spawnRule = { id:"guest", firstAt:1, intervalSeconds:10, limit:2, need:"help" }`.
  - Install `createOccupantFlowKit({ spawnRules:[spawnRule] })`.
  - Tick one second, reset, then tick one second.
  - Probe result: `spawnRule.nextAt` became `11`; first run spawned one occupant, but after reset the second one-second tick spawned zero occupants.
- Expected behavior:
  - Reset should restore authored timing from immutable config or normalized cloned rules.
- Actual behavior:
  - Runtime scheduling mutates caller/authored config and survives reset.
- Why it matters for production scaling:
  - City operations, service-flow, and proof harnesses need deterministic replay. A reset that preserves hidden schedule progress will make repeated runs differ from first runs.
- Validation needed:
  - Add an occupant-flow reset smoke that verifies `firstAt` timing after spawn, reset, and replay.
- Suggested fix direction:
  - Normalize/cloned spawn rules into runtime state, keep authored config immutable, and rebuild from fresh normalized rules on reset.
- Blocks DSK promotion:
  - Yes for occupant/population/service-flow DSK promotion. Replayable reset is a promoted-service expectation.

### 2. OccupantFlowKit can generate duplicate occupant ids
- Severity: high
- Owner: occupant/population domain
- Evidence files and line references:
  - `src/occupant-flow-kit.js:30` initializes `nextSequence:1` regardless of initial occupant count or existing ids.
  - `src/occupant-flow-kit.js:37-51` creates rule-spawned ids from `rule.id` plus `nextSequence`.
  - `src/occupant-flow-kit.js:64-67` manual spawn also uses `occupant-${nextSequence}` when no id is supplied.
  - `tests/procedural-navigation-smoke.mjs:230-269` does not include initial occupants plus generated occupants or uniqueness assertions.
- Reproduction path:
  - Create initial occupant `{ id:"occupant-1" }`.
  - Add spawn rule `{ id:"occupant", firstAt:1, intervalSeconds:10, limit:2 }`.
  - Tick one second.
  - Probe result: occupants ids were `["occupant-1","occupant-1"]`.
- Expected behavior:
  - Generated ids should avoid collisions with initial or existing occupants.
- Actual behavior:
  - `nextSequence` starts at one and can create ids already present in the dataset.
- Why it matters for production scaling:
  - Request queues, transport riders, telemetry, and service calls key by occupant id. Duplicate ids can serve, transport, abandon, or count the wrong occupant.
- Validation needed:
  - Add uniqueness checks for initial occupants plus rule/manual spawn paths.
- Suggested fix direction:
  - Initialize `nextSequence` from the initial dataset or generate collision-free ids by checking current occupants.
- Blocks DSK promotion:
  - Yes for occupant/population DSKs because stable identity is foundational for cross-domain composition.

### 3. FacilityOperationsKit can poison EconomyKit with non-finite transaction amounts
- Severity: high
- Owner: facility/economy operations domain
- Evidence files and line references:
  - `src/facility-operations-kit.js:15-20` uses raw `Number(...)` inside `Math.max` for facility numeric fields, allowing `NaN` to enter state.
  - `src/facility-operations-kit.js:61-78` checks `Number(facility.output.amount ?? 0) !== 0`; `NaN !== 0` is true, so invalid output emits.
  - `src/facility-operations-kit.js:79-85` has the same non-finite risk for upkeep amounts.
  - `src/economy-kit.js:23-60` applies `Number(request.amount ?? 0)` without finite validation; non-finite values enter accounts and ledger.
  - `tests/procedural-navigation-smoke.mjs:222-269` covers valid facility output only.
- Reproduction path:
  - Compose `createFacilityOperationsKit({ facilities:[{ id:"f", intervalSeconds:1, output:{ account:"cash", amount:"bad" } }] })` with EconomyKit.
  - Tick one second.
  - Probe result: facility emitted a non-finite amount; EconomyKit account and ledger `after` became non-finite. JSON output rendered these non-finite values as `null`.
- Expected behavior:
  - Invalid facility/economy numeric config should reject, default, or skip the transaction before it mutates economy state.
- Actual behavior:
  - Non-finite facility amounts are treated as non-zero and committed into economy state.
- Why it matters for production scaling:
  - Operations domains are data-heavy. One malformed facility output/upkeep value can corrupt serialized economy snapshots and downstream proof metrics.
- Validation needed:
  - Add facility/economy smokes for invalid output amount, invalid upkeep amount, invalid condition/interval, and EconomyKit non-finite transaction requests.
- Suggested fix direction:
  - Use a finite-number helper in both FacilityOperationsKit and EconomyKit, and reject or normalize invalid transaction requests with `EconomyTransactionRejected`.
- Blocks DSK promotion:
  - Yes for facility/economy DSK promotion. Promoted services must not admit non-finite ledger state.

### 4. ResourcePressureKit starts with contradictory depletion state
- Severity: medium
- Owner: resource/pressure domain
- Evidence files and line references:
  - `src/resource-pressure-kit.js:18-31` stores `value:start` directly and always initializes per-resource `depleted:false`.
  - `src/resource-pressure-kit.js:34-45` initializes top-level `depleted:[]` without deriving from resource values.
  - `src/resource-pressure-kit.js:92-98` updates only the top-level depleted set when a below-min value is detected without also synchronizing the per-resource `depleted` flag unless an adjustment/drift changed the resource.
  - `tests/procedural-navigation-smoke.mjs:271-286` covers a valid resource above min plus adjustment, not initial below-min state.
- Reproduction path:
  - Create `createResourcePressureKit({ resources:[{ id:"oxygen", start:-5, min:0, max:100 }] })`.
  - Read snapshot before ticking.
  - Tick zero seconds.
  - Probe result: before tick, resource `value:-5`, `depleted:false`, top-level `depleted:[]`; after tick, top-level `depleted:["oxygen"]` but resource `depleted:false`.
- Expected behavior:
  - Initial resource values should be clamped to min/max or depletion flags should be derived consistently at initialization and system pass.
- Actual behavior:
  - Resource and aggregate depletion state disagree.
- Why it matters for production scaling:
  - Pressure domains often drive failure, oxygen, heat, stamina, morale, and timer logic. Contradictory depletion snapshots can split UI, telemetry, and scenario completion decisions.
- Validation needed:
  - Add resource-pressure smokes for start below min, start above max, reset from invalid start, and zero-delta depletion consistency.
- Suggested fix direction:
  - Clamp initial value to `[min,max]` or derive both per-resource and top-level depletion from normalized value in one helper.
- Blocks DSK promotion:
  - Promotion-adjacent for resource/pressure DSKs that need restored-state and depletion invariants.

## Domain and kit expansion risks
- Occupant/service-flow examples need reset-safe spawn schedules and stable ids before they can support repeatable validation or saved/resumed runs.
- Facility/economy examples need finite transaction normalization before broader operations datasets are trusted.
- Resource pressure examples need consistent initial/restored state before they can drive oxygen, heat, stamina, morale, or failure conditions.
- Config-normalization and accepted-mutation planning should explicitly include occupant, facility, economy, and pressure domains, not only schedule/lifecycle.

## Cross-cutting risks
- Several kits still store caller config objects by reference and then mutate them as runtime state.
- Stable entity identity is not enforced across initial datasets and generated entities.
- Numeric normalization is inconsistent: some kits use finite helpers, while facility/economy paths accept raw `Number(...)`.
- Initial/restored snapshots can disagree with aggregate counters or flags until a later system pass.

## Missing validation
- OccupantFlow reset after scheduled spawn.
- OccupantFlow generated id uniqueness with initial occupants and manual spawn.
- FacilityOperations invalid numeric output/upkeep and interval/condition normalization.
- EconomyKit non-finite transaction rejection.
- ResourcePressure initial below-min/above-max value normalization and depletion consistency.
- DSK promotion fixtures for immutable config, stable ids, finite transactions, and restored-state invariants.

## DSK promotion blockers
- Occupant/population DSK promotion is blocked by reset/replay state leakage and duplicate generated ids.
- Facility/economy operations DSK promotion is blocked by non-finite transactions entering account and ledger state.
- Resource pressure DSK promotion is blocked until restored/initial depletion invariants are explicit and tested.
- Existing install/namespace/public proof blockers from neighboring lanes remain open; this packet adds domain-data blockers, not replacements.

## Suggested next review item
- Add a focused operations-domain invariant smoke group for OccupantFlow reset/id uniqueness and Facility/Economy finite transaction rejection before expanding service-flow promotion claims.

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, or deployments were edited.
- Passing `npm test` does not prove occupant/facility/economy/resource-pressure DSK readiness.
- This packet does not claim browser UX, public proof completion, npm publication, async execution, worker/network readiness, or broad domain graph promotion.
