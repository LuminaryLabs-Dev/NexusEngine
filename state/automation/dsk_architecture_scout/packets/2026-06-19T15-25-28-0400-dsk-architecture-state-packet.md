# DSK Architecture State Packet

## Timestamp
- local: 2026-06-19T15:25:28-0400
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current DSK tracker root before this run: `dsk-runtime-failure-boundary-root-2026-06-19-1424`.
- Latest DSK packet/node `2026-06-19T14-24-17-0400` said the non-scout hardening handoff must include namespace reserved keys, failed-install rollback/retryability, direct/composer dependency parity, and scheduler failed-tick event lifetime.
- Latest ecosystem state packet/node `2026-06-19T15-10-04-0400` kept core current and validation-green, while module-source strategy remained the shared blocker for ProtoKits fetched-ref proof, Experiments targeted proof, and public browser proof.
- Latest ecosystem proof packet/node `2026-06-19T14-41-14-0400` kept local available-checkout proof, fetched-ref proof, public browser proof, aggregate proof, npm availability, and runtime hardening as separate proof categories.
- Latest deep bug packet/node `2026-06-19T14-54-04-0400` added experience-edge rows: repeated ragdoll recovery receipts, AR launch fallback behavior, custom quality profile handling, and empty FishingKit content semantics.
- Prior deep bug packet/node `2026-06-19T13-53-17-0400` is still the direct DSK/scheduler failure-boundary source for partial DSK installs, reserved `apiName:"__proto__"`, direct non-`n:` dependency bypass, and failed-tick event replay.
- Latest domain idea packet/node `2026-06-19T15-00-41-0400` mapped experience-edge rows into planning inventory. Prior domain idea packet/node `2026-06-19T14-00-58-0400` mapped runtime failure-boundary rows into DSK hardening inventory.
- State packets were context only. Live source, docs, tests, preflight, git refs, and clean probes are authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Preflight timestamp: `2026-06-19T19:22:41.782Z`.
- Branch status: `current-is-latest-release-branch`.
- Remote branches observed: `0.0.1`, `0.0.2`, `main`.
- Required public links passed: GitHub repo, raw `0.0.2/package.json`, jsDelivr `0.0.2/src/index.js`.
- Optional npm metadata remains 404 for `https://registry.npmjs.org/nexusengine`.
- `HEAD` and `origin/0.0.2` both resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`.
- Package metadata is still `nexusengine@0.1.0` while the release branch is `0.0.2`.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- Latest current-lane packets/nodes: `2026-06-19T14-24-17-0400`, `2026-06-19T13-24-43-0400`, `2026-06-19T12-23-47-0400`
- Latest neighboring lane packets/nodes from ecosystem state, ecosystem proof, deep bug, and domain kit idea lanes.
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/engine.js`
- `src/ecs.js`
- `src/character-ragdoll-kit.js`
- `src/ar-launcher.js`
- `src/ar-modes/*`
- `src/realism-kit.js`
- `src/fishing-kit.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`
- `README.md`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2 && git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: both refs `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md docs/how-to-protokit.md state/automation/dsk_architecture_scout`
  - Result before this packet: no source/test/runtime diff; tracked diffs in idea docs and DSK tracker only.
- `npm test`
  - Result: pass, 8 smoke tests.
- Focused `node --input-type=module` DSK/scheduler failure-boundary probe.
  - Result: clean probe reconfirmed reserved `apiName:"__proto__"` inherits API through prototype, failed API collision leaves partial installed DSK and same-object reinstall success, direct install allows missing `runtime:missing`, and failed-tick events replay with the next successful tick.
- Discarded probe attempts:
  - One attempt used nonexistent `engine.surfaces.events`.
  - One attempt used an ad hoc resource key instead of `defineResource()`.
  - One attempt used the wrong event-surface batch shape.
  - These failed harness attempts were not used as evidence.
- Targeted `rg`/`nl -ba` inspections for DSK, RuntimeKit, composer, public exports, smoke tests, docs, and newest edge-contract source rows.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for components, resources, events, systems, bindings, registries, sequences, sequence nodes, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, domain/version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still says linear execution with async-ready, serializable-state, reset, and snapshot expectations, but those remain metadata expectations rather than enforced runtime boundaries (`src/domain-service-kit.js:131-139`; `README.md:136-140`).
- `engine.n` is still created as a normal object and the DSK API is assigned late in the install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, bindings, and kit identity before `initWorld`, registries, scheduler, sequence runtimes, and final install hooks complete (`src/runtime-kit.js:135-157`, `src/runtime-kit.js:159-215`).
- Direct DSK install still filters missing requirements to `n:` tokens only, while `createGameKitComposer()` resolves every `requires` token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- Public exports remain present for DSK APIs and RuntimeKit primitives (`src/index.js:28-41`; `tests/public-api-freeze.mjs:16-24`).

