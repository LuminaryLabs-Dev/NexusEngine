# Deep Bug Report Packet: 2026-06-18T21:52:29-04:00

Timestamp: 2026-06-18T21:52:29-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for NexusRealtime runtime invariants and production risks

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404

## Current branch
- `0.0.2`, tracking `origin/0.0.2`
- `git diff --stat origin/0.0.2...HEAD`: no committed divergence from latest release branch.
- Local worktree already contained modified/untracked automation lane files from prior runs; this pass only wrote inside `state/automation/deep_bug_report_scout/`.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- `state/automation/deep_bug_report_scout/packets/2026-06-18T19-54-00-0400-deep-bug-report-packet.md`
- `state/automation/deep_bug_report_scout/packets/2026-06-18T20-54-00-0400-deep-bug-report-packet.md`
- `state/automation/runtime_bug_scout/master_runtime_bugs.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
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
- `tests/`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` with pre-existing modified/untracked automation files.
- `git branch -r --sort=-committerdate`
  - Result: `origin/0.0.2`, `origin/0.0.1`, `origin/HEAD -> origin/main`, `origin/main`.
- `git diff --stat origin/0.0.2...HEAD`
  - Result: no output.
- `npm test`
  - Result: passed 8 smoke tests.
- Inline Node probe: duplicate runtime kit ids through direct `createEngine({ kits })`.
  - Result: `{ "kitCount": 2, "ids": ["dup-kit","dup-kit"], "installs": 2 }`.
- Inline Node probe: cleanup-phase event emitted by one system and read by next tick input system.
  - Result: `{ "cleanupEventSeen": 0, "remainingEvents": 0 }`.
- Inline Node probe: disposed SequenceNode runtime.
  - Result: after `dispose()`, `frame()` returned a frame event and `mount()` repopulated `roots` while `snapshot().disposed === true`.
- Inline Node probe: renderer factory in non-DOM runtime.
  - Result: `createRenderer("custom-webgl")`, `createRenderer("webgl2")`, `createRenderer("three")`, and `createThreeRenderer()` returned inert `canvas2d` renderers with no canvas; unknown type returned `headless`.

## Existing bug packets checked
- Prior deep packet `2026-06-18T19-54-00-0400`:
  - Avoided duplicates: invalid `deploySequenceNode()` still mutates, TerrainKit cache retention, AR stale session, DSK install atomicity.
- Prior deep packet `2026-06-18T20-54-00-0400`:
  - Avoided duplicates: engine SequenceNode boot order, lifecycle frame duplication, default camera crash, ActionMovementKit killY masking.
- DSK architecture tracker:
  - Known: namespace safety, install rollback, dependency parity, async/serialization contract gaps.
- Runtime bug tracker:
  - Known root branch: DSK contract edge cases.

## Executive summary
- Existing tests still pass, but four additional production risks reproduce through public APIs or direct source-backed probes.
- Highest-impact runtime bug: direct engine kit installation is idempotent only by object identity, so two different kit objects with the same stable `id` both install and can duplicate systems/APIs/resources.
- Scheduler event lifetime is phase-sensitive: events emitted in `cleanup` are cleared after the same tick and cannot be consumed next tick.
- SequenceNode disposal is not a hard lifecycle boundary: disposed runtimes can still mount roots and generate frame events.
- Renderer factory fallbacks can misrepresent requested browser/WebGL rendering in non-DOM or unsupported contexts by returning a canvas2d adapter with no canvas instead of a headless/error result.

## Deep bug reports

### 1. Direct runtime kit install allows duplicate stable kit ids
- Severity: high
- Owner: runtime-kit/composer
- Evidence files and line references:
  - `src/runtime-kit.js:131-133` skips only when `engine.kits.includes(kit)`, which is object-identity based.
  - `src/runtime-kit.js:157` pushes every non-identical kit object into `engine.kits`.
  - `src/game-kit-composer.js:39-40` rejects duplicate ids only when callers use the composer.
  - `src/engine.js:363-364` directly installs `options.kits` without composer duplicate-id protection.
  - `tests/domain-service-kit-smoke.mjs:120-122` covers reinstalling the same kit object and duplicate DSK id, but not two generic runtime kits with the same `id`.
