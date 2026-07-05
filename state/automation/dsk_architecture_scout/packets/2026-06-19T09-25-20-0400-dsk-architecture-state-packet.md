# DSK Architecture State Packet

## Timestamp
- 2026-06-19T09-25-20-0400

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-bridge-state-fixture-root-2026-06-19-0823`.
- Latest DSK packet `2026-06-19T08-23-23-0400` kept core release-aligned and test-green, but added bridge phase delivery, step-transition receipts, delegated-action reconciliation, and wrapper state contracts to the DSK promotion fixture gates.
- Latest ecosystem state packet `2026-06-19T09-12-09-0400` says core and ProtoKits remain release-aligned and validation-green, while Experiments latest-ref validation, browser-complete public proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening/source-state gates remain open.
- Latest ecosystem proof packet `2026-06-19T08-48-39-0400` says targeted DSK proof passes locally, but Experiments is behind fetched `origin/0.0.2`, public proof still stalls at `Booting...`, and aggregate proof remains separate.
- Latest deep bug packet `2026-06-19T08-56-02-0400` adds source-state bugs: WaterSurface/RouteField/RenderDescriptor nested authored-data leaks, Economy `ledgerLimit:0` retention inversion, and PursuitPressure initial terminal-state contradiction.
- Latest domain idea packet `2026-06-19T09-00-53-0400` converts those bugs into source-state integrity proof rows for authored-source isolation, reset-source policy, retention-limit policy, initial-terminal receipts, and source-state proof.
- These packets are context only. Live source, tests, docs, preflight, git refs, and focused probes are authority for this run.

## Latest branch
- Latest remote release branch from preflight: `0.0.2`
- Current branch: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- `HEAD`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- Ahead/behind against `origin/0.0.2`: `0 0`
- Required public links: pass
- Optional npm package metadata: 404
- Worktree note: pre-existing modified/untracked automation and planning docs were present before this run. This lane wrote only its packet, node, and master tracker update.

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
- Latest 1-3 DSK packets/nodes from this lane.
- Latest neighboring ecosystem state, ecosystem proof, deep bug, and domain idea packets/nodes.
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/water-surface-kit.js`
- `src/route-field-kit.js`
- `src/render-descriptor-kit.js`
- `src/economy-kit.js`
- `src/pursuit-pressure-kit.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning docs.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md docs/how-to-protokit.md state/automation/dsk_architecture_scout`
  - Result before this packet: no source/test/runtime diff; pre-existing tracked diffs in expansion docs and this lane tracker.
- `npm test`
  - Result: pass, 8 smoke tests.
- Focused `node --input-type=module` DSK/source-state probe
  - Result: confirmed reserved `apiName:"__proto__"` is not an own namespace key, failed API collision leaves `n-late-collision-kit` in `engine.kits` and `engine.domainServiceKits`, direct DSK install allows missing `runtime:needed`, WaterSurface and RouteField reset from mutated nested caller config, RenderDescriptor exposes caller-owned material metadata, Economy `ledgerLimit:0` retains one transaction, and PursuitPressure can start in caught band with `caught:false` then recover without caught/recovered receipts.
- One discarded focused probe attempt
  - Result: failed because the probe used a nonexistent `engine.subscribeToEvent()` helper; rerun above used registered event surfaces.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for components, resources, events, systems, bindings, registries, sequences, sequence nodes, metadata, and install hooks.
- `defineDomainServiceKit()` still wraps runtime kits with required domain/stability/version metadata, default `n-<domain>-kit` ids, `n:` capability tokens, optional service tokens, and `engine.n.<apiName>` installation.
- `src/index.js` exports the DSK surface and the source-state-relevant dataset, ledger, and pressure kits inspected in this pass.
- DSK execution remains normal runtime-kit install plus linear scheduler phases. `asyncReady`, `snapshot`, `reset`, and `serializableState` are metadata/convention today, not enforced runtime boundaries.
- `createGameKitComposer()` enforces all `requires` tokens during composition. Direct `installRuntimeKit()` still only rejects missing DSK requirements whose tokens start with `n:`.
- No live source drift was found that resolves prior namespace, install atomicity, dependency parity, state contract, receipt, bridge-state, wrapper-state, or source-state blockers on current `origin/0.0.2`.

