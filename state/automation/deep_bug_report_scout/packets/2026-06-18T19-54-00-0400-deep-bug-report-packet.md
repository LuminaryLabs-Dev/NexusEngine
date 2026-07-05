# Deep Bug Report Packet

Timestamp: 2026-06-18T19-54-00-0400
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine core runtime surfaces

## Latest branch
- latest remote release branch: `0.0.2`
- compare target: `origin/0.0.2`
- preflight branch status: `current-is-latest-release-branch`
- required public links: pass
- optional npm metadata: 404

## Current branch
- current branch: `0.0.2`
- local dirty state before scout: `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, `README.md`, `memory.md`, `package.json`, untracked `scripts/`, untracked `state/`, and untracked lower-case `.agent` operating files.
- diff against `origin/0.0.2`: 5 files, 15 insertions before this lane write; this packet did not inspect those edits as source truth beyond required files.

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
- `state/automation/runtime_bug_scout/master_runtime_bugs.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- `state/automation/ecosystem_proof_scout/master_ecosystem_proof.md`
- `src/ecs.js`
- `src/engine.js`
- `src/runtime-kit.js`
- `src/domain-service-kit.js`
- `src/game-kit-composer.js`
- `src/sequence-node.js`
- `src/sequence-node-kit.js`
- `src/terrain-kit.js`
- `src/world-physics-kit.js`
- `src/action-movement-kit.js`
- `src/character-camera-kit.js`
- `src/renderers.js`
- `src/ar-kit.js`
- `src/ar-session.js`
- `src/ar-renderer.js`
- `src/index.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/sequence-node-kit-deploy-smoke.mjs`
- `README.md`

## Commands run
- `npm run automation:preflight`
  - result: pass; latest release branch `0.0.2`; required public links OK; npm metadata 404.
- `git branch -a --sort=-committerdate`
  - result: `0.0.2`, `origin/0.0.2`, `0.0.1`, `main`, `origin/0.0.1`, `origin/main`.
- `git diff --stat origin/0.0.2...HEAD`
  - result: no committed divergence from latest release branch.
