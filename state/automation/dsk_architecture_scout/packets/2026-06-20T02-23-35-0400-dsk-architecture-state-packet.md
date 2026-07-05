# DSK Architecture State Packet: 2026-06-20T02-23-35-0400

## Timestamp
- local: 2026-06-20T02-23-35-0400
- UTC preflight: 2026-06-20T06:22:25.472Z
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-distribution-boundary-still-root-2026-06-20-0154`.
- Latest DSK packet kept runtime failure-boundary as tranche 1, proof-signal integrity as tranche 8, and distribution/module-source proof as separate claim management.
- Latest ecosystem state/proof nodes `2026-06-20T01-59-37-0400` and `2026-06-20T01-59-45-0400` show core still current and smoke-green, but local ProtoKits/Experiments targeted DSK proof now also fails on unresolved package `nexusengine`; fetched/public proof still fails on module-source paths.
- Latest deep bug node `2026-06-20T01-55-55-0400` adds composition-proof rows: duplicate capability providers, silent SequenceNode type overwrite, mutable SequenceNode event history, and AR launch device-source mismatch.
- Latest domain idea node `2026-06-20T02-01-55-0400` converts those rows into a Composition Proof Ownership family without reordering runtime failure-boundary work.
- State packets were context only. Live source, docs, tests, git refs, preflight, and focused probes were treated as authority.

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
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/dsk_architecture_scout/PROMPT.md`, `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- latest DSK packets/nodes: `2026-06-20T01-54-13-0400`, `2026-06-19T22-25-35-0400`, `2026-06-19T21-25-07-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/index.js`, `src/engine.js`
- `src/sequence-node-library.js`, `src/sequence-node.js`, `src/ar-device.js`, `src/ar-launcher.js`, `src/ar-modes/camera-overlay.js`
- `tests/domain-service-kit-smoke.mjs`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch` -> `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked docs and automation artifacts.
- `git rev-parse HEAD origin/0.0.2` -> both refs `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- `git diff --stat origin/0.0.2 -- <inspected source/test/doc files>` -> no inspected source/test runtime diff; tracked diffs were prior docs idea additions.
- `npm test` -> passed 8 smoke tests.
- Focused `node --input-type=module` DSK/composer/SequenceNode/AR probe -> reconfirmed tranche 1 DSK blockers and confirmed composition-proof rows.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable kit primitive for components, resources, events, systems, registries, sequences, sequence nodes, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares `asyncReady`, serializable state, snapshot, and reset expectations, while current execution remains linear scheduler phases (`src/domain-service-kit.js:131-139`; `README.md:136-140`).
- `engine.n` is still initialized as a normal object when missing, and API assignment happens late through the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, bindings, and kit identity before `initWorld`, registry, scheduler, sequence, sequence-node, and install hooks can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still checks only missing `n:` requirements, while `createGameKitComposer()` resolves every required token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- Public exports still include DSK, RuntimeKit, composer, SequenceNode, AR/session/launch APIs, and many domain primitives (`src/index.js:28-210`).

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK validation, metadata shape, token creation, extension duplicate checks, missing `n:` rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw (`tests/domain-service-kit-smoke.mjs:64-135`; `tests/public-api-freeze.mjs:16-24`; `tests/run-all.mjs:3-11`).
- Not covered: reserved API names, own-property namespace policy, failed-install rollback, direct non-`n:` dependency parity, duplicate provider-token diagnostics, SequenceNode duplicate type policy, event-bus history isolation, AR runtime-source consistency, scheduler failed-tick lifetime, reset/snapshot failure, and async metadata truth.
- Focused probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed clean API collision: first collision threw, second same-object reinstall returned `n-late-collision-clean-kit`, API owner stayed `existing`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-kit` and exposed `engine.n.needsRuntime.ready:true`.
  - duplicate provider ownership: two kits with `provides:["cap:x"]` composed and installed; composer returned one `cap:x`, `hasProvider:true`, and both install hooks ran.
  - SequenceNode type policy: registering type `dup` twice left one entry with title `second`.
  - SequenceNode history isolation: mutating `bus.snapshot().history[0].payload.nested.value` changed the original event and later snapshots to `99`.
  - AR runtime source: override device selected `camera-overlay` with `supported:true`, but start failed session with `camera_unavailable` while support still reported true.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments ownership stayed stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation surfaces; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:53-68`, `docs/how-to-protokit.md:253-286`).
