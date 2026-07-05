# DSK Architecture State Packet

## Timestamp
- 2026-06-19T05-40-58-0400

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-operations-data-integrity-root-2026-06-19-0224`.
- Latest DSK packet `2026-06-19T02-24-48-0400` kept DSK production promotion gated by one hardening fixture plan spanning install safety, service-call policy, and operations data integrity.
- Latest ecosystem state packet `2026-06-19T01-11-04-0400` says core and sibling release heads were aligned and validation-green, while sibling worktree dirt, public browser proof, aggregate DSK proof coverage, npm metadata, and branch/package version policy remained open.
- Latest ecosystem proof packet `2026-06-19T01-44-00-0400` says local/raw proof stayed green, but public browser proof still stalled at `Booting...`, sibling worktrees were dirty, and aggregate Experiments validation still omitted the targeted DSK smoke.
- Latest deep bug packet `2026-06-19T01-53-53-0400` adds operations-domain invariant bugs around mutable occupant spawn rules, duplicate occupant ids, non-finite facility/economy ledger state, and contradictory resource-pressure depletion state.
- Latest domain idea packet `2026-06-19T02-02-08-0400` converts those bugs into operations data integrity planning inventory: immutable authored config, stable generated identity, finite transaction gates, and restored-state consistency.
- These packets are context only. Live source, tests, docs, probes, and preflight are the authority for this run.

## Latest branch
- Latest remote release branch from preflight: `0.0.2`
- Current branch: `0.0.2`
- `HEAD`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- Ahead/behind against `origin/0.0.2`: `0 0`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm package metadata: 404
- Drift note: older DSK packets referenced `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`; this run revalidated against the current latest release head `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.

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
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- Latest 1-3 DSK packets/nodes from this lane
- Latest neighboring ecosystem state, ecosystem proof, deep bug, and domain idea packets/nodes
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/objective-flow-kit.js`
- `src/schedule-kit.js`
- `src/occupant-flow-kit.js`
- `src/facility-operations-kit.js`
- `src/economy-kit.js`
- `src/resource-pressure-kit.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2`.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md docs/how-to-protokit.md state/automation/dsk_architecture_scout`
  - Result before this packet: no output for the checked paths.
- `npm test`
  - Result: pass, 8 smoke tests.
- Focused `node --input-type=module` DSK probe
  - Result: `apiName:"__proto__"` installs through prototype behavior instead of an own key; API collision leaves failed DSK metadata installed; direct DSK install allows missing non-`n:` requirement.
- Focused `node --input-type=module` operations/state-policy probe
  - Result: OccupantFlow reset reused mutated spawn timing, OccupantFlow duplicated `occupant-1`, Facility/Economy committed non-finite ledger state, ResourcePressure exposed contradictory depletion flags, ObjectiveFlow emitted completion batches repeatedly, and ScheduleKit accepted `scale:"fast"` into `NaN`.
- One discarded operations probe attempt
  - Result: failed because `createEventSurface` was called with the wrong helper shape; corrected by using `engine.eventSurface(ObjectiveFlowCompleted)`.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for ECS definitions, systems, bindings, registries, sequences, sequence nodes, metadata, and install hooks.
- `defineDomainServiceKit()` wraps runtime kits with required `domain`, `stability`, `version`, default stable id `n-<domain>-kit`, default `n:<domain>` provide token, optional service tokens, DSK metadata, and an `engine.n.<apiName>` bridge.
- `createDomainServiceToken()` normalizes domain/service names into `n:` capability tokens.
- `src/index.js` exports the DSK API surface and the domain kits now relevant to promotion-policy fixtures.
- DSK execution remains normal runtime-kit install plus linear scheduler phases. `asyncReady`, `snapshot`, `reset`, and `serializableState` remain metadata/convention, not enforced runtime boundaries.
- `createGameKitComposer()` enforces all declared `requires` tokens during composition. Direct `installRuntimeKit()` only rejects missing DSK requirements whose tokens start with `n:`.
- No live source drift was found that resolves prior DSK blockers on current `origin/0.0.2`.

## Invariant coverage
- Covered by current smoke/freeze tests:
  - default `n-<domain>-kit` id
  - default `n:<domain>` and service tokens
  - metadata kind, namespace, linear execution, and async-ready default
  - invalid domain/provides/version errors
  - extension duplicate resource/system checks
  - missing `n:` dependency rejection on direct engine install
  - normal `engine.n.<api>` install path
  - simple JSON-serializable snapshot happy path
  - same-object duplicate install no-op
  - same-id duplicate DSK rejection
  - normal API collision throws
  - public export presence
- Still not covered:
  - reserved `apiName` keys and own-property namespace guarantees
  - rollback after any failed install stage
  - direct install behavior for missing non-`n:` requirements
  - duplicate provider-token diagnostics across different DSK ids
  - path ownership and private-resource coupling between domains
  - reset/snapshot absence, failure, non-serializable state, and restore policy
  - async metadata override behavior and async boundary expectations
  - accepted/rejected service-call receipts before side effects
  - one-shot completion events and reset-safe completion state
  - large-delta catch-up and leftover progress policy
  - finite numeric config normalization before simulation state is created
  - immutable authored config versus runtime state fields
  - stable generated identity across authored/restored/manual entities
  - finite ledger mutation gates
  - initial/restored aggregate-state consistency

