# Deep Bug Report Packet: 2026-06-20T17:54:14-04:00

Timestamp: 2026-06-20T17:54:14-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for telemetry proof snapshots and operations/input command payload ownership

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-20-procedural-navigation-state-ownership`.
- Recent deep packets already cover procedural/navigation command and snapshot ownership, scheduler/world mutation isolation, query helper read-model leaks, Fishing/ReefRescue boundaries, runtime identity/lifecycle, SequenceNode lifecycle/registry/history, AR launch/spatial gaps, surface snapshot aliasing, failed tick replay, and operations bugs such as RequestQueue reward ordering/defaults, TransportRoute catch-up, Telemetry `historyLimit:0`, Schedule invalid scale, InputIntent held-action repeats, and dataset/reset leakage.
- Latest ecosystem state/proof packets keep public module-source proof, npm metadata, public browser proof, package-version policy, and aggregate-vs-targeted proof separate from runtime hardening.
- Latest DSK architecture packet adds procedural/navigation ownership to the tranche 1 hardening queue after scheduler/world mutation isolation.
- Latest domain idea packet found no new non-duplicative idea family because procedural/navigation ownership, scheduler/world mutation, and proof-readiness rows already exist.
- State packets were context only. Live source, docs, tests, preflight, duplicate scans, and focused probes were authority for this run.

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
- `src/telemetry-kit.js`, `src/request-queue-kit.js`, `src/transport-route-kit.js`, `src/input-intent-kit.js`, `src/scenario-driver-kit.js`, `src/schedule-kit.js`, `src/index.js`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: branch `0.0.2...origin/0.0.2`; pre-existing modified docs/automation trackers and many untracked prior automation artifacts were present.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan for Telemetry, RequestQueue, TransportRoute, InputIntent, command payload ownership, caller-owned metadata, live metadata, and proof snapshot mutation.
- Inline Node probe: Telemetry snapshot selector ownership.
  - Result: mutating a live resource after a telemetry tick changed the previously stored telemetry snapshot value from `1` to `2`; mutating `snapshot.values.probe.list[0].id` changed the live resource list id.
- Inline Node probe: Telemetry path selector ownership.
  - Result: mutating `engine.telemetry.snapshot().values.nested.value` changed the source resource nested value to `99`.
- Inline Node probe: RequestQueue command metadata ownership.
  - Result: mutating the original `request.metadata.nested.value` after `requestQueue.add()` changed stored queue state to `44`; mutating the returned state changed stored queue state to `55`.
- Inline Node probe: TransportRoute command metadata ownership.
  - Result: mutating the original call metadata after `transportRoutes.call()` changed the eventual `lastArrival.metadata.nested.value` to `88`.
- Inline Node probe: InputIntent command metadata ownership.
  - Result: mutating original intent metadata and returned state after `inputIntent.set()` changed stored input snapshot metadata to `88`.

## Existing bug packets checked
- Prior deep packets through `2026-06-20T06-54-16-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover Telemetry `historyLimit:0`, RequestQueue reward ordering/defaultReward, TransportRoute large-delta under-travel, InputIntent held-action repeats, source-config/reset leakage, public query helper aliasing, `world.readEvents()` event payload aliasing, and procedural/navigation command payload ownership.
- This packet does not duplicate those rows. It isolates diagnostic telemetry snapshot aliasing and non-navigation command payload/return-state aliasing in operations/input APIs.

## Executive summary
- Current smoke tests still pass, but Telemetry proof snapshots are not snapshots when selectors read object resources or nested object paths.
- `createTelemetryKit()` stores live selected resource objects in `lastSnapshot` and `snapshots`, so later resource mutations rewrite old evidence and snapshot mutations can write back into runtime resources.
- `RequestQueue.add()` and `TransportRoute.call()` normalize command metadata by reference, so caller-owned metadata can mutate queued work and later arrival/fulfillment proof after the command boundary.
- `InputIntent.set()` keeps caller-owned metadata in runtime state and returns the live stored state, so a host can mutate normalized input state after submission without another input command.