- `git diff --stat origin/0.0.2`
  - result: pre-existing dirty diff in `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, `README.md`, `memory.md`, `package.json`.
- `npm test`
  - result: pass; 8 smoke tests passed.
- inline Node probe: invalid `deploySequenceNode()` graph
  - result: `validationOk:false`, errors `unknown_type`, but probe kit installed and invalid root mounted/running.
- inline Node probe: TerrainKit focus jumps with `activeRadius:1`, `unloadRadius:1`
  - result: cached chunks grew `9 -> 18 -> 27` while visible chunks stayed `9`.
- inline Node probe: AR start then fail
  - result: failed AR state retained prior `session:{id:"s1"}`.

## Existing bug packets checked
- `state/automation/runtime_bug_scout/master_runtime_bugs.md`
  - Known branch: DSK contract edge cases.
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
  - Known branches: DSK namespace safety, install atomicity, dependency parity.
- `state/automation/ecosystem_proof_scout/master_ecosystem_proof.md`
  - Known branches: public proof alignment, npm metadata 404, stale CDN pins.
- No prior `state/automation/deep_bug_report_scout/` packet existed before this run.

## Executive summary
- Existing tests pass, but deep probes reproduced three production-relevant runtime bugs.
- Highest-impact blocker: `deploySequenceNode()` reports validation errors but still installs required kits, mounts invalid graphs, and can auto-start them.
- Terrain streaming has an unbounded cache path: `preloadRadius` and `unloadRadius` are normalized but not enforced, so moving focus across an infinite world accumulates hidden chunks.
- AR failure state keeps the previous live session object, which can mislead fallback/cleanup code after a session failure.
- DSK install atomicity remains a known open risk from prior scouts; this packet did not re-count it as a new bug, but the SequenceNode deployment bug can install kits before graph validity is enforced and should be treated as promotion-adjacent.

## Deep bug reports

### 1. Invalid SequenceNode graphs still install kits and mount running nodes
- Severity: high
- Owner: sequence
- Evidence:
  - `src/sequence-node-kit.js:82` computes `validation`.
  - `src/sequence-node-kit.js:87` creates a plan regardless of `validation.ok`.
  - `src/sequence-node-kit.js:88-90` installs required kits before any validation guard.
  - `src/sequence-node-kit.js:92-99` mounts and optionally auto-starts the root regardless of validation result.
  - `src/sequence-node.js:356-359` flags unknown node types as validation errors.
  - `tests/sequence-node-kit-deploy-smoke.mjs:40-47` covers happy-path deployment only.
- Reproduction path or likely trigger:
  - Call `deploySequenceNode(engine, { id:"bad", type:"missingType", kits:["probe-kit"] }, { kitRegistry, autoStart:true })`.
  - Probe result: `validationOk:false`, `errors:["unknown_type","unknown_type"]`, `installed:1`, mounted root `{id:"bad", type:"missingType", state:"running"}`.
- Expected behavior:
  - Invalid graphs should not install kits, mutate runtime state, mount nodes, or auto-start.
- Actual or suspected behavior:
  - Validation is advisory only. Deployment side effects happen even after fatal graph errors.
- Why it matters for production scaling:
  - Remote/JSON-authored mission graphs, product scripts, or DSK-provided SequenceNodes can partially install runtime capabilities before the graph is safe to execute.
  - A failed content rollout could leave installed systems or APIs active while the orchestration layer is invalid.
- Validation needed:
  - Add an existing-suite-compatible smoke that proves invalid graphs are rejected before kit installation and mounting.
- Suggested fix direction:
  - In `deploySequenceNode()`, return or throw before planning/install/mount when `validation.ok === false`, unless an explicit unsafe option is introduced.
  - If keeping advisory mode, default must be safe and side-effect-free.
- Blocks DSK promotion:
  - Yes, for DSKs that ship or deploy SequenceNode graphs as part of promoted domain APIs.

### 2. TerrainKit never enforces unload/preload radius and hidden chunks accumulate
- Severity: high
- Owner: terrain
- Evidence:
  - `src/terrain-kit.js:155-159` stores `streaming.activeRadius`, `preloadRadius`, and `unloadRadius`.
  - `src/terrain-kit.js:745-776` rebuilds visible chunks only inside active radius.
  - `src/terrain-kit.js:778-783` reports hidden chunks but does not delete them.
  - `src/terrain-kit.js:788-793` exposes `totalCached: state.chunks.size`, which grows as focus moves.
  - `memory.md` says chunk focus plus streaming active radius is the default infinite-world policy.
- Reproduction path or likely trigger:
  - Install `createTerrainKit({ chunks:{ size:8 }, activeRadius:1, unloadRadius:1 })`.
  - Tick at focus `0`, then set focus `8000`, tick, set focus `16000`, tick.
  - Probe result: cached chunks grew `9 -> 18 -> 27`; visible chunks stayed `9`; each move hid `9`.
- Expected behavior:
  - Chunks outside configured unload radius should be evicted or bounded by a documented cache policy.
  - `preloadRadius` should be used or removed from the public contract.
- Actual or suspected behavior:
  - Infinite streaming retains every hidden chunk in `state.chunks` for the lifetime of the engine.
- Why it matters for production scaling:
  - Long-running open-world sessions, demos, or autoplay validation can leak terrain memory linearly with travel distance.
  - Renderer caches keyed by `TerrainSnapshot.visibleChunks` may look healthy while the underlying simulation cache grows.
- Validation needed:
  - Add or run an existing terrain smoke that moves focus across many chunk centers and asserts bounded `state.chunks.size`.
- Suggested fix direction:
  - Enforce `streaming.unloadRadius` during `terrainChunkSystem()` by deleting chunks outside the retention radius.
  - Decide whether `preloadRadius` should pre-bake non-visible chunks or be dropped from config.
- Blocks DSK promotion:
  - Yes, if TerrainKit is promoted as a stable reusable streaming domain.

### 3. AR session failure leaves the previous session object in failed state
- Severity: medium
- Owner: AR
- Evidence:
  - `src/ar-kit.js:69-77` stores `payload.session` when a session starts.
  - `src/ar-kit.js:80-86` spreads current state on failure and sets `status:"failed"` but never clears `session`.
  - `src/ar-kit.js:135-142` exposes `engine.ar.startSession()` and `engine.ar.failSession()` convenience paths that tick immediately.
  - `src/ar-session.js:110-116` has an explicit `endARSession()` helper, but `ar-kit` failure state does not represent session cleanup.
- Reproduction path or likely trigger:
  - Install `createARKit()`, call `engine.ar.startSession({ session:{ id:"s1" } })`, then `engine.ar.failSession({ error:"boom" })`.
  - Probe result: state becomes `{ status:"failed", session:{ id:"s1" }, error:"boom" }`.
- Expected behavior:
  - Failed AR state should clear or explicitly mark the prior session as ended/unusable.
- Actual or suspected behavior:
  - Failed state can retain a stale session reference from a previous running state.
- Why it matters for production scaling:
  - Mode fallback, retry, cleanup, and renderer logic can mistake a failed session state for an active session handle.
  - This is most likely on real mobile AR where session request/start can fail after partial setup.
- Validation needed:
  - Add or run an existing AR smoke that starts, fails, retries, and confirms session/fallback state transitions.
- Suggested fix direction:
  - Set `session:null` when processing `ARSessionFailed`, or add a separate `previousSession`/`endedSession` field if retention is required for diagnostics.
- Blocks DSK promotion:
  - No for non-AR DSKs; yes for AR-specific domain promotion.

### 4. DSK/runtime install atomicity is still a promotion blocker
- Severity: medium
- Owner: runtime-kit/DSK
- Evidence:
  - `state/automation/dsk_architecture_scout/master_dsk_architecture.md` already lists install atomicity as a high-priority open branch.
  - `src/runtime-kit.js:126-157` mutates `engine.kit`, `engine.domainServiceKits`, `engine.kitBindings`, and `engine.kits` before world init, registry install, scheduler install, sequence install, and custom install complete.
  - `src/domain-service-kit.js:143-162` can write `engine.n.<apiName>` before the wrapped custom install completes.
- Reproduction path or likely trigger:
  - A DSK whose `createApi()` succeeds but custom `install()` throws after API assignment.
- Expected behavior:
  - Failed installs should leave no promoted API, installed-kit registry entry, scheduler systems, bindings, or metadata.
- Actual or suspected behavior:
  - Partial state can remain after install failure.
- Why it matters for production scaling:
  - DSK promotion requires predictable rollback when optional domain services fail during app boot.
- Validation needed:
  - Existing DSK smoke should be extended in a future implementation pass to assert rollback on throwing install.
- Suggested fix direction:
  - Stage all install mutations, commit only after every phase succeeds, or add explicit rollback handlers for each phase.
- Blocks DSK promotion:
  - Yes.

## Cross-cutting risks
- Validation is not consistently enforced at mutation boundaries. SequenceNode validation exists but deployment treats it as advisory.
- Several runtime systems expose cache/snapshot fields that make long-running behavior look bounded while internal maps continue growing.
- Failure state often carries prior state forward via object spread. This is convenient for continuity but risky for session handles and promoted APIs.

## Missing validation
- No smoke proves invalid SequenceNode deployment is side-effect-free.
- No smoke proves TerrainKit streaming cache is bounded by `unloadRadius`.
- No smoke covers AR start/fail/retry session state cleanup.
- No smoke proves DSK install rollback.
- Existing tests pass, so these gaps are not currently caught by `npm test`.

## DSK promotion blockers
- Blocking:
  - DSK/runtime install atomicity and rollback.
  - SequenceNode deployment side effects after fatal validation errors, if DSKs install SequenceNode content.
  - TerrainKit unbounded cache if TerrainKit is promoted as a stable domain service.
- Not blocking for general DSK:
  - AR stale session state, unless promoting AR-specific DSKs.

## Suggested next review item
- Focus next on mutation-boundary hardening: `deploySequenceNode()` validation guard first, then DSK/runtime install rollback.

## Not claimed
- This packet does not fix bugs.
- This packet does not create tests.
- This packet does not prove browser renderer behavior with Playwright.
- This packet does not prove npm publication readiness.
- This packet does not validate uncommitted source/doc changes outside this lane.
