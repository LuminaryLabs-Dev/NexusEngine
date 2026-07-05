# Deep Bug Report Packet: 2026-06-19T21:55:21-04:00

Timestamp: 2026-06-19T21:55:21-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for AR experience completion, WebXR hit-test helper failure, engine time policy, and greybox spatial scale normalization

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-ar-launch-spatial-readmodel`.
- Recent deep packets already cover AR launch missing-ARKit preconditions, mutable launcher support state, silent preferred-mode fallback, SpatialRoom live getters, legacy sequence replay/cleanup, AR DOM raw HTML, registry/surface aliasing, DSK install/scheduler failure boundaries, AR/objective step-completion gaps, ObjectiveFlow repeated completion, schedule invalid scale, and SpatialRoom anchor/source normalization.
- Latest ecosystem state/proof packets keep core current and validation-green, but public proof is still browser-incomplete at `Booting...` and fetched-ref/public module-source strategy remains unresolved.
- Latest DSK architecture/domain idea packets treat AR/spatial read-model rows as hardening inventory, not distribution proof.
- These packets were context only. Live source, docs, tests, preflight, git refs, and focused probes were authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404
- Current `HEAD` and `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- Ahead/behind against `origin/0.0.2`: `0 0`

## Current branch
- `0.0.2`, tracking `origin/0.0.2`
- Worktree had pre-existing modified docs/automation trackers and many untracked prior automation artifacts before this run.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/ar-experience-kit.js`, `src/ar-session.js`, `src/engine.js`, `src/ecs.js`, `src/surfaces.js`, `src/greybox-building-kit.js`, `src/spatial-room-kit.js`, `src/render-descriptor-kit.js`, `src/index.js`
- `tests/run-all.mjs`, `tests/public-api-freeze.mjs`, `tests/domain-service-kit-smoke.mjs`, `tests/sequence-node-runtime-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan for `ARExperience`, `ARExperienceCompleted`, hit-test, negative delta, `createGreyboxBuilding`, `SpatialRoom`, scale normalization, and related read-model/config terms.
- Inline Node probe: ARExperience completion idempotency.
  - Result: one normal final-step action plus two later ticks emitted three `ARExperienceCompleted` batches; `arExperience.complete()` emitted two completed payloads in one API call/tick.
- Inline Node probe: `createHitTestSource()` rejection.
  - Result: a session whose `requestHitTestSource()` rejected caused `createHitTestSource()` to throw `hit-test denied` instead of returning `null` or a structured unsupported result.
- Inline Node probe: engine negative delta.
  - Result: `engine.tick(1)` followed by `engine.tick(-2)` left `clock.delta:-2`, `clock.elapsed:-1`, and published a normal event batch with negative elapsed time.
- Inline Node probe: greybox/spatial building scale.
  - Result: `createGreyboxBuilding({ scale:"huge" })` produced `scale:NaN`, and installing `createGreyboxBuildingKit()` stored `SpatialRoomState.buildings[0].scale` as `NaN`.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T20-53-37-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover ObjectiveFlow repeated completion, ARExperience missing step-completion events, AR launch read-model isolation, SpatialRoom live getters and non-normalized anchors, schedule invalid scale, failed-tick clock/event replay, and RenderDescriptor source-state leaks.
- No prior deep packet reported ARExperience final-completion repeat/`complete()` double emission, `createHitTestSource()` rejecting through a supposedly nullable helper, engine negative-delta time rollback, or greybox/spatial building scale becoming non-finite.

## Executive summary
- Current smoke tests still pass, but exported AR, engine clock, and greybox spatial helper surfaces have fresh proof gaps.
- ARExperience repeats final completion receipts after terminal state and emits duplicate completion from `complete()`.
- `createHitTestSource()` catches viewer-space failure but not hit-test-source failure, so denied/unsupported hit-test setup can reject through AR startup loops.
- `engine.tick()` accepts finite negative deltas and publishes normal lifecycle/event surfaces with rolled-back elapsed time.
- `createGreyboxBuilding()` and `normalizeBuildingDataset()` store non-finite building scale, which can poison SpatialRoom/render proof geometry.

