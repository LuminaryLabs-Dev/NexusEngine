# DSK Architecture State Packet: 2026-06-20T03-23-42-0400

## Timestamp
- local: 2026-06-20T03-23-42-0400
- UTC preflight: 2026-06-20T07:21:45.472Z
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-composition-proof-ownership-root-2026-06-20-0223`.
- Latest DSK packet kept runtime failure-boundary as tranche 1, composition-proof ownership as a later validation tranche, and module-source proof as ecosystem/proof claim management.
- Latest ecosystem state node `2026-06-20T03-07-30-0400` says core remains current and smoke-green, while ProtoKits local/fetched proof, Experiments targeted proof, public browser proof, npm metadata, and package-version claims remain separate proof blockers.
- Latest ecosystem proof node `2026-06-20T02-40-59-0400` keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof-signal claims separate.
- Latest deep bug node `2026-06-20T02-54-27-0400` adds runtime binding overwrite, ECS definition-name aliasing, SequenceNode install-only repeat side effects, and disposed event-bus `onAny()` parity as hardening inventory.
- Latest domain idea node `2026-06-20T03-01-44-0400` maps those rows into Runtime Identity And Lifecycle Ownership, not a module-source or runtime failure-boundary replacement.
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
- worktree note: pre-existing modified docs/automation trackers and many untracked prior automation artifacts were present before this run. This lane wrote only its packet, node, and tracker update.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/dsk_architecture_scout/PROMPT.md`, `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- latest DSK packets/nodes: `2026-06-20T02-23-35-0400` and `2026-06-20T01-54-13-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/ecs.js`, `src/index.js`, `src/sequence-node.js`, `src/sequence-node-library.js`, `src/sequence-node-kit.js`
- `tests/domain-service-kit-smoke.mjs`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch` -> `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked docs and automation artifacts.
- `git rev-parse HEAD origin/0.0.2` -> both refs `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- `git diff --stat origin/0.0.2 -- <inspected source/test/doc files>` -> no inspected source/test/runtime diff; tracked diffs were prior docs idea additions.
- `npm test` -> passed 8 smoke tests.
- Focused `node --input-type=module` DSK/runtime/SequenceNode probes -> reconfirmed base DSK blockers and current runtime identity/lifecycle rows.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for components, resources, events, systems, registries, sequences, SequenceNode fields, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares async-ready, serializable state, snapshot, and reset expectations while current execution remains scheduler-linear (`src/domain-service-kit.js:131-139`; `README.md:140`).
- `engine.n` is still initialized as a normal object and assigned late through the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, kit bindings, and kit identity before `initWorld`, registry, scheduler, sequence, SequenceNode, and install hooks can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still checks only missing `n:` requirements, while `createGameKitComposer()` resolves every required token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- Public exports still include DSK, RuntimeKit, composer, ECS, SequenceNode, AR/session/launch APIs, and domain primitives (`src/index.js:28-210`).

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK validation, metadata shape, token creation, extension duplicate checks, missing `n:` rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw (`tests/domain-service-kit-smoke.mjs:64-135`; `tests/public-api-freeze.mjs:16-24`; `tests/run-all.mjs:3-11`).
- Not covered: reserved API names, own-property namespace policy, failed-install rollback, direct non-`n:` dependency parity, duplicate provider-token diagnostics, duplicate binding diagnostics, ECS definition-name collision policy, SequenceNode duplicate type policy, install-only kit idempotency, event-history isolation, disposed `onAny()` parity, scheduler failed-tick lifetime, reset/snapshot failure, and async metadata truth.
- Focused probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed clean API collision: first collision threw, second same-object reinstall returned `n-late-collision-clean-kit`, API owner stayed `existing`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-kit` and exposed `engine.n.needsRuntime.ready:true`.
  - binding ownership: composer and engine both kept binding `service` from second kit `binding-b`.
  - ECS definition identity: `ComponentB`, `ResourceB`, and `EventB` read data emitted/written through same-named A definitions.
  - SequenceNode type policy: registering type `dup` twice left title `second`.
  - event history isolation: mutating `bus.snapshot().history[0].payload.nested.value` changed original and later snapshots to `99`.
  - disposed event-bus parity: `subscribe()` and `once()` rejected after dispose, but `onAny()` added a listener and snapshot reported `anyListenerCount:1`.
  - install-only SequenceNode idempotency: two deployments of the same raw kit ran install twice, set `rawInstalled:2`, and left `engine.kits` empty.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments ownership stayed stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation surfaces; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:53-68`, `docs/how-to-protokit.md:99-105`).
