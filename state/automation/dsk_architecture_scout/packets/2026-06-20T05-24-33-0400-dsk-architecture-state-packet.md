# DSK Architecture State Packet: 2026-06-20T05-24-33-0400

## Timestamp
- local: 2026-06-20T05-24-33-0400
- UTC preflight: 2026-06-20T09:22:01.034Z
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-content-boundary-objective-context-root-2026-06-20-0422`.
- Latest DSK packet kept runtime failure-boundary as tranche 1, while Fishing/ReefRescue content boundary, preset identity, objective threshold, and content validation rows joined later hardening inventory.
- Latest ecosystem state node `2026-06-20T05-11-41-0400` says core and ProtoKits now match latest release refs, but proof remains blocked by module-source strategy across ProtoKits, Experiments targeted proof, public browser proof, npm, package-version, and aggregate-vs-targeted proof.
- Latest ecosystem proof node `2026-06-20T04-42-18-0400` keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof claims separate.
- Latest deep bug node `2026-06-20T04-54-16-0400` adds public query helper and engine read-method isolation findings across RequestFulfillment, CargoManifest, LandmarkGuidance, EnvironmentalAffordance, HazardField, and WaterSurface.
- Latest domain idea node `2026-06-20T05-02-13-0400` maps those findings into Query Read Model Isolation planning inventory, not a module-source or runtime failure-boundary replacement.
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
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/README.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/dsk_architecture_scout/PROMPT.md`, `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- latest DSK packets/nodes: `2026-06-20T04-22-52-0400`, `2026-06-20T03-23-42-0400`, `2026-06-20T02-23-35-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/index.js`
- `src/request-fulfillment-kit.js`, `src/cargo-manifest-kit.js`, `src/landmark-guidance-kit.js`, `src/environmental-affordance-kit.js`, `src/hazard-field-kit.js`, `src/water-surface-kit.js`
- `tests/domain-service-kit-smoke.mjs`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch` -> `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked docs and automation artifacts.
- `git rev-parse HEAD origin/0.0.2` -> both refs `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- `git diff --stat origin/0.0.2 -- <inspected source/test/doc files>` -> no inspected source/test/runtime diff; tracked diffs were prior docs idea additions.
- `npm test` -> passed 8 smoke tests.
- Focused `node --input-type=module` DSK/runtime probe -> reconfirmed base DSK blockers and duplicate binding overwrite.
- Focused `node --input-type=module` query read-model probe -> confirmed returned request, cargo, landmark, affordance, hazard, and water read objects can mutate live runtime state, stored query/collision proof fields, or helper input state.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable kit primitive for components, resources, events, systems, registries, sequences, SequenceNode fields, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares async-ready, serializable state, snapshot, and reset expectations while current execution remains scheduler-linear (`src/domain-service-kit.js:131-139`; `README.md:136-140`).
- `engine.n` is still initialized as a normal object and assigned late through the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, kit bindings, and kit identity before `initWorld`, registry, scheduler, SequenceNode, and install hooks can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still checks only missing `n:` requirements, while `createGameKitComposer()` resolves every required token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- Public exports still include DSK, RuntimeKit, composer, SequenceNode, AR/session/launch APIs, domain primitives, and the public query helper families inspected this run (`src/index.js:28-260`).

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK validation, metadata shape, token creation, extension duplicate checks, missing `n:` rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw (`tests/domain-service-kit-smoke.mjs:64-135`; `tests/public-api-freeze.mjs:16-24`; `tests/run-all.mjs:3-11`).
- Not covered: reserved API names, own-property namespace policy, failed-install rollback, direct non-`n:` dependency parity, duplicate provider/binding diagnostics, ECS definition-name collision policy, SequenceNode duplicate type policy, install-only kit idempotency, event-history isolation, disposed listener parity, scheduler failed-tick lifetime, reset/snapshot failure, async metadata truth, content-boundary/objective rows, and query read-model isolation.
- Focused probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed clean API collision: first collision threw, second same-object reinstall returned `n-late-collision-probe-kit`, API owner stayed `existing`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit after `initWorld` mutation.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-probe-kit` and exposed `engine.n.needsRuntimeProbe.ready:true`, while composer rejected the same graph as unresolved.
  - binding ownership: composer and engine both kept duplicate binding `service` from second kit `binding-b`.
  - query read models: request, cargo, landmark, affordance, hazard, and water probes all allowed returned nested metadata or hazard objects to mutate live state or stored query/collision fields; final observed values were `10`, `20`, `30`, `40`, `50`, and `60` respectively.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments ownership stayed stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation surfaces; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:53-68`, `docs/how-to-protokit.md:99-105`).
