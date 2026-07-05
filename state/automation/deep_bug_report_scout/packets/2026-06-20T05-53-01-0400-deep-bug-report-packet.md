# Deep Bug Report Packet: 2026-06-20T05:53:01-04:00

Timestamp: 2026-06-20T05:53:01-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for scheduler/world mutation isolation in the ECS core

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-20-query-read-model-isolation`.
- Recent deep packets already cover query read-model leaks, Fishing/ReefRescue identity/content boundaries, runtime binding and ECS definition aliasing, SequenceNode install/dispose gaps, registry/surface snapshot aliasing, failed scheduler tick event replay, and DSK partial install rollback.
- Latest ecosystem state/proof packets keep module-source/public proof blocked separately from local runtime hardening.
- Latest DSK architecture packet keeps runtime failure-boundary first and query read-model isolation as later inventory.
- Latest domain idea packet maps query isolation into planning docs, not source authority.
- State packets were context only. Live source, docs, tests, preflight, git refs, duplicate scans, and focused probes were authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404
- Current `HEAD` and `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`

## Current branch
- `0.0.2`
- Worktree had pre-existing modified docs/automation trackers and many untracked prior automation artifacts before this run.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/ecs.js`, `src/engine.js`, `src/runtime-kit.js`, `src/domain-service-kit.js`, `src/common-game-definitions.js`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short`
  - Result: pre-existing modified docs/automation trackers and untracked prior automation artifacts were present.
- `git branch --show-current`
  - Result: `0.0.2`.
- `git ls-remote --heads origin`
  - Result: remote release branches include `0.0.1` and `0.0.2`; `0.0.2` is latest.
- Existing-packet duplicate scan for dynamic scheduler mutation, active phase mutation, `runSystem` stale entity iteration, `readEvents`, event payload mutation, and world API mutation.
- Inline Node probe: dynamic scheduler mutation.
  - Result: adding a system to the active phase during `scheduler.run()` executed that system in the same run; adding a new phase and system during `simulate` executed the new phase in the same run.
- Inline Node probe: `world.runSystem()` entity removal.
  - Result: an entity removed by an earlier handler was still passed to the same `runSystem()` handler later with missing component arguments.
- Inline Node probe: `world.readEvents()` payload isolation.
  - Result: mutating an object returned by `readEvents()` changed the queued event payload and the original emitted object.

## Existing bug packets checked
- Prior deep packets through `2026-06-20T04-54-16-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover failed tick event replay, surface snapshot mutation of resource/event payloads, query helper live-object mutation, and ECS definition-name aliasing.
- No prior deep packet isolated active scheduler graph mutation during `run()`, same-pass phase addition, `runSystem()` stale removed-entity iteration, or low-level `world.readEvents()` live payload mutation.

## Executive summary
- Current smoke tests still pass, but the ECS core lets scheduler and world read APIs mutate proof state during supposedly bounded simulation passes.
- `createScheduler().run()` iterates live `phases` and live phase system arrays, so systems and phases added during a pass can execute in that same pass.
- `world.runSystem()` snapshots matching entity ids once, then reads component stores later; if an earlier handler removes a later entity, the removed entity still reaches the handler with `undefined` component values.
- `world.readEvents()` returns a shallow queue copy, so callers can mutate queued payload objects before later systems or diagnostics read them.

## Deep bug reports

### 1. Systems added to the active scheduler phase execute in the same pass
- Severity: high
- Owner: scheduler mutation boundary
- Evidence files and line references:
  - `src/ecs.js:331-341` appends systems directly into the phase array.
  - `src/ecs.js:349-356` iterates the live phase array during `run()`.
- Reproduction path: a `simulate` system calls `scheduler.addSystem("simulate", addedSystem)` while `scheduler.run(world)` is iterating `simulate`.
- Probe result: the newly added `addedSystem` ran during that same scheduler pass.
- Expected behavior: scheduler topology changes made during a pass should apply next tick or be rejected while running.
- Actual behavior: active phase arrays are live and append-visible to the current iterator.
- Why it matters: runtime kits, DSK installers, or proof adapters that attach systems during an active tick can change same-tick ordering, replay side effects, or accidentally create unbounded loops.
- Validation needed: scheduler mutation fixtures for same-phase add, later-phase add, self-add, duplicate add, and explicit next-tick application policy.
- Suggested fix direction: snapshot `systemsByPhase.get(phaseName)` before iteration or add an active-run guard that queues mutations until the next pass.
- Blocks DSK promotion: yes for scheduler determinism and install/runtime boundary proof.

### 2. Phases added during `scheduler.run()` can execute in the same run
- Severity: high
- Owner: scheduler phase topology
- Evidence files and line references:
  - `src/ecs.js:315-325` appends new phase names directly into `phases`.
  - `src/ecs.js:349-361` iterates the live `phases` array.
