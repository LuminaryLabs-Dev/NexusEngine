# DSK Architecture State Packet

## Timestamp
- 2026-06-19T11-23-07-0400

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-state-signal-fixture-root-2026-06-19-1023`.
- Latest DSK packet `2026-06-19T10-23-10-0400` kept core release-aligned and test-green, but added state-signal contracts to DSK promotion fixtures: descriptor invalidation, action repeat policy, transition receipts, coordinate-axis policy, and derived-state boundaries.
- Latest ecosystem state node `2026-06-19T11-08-56-0400` says core and ProtoKits remain latest-ref aligned and validation-green, while Experiments fetched `origin/0.0.2` advanced again and is now 24 commits ahead of the clean local checkout.
- Latest ecosystem proof node `2026-06-19T10-45-02-0400` keeps core/ProtoKits proof green while Experiments latest-ref proof, public browser proof, aggregate proof, npm availability, and runtime hardening remain separate.
- Latest deep bug node `2026-06-19T09-54-20-0400` keeps placement invalidation, held interaction repeats, puzzle/combat transition gaps, ScenarioDriver axis loss, and CameraOcclusion source mutation open.
- Latest domain idea node `2026-06-19T10-02-21-0400` maps those bugs into state signal contract planning rows.
- State packets were context only. Live source, docs, tests, preflight, git refs, and focused probes were authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Current branch: `0.0.2`.
- Compare target: `0.0.2`.
- Branch status: `current-is-latest-release-branch`.
- `HEAD`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- Ahead/behind against `origin/0.0.2`: `0 0`.
- Required GitHub/raw/jsDelivr public links passed; optional npm metadata remained 404.
- Package metadata remains `nexusengine@0.1.0`.

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
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/README.md`
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- Latest DSK packets/nodes: `2026-06-19T08-23-23-0400`, `2026-06-19T09-25-20-0400`, `2026-06-19T10-23-10-0400`
- Neighboring packets/nodes: ecosystem state `2026-06-19T10-10-19-0400` and `2026-06-19T11-08-56-0400`, ecosystem proof `2026-06-19T09-44-04-0400` and `2026-06-19T10-45-02-0400`, deep bug `2026-06-19T08-56-02-0400` and `2026-06-19T09-54-20-0400`, domain idea `2026-06-19T09-00-53-0400` and `2026-06-19T10-02-21-0400`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/forest-placement-kit.js`
- `src/interaction-kit.js`
- `src/shrine-puzzle-kit.js`
- `src/light-combat-kit.js`
- `src/scenario-driver-kit.js`
- `src/camera-occlusion-kit.js`
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
- Focused `node --input-type=module` DSK/signal probe
  - Result: reconfirmed reserved `apiName:"__proto__"` is not an own namespace key, failed API collision leaves partial DSK state, direct install allows missing `runtime:needed`, ForestPlacement same-length route changes stay stale, Interaction held gather repeats, LightCombat can start at zero health without defeated state, ScenarioDriver ignores `{ x, z }`, and CameraOcclusion mutates source `lookAt.y`.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for components, resources, events, systems, bindings, registries, sequences, sequence nodes, metadata, and install hooks.
- `defineDomainServiceKit()` still wraps runtime kits with required domain/stability/version metadata, default `n-<domain>-kit` ids, `n:` capability tokens, optional service tokens, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:165-195`).
- DSK metadata still describes linear execution with async-ready, serializable-state, reset, and snapshot expectations (`src/domain-service-kit.js:131-139`), but these are not enforced runtime boundaries.
- `engine.n` is still created as a plain object and late API assignment happens inside the install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata and pushes kits before late install hooks complete (`src/runtime-kit.js:135-157`, `src/runtime-kit.js:214-216`).
- Direct DSK install still enforces only missing `n:` requirements (`src/runtime-kit.js:142-145`), while `createGameKitComposer()` checks all `requires` tokens during composition (`src/game-kit-composer.js:49-76`).
- Public exports and DSK smoke coverage remain present (`src/index.js:28-41`, `tests/domain-service-kit-smoke.mjs:64-134`, `tests/public-api-freeze.mjs:19-24`).

## Invariant coverage
- Covered today: DSK export presence, basic creation/validation, metadata shape, token generation, DSK extension duplicate checks, direct missing `n:` requirement failure, basic API install, serializable snapshot happy path, idempotent same-object reinstall, same-id duplicate rejection, and normal API collision throw.
- Still not covered: reserved API names, own-property namespace guarantees, failed-install rollback, direct non-`n:` dependency policy, duplicate provider-token diagnostics, reset/snapshot absence/failure/non-serializable behavior, async metadata boundaries, source-state isolation, receipt identity, event idempotency, bridge phase, wrapper state, operations finite data, spatial/mobility bounds, and state-signal contracts.
- Focused probe evidence:
  - DSK base: `protoOwn:false`, `protoMarker:"__proto__-api"`, failed collision retained `n-late-collision-kit` in both `engine.kits` and `engine.domainServiceKits`, and missing `runtime:needed` installed.
  - State signal: ForestPlacement route stayed at z `0` and version stayed `1` after same-length route changed to z `80`; Interaction relic seeds advanced `[1,2]` over two held ticks; LightCombat state stayed `{ enemyHealth:0, enemyDefeated:false }`; ScenarioDriver returned zero vector for `{ x, z }`; CameraOcclusion raised source `lookAt.y` from `0` to `1.9349` then `3.3233`.