## Invariant coverage
- Covered by current smoke/freeze tests:
  - default DSK id/token metadata and public exports
  - normal `engine.n.<api>` install path
  - missing direct `n:` dependency rejection
  - simple JSON-serializable snapshot happy path
  - same-object duplicate install no-op
  - same-id duplicate DSK rejection
  - normal API collision throws
  - simple extension duplicate resource/system checks
- Still not covered:
  - reserved `apiName` keys and own-property namespace guarantees
  - rollback after failed install stages
  - direct install parity or documented divergence for non-`n:` requirements
  - duplicate provider-token diagnostics across different DSK ids
  - reset/snapshot absence, failure, non-serializable state, restore, and reset policy
  - async metadata override behavior and async boundary expectations
  - accepted/rejected service-call receipts before side effects
  - receipt identity, event idempotency, claim idempotency, and generated request ids
  - bridge phase policy for events emitted after consumers
  - one-step and final-step transition receipts
  - wrapper-owned state versus delegated stateless adapter declarations
  - authored-source clone/freeze isolation for nested datasets
  - reset-source guarantees after runtime mutation
  - zero, negative, and non-finite retention-limit semantics
  - initial terminal-state receipt policy
  - public browser proof completion and aggregate DSK smoke coverage

## Domain and kit expansion architecture notes
- Expansion docs remain planning inventory, not release contract.
- `docs/how-to-protokit.md` still keeps new reusable implementations in ProtoKits by default; core should change only for runtime/DSK/composer primitives, invariants, and validation surfaces.
- The latest neighboring domain idea inventory adds `source-state-integrity` after bridge-state ownership. That does not justify promoting source-state policy kits into core yet; it does justify adding source/reset/retention/initial-terminal rows to the DSK hardening fixture plan.
- Source-state fixtures should distinguish caller-authored config, runtime-normalized state, restored state, reset output, and public proof snapshots.
- Reset/source policy is now part of DSK promotion because metadata claims `reset` and `snapshot` expectations, while several dataset-heavy services currently reset from mutable captured config.
- Retention policy should be shared before economy, telemetry, or proof history services are treated as reliable evidence stores.
- Initial terminal-state receipts should be explicit for pressure/recovery/objective/scenario domains before those services gate pass/fail proofs.

## Scaling risks
- `installRuntimeKit()` rebuilds installed provides from `engine.kits.flatMap(...)` for each DSK install; acceptable at smoke scale, weak for larger provider graphs.
- `createGameKitComposer()` repeatedly scans pending kits until dependencies resolve, trending quadratically with larger kit counts.
- `engine.n` is a flat normal object, so broad DSK promotion increases collision, inherited-key, reserved-key, discoverability, and ownership risks.
- Direct-install dependency behavior differs from composer behavior, creating different outcomes for the same graph depending on entry path.
- Metadata-only reset/snapshot/async claims are insufficient for replay, restore, worker, network, or long-lived engine promotion.
- Cross-domain event bridges can be structurally valid but phase-lost if emitted after their consumers run.
- Wrapper services can look promoted while actually delegating mutation elsewhere and leaving their own snapshots stale.
- Dataset-heavy services can appear resettable while runtime mutations have already modified captured authored config.
- Proof/history ledgers can silently keep or drop evidence incorrectly if retention limits are not normalized before mutation.