- New runtime identity/lifecycle rows target core validation surfaces, not gameplay kit implementation: runtime binding ownership, ECS definition identity, SequenceNode install-only idempotency, and event-bus disposed parity.
- Runtime failure-boundary remains tranche 1 because namespace safety, failed installs, direct/composer dependency parity, scheduler failed-tick semantics, and metadata truth affect all DSK promotion.
- Composition-proof ownership and runtime identity/lifecycle ownership should remain later validation tranches. They make large graphs and proof diagnostics trustworthy, but do not supersede base install/runtime hardening.
- Public module-source strategy remains an ecosystem/proof decision. Fixing public imports or npm metadata would not prove namespace safety, rollback, dependency parity, binding ownership, ECS definition identity, SequenceNode idempotency, or event-bus lifecycle policy.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registries, systems, sequence runtimes, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Duplicate provider tokens and duplicate binding names can make large graphs appear satisfied while ownership is ambiguous or last-writer-wins.
- Same-named ECS definitions across kits share runtime state and queues by implementation, not by explicit ownership.
- SequenceNode type overwrite and install-only kit repeats can change orchestration semantics or replay side effects across deployments.
- Event-bus snapshots and disposed listener APIs can let proof tooling mutate or misread its own diagnostics.
- Local/fetched/public DSK proof can regress independently of core smoke tests when module-source policy is implicit.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation would reject.
- Confirmed: runtime binding names silently overwrite across composer and direct install.
- Confirmed: same-named ECS component/resource/event definitions alias one store or queue.
- Confirmed: SequenceNode type registration silently overwrites an existing type.
- Confirmed: SequenceNode event-bus snapshots expose mutable event history.
- Confirmed: raw install-only SequenceNode kits replay side effects on repeated deployment.
- Confirmed: disposed SequenceNode event bus still accepts `onAny()` listeners.
- Carried: failed-tick replay, AR support/session source mismatch, proof-signal integrity, lifecycle parity, query/command semantics, experience-edge, read-model/orchestration, compatibility/content-safety, AR/spatial read-model, traversal, source-state, state-signal, receipt, bridge, operations, and spatial rows remain fixture inventory.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, `prototype`, inherited keys, and own-property service lookup.
- Null-prototype or reserved-key namespace policy for `engine.n`.
- Failed install rollback/retryability for API collision, `createApi` throw, install hook throw, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, and SequenceNode runtime throw.
- Direct install versus composer dependency policy for `n:*`, `runtime:*`, kit ids, and custom capability tokens.
- Duplicate provider-token diagnostics and owner lookup.
- Duplicate binding-name diagnostics, override metadata, and owner lookup.
- Duplicate ECS component/resource/event definition policy across direct and composed installs.
- SequenceNode duplicate type registration and explicit override policy.
- SequenceNode event-bus history clone/freeze behavior.
- Raw install-only SequenceNode kit installed-state/idempotency and failure handling.
- Disposed event-bus lifecycle parity for `subscribe`, `once`, `onAny`, dispatch, clear, snapshot, and repeated dispose.
- Reset/snapshot absence, failure, restore, non-serializable state behavior, and async metadata truth.
- Proof-readiness checks that keep local/fetched/browser/npm/package-version/module-source proof separate from runtime and composition hardening.

## Promotion risks
- Do not promote broad DSK graphs until runtime failure-boundary fixtures exist for namespace safety, install transaction semantics, dependency parity, scheduler failure lifetime, and metadata truth.
- Do not treat capability tokens or binding names as unambiguous service proof until ownership diagnostics exist.
- Do not scale domain kits with common ECS names until collisions are rejected, namespaced, or explicitly shared.
- Do not trust repeated SequenceNode-backed proof deployment until install-only kit idempotency is covered.
- Do not trust SequenceNode-backed diagnostics until duplicate type policy, history isolation, and disposed listener parity are covered.
- Do not treat `npm test`, HTTP 200 public routes, aggregate Experiments checks, fetched raw files, public CDN reachability, or npm metadata as production DSK safety.
- Do not move proof routing, package-resolution shims, browser routes, or reusable implementation into NexusEngine core to solve distribution proof.

## Suggested next review item
- Use a non-scout lane to write the smallest executable tranche 1 fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, scheduler failed-tick semantics, and reset/snapshot/async metadata truth.
- After tranche 1 starts, add ownership/lifecycle fixtures for duplicate providers, duplicate bindings, ECS definition identity, SequenceNode duplicate type policy, event-history isolation, install-only idempotency, disposed `onAny()` parity, and AR launch support/session consistency.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Playwright/Human View validation was not run for this DSK architecture scout because this pass had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry public browser proof status.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, read-model/orchestration readiness, runtime identity/lifecycle readiness, composition-proof ownership readiness, AR/spatial readiness, proof-signal integrity, proof-readiness taxonomy, or broad domain graph promotion.