## Domain and kit expansion architecture notes
- Expansion docs remain planning inventory, not public release contract.
- `docs/domain_ideas.md` and `docs/kits_ideas.md` now describe broad DSK service graphs across world, terrain, operations, objective, presentation, telemetry, proof, event, state, transfer, input, mutation, time, config, and operations data integrity domains.
- `docs/how-to-protokit.md` keeps new reusable kit implementations in ProtoKits by default. Core should stay focused on runtime primitives, DSK invariants, composer rules, and validation surfaces.
- Current source revalidates the latest neighboring bug/idea direction: DSK hardening needs one fixture plan that covers install mechanics, service-call semantics, state-policy semantics, and data-integrity semantics.
- The current release head changed since older packets, but source/probe results still support the same root blockers.
- Proof coverage should stay separated by category: local command, aggregate command, raw-public file, CDN import, npm availability, and browser-complete human proof.

## Scaling risks
- `installRuntimeKit()` rebuilds installed provides from `engine.kits.flatMap(...)` for each DSK install. This is acceptable at smoke scale but weak for larger provider graphs.
- `createGameKitComposer()` repeatedly scans pending kits until dependencies resolve, trending quadratically with larger kit counts.
- `engine.n` is a flat normal object, so broad DSK promotion increases collision, inherited-key, reserved-key, discoverability, and ownership risks.
- Direct-install dependency behavior differs from composer behavior, which can produce different outcomes for the same kit graph depending on entry path.
- Metadata-only reset/snapshot/async claims are insufficient for replay, restore, network, worker, or long-lived engine promotion.
- Domain service APIs can be structurally valid while still violating accepted mutation, idempotency, time-step, config-normalization, immutable-config, identity, finite-ledger, or restored-state policy.

## Bug candidates
- Confirmed: reserved namespace API key. Probe result for `apiName:"__proto__"`: `own:false`, `keys:[]`, `protoMarker:"__proto__-api"`, and `valueMarker:"__proto__-api"`.
- Confirmed: failed API collision install is non-atomic. Probe result after collision: thrown error plus `engine.kits` and `engine.domainServiceKits` both contain `n-late-collision-kit`.
- Confirmed/design gap: direct DSK install allows a missing non-`n:` requirement. Probe result: `n-generic-dependent-kit` installs with `requires:["runtime:needed"]` and no provider.
- Confirmed: OccupantFlowKit mutates caller spawn-rule config and reset reuses the mutated `nextAt`; probe result `externalNextAt:11`, first run count `1`, after-reset one-second count `0`.
- Confirmed: OccupantFlowKit can duplicate generated ids; probe result `["occupant-1","occupant-1"]`.
- Confirmed: FacilityOperationsKit and EconomyKit can commit non-finite ledger/account state; probe result `cashFinite:false`, `ledgerAfterFinite:false`, serialized cash `null`.
- Confirmed: ResourcePressureKit can expose contradictory depletion state; probe result before tick `value:-5`, resource depleted `false`, top-level `[]`; after tick resource depleted `false`, top-level `["oxygen"]`.
- Confirmed: ObjectiveFlowKit emits repeated completion batches; probe result `objectiveCompletionBatches:3`.
- Confirmed: ScheduleKit accepts non-finite scale into state; probe result `elapsedIsNaN:true`, `elapsedSeconds:"NaN"`, `lastCycles:0`.
- Candidate: The next useful DSK architecture work is no longer another broad audit; it is a smallest hardening fixture plan that can be converted into source/test work.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, and `prototype`.
- Own-property assertions for every installed `engine.n` API.
- Failed install rollback after API collision, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, sequence node runtime throw, and install hook throw.
- Direct install parity or documented divergence for non-`n:` `requires` tokens.
- Duplicate provider-token diagnostics across different DSK ids.
- End-to-end `extendDomainServiceKit()` install behavior, not only definition-time duplicate checks.
- Reset/snapshot absence, failure, non-serializable state, and restore/reset policy coverage.
- Async metadata override tests that explicitly state async is metadata-only today.
- Promotion fixture for objective reset and completion-event idempotency.
- Promotion fixture for lifecycle/economy accepted-state side effects.
- Promotion fixture for transport large-delta catch-up.
- Promotion fixture for schedule/config finite numeric normalization.
- Promotion fixture for occupant reset/id uniqueness.
- Promotion fixture for facility/economy finite transaction rejection or normalization.
- Promotion fixture for resource-pressure initial/restored depletion consistency.

## Promotion risks
- Do not promote broad ProtoKit or domain idea graphs into core until namespace safety, install atomicity, dependency policy, state contract enforcement, service-call policy, and operations data integrity fixtures are designed and tested.
- Do not claim async DSK execution, worker readiness, network partitioning, or replay/restore support from current metadata.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not treat public route HTTP 200 as a working DSK browser proof; neighboring lanes still show `Booting...` with missing module paths.
- Do not treat local aggregate validation as DSK first-wave proof coverage unless the targeted DSK smoke is included or explicitly documented.
- Do not treat idea docs as canonical public architecture.
- Do not treat current smoke tests as proof for accepted mutation, completion idempotency, time catch-up, config normalization, recovery, transfer, restored progress, input semantics, immutable config, identity, finite transactions, or restored-state consistency.

## Suggested next review item
- Convert the current root lesson into a smallest DSK promotion hardening fixture plan, then implement the first fixture set in a non-scout lane:
  - `engine.n` namespace policy
  - install preflight/rollback transaction boundaries
  - direct-install dependency parity versus composer-only policy
  - minimal reset/snapshot/serialization contract
  - service-call gates for accepted mutation, completion idempotency, time catch-up, and config normalization
  - operations data gates for immutable config, stable ids, finite transactions, and restored-state consistency

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, or deployments were edited.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, async execution, worker/network readiness, or broad domain graph promotion.