## Domain and kit expansion architecture notes
- Repo memory and docs keep the ownership split stable: core owns ECS/runtime/DSK/composer primitives and validation invariants; ProtoKits owns new reusable implementation; Experiments owns browser/playable proof.
- `docs/how-to-protokit.md` says new reusable kits belong in NexusEngine-ProtoKits, while core receives DSK contract, validation, scheduler, ECS, or runtime primitive changes.
- `docs/domain_ideas.md` and `docs/kits_ideas.md` now include Source State Integrity and State Signal Contract inventory, but these are planning rows, not release claims.
- Current architecture read: the next useful DSK step is not more broad scouting or core promotion. It is an executable hardening fixture plan that crosses the core DSK install boundary plus selected source-state and signal-contract examples.
- Neighboring ecosystem state adds a proof-boundary warning: Experiments latest release ref drifted again to 24 commits ahead of the clean local checkout, so DSK hardening proof must stay separate from Experiments latest-ref proof and public browser proof.

## Scaling risks
- Broad DSK promotion increases `engine.n` collision, inherited-key, reserved-key, and ownership risks while `engine.n` remains a normal object.
- Partial installs can leave metadata, kit lists, bindings, world state, scheduler state, sequence runtimes, or namespace APIs inconsistent after a late throw.
- Direct-install and composer dependency behavior can diverge for the same kit graph.
- Metadata-only reset/snapshot/async expectations are too weak for replay, restore, worker, network, or long-lived engine claims.
- Dataset-heavy services can mutate caller-owned nested config and reset from already-mutated source.
- Signal-heavy services can preserve public API shape while losing meaningful rebuilds, repeating one-shot actions, hiding terminal starts, dropping common coordinate axes, or mutating source view state.
- Public/browser proof and Experiments latest-ref validation can drift independently from core runtime hardening.

## Bug candidates
- Confirmed: reserved namespace API key. `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed API collision install is non-atomic. A late collision throws but leaves failed DSK metadata and kit identity installed.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements while composer rejects unresolved `requires`.
- Confirmed: ForestPlacement invalidation is count/signature-light and misses same-length route coordinate changes.
- Confirmed: InteractionKit held booleans repeat gather/activate style actions.
- Confirmed: ShrinePuzzle/LightCombat style state machines still need transition-only and initial-terminal receipt policy.
- Confirmed: ScenarioDriver is 2D `{ x, y }` only while route/world callers can use `{ x, z }`.
- Confirmed: CameraOcclusion mutates source camera look target instead of publishing a reset-safe derived output.
- Candidate: DSK hardening has enough repeated evidence to hand off to a non-scout fixture-writing lane.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, and `prototype`.
- Own-property assertions for every installed `engine.n` API.
- Failed install rollback after API collision, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, sequence node runtime throw, and install hook throw.
- Direct install parity or documented divergence for non-`n:` `requires` tokens.
- Duplicate provider-token diagnostics across different DSK ids.
- End-to-end `extendDomainServiceKit()` install behavior.
- Reset/snapshot absence, failure, non-serializable state, restore, and reset policy coverage.
- Async metadata tests that explicitly prove async is metadata-only today.
- Authored-source isolation, reset-source, retention-limit, and initial-terminal receipt fixtures.
- Descriptor invalidation, action repeat policy, transition-only receipts, coordinate-axis normalization, and source-versus-derived state boundary fixtures.
- Aggregate proof wiring that keeps runtime hardening, targeted proof, public browser proof, latest-ref Experiments proof, npm availability, and package-version policy separate.

## Promotion risks
- Do not promote broad ProtoKit or domain idea graphs into core until namespace safety, install atomicity, dependency policy, state contract enforcement, service-call policy, receipt integrity, bridge phase, wrapper-state contracts, source-state integrity, and state-signal contracts are designed and tested.
- Do not claim async DSK execution, worker readiness, network partitioning, replay/restore support, or production DSK safety from metadata and smoke tests alone.
- Do not treat public route HTTP 200, GitHub/raw/jsDelivr availability, or local targeted proof as runtime hardening proof.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not claim Experiments latest-ref proof; neighboring state says fetched `origin/0.0.2` is ahead of the clean local checkout.
- Do not treat idea docs as canonical public architecture or promotion approval.
- Do not run write-producing Experiments aggregate validation from this scout lane without a disposable worktree policy.

## Suggested next review item
- Use a non-scout lane to write the smallest executable DSK promotion hardening fixture set:
  - `engine.n` namespace policy
  - install preflight/rollback transaction boundaries
  - direct-install dependency parity versus composer-only policy
  - reset/snapshot/serialization enforcement or explicit metadata-only policy
  - authored-source/reset-source/retention/initial-terminal rows
  - descriptor invalidation/action repeat/transition/coordinate/derived-state rows
  - receipt/bridge/wrapper/operations/spatial rows carried from earlier packets

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, or deployments were edited.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, Experiments latest-ref validation, async execution, worker/network readiness, replay/restore support, or broad domain graph promotion.
