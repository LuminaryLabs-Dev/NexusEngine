# DSK Architecture State Packet

## Timestamp
- 2026-06-19T06-24-24-0400

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-fixture-plan-ready-root-2026-06-19-0540`.
- Latest DSK packet `2026-06-19T05-40-58-0400` says current `origin/0.0.2` remains release-aligned and test-green, but DSK promotion is blocked by one concrete fixture plan across namespace, install, dependency, state-contract, service-call, and operations data invariants.
- Latest ecosystem proof packet `2026-06-19T05-42-20-0400` says local targeted proof is green, sibling local checkouts are behind fetched release refs, and the public browser proof still stalls at `Booting...` due missing public module paths.
- Latest deep bug packet `2026-06-19T05-53-25-0400` adds spatial, scenario-time, hazard, and mobility invariant bugs: missed anchor-entered events, zero-duration inert state, generated hazard id collisions, and zero-capacity boost activation.
- Latest domain idea packet `2026-06-19T06-00-34-0400` maps those bugs into spatial/mobility invariant planning inventory: transition-state policy, immediate-threshold policy, hazard identity policy, resource-bound normalization, and proof rows.
- Latest ecosystem state packet `2026-06-19T06-09-33-0400` says core is current on the latest release branch and available-checkout validation is green, but public proof, sibling latest-ref validation, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening gates remain open.
- These packets are context only. Live source, tests, docs, focused probes, git state, and preflight are authority for this run.

## Latest branch
- Latest remote release branch from preflight: `0.0.2`
- Current branch: `0.0.2`
- `HEAD`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- Ahead/behind against `origin/0.0.2`: `0 0`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm package metadata: 404
- Local state note: worktree already had modified docs and neighboring automation files before this run. This lane wrote only its packet, node, and master tracker update.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `package.json`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`
- `state/automation/README.md`
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
- `src/spatial-scale-kit.js`
- `src/scenario-duration-kit.js`
- `src/hazard-field-kit.js`
- `src/vehicle-dynamics-kit.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning docs.
- `git branch -r --list 'origin/[0-9]*' --format='%(refname:short)' | sort -V | tail -n 5`
  - Result: `origin/0.0.1`, `origin/0.0.2`.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md docs/how-to-protokit.md state/automation/dsk_architecture_scout`
  - Result before this packet: no source/test diff; pre-existing tracked diffs in `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, and `state/automation/dsk_architecture_scout/master_dsk_architecture.md`.
- `npm test`
  - Result: pass, 8 smoke tests.
- Focused `node --input-type=module` DSK and spatial/mobility probe
  - Result: confirmed reserved namespace behavior, non-atomic API collision install, direct missing non-`n:` dependency install, missed spatial entry event, zero-duration inert state, hazard generated id collision, and zero-capacity boost activation.
- `rg -n "Domain Service|domain-service|n:<|engine\\.n|asyncReady|ProtoKit|runtime-kit|defineDomainServiceKit|Spatial Mobility|transition-state|immediate-threshold|hazard identity|resource-bound" README.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md docs/how-to-protokit.md`
  - Result: docs still describe DSK as the promoted contract, ProtoKits as the default implementation target, and new spatial/mobility invariant ideas as planning inventory.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for ECS definitions, systems, bindings, registries, sequences, sequence nodes, metadata, and install hooks.
- `defineDomainServiceKit()` wraps runtime kits with required `domain`, `stability`, `version`, default stable id `n-<domain>-kit`, default `n:<domain>` provide token, optional service tokens, DSK metadata, and an `engine.n.<apiName>` bridge.
- `createDomainServiceToken()` normalizes domain/service names into `n:` capability tokens.
- `src/index.js` exports the DSK surface and the spatial/mobility kits now relevant to promotion fixture planning.
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
  - spatial nearest/query state versus entered/exited transition state
  - zero-duration and zero-threshold settlement policy
  - generated hazard identity across authored/restored/spawned data
  - resource-bound normalization before mobility simulation uses capacity state

## Domain and kit expansion architecture notes
- Expansion docs remain planning inventory, not public release contract.
- `docs/how-to-protokit.md` keeps new reusable kit implementations in ProtoKits by default; core should receive only runtime contracts, validation invariants, composer rules, ECS/scheduler primitives, or DSK hardening.
- `docs/domain_ideas.md` now adds Spatial Mobility Invariant Domain with `n:spatial:transition`, `n:time:immediate-threshold`, `n:hazard:identity`, `n:mobility:resource-bound`, and proof services.
- `docs/kits_ideas.md` now adds transition-state, immediate-threshold, hazard-identity, resource-bound-normalization, and spatial-mobility-invariant-proof kit candidates, all pointed at ProtoKits.
- `docs/described_examples.md` now describes a Spatial Mobility Invariant Harness that joins spatial transition, time threshold, hazard identity, mobility resource, and proof domains.
- This does not change the core contract. It raises the fixture bar for DSK promotion because spatial/mobility failures can be service-contract failures even when install mechanics are green.
- Proof coverage should stay separated by category: local command, available-checkout command, latest sibling release-ref command, aggregate command, raw-public file, CDN import, npm availability, and browser-complete human proof.

## Scaling risks
- `installRuntimeKit()` rebuilds installed provides from `engine.kits.flatMap(...)` for each DSK install. This is acceptable at smoke scale but weak for larger provider graphs.
- `createGameKitComposer()` repeatedly scans pending kits until dependencies resolve, trending quadratically with larger kit counts.
- `engine.n` is a flat normal object, so broad DSK promotion increases collision, inherited-key, reserved-key, discoverability, and ownership risks.
- Direct-install dependency behavior differs from composer behavior, which can produce different outcomes for the same kit graph depending on entry path.
- Metadata-only reset/snapshot/async claims are insufficient for replay, restore, network, worker, or long-lived engine promotion.
- Domain service APIs can be structurally valid while still violating transition-state, immediate-threshold, stable-identity, resource-bound, accepted-mutation, idempotency, time-step, config-normalization, immutable-config, finite-ledger, or restored-state policy.

## Bug candidates
- Confirmed: reserved namespace API key. Probe result for `apiName:"__proto__"`: `own:false`, `keys:[]`, `protoMarker:"__proto__-api"`, and `valueMarker:"__proto__-api"`.
- Confirmed: failed API collision install is non-atomic. Probe result after collision: thrown error plus `engine.kits` and `engine.domainServiceKits` both contain `n-late-collision-kit`.
- Confirmed/design gap: direct DSK install allows a missing non-`n:` requirement. Probe result: `n-generic-dependent-kit` installs with `requires:["runtime:needed"]` and no provider.
- Confirmed: SpatialScaleKit can miss anchor-entered transition receipts. Probe result after outside-nearest then inside: `activeAnchorId:"anchor-a"`, `inside:true`, `enteredCount:0`.
- Confirmed: ScenarioDurationKit does not settle zero-duration and zero-time checkpoint state on initialization or zero-delta tick. Probe result: `initialCompleted:false`, `afterZeroCompleted:false`, checkpoint reached false, events `0`.
- Confirmed: HazardFieldKit can duplicate generated ids. Probe result: `["pulse-1","pulse-1"]`.
- Confirmed: VehicleDynamicsKit can grant one boosted frame with zero boost capacity. Probe result: `boost:{value:0,max:0,active:true}`, velocity `x:100`, position `x:100`.
- Candidate: The DSK promotion fixture plan should now include spatial/mobility invariant rows, not only DSK install hardening, service-call policy, and operations data integrity.

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
- Promotion fixture for spatial outside-nearest to inside entry receipts.
- Promotion fixture for zero-duration and zero-time checkpoint settlement.
- Promotion fixture for hazard generated id uniqueness.
- Promotion fixture for zero-capacity and over-capacity mobility resource normalization.

## Promotion risks
- Do not promote broad ProtoKit or domain idea graphs into core until namespace safety, install atomicity, dependency policy, state contract enforcement, service-call policy, operations data integrity, and spatial/mobility invariants have executable fixtures.
- Do not claim async DSK execution, worker readiness, network partitioning, or replay/restore support from current metadata.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not treat public route HTTP 200 as a working DSK browser proof; neighboring lanes still show `Booting...` with missing module paths.
- Do not treat local aggregate validation as DSK first-wave proof coverage unless the targeted DSK smoke is included or explicitly documented.
- Do not treat idea docs as canonical public architecture.
- Do not treat passing smoke tests as proof for transition receipts, immediate thresholds, stable generated ids, resource-bound normalization, accepted mutation, completion idempotency, time catch-up, config normalization, recovery, transfer, restored progress, input semantics, immutable config, finite transactions, or restored-state consistency.

## Suggested next review item
- Use a non-scout lane to write the smallest DSK promotion hardening fixture plan, then implement the first executable fixture set:
  - `engine.n` namespace policy
  - install preflight/rollback transaction boundaries
  - direct-install dependency parity versus composer-only policy
  - minimal reset/snapshot/serialization contract
  - service-call gates for accepted mutation, completion idempotency, time catch-up, and config normalization
  - operations data gates for immutable config, stable ids, finite transactions, and restored-state consistency
  - spatial/mobility gates for transition receipts, immediate thresholds, hazard identity, and resource-bound normalization

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, pulls, merges, or resets were edited/performed.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, latest sibling release-ref validation, async execution, worker/network readiness, or broad domain graph promotion.
