# Deep Bug Report Packet: 2026-06-19T15:53:59-04:00

Timestamp: 2026-06-19T15:53:59-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine locomotion receipts, terrain chunking, and AR lifecycle cleanup

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-presentation-ar-content-control`.
- Recent deep packets already cover DSK install/scheduler failure boundaries, navigation/procedural/physics integrity, AR launch fallback after WebXR start failure, Realism/Fishing edge contracts, CharacterRagdoll repeated receipts, ActionMovement killY masking, terrain cache retention, renderer fallback mismatch, AR failed-state stale sessions, and data/idempotency bugs.
- Latest ecosystem state/proof packets say core remains latest-ref aligned and local proof is green, while public browser proof, npm metadata, sibling fetched-ref proof, and module-source strategy remain separate blockers.
- Latest DSK architecture and domain idea packets map failure-boundary and experience-edge rows into planning inventory, not source authority.
- These packets were context only. Live source, docs, tests, preflight, and inline probes were authority for this run.

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
- Worktree had pre-existing modified/untracked automation and planning files before this run.
- This lane wrote only this packet, its knowledge node, and the lane master tracker update.

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
- `state/automation/deep_bug_report_scout/PROMPT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/action-movement-kit.js`
- `src/terrain-kit.js`
- `src/ar-launcher.js`
- `src/ar-kit.js`
- `src/ar-modes/camera-overlay.js`
- `src/ar-modes/fallback-preview.js`
- `src/ar-modes/page-marker.js`
- `src/ar-modes/webxr-plane.js`
- `src/ar-renderer.js`
- `src/ar-session.js`
- `src/ar-device.js`
- `src/reef-rescue-kit.js`
- `src/greybox-building-kit.js`
- `src/character-camera-kit.js`
- `src/sequence-node.js`
- `src/sequence-node-library.js`
- `src/renderers.js`
- `tests/run-all.mjs`

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
- Existing-packet duplicate scan for `action-glide-started`, `spline`, `camera-overlay`, AR stop/session, held glide, stream leak, and terrain carve terms.
- Inline Node probe: held airborne glide input in ActionMovement.
  - Result: 5 ticks with `input.glide:true` while airborne emitted 5 `action-glide-started` events.
- Inline Node probe: far terrain spline carve chunk.
  - Result: before chunk bake, query fallback at `(100,-2.6)` returned `-20`; after baking chunk `10,-1`, the chunk signature had `layers:[]` and `heightAt(100,-2.6)` returned `0`.
- Inline Node probe: camera-overlay start failure after media acquisition.
  - Result: mocked `getUserMedia()` returned a stream, forced `engine.ar.startSession()` to throw, `mode.start()` returned `{ ok:false, reason:"camera_request_failed" }`, but `mode.stream` still held the stream and no track was stopped.
- Inline Node probe: AR launch runtime stop after camera-overlay start.
  - Result: `mode.stop()` stopped one track, but `ARSessionState` stayed `{ status:"running", mode:"camera-overlay", session:<stream>, error:null }`.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T14-54-04-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover ActionMovement killY masking, terrain cache retention, AR failed-state stale sessions, and AR launch no fallback after WebXR request failure.
- No prior deep packet reported held airborne glide producing repeated `GlideStarted` events, spline carve layers being omitted from far baked chunks, camera-overlay partial-start stream retention, or AR launch stop leaving session state running.

## Executive summary
- Current smoke tests still pass, but locomotion, terrain, and AR lifecycle surfaces have fresh edge failures.
- Highest-impact world-building bug: terrain spline carve layers are culled by a single fake center point, so far shoreline/path chunks can bake without the carve that query fallback applies.
- ActionMovement treats held glide as a start event every airborne tick, so proof/objective consumers can overcount one glide as many starts.
- Camera-overlay AR can acquire a stream, then report start failure without stopping the stream when a later engine step throws.
- AR launch runtime `stop()` stops the mode but leaves `ARSessionState` as `running` with the old session handle.

## Deep bug reports

### 1. ActionMovement emits `GlideStarted` every held airborne tick
- Severity: medium
- Owner: locomotion/control receipt semantics
- Evidence files and line references:
  - `src/action-movement-kit.js:109-116` defines `GlideStarted` as an event receipt.
  - `src/action-movement-kit.js:230-231` sets `player.isGliding` directly from held input while airborne.
  - `src/action-movement-kit.js:249-250` emits `GlideStarted` on every tick where `input.glide` is true and the player is not grounded.
- Reproduction path: install `createActionMovementKit({ gravity:0 })`, set the player airborne, hold `input.glide=true`, subscribe to `GlideStarted`, and tick 5 times.
- Probe result: 5 ticks emitted 5 `action-glide-started` events while the player stayed airborne and `isGliding:true`.
- Expected behavior: a `Started` receipt should emit only on false-to-true glide transition, or be renamed/documented as a held-glide signal.
- Actual behavior: held input creates one start receipt per tick.
- Why it matters: tutorials, objectives, analytics, SequenceNode bridges, and replay proof can count one glide as many starts.
- Validation needed: locomotion smokes for jump/dash/glide edge-triggered receipts versus held-state signals.
- Suggested fix direction: track previous gliding state and emit `GlideStarted` only on transition, with a separate persistent state field for held glide.
- Blocks DSK promotion: promotion-adjacent for locomotion/control domains.

### 2. Terrain spline carve layers are omitted from far baked chunks
- Severity: high
- Owner: terrain chunk layer culling and query parity
- Evidence files and line references:
  - `src/terrain-kit.js:303-312` approximates every non-circle/non-box carve layer as centered at `{ x:0, z:config.shorelineZ }`.
  - `src/terrain-kit.js:334-338` can correctly apply spline carve distance to arbitrary points once the layer is included.
  - `src/terrain-kit.js:548-554` filters chunk layers through `layerAffectsChunk()` and then uses the filtered layer list in the chunk signature.
  - `src/terrain-kit.js:621-642` shows path/feature containment uses true segment distance elsewhere, so the runtime already has segment-distance semantics available.
- Reproduction path: create a terrain with a spline carve from `{x:-150,z:-2.6}` to `{x:150,z:-2.6}`, focus on chunk `10,-1`, and compare query fallback before bake with `heightAt()` after bake.
- Probe result: pre-bake query fallback returned `-20`; the baked chunk signature had `layers:[]`; post-bake `heightAt(100,-2.6)` returned `0`.
- Expected behavior: spline carve influence should be tested against the spline path/points, or long spline layers should be included in all intersecting chunks.
- Actual behavior: far chunks along the same spline are treated as unaffected and bake without the carve.
- Why it matters: streaming shorelines, paths, rivers, trenches, roads, and authored traversal routes can change shape depending on whether a chunk is loaded, breaking terrain proof and player-visible continuity.
- Validation needed: terrain smokes for spline/path carve chunks at origin, far positive/negative x, far positive/negative z, and query fallback versus baked chunk parity.
- Suggested fix direction: make `layerAffectsChunk()` compute distance from chunk bounds to spline segments or conservatively include spline carve layers.
- Blocks DSK promotion: yes for terrain/streaming/world-space DSK promotion.

### 3. Camera-overlay start failure can retain an acquired media stream
- Severity: medium
- Owner: AR camera-overlay cleanup
- Evidence files and line references:
  - `src/ar-modes/camera-overlay.js:16-20` stores the acquired `getUserMedia()` stream before later engine-side setup.
  - `src/ar-modes/camera-overlay.js:29-33` performs engine/session/objective side effects inside the same `try` after media acquisition.
  - `src/ar-modes/camera-overlay.js:35-37` catches later failures and returns `camera_request_failed` without stopping tracks or clearing `stream`.
  - `src/ar-modes/camera-overlay.js:40-44` only stops retained tracks when `stop()` is called later.
- Reproduction path: mock `getUserMedia()` to return a stream, force `engine.ar.startSession()` to throw, then call `createCameraOverlayMode().start({ engine })`.
- Probe result: `start()` returned failure, but `mode.stream` still referenced the acquired stream and no track was stopped.
- Expected behavior: partial start failure after media acquisition should stop tracks and clear the retained stream before returning failure.
- Actual behavior: a failed launch can keep camera hardware/live stream ownership until someone calls `stop()` on a mode that appears not to have started.
- Why it matters: mobile browser AR proof can leave camera resources active after a failed setup path, affecting retry, privacy indicators, battery, and user trust.
- Validation needed: camera-overlay fixtures for media unavailable, media acquired then engine failure, video play failure, session start failure, and retry after failure.
- Suggested fix direction: split media acquisition from engine setup and clean up `stream` in the catch path when `ok:false`.
- Blocks DSK promotion: yes for AR launch/runtime proof reliability.

### 4. AR launch runtime `stop()` leaves `ARSessionState` running with the old session
- Severity: medium
- Owner: AR launch lifecycle state
- Evidence files and line references:
  - `src/ar-launcher.js:131-133` calls `mode.stop()` and returns true without updating AR ECS state.
  - `src/ar-kit.js:69-77` sets `ARSessionState.status` to `running` and stores the session on start.
  - `src/ar-kit.js:80-86` has failure handling, but there is no stop/ended event path that clears a successful session.
- Reproduction path: create an engine with `createARKit()`, launch camera-overlay with mocked `getUserMedia()`, then call `runtime.stop()` and inspect `ARSessionState`.
- Probe result: one media track was stopped, but session state remained `status:"running"`, `mode:"camera-overlay"`, and `session:<stream>`.
- Expected behavior: stopping the launch runtime should transition session state to stopped/idle/ended and clear the session handle.
- Actual behavior: ECS state still claims AR is running after mode cleanup.
- Why it matters: retry buttons, overlays, lifecycle surfaces, analytics, and proof harnesses can believe AR is active after the mode stopped.
- Validation needed: AR launch stop fixtures for WebXR, camera-overlay, page-marker, fallback-preview, double stop, and restart after stop.
- Suggested fix direction: add an AR session ended/stopped event or explicit state mutation during `runtime.stop()`, and clear active stream/session references.
- Blocks DSK promotion: promotion-adjacent for AR lifecycle domains.

## Domain and kit expansion risks
- Locomotion/control services need a shared edge-versus-held receipt contract.
- Terrain streaming services need query/baked-chunk parity for long-authored spline and route layers.
- AR camera services need partial-start cleanup semantics before retry/fallback proof can be trusted.
- AR lifecycle services need explicit stop/end state, not just mode-local track cleanup.

## Cross-cutting risks
- Passing smoke tests does not cover held-input receipt counts, far streamed terrain chunks, partial camera startup failures, or post-stop ECS session state.
- Public browser proof blockers remain separate from these runtime issues; a page can load and still fail lifecycle cleanup.
- Prior AR failed-state stale-session findings remain related but distinct: this packet adds successful-start stop state and partial-start media cleanup.

## Missing validation
- ActionMovement glide receipt transition fixtures.
- Terrain spline/path carve culling fixtures across far chunks.
- Terrain query fallback versus baked chunk parity fixtures.
- Camera-overlay partial-start cleanup fixtures.
- AR launch stop/end state fixtures.

## DSK promotion blockers
- Terrain/streaming DSKs should not be promoted broadly until long spline/path layers affect every intersecting chunk.
- Locomotion/control DSKs need receipt semantics for held inputs before objective/telemetry use.
- AR launch/runtime DSKs need partial-start cleanup and explicit stop/end state before production proof.

## Suggested next review item
- In a non-scout lane, add a compact edge fixture set covering held glide receipts, far spline terrain carve parity, camera-overlay partial-start cleanup, and AR launch stop state.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, terrain cache cleanup, AR fallback iteration, or prior bug roots are fixed.
