# DSK Architecture State Packet

## Timestamp
- local: 2026-06-19T16:23:39-0400
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current DSK tracker root before this run: `dsk-hardening-boundary-split-root-2026-06-19-1525`.
- Latest DSK packet/node `2026-06-19T15-25-28-0400` split work into core runtime failure-boundary fixtures first, downstream experience-edge proof rows later, and public/fetched-ref/module-source proof separately.
- Latest ecosystem state packet/node `2026-06-19T16-09-07-0400` kept core current and validation-green, while module-source strategy still blocked ProtoKits fetched-ref proof, Experiments fetched-ref targeted proof, and public browser proof.
- Latest ecosystem proof packet/node `2026-06-19T15-40-03-0400` kept local proof, fetched-ref proof, public browser proof, aggregate proof, npm availability, runtime hardening, and experience-edge proof as separate claims.
- Latest deep bug packet/node `2026-06-19T15-53-59-0400` added lifecycle parity rows: repeated held-glide receipts, far terrain spline carve query/chunk mismatch, camera-overlay partial-start stream retention, and AR launch stop state remaining running.
- Latest domain idea packet/node `2026-06-19T16-01-29-0400` mapped those rows into lifecycle parity and cleanup planning inventory.
- State packets were context only. Live source, docs, tests, preflight, git refs, and focused probes are authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Preflight timestamp: `2026-06-19T20:21:42.520Z`.
- Branch status: `current-is-latest-release-branch`.
- Remote branches observed: `0.0.1`, `0.0.2`, `main`.
- Required public links passed: GitHub repo, raw `0.0.2/package.json`, jsDelivr `0.0.2/src/index.js`.
- Optional npm metadata remains 404 for `https://registry.npmjs.org/nexusengine`.
- `HEAD` and `origin/0.0.2` both resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind `0 0`.
- Package metadata remains `nexusengine@0.1.0` while latest release branch is `0.0.2`.

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
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- Latest current-lane packets/nodes: `2026-06-19T15-25-28-0400`, `2026-06-19T14-24-17-0400`, `2026-06-19T13-24-43-0400`
- Latest neighboring lane packets/nodes from ecosystem state, ecosystem proof, deep bug, and domain kit idea lanes.
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/engine.js`
- `src/ecs.js`
- `src/action-movement-kit.js`
- `src/terrain-kit.js`
- `src/ar-modes/camera-overlay.js`
- `src/ar-launcher.js`
- `src/ar-kit.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js src/engine.js src/ecs.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md docs/how-to-protokit.md state/automation/dsk_architecture_scout`
  - Result before this packet: no source/test/runtime diff; tracked diffs were in planning docs and DSK tracker only.
- `npm test`
  - Result: pass, 8 smoke tests.
- Focused `node --input-type=module` DSK/scheduler failure-boundary probe.
  - Result: reconfirmed inherited `__proto__` API behavior, failed collision partial install plus false same-object reinstall success, missing `runtime:missing` direct install, and failed-tick event replay on the next successful tick.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for components, resources, events, systems, registries, sequences, sequence nodes, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares async-ready, serializable-state, reset, and snapshot expectations, but those are metadata rather than enforced runtime boundaries (`src/domain-service-kit.js:131-139`; `README.md:136-140`).
- `engine.n` is still created as a normal object, and the DSK API is assigned late in the install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, bindings, and kit identity before `initWorld`, registry, scheduler, sequence, sequence-node, and late install mutations can throw (`src/runtime-kit.js:135-215`).
- Direct DSK install still filters missing requirements to `n:` tokens only, while `createGameKitComposer()` resolves every `requires` token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- `engine.tick()` still advances clock before scheduler execution and has no failure cleanup around `scheduler.run()`; event queues and journals clear only after all phases finish (`src/engine.js:168-214`; `src/ecs.js:251-269`; `src/ecs.js:344-370`).
- Public exports and smoke tests still cover DSK API availability and happy-path usage (`src/index.js:28-41`; `tests/domain-service-kit-smoke.mjs:64-135`; `tests/public-api-freeze.mjs:16-24`).

## Invariant coverage
- Covered by current smoke tests: DSK export presence, basic DSK creation/validation, metadata shape, token creation, extension duplicate checks, missing `n:` requirement rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw.
- Not covered by current smoke tests: reserved API names, inherited namespace behavior, own-property service guarantees, failed-install rollback/retryability, direct non-`n:` dependency policy, duplicate provider-token diagnostics, install throw points before/after world mutation, reset/snapshot absence or failure, non-serializable state behavior, async metadata truth, scheduler failed-tick clock/event/journal/lifecycle semantics, lifecycle parity, experience-edge rows, and public proof boundaries.
- Focused probe evidence:
  - Reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, and `protoMarker:"__proto__-api"`.
  - Failed collision: first install threw `cannot overwrite engine.n.collision`; second same-object reinstall returned `n-late-collision-kit`; the API owner stayed `existing`; `engine.kits` and `engine.domainServiceKits` retained the failed kit.
  - Dependency parity: direct install with `requires:["runtime:missing"]` installed and exposed `engine.n.needsRuntime.ready:true`.
  - Scheduler failure: first tick threw `boom once`; second tick published one event batch containing both `failed-tick` and `recovery-tick`; clock reached frame `2`, elapsed `0.5`.

## Domain and kit expansion architecture notes
- The ownership split stayed stable in live docs: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and hardening tests; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:53-68`, `docs/how-to-protokit.md:80-105`, `docs/how-to-protokit.md:253-287`).
- Runtime failure-boundary rows are core validation-surface inventory because they target DSK namespace safety, failed-install transactions, dependency policy, scheduler failure lifetime, and proof rows (`docs/domain_ideas.md:790-820`; `docs/kits_ideas.md:635-671`; `docs/described_examples.md:670-698`).
- New lifecycle parity rows are also mostly core validation-surface inventory because the live evidence sits in core movement, terrain, camera-overlay, launch, and AR session files:
  - Held glide emits `GlideStarted` when `input.glide` is true and player is airborne (`src/action-movement-kit.js:230-250`).
  - Terrain spline carve distance is precise in `carveDistance()`, but chunk inclusion for non-circle/non-box carve layers uses a single center point before signature/build (`src/terrain-kit.js:290-312`; `src/terrain-kit.js:548-564`).
  - Camera-overlay stores the acquired stream before later engine setup and catch handling does not stop tracks (`src/ar-modes/camera-overlay.js:16-37`).
  - AR launch `stop()` only calls `mode.stop()`; AR session state has start/failed handlers but no stopped/ended handler (`src/ar-launcher.js:131-133`; `src/ar-kit.js:68-87`).