## Deep bug reports

### 1. Telemetry snapshots retain live resource objects instead of proof snapshots
- Severity: high
- Owner: telemetry proof snapshot isolation
- Evidence files and line references:
  - `src/telemetry-kit.js:21-33` builds `values` by assigning selected resource/path values directly.
  - `src/telemetry-kit.js:47-52` stores that object in `lastSnapshot` and `snapshots` during cleanup.
  - `src/telemetry-kit.js:64-72` returns and stores the same direct-value snapshot from the manual API.
- Reproduction path: install TelemetryKit with a selector for a resource object, tick once, mutate the source resource, then inspect the prior telemetry snapshot.
- Probe result: the prior telemetry snapshot reflected the later resource mutation (`nested.value` became `2`), and mutating `snapshot.values.probe.list[0].id` changed the live resource.
- Expected behavior: telemetry history should record immutable/cloned proof values for the frame it captured.
- Actual behavior: telemetry history can be rewritten by later resource mutations or by consumers mutating returned snapshots.
- Why it matters: telemetry is used as validation/proof evidence; live references make historical evidence mutable.
- Validation needed: telemetry fixtures for whole-resource selectors, manual `snapshot()`, system-generated snapshots, nested arrays, and snapshot mutation back into source resources.
- Suggested fix direction: structured-clone selected values before storing and before returning manual snapshots.
- Blocks DSK promotion: yes for proof-signal integrity and auditability.

### 2. Telemetry path selectors expose nested live resource objects
- Severity: medium
- Owner: telemetry selector path ownership
- Evidence files and line references:
  - `src/telemetry-kit.js:6-10` resolves a selector path by returning the nested object directly.
  - `src/telemetry-kit.js:26-28` assigns the path result into snapshot values without cloning.
- Reproduction path: create a resource `{ nested:{ value:10 } }`, call `engine.telemetry.snapshot([{ id:"nested", resource, path:"nested" }])`, then mutate `snapshot.values.nested.value`.
- Probe result: the source resource nested value changed to `99`.
- Expected behavior: selecting a nested path should produce a read snapshot, not a mutable handle into the resource.
- Actual behavior: telemetry path selectors can mutate live resources through the returned snapshot.
- Why it matters: validation dashboards often select nested status objects; a diagnostic read can become a runtime write.
- Validation needed: telemetry path fixtures for nested objects, arrays, primitives, missing paths, and mutation attempts.
- Suggested fix direction: clone selected path values, and consider freezing telemetry snapshots when used as proof records.
- Blocks DSK promotion: promotion-adjacent for telemetry selectors and proof-signal integrity.

### 3. RequestQueue and TransportRoute command metadata remains caller-owned after command submission
- Severity: medium
- Owner: operations command payload ownership
- Evidence files and line references:
  - `src/request-queue-kit.js:13-24` normalizes requests but keeps `metadata`, `reward`, and `penalty` by reference.
  - `src/request-queue-kit.js:76-78` pushes normalized queued requests from live event payloads.
  - `src/request-queue-kit.js:139-147` emits caller payloads, ticks immediately, and returns live queue state.
  - `src/transport-route-kit.js:44-51` pushes waiting calls with caller-owned `metadata`.
  - `src/transport-route-kit.js:83-85` carries the same metadata into `lastArrival` and emitted arrival events.
  - `src/transport-route-kit.js:110-113` emits caller payloads, ticks immediately, and returns live route state.