- Reproduction path or likely trigger:
  - Create two `defineRuntimeKit({ id:"dup-kit", install(){...} })` objects.
  - Call `createEngine({ kits:[kitA, kitB] })`.
  - Probe result: both install hooks ran, `engine.kits.length === 2`, and both ids are `dup-kit`.
- Expected behavior:
  - Stable kit ids should be unique per engine install, regardless of object identity.
  - Direct engine install and composer install should enforce the same duplicate-id invariant.
- Actual or suspected behavior:
  - Direct install duplicates systems, resources, bindings, sequence node registrations, or engine APIs when the same logical kit is constructed twice.
- Why it matters for production scaling:
  - Host apps and DSK packages commonly call factory functions repeatedly. Duplicate logical installs can double scheduler work, duplicate event processing, and create hard-to-debug state drift.
- Validation needed:
  - Add an existing-suite-compatible smoke for two generic runtime kit objects with the same `id` installed through `createEngine({ kits })` and `engine.installKit()`.
- Suggested fix direction:
  - Track installed kit ids separately from object identity and reject or skip duplicate ids for all runtime kits.
  - Keep DSK-specific duplicate metadata checks, but make generic kit identity stable by `kit.id`.
- Blocks DSK promotion:
  - Yes. DSK depends on RuntimeKit as the install substrate; promoted domains need stable direct install idempotency.

### 2. Cleanup-phase events are erased before any later system can consume them
- Severity: high
- Owner: ECS/engine
- Evidence files and line references:
  - `src/ecs.js:349-361` runs phases in fixed order through `cleanup`.
  - `src/ecs.js:363-369` drains the journal and then clears all event queues after every tick.
  - `src/engine.js:186-214` only publishes surfaces after scheduler completion.
  - `src/engine.js:236-265` surfaces can observe cleanup-emitted events, but no later ECS phase can read them.
- Reproduction path or likely trigger:
  - Add a cleanup-phase system that emits `LateEvent`.
  - Add an input-phase system that reads `LateEvent`.
  - Tick twice.
  - Probe result: input reader saw `0` events and the event queue was empty after each tick.
- Expected behavior:
  - Either events emitted in terminal phases should survive to the next tick, or the scheduler should document/enforce that cleanup cannot emit ECS-consumable events.
- Actual or suspected behavior:
  - Cleanup events are visible to surfaces/journal only, then erased before any ECS system can react.
- Why it matters for production scaling:
  - Multi-kit systems may emit deferred cleanup, despawn, scoring, completion, or telemetry events at the end of a frame expecting another domain kit to process them next frame.
  - The failure is silent: surfaces show the event, but ECS consumers never see it.
- Validation needed:
  - Add a scheduler smoke that emits from each phase and asserts which phases can consume same-tick or next-tick events.
- Suggested fix direction:
  - Define event lifetime explicitly. Options: disallow cleanup event emission, carry terminal-phase events into the next tick, or add a post-cleanup/deferred-event queue.
- Blocks DSK promotion:
  - Yes for multi-domain DSK promotion, because cross-domain event handoff needs deterministic phase semantics.

### 3. Disposed SequenceNode runtime still accepts mount and frame mutations
- Severity: medium
- Owner: sequence
- Evidence files and line references:
  - `src/sequence-node.js:671` tracks `disposed`.
  - `src/sequence-node.js:909-915` `mount()` does not guard disposed state.
  - `src/sequence-node.js:1072-1074` guards `dispatch()` when disposed.
  - `src/sequence-node.js:1079-1101` `frame()` does not guard disposed state and returns an event.
  - `src/sequence-node.js:1162-1171` `dispose()` clears roots, queues, and marks disposed.
- Reproduction path or likely trigger:
  - `const runtime = createSequenceNodeRuntime(); runtime.dispose(); runtime.frame(); runtime.mount({ id:"x", type:"flow" });`
  - Probe result: `snapshot().disposed === true`, but `roots` and `nodes` contain `x`; `frame()` returned a `sequence.frame` event.
- Expected behavior:
  - After disposal, runtime mutation APIs should be no-ops or throw consistently.
  - Snapshot should not show new mounted nodes after disposal.
- Actual or suspected behavior:
  - Some APIs honor disposed state while others mutate internal roots or enqueue frame work.
- Why it matters for production scaling:
  - Browser hosts, hot reload flows, scene swaps, and long-running automation can dispose runtimes during teardown. Late frame drivers or content mounts can resurrect stale graphs behind a disposed flag.
