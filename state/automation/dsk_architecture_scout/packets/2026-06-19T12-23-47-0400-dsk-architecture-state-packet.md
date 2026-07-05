# DSK Architecture State Packet

## Timestamp
- 2026-06-19T12-23-47-0400

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-fixture-boundary-root-2026-06-19-1123`.
- Latest DSK packet `2026-06-19T11-23-07-0400` said core remains release-aligned and test-green, but repeated evidence now favors executable hardening fixtures over more scout-only confirmation.
- Latest ecosystem state node `2026-06-19T12-08-54-0400` says core remains latest-ref aligned and validation-green, while ProtoKits and Experiments fetched `origin/0.0.2` refs are ahead of local checkouts; public proof, aggregate proof, npm metadata, package-version policy, and DSK hardening remain separate proof categories.
- Latest ecosystem proof node `2026-06-19T11-40-11-0400` confirms local available-checkout DSK proof is green, but sibling latest-ref proof and browser-complete public proof remain open.
- Latest deep bug node `2026-06-19T11-55-07-0400` adds lifecycle/config blockers: CompanionCommand one-shot lockout, CorruptionWorld frame-rate-dependent progress, SpatialRoom descriptor normalization/source leaks, and TreeRunner invalid generation bounds.
- Latest domain idea node `2026-06-19T12-01-34-0400` maps those bugs into service lifecycle/config proof rows.
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
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/README.md`
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- Latest DSK packets/nodes: `2026-06-19T09-25-20-0400`, `2026-06-19T10-23-10-0400`, `2026-06-19T11-23-07-0400`
- Neighboring packets/nodes: ecosystem state `2026-06-19T11-08-56-0400` and `2026-06-19T12-08-54-0400`, ecosystem proof `2026-06-19T10-45-02-0400` and `2026-06-19T11-40-11-0400`, deep bug `2026-06-19T09-54-20-0400` and `2026-06-19T11-55-07-0400`, domain idea `2026-06-19T10-02-21-0400` and `2026-06-19T12-01-34-0400`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/companion-command-kit.js`
- `src/corruption-world-kit.js`
- `src/spatial-room-kit.js`
- `src/tree-runner-kit.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning docs.
- `git rev-parse HEAD && git rev-parse origin/0.0.2 && git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md docs/how-to-protokit.md state/automation/dsk_architecture_scout`
  - Result before this packet: no source/test/runtime diff; pre-existing tracked diffs in expansion docs and this lane tracker.
- `npm test`
  - Result: pass, 8 smoke tests.
- First focused `node --input-type=module` probe attempt
  - Result: discarded; used nonexistent `engine.surfaces.events` accessor.
- Corrected focused `node --input-type=module` DSK/lifecycle/config probe
  - Result: reconfirmed reserved `apiName:"__proto__"` is not an own namespace key, failed API collision leaves partial DSK state, direct install allows missing `runtime:needed`, CompanionCommand ignores a second target after arrival, CorruptionWorld equal elapsed time disagrees at 60Hz versus 10Hz, SpatialRoom preserves non-normalized anchor strings and mutates caller config, and TreeRunner invalid generation bounds crash or produce non-finite positions.

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
- Still not covered: reserved API names, own-property namespace guarantees, failed-install rollback, direct non-`n:` dependency policy, duplicate provider-token diagnostics, reset/snapshot absence/failure/non-serializable behavior, async metadata boundaries, source-state isolation, receipt identity, event idempotency, bridge phase, wrapper state, operations finite data, spatial/mobility bounds, state-signal contracts, command lifecycle, elapsed-rate policy, descriptor normalization/source isolation, and finite generated geometry.
- Focused probe evidence:
  - DSK base: `reservedApi.own:false`, `reservedApi.marker:"__proto__-api"`, failed collision retained `n-late-collision-kit` in both `engine.kits` and `engine.domainServiceKits`, and missing `runtime:needed` installed.
  - Lifecycle/config: CompanionCommand emitted only `node-a` command/arrival and kept `{commanded:true, arrived:true, target:"node-a"}` after a second target; CorruptionWorld cleansed at 60Hz but not at 10Hz for one elapsed second; SpatialRoom anchor kept `x:"bad-x"`, `y:"2"`, `z:"3"` and leaked runtime tags into source config; TreeRunner `initialBranches:0` threw and `laneCount:0` produced non-finite branch/player x values.