- Query Read Model Isolation is DSK-adjacent because promoted service APIs and proof harnesses depend on read-only query output being safe evidence.
- The new query family refines prior query/command and read-model/orchestration inventory: it targets exported `query*` helpers, engine read methods, nested metadata/hazard isolation, and stored `lastQuery`/`lastCollision` proof snapshots (`docs/domain_ideas.md:1164-1192`; `docs/kits_ideas.md:776-786`).
- Runtime failure-boundary remains tranche 1 because namespace safety, failed installs, direct/composer dependency parity, scheduler failed-tick semantics, and metadata truth affect all DSK promotion.
- Query read-model isolation should be a later validation tranche after base runtime failure-boundary and existing lifecycle/query-command/read-model rows begin. It matters for proof trust, but it does not supersede install/runtime hardening.
- Public module-source strategy remains an ecosystem/proof decision. Fixing package/import paths would not prove namespace safety, rollback, dependency parity, or query read-model immutability.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registries, systems, sequence runtimes, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Duplicate provider tokens and binding names can make large graphs appear satisfied while ownership is ambiguous or last-writer-wins.
- Query/read APIs can corrupt runtime state or proof snapshots while appearing read-only, especially for metadata-heavy authored datasets.
- `lastQuery` and `lastCollision` fields can become aliases to caller-mutated records rather than durable evidence snapshots.
- Local/fetched/public DSK proof can regress independently of core smoke tests when module-source policy is implicit.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation would reject.
- Confirmed: runtime binding names silently overwrite across composer and direct install.
- Confirmed: `RequestFulfillment.nearestOpen()` and `queryNearestOpenRequest()` expose nested request metadata mutation paths (`src/request-fulfillment-kit.js:74-80`, `src/request-fulfillment-kit.js:110-111`, `src/request-fulfillment-kit.js:144-146`).
- Confirmed: `CargoManifest.availableItems()`, `nearestAvailable()`, and `queryNearestCargo()` expose live or shallow-cloned item metadata (`src/cargo-manifest-kit.js:77-85`, `src/cargo-manifest-kit.js:103-109`, `src/cargo-manifest-kit.js:179-181`).
- Confirmed: `LandmarkGuidance.nearest()` stores and returns live query records, and `queryNearestLandmark()` shallow-copies nested metadata (`src/landmark-guidance-kit.js:47-52`, `src/landmark-guidance-kit.js:79-83`, `src/landmark-guidance-kit.js:137-139`).
- Confirmed: `EnvironmentalAffordance.nearby()` and `queryNearbyAffordances()` expose shallow affordance metadata through query results (`src/environmental-affordance-kit.js:42-49`, `src/environmental-affordance-kit.js:74-80`, `src/environmental-affordance-kit.js:112-113`).
- Confirmed: `HazardField.checkCircle()` and `queryHazardCircle()` expose live or shallow hazard records and stored `lastCollision` aliases (`src/hazard-field-kit.js:148-156`, `src/hazard-field-kit.js:180-188`, `src/hazard-field-kit.js:203-204`).
- Confirmed: `WaterSurface.query()` and `queryWaterSurface()` expose live nested hazard objects and stored `lastQuery` aliases (`src/water-surface-kit.js:41-64`, `src/water-surface-kit.js:91-95`, `src/water-surface-kit.js:110-111`).
- Carried: content-boundary/objective, runtime identity/lifecycle, composition-proof ownership, proof-signal, AR/spatial, traversal, source-state, state-signal, receipt, bridge, operations, and spatial rows remain fixture inventory.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, `prototype`, inherited keys, and own-property service lookup.
- Null-prototype or reserved-key namespace policy for `engine.n`.
- Failed install rollback/retryability for API collision, `createApi` throw, install hook throw, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, and SequenceNode runtime throw.
- Direct install versus composer dependency policy for `n:*`, `runtime:*`, kit ids, and custom capability tokens.
- Duplicate provider-token diagnostics and duplicate binding-name diagnostics with owner lookup and explicit override policy.
- Public query helper isolation fixtures for request, cargo, landmark, affordance, hazard, water, and future exported `query*` helpers.
- Engine read-method isolation fixtures for nearest, available, nearby, collision, water query, and stored `lastQuery`/`lastCollision` behavior.
- Nested metadata/hazard clone/freeze fixtures for helper output, engine output, event payloads, and proof snapshot fields.
- Reset/snapshot absence, failure, restore, non-serializable state behavior, and async metadata truth.
- Proof-readiness checks that keep local/fetched/browser/npm/package-version/module-source proof separate from runtime, composition, identity, content-boundary, and query-read-model hardening.

## Promotion risks
- Do not promote broad DSK graphs until runtime failure-boundary fixtures exist for namespace safety, install transaction semantics, dependency parity, scheduler failure lifetime, and metadata truth.
- Do not treat query outputs or stored query fields as proof-safe until returned records and nested metadata/hazards are isolated.
- Do not merge query read-model isolation with public module-source proof; one is runtime evidence integrity, the other is distribution/import strategy.
- Do not treat `npm test`, HTTP 200 public routes, aggregate Experiments checks, fetched raw files, public CDN reachability, npm metadata, or query helper availability as production DSK safety.
- Do not move proof routing, package-resolution shims, browser routes, or reusable gameplay implementation into NexusEngine core to solve query read-model or distribution proof.

## Suggested next review item
- Use a non-scout lane to write the smallest executable tranche 1 fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, scheduler failed-tick semantics, and reset/snapshot/async metadata truth.
- After tranche 1 starts, add query read-model isolation fixtures for exported `query*` helpers, engine read methods, nested metadata/hazard clone/freeze behavior, and stored `lastQuery`/`lastCollision` proof snapshots.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Playwright/Human View validation was not run for this DSK architecture scout because this pass had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current public browser proof status.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, read-model/orchestration readiness, runtime identity/lifecycle readiness, composition-proof ownership readiness, content-boundary/objective readiness, query-read-model readiness, AR/spatial readiness, proof-signal integrity, proof-readiness taxonomy, or broad domain graph promotion.
