# DSK Architecture State Packet: 2026-06-20T06-23-50-0400

## Timestamp
- local: 2026-06-20T06-23-50-0400
- UTC preflight: 2026-06-20T10:22:42.290Z
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-query-read-model-context-root-2026-06-20-0524`.
- Latest DSK packet kept runtime failure-boundary as tranche 1, query read-model isolation as later inventory, and module-source proof as a separate ecosystem/proof blocker.
- Latest ecosystem state node `2026-06-20T06-09-43-0400` says core and ProtoKits remain latest-ref aligned, but module-source strategy still blocks ProtoKits validation, Experiments targeted proof, and public browser proof.
- Latest ecosystem proof node `2026-06-20T05-39-53-0400` keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof claims separate.
- Latest deep bug node `2026-06-20T05-53-01-0400` adds scheduler/world mutation isolation: active-run system add, same-run phase add, `runSystem()` removed-entity iteration, and `world.readEvents()` payload aliasing.
- Latest domain idea node `2026-06-20T06-01-42-0400` maps that evidence into Scheduler World Mutation Isolation planning inventory, below query read-model and public module-source proof rows.
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
- latest DSK packets/nodes: `2026-06-20T05-24-33-0400`, `2026-06-20T04-22-52-0400`, `2026-06-20T03-23-42-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/ecs.js`, `src/engine.js`, `src/index.js`
- `tests/domain-service-kit-smoke.mjs`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch` -> `## 0.0.2...origin/0.0.2` plus pre-existing modified docs/automation trackers and untracked prior automation artifacts.
- `git rev-parse HEAD origin/0.0.2` -> both refs `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- `git diff --stat origin/0.0.2 -- src tests docs README.md package.json memory.md` -> inspected source/test/runtime files had no diff; tracked diffs were prior docs idea additions.
- `npm test` -> passed 8 smoke tests.
- Focused `node --input-type=module` DSK/runtime/scheduler/world probe -> reconfirmed base DSK blockers and reproduced scheduler/world mutation isolation rows.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable kit primitive for components, resources, events, systems, registries, sequences, SequenceNode fields, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares async-ready, serializable state, snapshot, and reset expectations while current execution remains scheduler-linear (`src/domain-service-kit.js:131-139`; `README.md:136-140`).
- `engine.n` is still initialized as a normal object and assigned late through the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, kit bindings, and kit identity before `initWorld`, registry, scheduler, SequenceNode, and install hooks can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still checks only missing `n:` requirements, while `createGameKitComposer()` resolves every required token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- `createEngine().tick()` still delegates to `scheduler.run()` and publishes lifecycle records from the live scheduler pass (`src/engine.js:168-214`).
- Public exports still include DSK, RuntimeKit, composer, ECS scheduler/world primitives, SequenceNode, AR/session/launch APIs, domain primitives, and existing public kit/query surfaces (`src/index.js:1-290`).

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK validation, metadata shape, token creation, extension duplicate checks, missing `n:` rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw (`tests/domain-service-kit-smoke.mjs:64-135`; `tests/public-api-freeze.mjs:16-24`; `tests/run-all.mjs:3-11`).
- Not covered: reserved API names, own-property namespace policy, failed-install rollback, direct non-`n:` dependency parity, duplicate provider/binding diagnostics, ECS definition-name collision policy, SequenceNode duplicate type policy, install-only kit idempotency, event-history isolation, disposed listener parity, scheduler failed-tick lifetime, active-run scheduler mutation policy, scheduler phase topology mutation, `runSystem()` removed-entity membership, `readEvents()` payload isolation, reset/snapshot failure, async metadata truth, content-boundary/objective rows, and query read-model isolation.
- Focused probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed clean API collision: first collision threw, second same-object reinstall returned `n-late-collision-probe-kit`, API owner stayed `base`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit after `initWorld` mutation.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-probe-kit`, while composer rejected the same graph as unresolved.
  - binding ownership: composer and engine both kept duplicate binding `service` from second kit `binding-b`.
  - scheduler active-run mutation: adding a system to active `simulate` and adding a `late` phase during `scheduler.run()` produced execution order `["first","added-active","late"]`.
  - `runSystem()` membership: an entity removed by an earlier handler still reached the same `runSystem()` pass with missing component values.
  - `readEvents()` isolation: mutating a returned event payload changed the original emitted object and the second queue read to `99`.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments ownership stayed stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation surfaces; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:53-68`, `docs/how-to-protokit.md:99-105`).
- Scheduler World Mutation Isolation is not a new gameplay kit request. It is core validation-surface inventory for ECS scheduler/world primitives (`docs/domain_ideas.md:1195-1224`; `docs/kits_ideas.md:1142-1179`; `docs/described_examples.md:1062-1086`).
- The new scheduler/world rows expand tranche 1 runtime failure-boundary because they affect tick determinism, install/runtime mutation boundaries, lifecycle proof, and event evidence before higher-level DSK service APIs are evaluated.
- Query read-model isolation remains a later proof-trust tranche. It should not mask lower-level scheduler/world mutation risk.
- Public module-source strategy remains an ecosystem/proof decision. Fixing package/import paths would not prove namespace safety, rollback, dependency parity, scheduler topology stability, `runSystem()` membership, or event queue payload isolation.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registries, systems, sequence runtimes, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Duplicate provider tokens and binding names can make large graphs appear satisfied while ownership is ambiguous or last-writer-wins.
- Runtime kits or DSK adapters that attach systems during active ticks can change same-pass scheduler order.
- Dynamic phase creation during a pass can alter lifecycle and frame proof rows in the same tick.
- Cleanup/despawn-heavy systems can process removed entities with undefined component values.
- Low-level event queue reads can corrupt queued evidence before scheduler consumers, SequenceNode bridges, or diagnostics inspect it.
- Local/fetched/public DSK proof can regress independently of core smoke tests when module-source policy is implicit.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation would reject.
- Confirmed: runtime binding names silently overwrite across composer and direct install.
- Confirmed: systems added to the active scheduler phase during `scheduler.run()` execute in that same pass (`src/ecs.js:331-356`).
- Confirmed: phases added during `scheduler.run()` can execute in that same run (`src/ecs.js:315-325`; `src/ecs.js:349-361`).
- Confirmed: `world.runSystem()` snapshots entity ids then live-reads component stores, so removed entities can reach handlers with undefined component values (`src/ecs.js:272-294`).
- Confirmed: `world.readEvents()` shallow-copies the queue array but exposes live payload objects (`src/ecs.js:251-260`).
- Carried: query read-model, content-boundary/objective, runtime identity/lifecycle, composition-proof ownership, proof-signal, AR/spatial, traversal, source-state, state-signal, receipt, bridge, operations, and spatial rows remain fixture inventory.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, `prototype`, inherited keys, and own-property service lookup.
- Null-prototype or reserved-key namespace policy for `engine.n`.
- Failed install rollback/retryability for API collision, `createApi` throw, install hook throw, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, and SequenceNode runtime throw.
- Direct install versus composer dependency policy for `n:*`, `runtime:*`, kit ids, and custom capability tokens.
- Duplicate provider-token diagnostics and duplicate binding-name diagnostics with owner lookup and explicit override policy.
- Scheduler active-run mutation fixtures for same-phase add, self-add, duplicate add, deferred mutation policy, and install-during-tick behavior.
- Scheduler phase topology fixtures for add during run, lifecycle ordering, duplicate phases, and next-pass-only policy.
- `runSystem()` membership fixtures for entity removal, component removal, stable component snapshots, and live membership rechecks.
- Event queue isolation fixtures for `emit`, `readEvents`, scheduler consumers, journal payloads, surface publication, and SequenceNode bridges.
- Reset/snapshot absence, failure, restore, non-serializable state behavior, and async metadata truth.
- Proof-readiness checks that keep local/fetched/browser/npm/package-version/module-source proof separate from runtime, composition, identity, content-boundary, query-read-model, and scheduler/world hardening.

## Promotion risks
- Do not promote broad DSK graphs until runtime failure-boundary fixtures exist for namespace safety, install transaction semantics, dependency parity, scheduler failure lifetime, scheduler/world mutation isolation, event queue isolation, and metadata truth.
- Do not treat scheduler phase/system topology as deterministic while active-run mutations can execute immediately.
- Do not attach runtime kits, DSK adapters, or proof systems during active ticks without an explicit defer/reject/immediate contract.
- Do not use low-level `readEvents()` output as proof evidence until returned payloads are isolated or explicitly documented as mutable handles.
- Do not treat `npm test`, HTTP 200 public routes, aggregate Experiments checks, fetched raw files, public CDN reachability, npm metadata, query helper availability, or module-source alignment as production DSK safety.
- Do not move proof routing, package-resolution shims, browser routes, or reusable gameplay implementation into NexusEngine core to solve scheduler/world or distribution proof issues.

## Suggested next review item
- Use a non-scout lane to write the smallest executable tranche 1 fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, scheduler failed-tick semantics, active-run scheduler mutation, phase topology mutation, `runSystem()` membership, `readEvents()` payload isolation, and reset/snapshot/async metadata truth.
- After tranche 1 starts, add query read-model isolation fixtures for exported `query*` helpers, engine read methods, nested metadata/hazard clone/freeze behavior, and stored `lastQuery`/`lastCollision` proof snapshots.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Playwright/Human View validation was not run for this DSK architecture scout because this pass had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current public browser proof status.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, read-model/orchestration readiness, runtime identity/lifecycle readiness, composition-proof ownership readiness, content-boundary/objective readiness, query-read-model readiness, scheduler/world readiness, AR/spatial readiness, proof-signal integrity, proof-readiness taxonomy, or broad domain graph promotion.