- Reproduction path: a `simulate` system calls `scheduler.addPhase("late")` and then `scheduler.addSystem("late", lateSystem)` during `scheduler.run(world)`.
- Probe result: `lateSystem` executed in the same scheduler run after `simulate`.
- Expected behavior: phase topology should be stable for the duration of one scheduler pass.
- Actual behavior: a pass can gain new phases while it is running.
- Why it matters: DSK graphs can change execution topology mid-frame, which makes phase ordering, lifecycle surfaces, and deterministic replay harder to reason about.
- Validation needed: phase mutation fixtures for add during current pass, add in final phase, duplicate phase, and lifecycle start/end event ordering.
- Suggested fix direction: snapshot `phases` at run start or reject `addPhase()` while running unless the behavior is explicitly documented as immediate.
- Blocks DSK promotion: yes for deterministic scheduler topology.

### 3. `world.runSystem()` can call handlers for entities removed earlier in the same iteration
- Severity: medium
- Owner: ECS query iteration safety
- Evidence files and line references:
  - `src/ecs.js:272-279` builds a query result from current entities and component presence.
  - `src/ecs.js:291-294` iterates that entity list and fetches component values without rechecking entity/component presence.
  - `src/ecs.js:142-164` removes entities and their component rows immediately.
- Reproduction path: create two entities matching `[Position, Flag]`; the first handler removes the second entity; continue the same `runSystem()` pass.
- Probe result: the second removed entity still reached the handler with `position` and `flag` omitted/undefined.
- Expected behavior: removed entities should be skipped, or `runSystem()` should provide a documented stable snapshot of component values from query time.
- Actual behavior: entity ids are snapshotted, component values are live-read later, producing a dead-entity handler call with missing data.
- Why it matters: cleanup, collision, death, despawn, transfer, and objective systems can process already-removed entities in the same tick.
- Validation needed: `runSystem()` fixtures for entity removal, component removal, resource mutation, handler ordering, and stable-snapshot versus live-skip policy.
- Suggested fix direction: recheck each entity still has every component before invoking the handler, or snapshot component values with the query result.
- Blocks DSK promotion: promotion-adjacent for ECS state isolation and same-tick cleanup determinism.

### 4. `world.readEvents()` exposes live queued payload objects
- Severity: medium
- Owner: ECS event queue read-model isolation
- Evidence files and line references:
  - `src/ecs.js:251-255` pushes the original payload object into the event queue and journal.
  - `src/ecs.js:258-260` returns `ensureEventQueue(event).slice()`, cloning only the array.
- Reproduction path: emit an event with nested metadata, call `world.readEvents(Event)`, mutate the returned payload object, then call `world.readEvents(Event)` again.
- Probe result: the second read and the original emitted payload both reflected the mutation.
- Expected behavior: read APIs should either return immutable/cloned event payload snapshots or clearly name themselves as mutable handles.
- Actual behavior: read-only event inspection can alter queued events before later consumers or diagnostics inspect them.
- Why it matters: ECS systems, SequenceNode bridges, and proof probes can corrupt same-tick events while only inspecting queue state.
- Validation needed: event queue isolation fixtures for `emit`, `readEvents`, scheduler consumers, journal payloads, and surface publication boundaries.
- Suggested fix direction: clone/freeze payloads on emit or read, or add a separate explicit mutable event-handle API.
- Blocks DSK promotion: promotion-adjacent for event handoff and proof-signal integrity.

## Domain and kit expansion risks
- Scheduler topology needs an explicit mutation policy before broad DSK graphs can install or attach systems during active runtime.
- ECS query iteration should define whether systems operate on stable component snapshots or live membership.
- Event queue reads should be treated as proof snapshots only after payload isolation policy is executable.
- These findings sit below individual kits; fixing one kit will not protect all DSK/proof graphs.

## Cross-cutting risks
- Passing smoke tests does not cover scheduler graph mutation during `run()`, removed-entity iteration, or low-level event queue mutation.
- These are separate from public module-source proof; package/import fixes would not prove scheduler determinism.
- These extend but do not duplicate prior surface snapshot findings: this packet targets core `world.readEvents()` before surface publication.

## Missing validation
- Scheduler active-run mutation fixtures for system addition, phase addition, self-addition, duplicate addition, and deferred topology application.
- `runSystem()` stale membership fixtures for entity removal and component removal during iteration.
- Event queue clone/freeze fixtures for `readEvents()` and scheduler handoff.
- Lifecycle surface fixtures that confirm dynamic phases do not emit unexpected same-run lifecycle records.

## DSK promotion blockers
- Do not treat scheduler phase/system topology as deterministic while active-run mutations can execute immediately.
- Do not promote DSK install/runtime graphs that attach systems during a tick until scheduler mutation policy is explicit.
- Do not use low-level event queue reads as proof evidence until returned payloads are isolated or documented as mutable.

## Suggested next review item
- In a non-scout lane, add a compact scheduler/world boundary fixture set covering active-run scheduler mutation, `runSystem()` entity/component removal, and `readEvents()` payload isolation.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, DSK hardening, scheduler hardening, event queue hardening, ECS iteration hardening, or any prior bug root is fixed.
