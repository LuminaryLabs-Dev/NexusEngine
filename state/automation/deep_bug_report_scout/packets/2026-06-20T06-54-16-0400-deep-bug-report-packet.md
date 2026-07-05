# Deep Bug Report Packet: 2026-06-20T06:54:16-04:00

Timestamp: 2026-06-20T06:54:16-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for procedural/navigation API state ownership

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-20-scheduler-world-mutation-isolation`.
- Recent deep packets already cover scheduler/world mutation isolation, query read-model leaks in several domain kits, Fishing/ReefRescue identity/content boundaries, runtime binding/ECS definition aliasing, SequenceNode install/dispose gaps, AR/spatial launch gaps, surface snapshot aliasing, failed scheduler tick event replay, navigation cost policy, navmesh identity, and procedural signature taxonomy.
- Latest ecosystem state/proof packets keep package/module-source proof, public browser proof, npm metadata, and package-version policy separate from runtime hardening.
- Latest DSK architecture packet treats scheduler/world mutation isolation as tranche 1 runtime hardening and keeps query read-model isolation as separate proof-trust inventory.
- Latest domain idea packet maps scheduler/world mutation evidence into planning inventory, not source authority.
- State packets were context only. Live source, docs, tests, preflight, duplicate scans, and focused probes were authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404
- Current branch: `0.0.2`

## Current branch
- `0.0.2`
- Worktree had pre-existing modified docs/automation trackers and many untracked prior automation artifacts before this run.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/README.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/procedural-kit.js`, `src/pathfinding-kit.js`, `src/navmesh-kit.js`, `src/common-game-definitions.js`, `src/render-descriptor-kit.js`, `src/surfaces.js`, `src/engine.js`
- `tests/run-all.mjs`, `tests/procedural-navigation-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: branch `0.0.2...origin/0.0.2`; pre-existing modified docs/automation trackers and many untracked prior automation artifacts were present.
- Existing-packet duplicate scan for procedural, navigation, `requestPath`, `lastPath`, `NavigationSnapshot`, `ProceduralSnapshot`, snapshot/query live state, and path request ownership.
- Inline Node probe: returned path request and caller-owned endpoint mutation.
  - Result: mutating `engine.navigation.requestPath()` return value and the original `goal` object changed the queued request before the next tick; the path failed against mutated endpoints.
- Inline Node probe: procedural and navigation snapshot liveness.
  - Result: `engine.procedural.snapshot()` and `engine.navigation.snapshot()` returned the live resource object; mutating returned cells/paths changed stored runtime state.
- Inline Node probe: `engine.procedural.regenerate()` returned live state.
  - Result: mutating the returned state set `dirty:false` and changed stored seed before the next tick.

## Existing bug packets checked
- Prior deep packets through `2026-06-20T05-53-01-0400` were scanned to avoid repeating known findings.
- Prior traversal packet `2026-06-19T12-54-22-0400` covers negative path costs, duplicate navmesh identity, procedural signature omission, and physics recovery receipts.
- Prior query read-model packet `2026-06-20T04-54-16-0400` covers RequestFulfillment, CargoManifest, LandmarkGuidance, EnvironmentalAffordance, HazardField, and WaterSurface query leaks.
- This packet does not duplicate those rows. It isolates procedural/navigation control API ownership: queued request aliasing, live procedural/nav snapshots, and live regenerate state mutation.

## Executive summary
- Current smoke tests still pass, but procedural/navigation public APIs expose mutable runtime handles across command, snapshot, and query surfaces.
- `engine.navigation.requestPath()` stores caller-owned `start`/`goal` objects and returns the same queued request object, so callers can mutate pending path work after enqueue.
- `engine.procedural.snapshot()`, `engine.procedural.query().snapshot()`, `engine.navigation.snapshot()`, `engine.navigation.query().snapshot()`, `engine.navigation.query().state()`, and `engine.navigation.query().lastPath()` return live resource objects.
- `engine.procedural.regenerate()` returns the live `ProceduralState`, letting callers change `dirty`, `seed`, or config before the generation system runs.

## Deep bug reports

### 1. `requestPath()` queues caller-owned endpoint objects by reference
- Severity: high
- Owner: navigation command boundary
- Evidence files and line references:
  - `src/pathfinding-kit.js:548-565` builds `next` with `start: request.start` and `goal: request.goal`, appends it to `state.requests`, emits it, and returns it.
  - `src/pathfinding-kit.js:455-466` later reads those queued request objects to build path payloads.
- Reproduction path: call `engine.navigation.requestPath({ start, goal })`, mutate the returned request `start` or the original `goal` object before `engine.tick()`, then tick.
- Probe result: the queued request stored `start:{x:999,y:0}` and `goal:{x:11,y:-999}` after external mutation, then failed as `unreachable-endpoint`.
- Expected behavior: queued command data should be cloned/frozen at enqueue or documented as a mutable handle.
- Actual behavior: callers can change pending navigation work after enqueue without another API call.
- Why it matters: host apps, SequenceNode bridges, replay harnesses, and DSK adapters can corrupt deterministic navigation requests by reusing endpoint objects.
- Validation needed: path request ownership fixtures for returned request mutation, original endpoint mutation, event payload mutation, queued-state mutation, and agent path assignment.
- Suggested fix direction: clone endpoint objects and returned payloads at enqueue, or expose an explicit mutable-request API with cancellation/update semantics.
- Blocks DSK promotion: yes for navigation command determinism and replay-safe request ownership.

### 2. Navigation query and snapshot APIs return live runtime resources
- Severity: medium
- Owner: navigation read-model isolation
- Evidence files and line references:
  - `src/pathfinding-kit.js:388-400` returns `NavigationSnapshot`, `NavigationState`, and `lastPath` directly from resources.
  - `src/pathfinding-kit.js:567-568` exposes `engine.navigation.snapshot()` as the live `NavigationSnapshot`.
  - `src/pathfinding-kit.js:488-507` stores paths, lastPath, and debug graph objects into the same resource later returned to callers.
- Reproduction path: after installing pathfinding, call `const snap = engine.navigation.snapshot(); snap.paths.push({ id:"reader-injected" });`.
- Probe result: the next `engine.navigation.snapshot().paths.at(-1)` returned `{ id:"reader-injected" }`.
- Expected behavior: snapshot/query methods should return isolated proof snapshots or clearly named mutable state handles.
- Actual behavior: read APIs can inject fake path history or mutate `lastPath`/debug graph data.
- Why it matters: proof dashboards, validation harnesses, and browser hosts can accidentally rewrite navigation proof state while only inspecting it.
- Validation needed: navigation read-model fixtures for `snapshot()`, `query().snapshot()`, `query().state()`, `query().lastPath()`, nested path arrays, and debug raw graph arrays.
- Suggested fix direction: deep-clone snapshot/query output and add explicit state mutation methods for intended writes.
- Blocks DSK promotion: promotion-adjacent for navigation proof integrity.

### 3. Procedural snapshots expose live cell and walkability objects
- Severity: medium
- Owner: procedural read-model isolation
- Evidence files and line references:
  - `src/procedural-kit.js:590-591` exposes `engine.procedural.snapshot()` as the live `ProceduralSnapshot`.
  - `src/procedural-kit.js:465-500` returns current snapshot objects through `createProceduralQuery()`.
  - `src/procedural-kit.js:404-440` stores `cells` and `walkability.cells` with shared cell/world objects.
- Reproduction path: call `const snap = engine.procedural.snapshot(); snap.cells[0].walkable = false; snap.walkability.cells[0].material = "mutated-by-reader";`.
- Probe result: later `engine.procedural.snapshot()` returned `cell.walkable:false` and `walkability.cells[0].material:"mutated-by-reader"`.
- Expected behavior: procedural snapshots should be immutable or cloned because they are used as proof and downstream navmesh input.
- Actual behavior: read-only consumers can change generation output and downstream navigation inputs without calling regenerate.
- Why it matters: terrain, navmesh, route, proof, and renderer adapters can corrupt shared generated space state by inspecting or decorating snapshot cells.
- Validation needed: procedural snapshot isolation fixtures for cells, walkability cells, regions, render descriptors, objective markers, and world positions.
- Suggested fix direction: deep-clone/freeze procedural snapshots at resource write or public read boundaries.
- Blocks DSK promotion: promotion-adjacent for generated-world proof and navigation input integrity.

### 4. `regenerate()` returns live mutable procedural state before generation
- Severity: medium
- Owner: procedural command/state boundary
- Evidence files and line references:
  - `src/procedural-kit.js:573-588` mutates `state`, stores it, emits invalidation, and returns the same state object.
  - `src/procedural-kit.js:538-551` generation later trusts `state.dirty`, `state.seed`, and `state.config`.
- Reproduction path: call `const state = engine.procedural.regenerate({ seed:"next" }); state.dirty = false; state.seed = "tampered"; engine.tick();`.
- Probe result: stored `ProceduralState` changed to `dirty:false` and `seed:"tampered"` before generation; the next snapshot used the tampered state.
- Expected behavior: command APIs should return an isolated summary or immutable copy, not the live pending state.
- Actual behavior: callers can cancel or redirect pending procedural generation by mutating a return value.
- Why it matters: editor tools and proof harnesses commonly keep returned command objects for display; this can alter generation state accidentally.
- Validation needed: regenerate return-value fixtures for `dirty`, `seed`, nested `config`, event payload, and same-frame generation.
- Suggested fix direction: return a cloned state summary and keep mutation through `regenerate()` only.
- Blocks DSK promotion: yes for procedural command determinism and reset/snapshot safety.

## Domain and kit expansion risks
- Procedural, navigation, navmesh, route, and terrain DSKs need explicit ownership policy for command payloads and snapshot outputs.
- Fixing path cost or procedural signature taxonomy alone will not make navigation proof state trustworthy if returned snapshots remain live.
- Browser demos and editor UIs are likely to decorate returned snapshots; those decorations currently write into simulation resources.

## Cross-cutting risks
- Passing smoke tests does not cover command payload ownership, returned-state mutation, or nested snapshot isolation.
- These findings are separate from public module-source proof; resolving CDN/package paths would not prove navigation/procedural state ownership.
- These extend but do not duplicate the earlier query read-model root: the affected APIs are procedural/navigation command and proof surfaces.

## Missing validation
- Path request clone/freeze fixtures covering original endpoint objects, returned request objects, event payloads, and queued state.
- Procedural snapshot clone/freeze fixtures covering cells, walkability, render descriptors, regions, objective markers, and world objects.
- Navigation snapshot/query isolation fixtures covering `state()`, `snapshot()`, `lastPath()`, path history, debug graph, and agent path assignment.
- Procedural regenerate return-value fixtures covering `dirty`, seed/config mutation, invalidation event payloads, and same-frame generation.

## DSK promotion blockers
- Do not treat procedural/navigation snapshots as proof-safe until public read APIs isolate returned objects.
- Do not promote navigation/procedural DSK command APIs that retain caller-owned request/config objects without an explicit ownership policy.
- Do not rely on navigation proof history or procedural walkability as immutable evidence while read APIs can mutate them.

## Suggested next review item
- In a non-scout lane, add a compact procedural/navigation ownership fixture set covering request payload cloning, snapshot/query cloning, and regenerate return-value isolation.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, DSK hardening, scheduler/world hardening, query read-model hardening, navigation/procedural hardening, or any prior bug root is fixed.
- Playwright/Human View validation was not run because this deep bug scout had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current browser-visible proof status.