- Reproduction path: submit a request/call with nested metadata, mutate the original metadata object after the command returns, then inspect queue state or the later transport arrival.
- Probe result: RequestQueue stored metadata changed to `44` after original object mutation and to `55` after mutating returned state; TransportRoute `lastArrival.metadata.nested.value` changed to `88` after original call metadata mutation.
- Expected behavior: command submission should clone/freeze command metadata at the boundary, or explicitly expose a mutable handle with update semantics.
- Actual behavior: operations commands keep caller-owned nested metadata alive in runtime state and later proof receipts.
- Why it matters: queue, transit, service, and city-sim DSKs depend on replay-safe command boundaries; hosts often reuse request objects for UI state.
- Validation needed: operations command ownership fixtures for request add/fulfill, transport call/arrival, reward/penalty metadata, returned state mutation, and event payload isolation.
- Suggested fix direction: clone command payloads and return snapshots or explicit mutable handles instead of live state.
- Blocks DSK promotion: yes for operations/logistics command determinism.

### 4. InputIntent retains caller-owned metadata and returns live input state
- Severity: medium
- Owner: input command payload ownership
- Evidence files and line references:
  - `src/input-intent-kit.js:13-23` normalizes intent but keeps `metadata` by reference.
  - `src/input-intent-kit.js:50-64` stores the normalized intent, emits it, and returns the same live state object.
  - `src/input-intent-kit.js:70-72` only the separate `snapshot()` API clones state.
- Reproduction path: call `engine.inputIntent.set(intent)`, mutate the original `intent.metadata` or the returned `state.intent.metadata`, then inspect `engine.inputIntent.snapshot()`.
- Probe result: stored input metadata changed to `88` after mutating the returned state; original intent metadata mutation also shared the same object.
- Expected behavior: an input submission should capture the normalized input frame, not keep mutable references to host input objects.
- Actual behavior: caller-owned metadata and returned live state can rewrite the current input frame after submission.
- Why it matters: per-frame input, replay, automation, and SequenceNode bridges need input frames to be immutable evidence for that frame.
- Validation needed: InputIntent fixtures for metadata clone/freeze, returned state mutation, event payload mutation, and press/hold edge separation.
- Suggested fix direction: structured-clone metadata/payload at `set()` and return a cloned state summary, keeping mutation paths explicit.
- Blocks DSK promotion: promotion-adjacent for input/replay proof.

## Domain and kit expansion risks
- Telemetry cannot be treated as release proof while old snapshots are aliases to live resources.
- Command payload isolation should be generalized beyond procedural/navigation into operations, transport, input, and future DSK service commands.
- `getState()` or command methods returning live state should be explicitly separated from proof-safe `snapshot()` APIs.
- Metadata-heavy domain kits need a consistent rule for command payload cloning, event payload cloning, returned state cloning, and source config cloning.

## Cross-cutting risks
- Passing smoke tests does not cover telemetry history mutation or post-command caller-owned metadata mutation.
- This does not replace earlier source-config/reset leakage. This packet targets command submissions and proof snapshots after runtime APIs are called.
- This does not fix public module-source proof; package/import and public browser blockers remain separate.

## Missing validation
- Telemetry proof snapshot clone/freeze fixtures for whole resources, nested paths, manual snapshots, cleanup snapshots, and history mutation.
- RequestQueue and TransportRoute command payload ownership fixtures for original object mutation, returned state mutation, metadata mutation, event payload mutation, and replay determinism.
- InputIntent command ownership fixtures for normalized metadata, returned state, payload/event aliasing, and per-frame immutable input snapshots.
- A cross-kit command-boundary fixture pattern for DSK candidates.

## DSK promotion blockers
- Do not treat TelemetryKit as proof-safe while snapshots can be rewritten through live resource aliases.
- Do not promote operations/logistics command APIs as replay-safe while caller-owned metadata mutates queued work or arrival receipts after submission.
- Do not use InputIntent frames as deterministic replay evidence until submitted intent metadata and returned state are isolated.

## Suggested next review item
- In a non-scout lane, add one command/proof ownership fixture set covering Telemetry selected-value cloning, RequestQueue/TransportRoute command metadata cloning, and InputIntent submitted-frame cloning.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, DSK hardening, telemetry hardening, operations command hardening, input hardening, query read-model hardening, procedural/navigation hardening, or any prior bug root is fixed.
- Playwright/Human View validation was not run because this deep bug scout had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current browser-visible proof status.