- Experience-edge rows remain a downstream proof tranche after base runtime failure-boundary and lifecycle parity fixtures begin.
- Public/fetched-ref/browser proof is still a distribution/module-source gate, not DSK runtime hardening proof.

## Scaling risks
- Broad DSK promotion increases collision, inherited-key, and ownership risks while `engine.n` remains a normal object.
- Partial installs can leave kit identity, DSK metadata, bindings, world state, registry state, scheduler systems, sequence runtimes, or service APIs inconsistent after any late throw.
- Direct-install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Failed-tick events can be consumed later as normal success evidence by event surfaces, SequenceNode bridges, analytics, objectives, or proof harnesses.
- Metadata-only reset/snapshot/async expectations are too weak for replay, restore, worker, network, or long-running simulation claims.
- Lifecycle parity gaps can make receipts, query results, acquired device resources, and session state disagree with visible/user-facing behavior even after the DSK install path is hardened.
- Module-source/public proof can drift independently from runtime hardening: local available-checkout proof, fetched-ref proof, aggregate proof, npm metadata, package-version policy, and browser-complete public proof remain separate.

## Bug candidates
- Confirmed: reserved namespace API key. `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late DSK API collision is non-atomic. The failed kit remains in `engine.kits` and `engine.domainServiceKits`, and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation would reject.
- Confirmed: thrown systems can replay failed-tick events on the next successful tick.
- Confirmed from live source and neighboring packet context: held glide repeated start receipts, far spline carve query/chunk mismatch, camera-overlay partial-start stream retention, and AR launch stopped-mode/running-session mismatch.
- Candidate architecture risk: the DSK tracker should now name an ordered fixture queue, because the latest rows are useful but belong after base runtime failure-boundary fixtures, not before them.

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
- Lifecycle parity fixtures for held-input receipt transitions, query fallback versus baked chunk parity, partial-start cleanup, and AR/session stop state.
- Experience-edge fixtures for repeated recovery receipts, AR launch fallback/no-fallback diagnostics, custom quality profile handling, and empty/malformed content datasets.
- Aggregate proof wiring that keeps runtime hardening, lifecycle parity, experience-edge proof, public browser proof, latest-ref sibling proof, npm availability, and package-version policy separate.

## Promotion risks
- Do not promote broad DSK graphs until namespace safety, install transaction semantics, direct/composer dependency policy, scheduler failure lifetime, reset/snapshot/async truth, and lifecycle parity are executable fixtures.
- Do not treat `npm test` or DSK smoke success as production DSK safety; they are happy-path and export-shape proof.
- Do not treat lifecycle parity or experience-edge rows as replacements for base DSK hardening; they are later fixture tranches.
- Do not treat public route HTTP 200, GitHub/raw/jsDelivr availability, local targeted proof, fetched aggregate proof, or Playwright launch visibility as runtime hardening proof.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not claim public browser DSK proof, ProtoKits fetched-ref proof, or Experiments targeted fetched-ref proof until module-source strategy is fixed in those lanes.
- Do not promote idea docs as canonical runtime contract or implementation state.

## Suggested next review item
- Use a non-scout lane to write the smallest executable fixture queue in this order:
  - tranche 1: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, scheduler failed-tick semantics, reset/snapshot/async metadata truth.
  - tranche 2: lifecycle parity rows for held-input receipts, terrain query/chunk parity, partial-start cleanup, and stopped-session state.
  - tranche 3: experience-edge rows for recovery receipts, launch fallback, quality profile contracts, and content dataset semantics.
- Keep public/fetched-ref/module-source proof as a separate ecosystem/proof lane decision.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling latest-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, experience-edge readiness, or broad domain graph promotion.