- Fresh composition-proof rows target core validation surfaces, not gameplay kit implementation: composer provider ownership, SequenceNode type registry policy, SequenceNode event history isolation, and AR launch runtime-source consistency.
- Runtime failure-boundary remains tranche 1 because namespace safety, failed installs, direct/composer dependency parity, failed scheduler ticks, and metadata truth affect all DSK promotion.
- Composition proof ownership should be a later tranche after read-model/orchestration and before or beside AR/proof-signal rows, because it makes large graphs and proof diagnostics trustworthy but does not supersede base install/runtime hardening.
- Public module-source strategy remains an ecosystem/proof decision. Fixing module imports would not prove runtime failure-boundary, duplicate provider policy, SequenceNode type policy, event-history isolation, or AR runtime-source consistency.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registries, systems, sequence runtimes, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Duplicate provider tokens let large graphs satisfy dependencies through a boolean while multiple providers mutate runtime state.
- SequenceNode type overwrite lets later kits change orchestration semantics after validation or planning.
- Event-bus history mutation lets diagnostics, proof panels, telemetry, or inspectors alter the evidence they read.
- AR launch can report override-based camera support while selected mode startup fails against global browser state.
- Local/fetched/public DSK proof can regress independently of core smoke tests when module-source policy is implicit.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation would reject.
- Confirmed: duplicate capability providers compose and install with no ownership diagnostics.
- Confirmed: SequenceNode type registration silently overwrites an existing type.
- Confirmed: SequenceNode event-bus snapshots expose mutable event history.
- Confirmed: AR launch classification can use override device data while camera-overlay startup reads global `navigator`, leaving support and session state contradictory.
- Carried: failed-tick replay, proof-signal integrity, lifecycle parity, query/command semantics, experience-edge, read-model/orchestration, compatibility/content-safety, AR/spatial read-model, traversal, source-state, state-signal, receipt, bridge, operations, and spatial rows remain fixture inventory.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, `prototype`, inherited keys, and own-property service lookup.
- Null-prototype or reserved-key namespace policy for `engine.n`.
- Failed install rollback/retryability for API collision, `createApi` throw, install hook throw, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, and sequence node runtime throw.
- Direct install versus composer dependency policy for `n:*`, `runtime:*`, kit ids, and custom capability tokens.
- Duplicate provider-token diagnostics, owner lookup, and intentional override behavior.
- SequenceNode duplicate type registration and explicit override policy.
- SequenceNode event-bus history clone/freeze behavior for payloads, meta, returned events, listeners, and disposed state.
- AR launch support/session consistency across override navigator, global navigator, unsupported global, and failed startup.
- Reset/snapshot absence, failure, restore, non-serializable state behavior, and async metadata truth.
- Proof-readiness checks that keep local/fetched/browser/npm/package-version/module-source proof separate from runtime and composition hardening.

## Promotion risks
- Do not promote broad DSK graphs until runtime failure-boundary fixtures exist for namespace safety, install transaction semantics, dependency parity, scheduler failure lifetime, and metadata truth.
- Do not treat capability-token presence as unambiguous proof until duplicate provider ownership has executable diagnostics.
- Do not trust SequenceNode-backed orchestration proof until duplicate type policy and event-history isolation are covered.
- Do not use override-based AR launch support as proof until startup uses the same runtime source or reconciles support after failure.
- Do not treat `npm test`, HTTP 200 public routes, aggregate Experiments checks, fetched raw files, or public CDN reachability as production DSK safety.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not move proof routing, package-resolution shims, browser routes, or reusable implementation into NexusEngine core to solve distribution proof.

## Suggested next review item
- Use a non-scout lane to write the smallest executable tranche 1 fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, scheduler failed-tick semantics, and reset/snapshot/async metadata truth.
- After tranche 1 starts, add composition-proof ownership fixtures for duplicate providers, SequenceNode duplicate type policy, event-bus history isolation, and AR launch support/session consistency.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, read-model/orchestration readiness, composition-proof ownership readiness, AR/spatial readiness, proof-signal integrity, proof-readiness taxonomy, or broad domain graph promotion.