## Deep bug reports

### 1. ARExperience repeats final completion receipts and `complete()` double-emits
- Severity: medium
- Owner: AR experience terminal receipt idempotency
- Evidence files and line references:
  - `src/ar-experience-kit.js:112-114` emits `ARExperienceCompleted` on every system run while `state.completed` is true.
  - `src/ar-experience-kit.js:145-149` manually sets completed, emits `ARExperienceCompleted`, then ticks immediately, causing the system to emit again.
  - `tests/run-all.mjs` includes no ARExperience terminal idempotency fixture.
- Reproduction path: install a one-step ARExperience, subscribe to `ARExperienceCompleted`, complete the final step, then tick twice; separately call `engine.arExperience.complete()`.
- Probe result: normal action path emitted three completion batches across three ticks; manual `complete()` emitted two completion payloads in one API call/tick.
- Expected behavior: terminal completion should be edge-triggered once per experience completion, with later ticks and manual completion idempotent.
- Actual behavior: terminal state is a standing condition that emits completion every tick, and public `complete()` duplicates its own receipt.
- Why it matters: AR proof pages, telemetry, objective bridges, and reward flows can count one AR completion multiple times.
- Validation needed: ARExperience final-step, manual complete, repeated tick, reset-after-complete, and completion-surface event-count fixtures.
- Suggested fix direction: add a completed-receipt flag or compare incomplete-to-complete transitions before emitting final completion.
- Blocks DSK promotion: yes for AR/tutorial/experience proof receipt integrity.

### 2. `createHitTestSource()` throws when `requestHitTestSource()` rejects
- Severity: medium
- Owner: WebXR hit-test helper failure policy
- Evidence files and line references:
  - `src/ar-session.js:61-75` returns `null` for missing session/viewer-space support, but directly awaits `session.requestHitTestSource(...)` without a catch.
  - `src/ar-session.js:66-69` catches `requestReferenceSpace("viewer")` failures, creating asymmetric failure handling inside the same helper.
- Reproduction path: call `createHitTestSource()` with a session whose `requestReferenceSpace()` succeeds and whose `requestHitTestSource()` rejects.
- Probe result: helper threw `hit-test denied`.
- Expected behavior: a helper that returns `null` for unavailable hit-test prerequisites should also return `null` or a structured failure for rejected hit-test source requests.
- Actual behavior: permission/policy/runtime hit-test failure can reject through caller AR setup.
- Why it matters: WebXR hit-test availability can vary by browser, session mode, device policy, and permission. Public AR proof should degrade or diagnose, not crash a mode loop.
- Validation needed: hit-test helper fixtures for missing method, viewer-space rejection, hit-test-source rejection, no result, and valid pose.
- Suggested fix direction: wrap `requestHitTestSource()` in try/catch and return `null` or a frozen unsupported object with reason details.
- Blocks DSK promotion: promotion-adjacent for WebXR mode reliability and browser proof fallback.

### 3. `engine.tick()` accepts negative deltas and publishes rolled-back time
- Severity: medium
- Owner: engine clock/time policy
- Evidence files and line references:
  - `src/engine.js:168-173` normalizes only non-finite delta values; finite negative deltas are accepted.
  - `src/engine.js:176-183` publishes lifecycle start records with the negative delta and rolled-back elapsed value.
  - `src/engine.js:236-265` publishes normal event/resource/query/lifecycle surfaces after the negative-time scheduler run.
  - `src/engine.js:271-287` also forwards the negative frame event to SequenceNode when enabled.
- Reproduction path: install a probe system that emits clock values, run `engine.tick(1)`, then `engine.tick(-2)`.
- Probe result: engine clock became `{ delta:-2, elapsed:-1, frame:2 }` and event surfaces published that as a normal batch.
- Expected behavior: engine time should be monotonic unless a clearly separate rewind/replay API owns rollback semantics.
- Actual behavior: any caller can move elapsed time backward through the normal tick path.
- Why it matters: schedulers, duration gates, telemetry, sequence timers, AR/browser proof rows, and save/replay systems can receive negative elapsed time as normal runtime truth.
- Validation needed: engine tick fixtures for negative, zero, fractional, non-finite, and large deltas, plus SequenceNode/surface propagation checks.
- Suggested fix direction: reject or clamp negative deltas in `tick()`, or add an explicit rewind API that does not publish normal forward-time surfaces.
- Blocks DSK promotion: yes for deterministic time/proof guarantees.

