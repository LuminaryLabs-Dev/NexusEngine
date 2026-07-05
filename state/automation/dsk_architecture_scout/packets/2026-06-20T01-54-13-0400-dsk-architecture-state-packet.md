# DSK Architecture State Packet: 2026-06-20T01-54-13-0400

## Timestamp
- local: 2026-06-20T01-54-13-0400
- UTC preflight: 2026-06-20T05:53:14.802Z
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-proof-signal-integrity-tranche-root-2026-06-19-2225`.
- Latest DSK packet/node kept runtime failure-boundary as tranche 1, lifecycle parity as tranche 2, query/command semantics as tranche 3, experience-edge as tranche 4, read-model/orchestration as tranche 5, compatibility/content-safety as tranche 6, AR/spatial read-model as tranche 7, proof-signal integrity as tranche 8, and proof-readiness/module-source/release evidence as separate claim-management layers.
- Latest ecosystem state node `2026-06-19T22-10-08-0400` says core remains current and validation-green, but ProtoKits fetched-ref proof, Experiments targeted fetched-ref proof, and public browser proof still need one declared module-source strategy.
- Latest ecosystem proof node `2026-06-19T22-40-52-0400` keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, proof-signal, and distribution/module-source proof claims separate.
- Latest deep bug node `2026-06-19T21-55-21-0400` remains the newest bug family for proof-signal integrity: repeated ARExperience completion, WebXR hit-test rejection, negative normal tick time, and non-finite greybox/spatial scale.
- Latest domain idea node `2026-06-20T00-00-47-0400` found no non-duplicative durable idea family; distribution-proof and proof-signal rows stay under existing Proof Readiness Queue and Proof Signal Integrity inventory.
- State packets were context only. Live source, docs, tests, git refs, preflight, and focused probes were treated as authority for this run.

## Latest branch
- preflight command: `npm run automation:preflight`
- latest remote release branch: `0.0.2`
- compare target: `0.0.2`
- current branch: `0.0.2`
- branch status: `current-is-latest-release-branch`
- required public links: pass
- optional npm metadata: 404
- `HEAD`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- ahead/behind against `origin/0.0.2`: `0 0`
- package metadata: `nexusengine@0.1.0`
- worktree note: pre-existing modified docs/automation trackers and many untracked prior automation artifacts were present before this lane wrote its packet, node, and tracker update.

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
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- latest DSK packets/nodes: `2026-06-19T22-25-35-0400`, `2026-06-19T21-25-07-0400`, `2026-06-19T20-24-13-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/engine.js`
- `src/ar-experience-kit.js`
- `src/ar-session.js`
- `src/greybox-building-kit.js`
- `src/spatial-room-kit.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch` -> `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked docs and automation artifacts.
- `git rev-parse HEAD origin/0.0.2` -> both refs `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- `git diff --stat origin/0.0.2 -- <inspected source/test/doc files>` -> no inspected source/test runtime diff; tracked diffs were `docs/described_examples.md`, `docs/domain_ideas.md`, and `docs/kits_ideas.md` from prior lane work.
- `npm test` -> passed 8 smoke tests.
- Focused `node --input-type=module` DSK/runtime/proof-signal probes -> reconfirmed reserved API behavior, failed API-collision partial install, direct dependency parity, failed-tick replay, ARExperience completion repeat/double emit, hit-test rejection throw, negative tick time, and non-finite greybox/spatial scale.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable kit primitive for components, resources, events, systems, registries, sequences, sequence nodes, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares `asyncReady`, serializable state, snapshot, and reset expectations, but execution remains the current linear scheduler path (`src/domain-service-kit.js:131-139`; `README.md:138-140`).
- `engine.n` is still initialized as a normal object when missing, and DSK API assignment happens late through the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, bindings, and kit identity before `initWorld`, registry, scheduler, sequence, sequence-node, and install hooks can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still checks only missing `n:` requirements, while `createGameKitComposer()` resolves every required token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- Public exports still include DSK, RuntimeKit, composer, surfaces, shader/material registries, legacy sequence runtime, SequenceNode APIs, AR/session/experience APIs, and spatial/greybox APIs (`src/index.js:28-200`).

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK creation/validation, metadata shape, token creation, extension duplicate checks, missing `n:` requirement rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw (`tests/domain-service-kit-smoke.mjs:64-135`; `tests/public-api-freeze.mjs:16-24`).
- Not covered by smoke tests: reserved API names, inherited namespace behavior, own-property service guarantees, failed-install rollback/retryability, direct non-`n:` dependency policy, duplicate provider-token diagnostics, install throw points before/after world mutation, reset/snapshot absence or failure, non-serializable state behavior, async metadata truth, scheduler failed-tick clock/event/journal/lifecycle semantics, lifecycle parity, query/command semantics, experience-edge rows, read-model/orchestration isolation, compatibility/content-safety, AR/spatial read-model contracts, proof-signal integrity, public proof boundaries, and proof-claim taxonomy.
- Focused probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed clean API collision: first collision threw, second same-object reinstall returned `n-late-collision-clean-kit`, API owner stayed `existing`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-kit` and exposed `engine.n.needsRuntime.ready:true`.
  - scheduler failure: first tick threw `boom once`; the next successful tick event surface published both `failed-tick` and `recovery-tick` at frame `2`, elapsed `0.5`.
  - ARExperience completion: final step with `action:"done"` produced 3 completion batches across the action tick plus two later ticks; `arExperience.complete()` produced 2 completion payloads in one API call/tick.
  - WebXR hit-test helper: rejected `requestHitTestSource()` threw `hit-test denied`.
  - negative tick time: `tick(1)` then `tick(-2)` left `clock.delta:-2`, `clock.elapsed:-1`, `frame:2`, and lifecycle surfaces published negative elapsed time.
  - finite spatial scale: `createGreyboxBuilding({ scale:"huge" })` and installed `SpatialRoomState.buildings[0].scale` were both `NaN` before JSON serialization.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments ownership stayed stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation surfaces; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:11-15`, `docs/how-to-protokit.md:56-68`, `docs/how-to-protokit.md:265-285`).
- Latest idea expansion did not add a new durable distribution-proof domain; module-source, fetched-ref, public browser, npm, package-version, and aggregate/targeted proof rows already live under Proof Readiness Queue (`docs/domain_ideas.md:915-932`; `docs/kits_ideas.md:791-827`).
- Runtime failure-boundary remains the first core fixture tranche because it targets DSK namespace safety, failed installs, direct/composer dependency parity, failed scheduler ticks, and metadata truth.
- Proof-signal integrity remains tranche 8 after AR/spatial read-model because the evidence is in exported core proof surfaces (`src/ar-experience-kit.js`, `src/ar-session.js`, `src/engine.js`, `src/greybox-building-kit.js`, and `src/spatial-room-kit.js`) but does not replace base DSK install/runtime hardening.
- Public module-source strategy remains an ecosystem/proof decision. Fixing public imports would not prove namespace safety, install rollback, dependency parity, failed-tick semantics, terminal receipt idempotency, hit-test rejection policy, monotonic time, or finite spatial scale.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registry state, scheduler systems, sequence runtimes, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Failed-tick events can be replayed with later successful ticks and be mistaken as normal proof by surfaces, SequenceNode bridges, analytics, objectives, or proof harnesses.
- Metadata-only reset/snapshot/async expectations are too weak for replay, restore, worker, network, and long-running simulation claims.
- ARExperience terminal events can overcount proof completion, telemetry, rewards, objective bridges, and public proof counters.
- WebXR hit-test rejection can escape helper setup and crash mode loops that otherwise expect nullable unsupported behavior.
- Negative normal tick deltas can publish rollback time through lifecycle surfaces and SequenceNode frame events as if they were normal forward-time proof.
- Non-finite greybox/spatial scale can poison render descriptors, AR placement, serialization, and proof geometry.
- Duplicate proof-readiness/domain names would make the queue harder to act on; the latest idea packet correctly deferred duplicates instead of adding another planning family.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic. The failed kit remains in `engine.kits` and `engine.domainServiceKits`, and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation would reject.
- Confirmed: thrown systems can replay failed-tick events on the next successful tick.
- Confirmed/current: ARExperience terminal completion emits repeatedly, and manual `complete()` duplicates completion payloads (`src/ar-experience-kit.js:112-149`).
- Confirmed/current: `createHitTestSource()` catches viewer-space failure but not `requestHitTestSource()` rejection (`src/ar-session.js:61-75`).
- Confirmed/current: `engine.tick()` accepts finite negative deltas and publishes normal surfaces with negative elapsed time (`src/engine.js:168-287`).
- Confirmed/current: `createGreyboxBuilding()` and `normalizeBuildingDataset()` can store non-finite `scale` (`src/greybox-building-kit.js:26-67`; `src/spatial-room-kit.js:46-58`).
- Carried: lifecycle parity, query/command semantics, experience-edge, read-model/orchestration, compatibility/content-safety, AR/spatial read-model, traversal, source-state, state-signal, receipt, bridge, operations, and spatial rows remain fixture inventory.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, `prototype`, inherited keys, and own-property service lookup.
- Null-prototype or reserved-key namespace policy for `engine.n`.
- Failed install rollback/retryability for API collision, `createApi` throw, install hook throw, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, and sequence node runtime throw.
- Direct install versus composer dependency policy for `n:*`, `runtime:*`, kit ids, and custom capability tokens.
- Duplicate provider-token diagnostics across different DSK ids.
- End-to-end `extendDomainServiceKit()` install behavior.
- Reset/snapshot absence, failure, restore, and non-serializable state behavior.
- Async metadata truth tests that prove async is metadata-only today.
- Scheduler failed-tick fixtures for throw-before-emit, throw-after-emit, clock commit/rollback, event clearing, journal clearing, lifecycle diagnostics, and SequenceNode bridge inputs.
- Lifecycle parity fixtures for held-input receipt transitions, query fallback versus baked chunk parity, partial-start cleanup, and stopped-session state.
- Query/command semantics fixtures for terminal receipts, side-effect-free query policy, rejected-command state preservation, and cloned/immutable query snapshots.
- Experience-edge fixtures for repeated recovery receipts, AR launch fallback/no-fallback diagnostics, custom quality profile handling, and empty/malformed content datasets.
- Read-model/orchestration isolation fixtures for shader/material registry descriptor cloning/freezing, surface snapshot isolation, SequenceNode race cleanup, and SequenceNode `any` receipt policy.
- Legacy compatibility/content-safety fixtures for root restart descendant reset/replay, legacy `AnyChild` loser cleanup, legacy controller owning-kit lookup, and AR renderer text-versus-trusted-HTML policy.
- AR/spatial read-model fixtures for ARKit preconditions, strict/permissive fallback mode labels, launcher support-state cloning/freezing, render/update callback state isolation, SpatialRoom getter cloning/freezing, and mutable-handle naming policy.
- Proof-signal integrity fixtures for ARExperience final-step/manual-complete/repeated-tick event counts, hit-test source rejection, negative normal tick deltas through surfaces and SequenceNode, and finite greybox/spatial scale normalization.
- Proof-readiness/release evidence checks that keep runtime hardening, lifecycle parity, query/command semantics, experience-edge proof, read-model/orchestration proof, compatibility/content-safety proof, AR/spatial read-model proof, proof-signal integrity, fetched-ref validation, aggregate/targeted proof parity, public browser proof, npm availability, and package-version policy separate.

## Promotion risks
- Do not promote broad DSK graphs until namespace safety, install transaction semantics, direct/composer dependency policy, scheduler failure lifetime, reset/snapshot/async truth, lifecycle parity, query/command semantics, experience-edge, read-model/orchestration, compatibility/content-safety, AR/spatial read-model, and proof-signal integrity semantics are executable fixtures.
- Do not treat `npm test` or DSK smoke success as production DSK safety; they remain happy-path/export-shape proof.
- Do not treat proof-readiness queueing, claim taxonomy, release-evidence checklist rows, module-source decisions, or public browser route visibility as proof that runtime hardening blockers are fixed.
- Do not let proof-signal integrity rows or distribution-proof planning rows supersede base DSK runtime failure-boundary work.
- Do not treat HTTP 200, GitHub/raw/jsDelivr availability, fetched-ref package resolution, aggregate proof, targeted proof, or Playwright launch visibility as runtime hardening proof.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not promote idea docs as canonical runtime contract or implementation state.

## Suggested next review item
- Use a non-scout lane to write the smallest executable tranche 1 fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, scheduler failed-tick semantics, and reset/snapshot/async metadata truth.
- Keep tranche 2 lifecycle parity, tranche 3 query/command semantics, tranche 4 experience-edge, tranche 5 read-model/orchestration isolation, tranche 6 compatibility/content-safety, tranche 7 AR/spatial read-model proof, tranche 8 proof-signal integrity, and proof-readiness/module-source/release-evidence taxonomy as separate follow-on gates.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, experience-edge readiness, read-model/orchestration readiness, compatibility/content-safety readiness, AR/spatial read-model readiness, proof-signal integrity readiness, proof-readiness taxonomy, or broad domain graph promotion.