- Validation needed:
  - Add a lifecycle smoke for `dispose()` followed by `mount`, `frame`, `start`, `complete`, and `addSubscription`.
- Suggested fix direction:
  - Add a central `assertNotDisposed()`/`if (disposed) return null` guard to all mutating public methods, not only `dispatch()`.
- Blocks DSK promotion:
  - Promotion-adjacent. It blocks SequenceNode-backed DSKs that need reliable teardown/restart.

### 4. Renderer factory silently degrades requested WebGL/Three renderer to inert canvas2d in non-DOM contexts
- Severity: medium
- Owner: renderer
- Evidence files and line references:
  - `src/renderers.js:886-893` falls back to `createCanvas2DRenderer()` when no canvas or WebGL2 context is available.
  - `src/renderers.js:783-797` `createCanvas2DRenderer()` can return a `canvas2d` renderer with `canvas:null` and `context:null`.
  - `src/renderers.js:1318-1325` maps `createThreeRenderer()` and `createRenderer("three")` to custom WebGL, then the fallback can become inert canvas2d.
  - `src/renderers.js:1322-1327` unknown renderer types return headless silently.
  - `README.md:15` describes `headless`, `canvas2d`, and `custom-webgl` adapters as distinct renderer types.
- Reproduction path or likely trigger:
  - In Node/non-DOM runtime, call `createRenderer("custom-webgl")`, `createRenderer("webgl2")`, `createRenderer("three")`, or `createThreeRenderer()`.
  - Probe result: all returned `rendererType:"canvas2d"` with no canvas; unknown `createRenderer("bad")` returned `headless`.
- Expected behavior:
  - Requested renderer type should either be created, return a clearly marked fallback (`headless` with reason), or throw/report unsupported renderer.
- Actual or suspected behavior:
  - WebGL/Three requests can appear to succeed with a canvas2d renderer that cannot render, while unknown types silently become headless.
- Why it matters for production scaling:
  - Browser/CDN smoke tests and automation can claim renderer startup while the requested backend never existed.
  - Host apps relying on `rendererType` or backend capability may skip fallback UI or user-visible error states.
- Validation needed:
  - Add an existing browser or Node smoke for renderer factory fallback contracts and unsupported type handling.
- Suggested fix direction:
  - Return `headless` with `fallbackReason`, throw on unknown renderer types, and preserve `requestedRendererType` separately from actual `rendererType`.
- Blocks DSK promotion:
  - No for core DSK. It blocks renderer-backed demo/public proof promotion where visual backend claims matter.

## Cross-cutting risks
- Direct engine install paths and composer paths enforce different invariants.
- Event lifetime is not expressed as a contract, so phase order can silently change behavior between kits.
- Lifecycle `dispose()` is treated as metadata in some APIs and a hard guard in others.
- Renderer fallbacks optimize for non-throwing startup but under-report capability failures.

## Missing validation
- No smoke for duplicate generic runtime kit ids through direct engine install.
- No scheduler smoke for events emitted in each phase and consumed by later/successive phases.
- No SequenceNode dispose lifecycle smoke.
- No renderer factory fallback contract smoke for Node/browser/CDN contexts.
- Existing tests pass, so none of these issues are caught by `npm test`.

## DSK promotion blockers
- Blocking:
  - Duplicate stable runtime kit ids through direct install.
  - Cleanup-phase event erasure for cross-domain event handoff.
- Promotion-adjacent:
  - Disposed SequenceNode runtime mutation for SequenceNode-backed DSK teardown.
  - Renderer fallback mismatch for renderer-backed public proofs, not core DSK contract.
- Still open from prior packets:
  - DSK/runtime install atomicity and rollback.
  - DSK namespace safety.
  - Direct install dependency parity.
  - SequenceNode boot/frame source ordering.

## Suggested next review item
- Review direct engine install invariants as one hardening pass: duplicate kit ids, generic `requires` enforcement, and event lifetime rules should be aligned before DSK promotion.

## Not claimed
- This packet does not fix bugs.
- This packet does not create tests.
- This packet does not claim browser visual rendering was validated with Playwright.
- This packet does not prove npm publication readiness.
- This packet does not validate prior uncommitted automation artifacts outside this lane.