### 4. Greybox building scale can become `NaN` in SpatialRoom state
- Severity: medium
- Owner: greybox/spatial descriptor config normalization
- Evidence files and line references:
  - `src/greybox-building-kit.js:32` computes `scale: Number(options.scale ?? 1)` without finite fallback.
  - `src/greybox-building-kit.js:67` passes the dataset into `normalizeBuildingDataset()`.
  - `src/spatial-room-kit.js:52` also stores `scale: Number(dataset.scale ?? 1)` without finite fallback.
  - `src/greybox-building-kit.js:70-76` installs the dataset into SpatialRoom via `createSpatialRoomKit()`.
- Reproduction path: call `createGreyboxBuilding({ scale:"huge" })`, then install `createGreyboxBuildingKit({ buildingDataset })` and inspect `SpatialRoomState`.
- Probe result: both the greybox building and installed SpatialRoom state held `scale:NaN`.
- Expected behavior: building scale should be finite, clamped, defaulted, or rejected before entering spatial/render descriptors.
- Actual behavior: non-numeric scale becomes non-finite runtime geometry metadata.
- Why it matters: AR room placement, greybox render descriptors, spatial proofs, and downstream transforms can serialize `NaN` as `null` or break geometry math.
- Validation needed: greybox/spatial fixtures for invalid scale, zero/negative scale, infinite scale, string dimensions, and render descriptor consumption.
- Suggested fix direction: use a finite positive-number normalizer for building scale in both greybox and SpatialRoom normalization.
- Blocks DSK promotion: promotion-adjacent for spatial/AR descriptor proof reliability.

## Domain and kit expansion risks
- AR experience services need terminal receipt idempotency before tutorial/reward/telemetry bridges trust completion events.
- WebXR helpers need consistent nullable or structured failure contracts before browser proof claims can distinguish degraded AR from crashed setup.
- Engine-wide time policy needs monotonic forward-time guarantees before DSK proof harnesses use elapsed time as evidence.
- Spatial descriptor helpers need finite numeric config boundaries before AR/greybox proof routes consume them.

## Cross-cutting risks
- Passing smoke tests does not cover ARExperience final completion event counts, hit-test source rejection, negative engine deltas, or greybox building scale normalization.
- These findings are separate from public module-source blockers; fixing imports would not prove AR experience, hit-test, time, or spatial-scale correctness.
- ObjectiveFlow and SpatialRoom prior bugs are related but not duplicates; this packet covers ARExperience terminal receipt idempotency and greybox building scale specifically.

## Missing validation
- ARExperience completion idempotency fixtures.
- WebXR hit-test helper rejection fixtures.
- Engine monotonic time policy fixtures, including SequenceNode and surface propagation.
- Greybox/SpatialRoom finite scale normalization fixtures.
- Browser proof fixtures that assert degraded AR hit-test setup reports a structured status instead of throwing.

## DSK promotion blockers
- Do not treat ARExperience completion events as reliable proof receipts until terminal idempotency is enforced.
- Do not rely on WebXR hit-test helper success/failure as a stable proof signal until rejection handling is explicit.
- Do not promote elapsed-time-based services while normal `engine.tick()` can publish negative elapsed time.
- Do not use greybox/spatial building scale as proof geometry unless it is finite-normalized.

## Suggested next review item
- In a non-scout lane, add compact fixtures for ARExperience completion event counts, `createHitTestSource()` rejection, negative engine deltas, and greybox/spatial scale normalization.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, DSK hardening, AR launch hardening, SpatialRoom getter isolation, ObjectiveFlow fixes, scheduler failed-tick fixes, or prior bug roots are fixed.