## Domain and kit expansion architecture notes
- Repo memory and docs keep the ownership split stable: core owns ECS/runtime/DSK/composer primitives and validation invariants; ProtoKits owns new reusable implementations; Experiments owns browser/playable proof.
- `docs/how-to-protokit.md` says new reusable kits belong in NexusEngine-ProtoKits, while core receives DSK contract, validation, scheduler, ECS, or runtime primitive changes.
- `docs/domain_ideas.md` and `docs/kits_ideas.md` now include service lifecycle/config inventory, but those rows are planning inventory, not release claims.
- The DSK architecture implication is now narrower: add lifecycle/config rows to the non-scout hardening fixture plan, not more core kit promotion.
- Neighboring proof context still matters: sibling latest refs and public browser proof can drift independently from core runtime hardening, so promotion evidence must stay separated by category.

## Scaling risks
- Broad DSK promotion increases `engine.n` collision, inherited-key, reserved-key, and ownership risks while `engine.n` remains a normal object.
- Partial installs can leave metadata, kit lists, bindings, world state, scheduler state, sequence runtimes, or namespace APIs inconsistent after a late throw.
- Direct-install and composer dependency behavior can diverge for the same kit graph.
- Metadata-only reset/snapshot/async expectations are too weak for replay, restore, worker, network, or long-lived engine claims.
- Command-style services can become one-shot locked without accepted, duplicate, retargeted, arrived, reset, and rejected receipts.
- Progression services can be frame-rate dependent if rates are per-tick while proof language expects elapsed-time behavior.
- Descriptor services can preserve invalid source fields and mutate caller-owned nested config.
- Procedural/traversal generators can crash install or publish non-finite geometry if count/lane/spacing inputs are not bounded.

## Bug candidates
- Confirmed: reserved namespace API key. `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed API collision install is non-atomic. A late collision throws but leaves failed DSK metadata and kit identity installed.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements while composer rejects unresolved `requires`.
- Confirmed: CompanionCommandKit ignores a second command after first arrival because `commanded` and `arrived` never reset.
- Confirmed: CorruptionWorldKit progress depends on tick count rather than elapsed time.
- Confirmed: SpatialRoomKit anchor normalization can be overwritten by source spread, and runtime descriptor mutations leak into caller config.
- Confirmed: TreeRunnerKit does not bound `initialBranches` or `laneCount`, leading to init crashes or non-finite geometry.
- Candidate: the non-scout DSK fixture handoff should now include lifecycle/config rows with the prior namespace, install, dependency, source-state, state-signal, receipt, bridge, operations, and spatial rows.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, and `prototype`.
- Own-property assertions for every installed `engine.n` API.
- Failed install rollback after API collision, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, sequence node runtime throw, and install hook throw.
- Direct install parity or documented divergence for non-`n:` `requires` tokens.
- Duplicate provider-token diagnostics across different DSK ids.
- End-to-end `extendDomainServiceKit()` install behavior.
- Reset/snapshot absence, failure, non-serializable state, restore, and reset policy coverage.
- Async metadata tests that explicitly prove async is metadata-only today.
- Command lifecycle fixtures for accepted, duplicate, retargeted, arrived, reset, and rejected command semantics.
- Elapsed-rate fixtures proving per-second versus per-tick progression policy and terminal threshold settlement.
- Descriptor normalization/source isolation fixtures for canonical fields, clone/freeze policy, and reset-safe descriptor rows.
- Generated-geometry fixtures for reject/clamp policy and finite branch/player snapshots.
- Aggregate proof wiring that keeps runtime hardening, targeted proof, public browser proof, latest-ref sibling proof, npm availability, and package-version policy separate.

## Promotion risks
- Do not promote broad ProtoKit or domain idea graphs into core until namespace safety, install atomicity, dependency policy, state contract enforcement, service-call policy, receipt integrity, bridge phase, wrapper-state contracts, source-state integrity, state-signal contracts, and lifecycle/config policy are designed and tested.
- Do not claim async DSK execution, worker readiness, network partitioning, replay/restore support, or production DSK safety from metadata and smoke tests alone.
- Do not treat public route HTTP 200, GitHub/raw/jsDelivr availability, or local targeted proof as runtime hardening proof.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not claim sibling latest-ref proof; neighboring state says ProtoKits and Experiments fetched `origin/0.0.2` refs are ahead of local checkouts.
- Do not treat idea docs as canonical public architecture or promotion approval.

## Suggested next review item
- Use a non-scout lane to write the smallest executable DSK promotion hardening fixture set:
  - `engine.n` namespace policy
  - install preflight/rollback transaction boundaries
  - direct-install dependency parity versus composer-only policy
  - reset/snapshot/serialization enforcement or explicit metadata-only policy
  - authored-source/reset-source/retention/initial-terminal rows
  - descriptor invalidation/action repeat/transition/coordinate/derived-state rows
  - command lifecycle/elapsed-rate/descriptor normalization/generated-geometry rows
  - receipt/bridge/wrapper/operations/spatial rows carried from earlier packets

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, or deployments were edited.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling latest-ref validation, async execution, worker/network readiness, replay/restore support, or broad domain graph promotion.