## Invariant coverage
- Covered by current smoke tests: DSK export presence, basic DSK creation/validation, metadata shape, token creation, extension duplicate checks, missing `n:` requirement rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw (`tests/domain-service-kit-smoke.mjs:64-135`).
- Not covered by current smoke tests: reserved API names, inherited namespace behavior, own-property service guarantees, failed install rollback/retryability, direct non-`n:` dependency policy, duplicate provider-token diagnostics, install throw points before/after world mutation, reset/snapshot absence or failure, non-serializable state behavior, async metadata truth, scheduler failed-tick clock/event/journal/lifecycle semantics, and downstream domain edge rows.
- Clean probe evidence:
  - `reservedApi.own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - Failed collision first threw `cannot overwrite engine.n.collision`, then same-object reinstall returned `n-late-collision-kit`; both `engine.kits` and `engine.domainServiceKits` retained the failed kit while `engine.n.collision` stayed on the old API.
  - Direct DSK install with `requires:["runtime:missing"]` installed and exposed `engine.n.needsRuntime.ready:true`.
  - Throw-after-emit scheduler probe threw `boom once`, then next successful tick published one event batch containing `failed-tick` and `recovery-tick`.

## Domain and kit expansion architecture notes
- Repo docs keep the ownership split stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and hardening tests; ProtoKits owns new reusable domain kits; Experiments owns playable/browser proof (`docs/how-to-protokit.md:53-68`, `docs/how-to-protokit.md:80-105`).
- The runtime failure-boundary domain is now explicitly documented as core validation surface inventory: DSK namespace policy, install rollback, dependency parity, scheduler failure lifetime, and proof rows (`docs/domain_ideas.md:790-820`; `docs/kits_ideas.md:638-671`; `docs/described_examples.md:670-698`).
- Newest neighboring edge-contract rows are real future proof inputs, but they are not a reason to defer base DSK hardening:
  - CharacterRagdoll emits `Staggered` every settled non-recovering tick after `recoverDelay` (`src/character-ragdoll-kit.js:145-173`).
  - AR launch selects one mode and calls `mode.start()` without a fallback loop after selected-mode start failure (`src/ar-launcher.js:40-92`).
  - Realism quality resolution falls back unknown/custom quality ids to built-in profiles (`src/realism-kit.js:170-184`).
  - Fishing content fallback can use `{}` for missing species/lures and initial fish are still created from empty datasets (`src/fishing-kit.js:27`, `src/fishing-kit.js:181-187`, `src/fishing-kit.js:683-689`, `src/fishing-kit.js:849-866`).
- The DSK architecture implication is a boundary split:
  - Runtime hardening fixtures belong in NexusEngine core validation first.
  - Experience-edge fixture rows belong downstream as domain-kit edge proof inventory.
  - Public/fetched-ref/browser proof remains a separate module-source strategy gate.

## Scaling risks
- Broad DSK promotion increases collision, inherited-key, and ownership risks while `engine.n` remains a normal object.
- Partial installs can leave kit identity, DSK metadata, bindings, world state, registry state, scheduler systems, sequence runtimes, or service APIs inconsistent after any late throw.
- Direct-install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Event-driven proof surfaces can consume failed-tick events as normal success evidence unless scheduler failure semantics are explicit.
- Metadata-only reset/snapshot/async expectations are too weak for replay, restore, worker, network, or long-running simulation claims.
- Edge-contract bugs show that even after base DSK hardening, promoted domain kits need targeted receipt, fallback, profile, content, traversal, lifecycle, source-state, state-signal, bridge, receipt, operations, and spatial rows before public promotion claims.

## Bug candidates
- Confirmed: reserved namespace API key. `apiName:"__proto__"` installs through prototype mutation without an own `engine.n` slot.
- Confirmed: failed late DSK API collision is non-atomic. The failed kit remains in `engine.kits` and `engine.domainServiceKits`, and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation would reject.
- Confirmed: thrown systems can replay failed-tick events on the next successful tick.
- Confirmed from live edge source and neighboring packet context: CharacterRagdoll repeated settled receipts, AR launch no fallback after start failure, RealismKit custom profile fallback, and FishingKit empty dataset placeholder state are downstream edge-contract fixture rows.
- Candidate architecture risk: the tracker should stop widening scout scope into more domains until a non-scout lane writes executable hardening fixtures for the base runtime failure boundary.

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
- Experience-edge fixtures for repeated recovery receipts, AR launch fallback/no-fallback diagnostics, custom quality profile handling, and empty/malformed content datasets.
- Aggregate proof wiring that keeps runtime hardening, edge-contract proof, public browser proof, latest-ref sibling proof, npm availability, and package-version policy separate.

## Promotion risks
- Do not promote broad DSK graphs until namespace safety, install transaction semantics, direct/composer dependency policy, scheduler failure lifetime, and reset/snapshot/async truth are executable fixtures.
- Do not treat `npm test` or DSK smoke success as production DSK safety; they are happy-path and export-shape proof.
- Do not treat edge-contract rows as replacements for base DSK hardening; they are downstream proof rows after runtime failure-boundary policy exists.
- Do not treat public route HTTP 200, GitHub/raw/jsDelivr availability, local targeted proof, or fetched aggregate proof as runtime hardening proof.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not claim public browser DSK proof, ProtoKits fetched-ref proof, or Experiments targeted fetched-ref proof until module-source strategy is fixed in those lanes.
- Do not promote idea docs as canonical runtime contract or implementation state.

## Suggested next review item
- Use a non-scout lane to write the smallest executable NexusEngine core fixture set for:
  - `engine.n` reserved-key/null-prototype/own-property namespace policy
  - failed-install rollback or preflight retryability
  - direct install versus composer dependency parity
  - scheduler failed-tick event/journal/clock/lifecycle semantics
  - reset/snapshot/async metadata truth
- Keep experience-edge rows as the next downstream proof bundle after runtime failure-boundary fixtures start.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling latest-ref validation, async execution, worker/network readiness, replay/restore support, or broad domain graph promotion.
