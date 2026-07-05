# DSK Architecture State Packet: 2026-06-19T18-24-11-0400

## Timestamp
- local: 2026-06-19T18-24-11-0400
- UTC preflight: 2026-06-19T22:23:01.338Z
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-query-command-queue-split-root-2026-06-19-1722`.
- Latest DSK packet/node kept runtime failure-boundary first, lifecycle parity second, query/command semantics third, experience-edge fourth, with public/fetched-ref/module-source proof separate.
- Latest ecosystem state packet/node `2026-06-19T18-09-41-0400` said core remains current and validation-green, while module-source strategy still blocks ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof; proof-readiness queueing is planning inventory, not a replacement for module-source decisions.
- Latest ecosystem proof packet/node `2026-06-19T17-39-50-0400` kept local available-checkout proof, latest-ref proof, aggregate proof, targeted DSK proof, browser-complete proof, npm availability, runtime hardening, lifecycle parity, query/command semantics, and experience-edge proof as separate claims.
- Latest deep bug packet/node `2026-06-19T16-54-05-0400` remains the current query/command semantics source evidence: terminal guidance receipts, repeated proximity query receipts, rejected command state corruption, and live query mutation.
- Latest domain idea packet/node `2026-06-19T18-01-47-0400` added proof-readiness queueing: hardening fixture queue, proof claim taxonomy, module-source gate, aggregate/targeted proof parity, and release evidence checklist.
- State packets were used for context only. Live source, docs, tests, git refs, and preflight were treated as authority for this run.

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
- worktree note: pre-existing modified/untracked automation and planning files were present before this lane wrote its current packet, node, and tracker update.

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
- latest DSK packet/node: `2026-06-19T17-22-41-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/engine.js`
- `src/ecs.js`
- `src/surfaces.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch` -> `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2` -> both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- Focused Node probe, first attempt -> failed because the ad hoc probe used nonexistent `eventSurface.getState()`; not used as behavior evidence.
- Focused Node probe, corrected with `eventSurface.snapshot()` -> reconfirmed reserved API, failed install, dependency parity, and scheduler failed-tick behavior.
- `npm test` -> passed 8 smoke tests.

## DSK contract state
- `defineDomainServiceKit()` still validates domain slugs, `n:` tokens, stable `n-<domain>-kit` ids, version/stability metadata, and execution metadata (`src/domain-service-kit.js:74-195`).
- DSK metadata still declares linear execution, async-ready metadata, serializable state, snapshot, and reset expectations, but runtime execution is still the current linear scheduler path (`src/domain-service-kit.js:123-140`; `README.md:138-140`).
- `engine.n` is still initialized as a normal object and API assignment happens in the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, bindings, and kit identity before `initWorld`, registry, scheduler, sequence, sequence-node, and install hooks can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still checks only missing `n:` requirements, while composer dependency resolution checks every required token (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- Public exports still include DSK and composer APIs (`src/index.js:28-41`; `src/index.js:51-54`).

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK creation/validation, metadata shape, token creation, extension duplicate checks, missing `n:` requirement rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw (`tests/domain-service-kit-smoke.mjs:64-135`; `tests/public-api-freeze.mjs:16-24`).
- Not covered by smoke tests: reserved API names, inherited namespace behavior, own-property service guarantees, failed-install rollback/retryability, direct non-`n:` dependency policy, duplicate provider-token diagnostics, install throw points before/after world mutation, reset/snapshot absence or failure, non-serializable state behavior, async metadata truth, scheduler failed-tick clock/event/journal/lifecycle semantics, lifecycle parity, query/command semantics, experience-edge rows, public proof boundaries, and proof-claim taxonomy.
- Corrected focused probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed install: first collision threw, second same-object reinstall returned `n-late-collision-kit`, API owner stayed `existing`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-kit` and exposed `engine.n.needsRuntime.ready:true`.
  - scheduler failure: first tick threw `boom once`; after the next successful tick both failed and recovery events appeared, with frame `2` and elapsed `0.5`.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments ownership stayed stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation surfaces; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:56-58`, `docs/how-to-protokit.md:265-285`).
- Planning docs still treat domain and kit ideas as expansion inventory, not implementation or release contract (`docs/domain_ideas.md:3-14`; `docs/kits_ideas.md:3-13`).
- Runtime failure-boundary inventory remains directly relevant to core because it targets namespace safety, failed installs, direct/composer dependency parity, and failed scheduler ticks (`docs/described_examples.md:672-698`).
- New proof-readiness queueing belongs beside, not inside, the DSK fixture queue. It helps label claims and release evidence, but it does not fix runtime failure-boundary, lifecycle parity, query/command semantics, or experience-edge gaps.
- Module-source strategy remains an ecosystem/proof decision, not a reason to move product routes or reusable implementations into NexusEngine core.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registry state, scheduler systems, sequence runtimes, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Failed-tick events can be replayed with later successful ticks and be mistaken as normal proof by surfaces, SequenceNode bridges, analytics, objectives, or proof harnesses.
- Metadata-only reset/snapshot/async expectations are too weak for replay, restore, worker, network, and long-running simulation claims.
- Query/command semantics gaps can corrupt receipts and proof after install hardening because terminal targets, passive queries, rejected commands, and read APIs still need explicit contracts.
- Proof-readiness taxonomy can reduce overclaiming, but it can also create false confidence if treated as evidence rather than a checklist.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic. The failed kit remains in `engine.kits` and `engine.domainServiceKits`, and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation would reject.
- Confirmed: thrown systems can replay failed-tick events on the next successful tick.
- Carried from latest deep bug lane: LandmarkGuidance terminal receipts, EnvironmentalAffordance query-versus-transition/rejected-command state, and RouteField live query mutation remain fixture inventory.
- Candidate architecture risk: proof-readiness queueing should not be allowed to supersede the runtime failure-boundary first tranche.

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
- Proof-readiness/release evidence checks that keep runtime hardening, lifecycle parity, query/command semantics, experience-edge proof, fetched-ref validation, aggregate/targeted proof parity, public browser proof, npm availability, and package-version policy separate.

## Promotion risks
- Do not promote broad DSK graphs until namespace safety, install transaction semantics, direct/composer dependency policy, scheduler failure lifetime, reset/snapshot/async truth, lifecycle parity, and query/command semantics are executable fixtures.
- Do not treat `npm test` or DSK smoke success as production DSK safety; they remain happy-path/export-shape proof.
- Do not treat proof-readiness queueing, claim taxonomy, or release-evidence checklist rows as proof that hardening blockers are fixed.
- Do not treat lifecycle parity, query/command semantics, or experience-edge rows as replacements for base DSK runtime failure-boundary work.
- Do not treat HTTP 200, GitHub/raw/jsDelivr availability, fetched-ref package resolution, aggregate proof, targeted proof, or Playwright launch visibility as runtime hardening proof.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not promote idea docs as canonical runtime contract or implementation state.

## Suggested next review item
- Use a non-scout lane to write the smallest executable tranche 1 fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, scheduler failed-tick semantics, and reset/snapshot/async metadata truth.
- Keep tranche 2 lifecycle parity, tranche 3 query/command semantics, tranche 4 experience-edge rows, and proof-readiness/module-source/release-evidence taxonomy as separate follow-on gates.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, experience-edge readiness, proof-readiness taxonomy, or broad domain graph promotion.