## Bug candidates
- Confirmed: reserved namespace API key. Probe result for `apiName:"__proto__"`: `own:false`, `keys:[]`, `marker:"__proto__-api"`.
- Confirmed: failed API collision install is non-atomic. Probe result after collision: thrown error plus `engine.kits` and `engine.domainServiceKits` both contain `n-late-collision-kit`.
- Confirmed/design gap: direct DSK install allows a missing non-`n:` requirement. Probe result: `n-generic-dependent-kit` installs with `requires:["runtime:needed"]`.
- Confirmed: WaterSurface reset/source isolation gap. Probe result: runtime mutation changed reset tags and caller config tags to `["safe","runtime"]`.
- Confirmed: RouteField reset/source isolation gap. Probe result: runtime mutation changed reset tags and caller config tags to `["route","runtime"]`.
- Confirmed: RenderDescriptor caller-owned dataset gap. Probe result: material metadata mutation changed caller config tags to `["visual","runtime"]`.
- Confirmed: Economy retention-limit gap. Probe result: `ledgerLimit:0` retained one transaction, `transaction-1`.
- Confirmed: PursuitPressure initial terminal-state receipt gap. Probe result: initial `{band:"caught", caught:false, distance:5}` recovered to `{band:"danger", caught:false, distance:10}` with `caughtBatches:0` and `recoveredBatches:0`.
- Candidate: the smallest DSK promotion plan now needs source-state rows in addition to install, receipt, spatial/mobility, operations, service-call, bridge, step, and wrapper-state rows.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, and `prototype`.
- Own-property assertions for every installed `engine.n` API.
- Failed install rollback after API collision, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, sequence node runtime throw, and install hook throw.
- Direct install parity or documented divergence for non-`n:` `requires` tokens.
- Duplicate provider-token diagnostics across different DSK ids.
- End-to-end `extendDomainServiceKit()` install behavior.
- Reset/snapshot absence, failure, non-serializable state, restore, and reset policy coverage.
- Async metadata override tests that explicitly state async is metadata-only today.
- Receipt identity, idempotent completion events, idempotent claim events, and generated request identity fixtures.
- Bridge phase fixture for `SurfacePlacementKit` raw AR events reaching ObjectiveFlow.
- ObjectiveFlow and ARExperience step-transition receipt fixtures for one-step, middle-step, final-step, reset, and duplicate-attempt cases.
- Delegated wrapper reconciliation fixtures for symbol alignment, lock/socket, reveal light, sorting, moving target, and micro-platformer APIs.
- Wrapper state contract fixtures that distinguish owned state, mirrored state, and intentionally stateless adapters.
- Authored-source isolation fixtures for WaterSurface, RouteField, RenderDescriptor, and other dataset-heavy kits.
- Reset-source fixtures that mutate nested runtime state, call reset, and assert caller config plus reset output stay clean.
- Retention-limit fixtures for Economy, Telemetry, and proof-history rows covering zero, negative, non-finite, and positive limits.
- Initial terminal-state receipt fixtures for PursuitPressure, recovery, objective, and scenario services.

## Promotion risks
- Do not promote broad ProtoKit or domain idea graphs into core until namespace safety, install atomicity, dependency policy, state contract enforcement, service-call policy, receipt integrity, bridge phase, wrapper-state contracts, and source-state integrity are designed and tested.
- Do not claim async DSK execution, worker readiness, network partitioning, or replay/restore support from current metadata.
- Do not claim reset/snapshot readiness for dataset-heavy services while runtime mutations can leak into caller-owned config and reset output.
- Do not claim proof/history ledger reliability while zero retention can retain transactions.
- Do not claim pressure/recovery pass/fail proof readiness while initial terminal states can be contradictory and eventless.
- Do not claim raw event bridges are equivalent to direct service calls until phase delivery is proven.
- Do not claim wrapper state is authoritative when actions delegate to InteractionTarget and leave wrapper resources unchanged.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not treat public route HTTP 200 as working browser proof; neighboring lanes still report `Booting...`.
- Do not treat local aggregate validation as DSK first-wave proof unless the targeted DSK smoke is included or explicitly required.
- Do not treat idea docs as canonical public architecture.

## Suggested next review item
- Use a non-scout lane to write the smallest executable DSK promotion hardening fixture set, now including source-state rows:
  - `engine.n` namespace policy
  - install preflight/rollback transaction boundaries
  - direct-install dependency parity versus composer-only policy
  - minimal reset/snapshot/serialization contract
  - receipt identity and event/claim idempotency
  - bridge phase delivery and step-transition receipts
  - delegated wrapper state reconciliation or stateless adapter declarations
  - operations data and spatial/mobility invariant rows
  - authored-source isolation and reset-source proof
  - retention-limit normalization
  - initial terminal-state receipts

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, or deployments were edited.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, async execution, worker/network readiness, replay/restore support, or broad domain graph promotion.
