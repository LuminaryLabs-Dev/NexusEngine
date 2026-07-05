# DSK Architecture State Packet: 2026-06-19T21-25-07-0400

## Timestamp
- local: 2026-06-19T21-25-07-0400
- UTC preflight: 2026-06-20T01:23:25.769Z
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-compatibility-content-safety-tranche-root-2026-06-19-2024`.
- Latest DSK packet/node kept runtime failure-boundary as tranche 1, lifecycle parity as tranche 2, query/command semantics as tranche 3, experience-edge as tranche 4, read-model/orchestration as tranche 5, compatibility/content-safety as tranche 6, and proof-readiness/module-source/release evidence as separate claim-management layers.
- Latest ecosystem state node `2026-06-19T21-10-01-0400` says core remains current and validation-green, public proof still stalls at `Booting...`, sibling fetched-ref proof remains blocked by module-source strategy, and AR/spatial read-model rows are hardening inventory.
- Latest ecosystem proof node `2026-06-19T20-39-49-0400` keeps local available-checkout proof separate from fetched-ref, aggregate, targeted, browser, npm, package-version, runtime hardening, lifecycle parity, query/command, read-model/orchestration, compatibility/content-safety, and proof taxonomy claims.
- Latest deep bug node `2026-06-19T20-53-37-0400` adds AR launch missing-ARKit preconditions, live launcher support-state exposure, silent preferred-mode fallback, and SpatialRoom live getter mutation.
- Latest domain idea node `2026-06-19T21-01-07-0400` maps those rows into AR launch and SpatialRoom read-model planning inventory.
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
- worktree note: pre-existing modified docs and automation tracker files plus many untracked prior automation artifacts were present before this lane wrote its current packet, node, and tracker update.

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
- latest DSK packets/nodes: `2026-06-19T20-24-13-0400`, `2026-06-19T19-24-37-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/engine.js`
- `src/ecs.js`
- `src/surfaces.js`
- `src/ar-launcher.js`
- `src/ar-device.js`
- `src/ar-modes/fallback-preview.js`
- `src/ar-modes/camera-overlay.js`
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
- Focused `node --input-type=module` DSK/runtime/AR/spatial probe -> reconfirmed reserved API, failed install, direct dependency parity, AR launch, mode fallback, and SpatialRoom getter behavior.
- Corrected focused failed-tick event-surface probe -> reconfirmed failed-tick and recovery-tick events publish together on the next successful tick at frame `2`, elapsed `0.5`.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable kit primitive for components, resources, events, systems, registries, sequences, sequence nodes, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares `asyncReady`, serializable state, snapshot, and reset expectations, but execution remains the current linear scheduler path (`src/domain-service-kit.js:131-139`; `README.md:138-140`).
- `engine.n` is still initialized as a normal object when missing, and DSK API assignment happens late through the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, bindings, and kit identity before `initWorld`, registry, scheduler, sequence, sequence-node, and install hooks can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still checks only missing `n:` requirements, while `createGameKitComposer()` resolves every required token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- Public exports still include DSK, RuntimeKit, composer, surfaces, shader/material registries, legacy sequence runtime, SequenceNode APIs, AR launcher/device APIs, and SpatialRoom APIs (`src/index.js:28-112` and later exports).

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK creation/validation, metadata shape, token creation, extension duplicate checks, missing `n:` requirement rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw (`tests/domain-service-kit-smoke.mjs:64-135`; `tests/public-api-freeze.mjs:16-24`).
- Not covered by smoke tests: reserved API names, inherited namespace behavior, own-property service guarantees, failed-install rollback/retryability, direct non-`n:` dependency policy, duplicate provider-token diagnostics, install throw points before/after world mutation, reset/snapshot absence or failure, non-serializable state behavior, async metadata truth, scheduler failed-tick clock/event/journal/lifecycle semantics, lifecycle parity, query/command semantics, experience-edge rows, read-model/orchestration isolation, compatibility/content-safety, AR/spatial read-model contracts, public proof boundaries, and proof-claim taxonomy.
- Focused probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed install: first collision threw, second same-object reinstall returned `n-late-collision-kit`, API owner stayed `existing`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-kit` and exposed `engine.n.needsRuntime.ready:true`.
  - scheduler failure: first tick threw `boom once`; the next successful tick event surface published both `failed-tick` and `recovery-tick` at frame `2`, elapsed `0.5`.
  - AR launch composition: `createARLaunchRuntime({ engine:createEngine() })` selected fallback preview, then `start()` threw `Cannot read properties of undefined (reading 'startSession')` because `engine.ar` was missing.
  - AR launch read model: mutating `runtime.getState().support.supported` changed live `ARSupportState` to `"mutated"`.
  - AR mode policy: `chooseARMode(device, ["unknown-mode"])` and `chooseARMode(device, ["webxr-plane"])` returned fallback preview with reason `always_available`.
  - SpatialRoom read model: mutating `getActiveBuilding().rooms[0]` and `getAnchor("a")` changed live `SpatialRoomState`; `snapshot()` reflected the mutated anchor value afterward.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments ownership stayed stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation surfaces; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:11-15`, `docs/how-to-protokit.md:56-68`, `docs/how-to-protokit.md:265-285`).
- Runtime failure-boundary remains the first core fixture tranche because it targets DSK namespace safety, failed installs, direct/composer dependency parity, failed scheduler ticks, and metadata truth (`docs/domain_ideas.md:792-819`; `docs/kits_ideas.md:642-670`).
- The newest AR launch and SpatialRoom rows are core validation-surface inventory because the live evidence is in exported core files: `src/ar-launcher.js`, `src/ar-device.js`, `src/ar-modes/fallback-preview.js`, `src/ar-modes/camera-overlay.js`, and `src/spatial-room-kit.js`.
- These AR/spatial rows should not displace tranche 1. They belong as a later AR/spatial read-model proof tranche after base runtime failure-boundary, lifecycle parity, query/command semantics, experience-edge, read-model/orchestration, and compatibility/content-safety rows are tracked, or they can be split into read-model/orchestration plus AR compatibility once executable fixture ownership is chosen.
- Public module-source strategy remains an ecosystem/proof decision. Fixing public imports would not prove AR launch preconditions, explicit fallback labels, launch-state isolation, or SpatialRoom getter isolation.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registry state, scheduler systems, sequence runtimes, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Failed-tick events can be replayed with later successful ticks and be mistaken as normal proof by surfaces, SequenceNode bridges, analytics, objectives, or proof harnesses.
- Metadata-only reset/snapshot/async expectations are too weak for replay, restore, worker, network, and long-running simulation claims.
- AR launch can be constructed without required AR composition and then fail at start, which is a poor public/browser proof failure mode.
- AR capability selectors can silently degrade explicit requested modes to fallback preview, making browser proof claims ambiguous.
- AR launch and SpatialRoom read APIs expose live mutable state to renderers, callbacks, inspectors, and proof panels.
- Proof-readiness taxonomy can reduce overclaiming, but it can also create false confidence if treated as evidence rather than a checklist.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic. The failed kit remains in `engine.kits` and `engine.domainServiceKits`, and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation would reject.
- Confirmed: thrown systems can replay failed-tick events on the next successful tick.
- Confirmed/current: AR launch runtime can be created without `createARKit()` and then crash during fallback preview start.
- Confirmed/current: AR launcher `getState()` returns live mutable support state.
- Confirmed/current: explicit AR preferred-mode lists can silently fall back to fallback preview.
- Confirmed/current: SpatialRoom `getActiveBuilding()` and `getAnchor()` return live objects that can mutate world state.
- Carried: lifecycle parity, query/command semantics, experience-edge, read-model/orchestration, compatibility/content-safety, traversal, source-state, state-signal, receipt, bridge, operations, and spatial rows remain fixture inventory.

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
- Proof-readiness/release evidence checks that keep runtime hardening, lifecycle parity, query/command semantics, experience-edge proof, read-model/orchestration proof, compatibility/content-safety proof, AR/spatial read-model proof, fetched-ref validation, aggregate/targeted proof parity, public browser proof, npm availability, and package-version policy separate.

## Promotion risks
- Do not promote broad DSK graphs until namespace safety, install transaction semantics, direct/composer dependency policy, scheduler failure lifetime, reset/snapshot/async truth, lifecycle parity, query/command semantics, experience-edge, read-model/orchestration, compatibility/content-safety, and AR/spatial read-model semantics are executable fixtures.
- Do not treat `npm test` or DSK smoke success as production DSK safety; they remain happy-path/export-shape proof.
- Do not treat proof-readiness queueing, claim taxonomy, release-evidence checklist rows, or module-source decisions as proof that hardening blockers are fixed.
- Do not let AR/spatial read-model rows supersede base DSK runtime failure-boundary work.
- Do not treat HTTP 200, GitHub/raw/jsDelivr availability, fetched-ref package resolution, aggregate proof, targeted proof, or Playwright launch visibility as runtime hardening proof.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not promote idea docs as canonical runtime contract or implementation state.

## Suggested next review item
- Use a non-scout lane to write the smallest executable tranche 1 fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, scheduler failed-tick semantics, and reset/snapshot/async metadata truth.
- Keep tranche 2 lifecycle parity, tranche 3 query/command semantics, tranche 4 experience-edge, tranche 5 read-model/orchestration isolation, tranche 6 compatibility/content-safety, tranche 7 AR/spatial read-model proof, and proof-readiness/module-source/release-evidence taxonomy as separate follow-on gates.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, experience-edge readiness, read-model/orchestration readiness, compatibility/content-safety readiness, AR/spatial read-model readiness, proof-readiness taxonomy, or broad domain graph promotion.
