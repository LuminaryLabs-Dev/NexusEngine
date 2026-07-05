# Deep Bug Report Packet: 2026-06-20T01:55:55-04:00

Timestamp: 2026-06-20T01:55:55-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for composer capability ownership, SequenceNode type/history isolation, and AR launch device-source consistency

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-ar-experience-time-spatial-config`.
- Recent deep packets already cover ARExperience terminal repeat, WebXR hit-test-source rejection, negative engine deltas, non-finite greybox scale, AR launch missing-ARKit preconditions, mutable launcher state, explicit-mode silent fallback, SpatialRoom live getters, AR stop-state drift, camera-overlay partial cleanup, surface snapshot aliasing, renderer descriptor aliasing, DSK partial install, direct non-`n:` dependency bypass, and duplicate direct kit ids.
- Latest ecosystem state/proof packets keep core current and smoke-green, but fetched-ref/public browser proof remains blocked by module-source strategy; proof-signal integrity is separate hardening inventory.
- Latest DSK architecture packets list duplicate provider-token diagnostics and SequenceNode/proof-signal hardening as open fixture inventory, not fixed source behavior.
- Latest domain idea packet avoided adding duplicate distribution/proof ideas and kept module-source/proof-signal rows as planning inventory.
- State packets were context only. Live source, docs, tests, preflight, git refs, and focused probes were authority for this run.

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
- `src/game-kit-composer.js`, `src/runtime-kit.js`, `src/engine.js`, `src/sequence-node-library.js`, `src/sequence-node.js`, `src/ar-device.js`, `src/ar-launcher.js`, `src/ar-modes/camera-overlay.js`, `src/ar-kit.js`, `src/index.js`
- `tests/run-all.mjs`, `tests/domain-service-kit-smoke.mjs`, `tests/sequence-node-runtime-smoke.mjs`, `tests/sequence-node-kit-deploy-smoke.mjs`

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
- Existing-packet duplicate scan for provider tokens, SequenceNode type registration, event-bus history, camera-overlay, AR device classification, and launcher support terms.
- Inline Node probe: duplicate capability providers in composer and `createRealtimeGame()`.
  - Result: two kits with different ids and the same `provides:["cap:x"]` composed and installed together; `hasProvider("cap:x")` returned true with no owner/ambiguity diagnostics.
- Inline Node probe: duplicate SequenceNode type registration.
  - Result: registering type `dup` twice silently replaced title `first` with `second`, and `list()` reported one type.
- Inline Node probe: SequenceNode event bus history mutation.
  - Result: mutating `bus.snapshot().history[0].payload.nested.value` changed the original dispatched event and later history snapshots from `1` to `99`.
- Inline Node probe: AR launch device override versus camera-overlay global navigator.
  - Result: launcher selected `camera-overlay` with support `camera_available` from `options.device`, then `start()` failed `ARSessionState` with `camera_unavailable` because the mode read global `navigator`.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T21-55-21-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover duplicate direct kit ids, DSK install rollback, direct non-`n:` dependency bypass, renderer/surface/descriptor aliasing, disposed SequenceNode mutation, SequenceNode race/any cleanup, AR launch fallback/preconditions, camera cleanup, and AR support live-state mutation.
- DSK architecture packets list duplicate provider diagnostics as missing fixture inventory; no prior deep packet confirmed duplicate capability providers composing and installing together through `createRealtimeGame()`.
- No prior deep packet reported silent duplicate SequenceNode type overwrite, event-bus history mutation through `snapshot()`, or device-override/global-navigator mismatch in AR launch camera selection.

## Executive summary
- Current smoke tests still pass, but composition/proof surfaces have fresh ambiguity and isolation gaps.
- `createGameKitComposer()` rejects duplicate kit ids but allows duplicate capability tokens, so broad DSK graphs can have two providers for one capability with no owner diagnostics.
- `createSequenceNodeLibrary().register()` silently overwrites an existing type definition, so later kits can change node semantics after earlier validation/planning.
- `createSequenceNodeEventBus().snapshot()` returns live event objects, so diagnostics/history readers can mutate proof history.
- AR launch classification can use `options.device`, while camera-overlay mode startup uses global `navigator`, producing contradictory support and session state in deterministic launch/proof harnesses.

## Deep bug reports

### 1. Composer allows duplicate capability providers with no ownership diagnostics
- Severity: medium
- Owner: runtime composer capability registry
- Evidence files and line references:
  - `src/game-kit-composer.js:27-43` validates duplicate kit ids only.
  - `src/game-kit-composer.js:47-75` stores provided tokens in a `Set`, collapsing duplicate provider identity.
  - `src/game-kit-composer.js:80-91` exposes `hasProvider()` but no provider owner list or ambiguity diagnostics.
  - `src/runtime-kit.js:150-157` installs bindings/kits in order without checking duplicate `provides` tokens for non-DSK runtime kits.
- Reproduction path: compose two kits with ids `a` and `b`, both `provides:["cap:x"]`, then create a realtime game from them.
- Probe result: install order was `["a","b"]`, `provides` contained one `cap:x`, `hasProvider("cap:x")` was true, and both kits installed.
- Expected behavior: duplicate capability providers should be rejected or reported with provider ownership and intentional override policy.
- Actual behavior: duplicate capability ownership is silently collapsed to a boolean.
- Why it matters: large ProtoKit/DSK graphs can satisfy dependencies through an ambiguous capability token while both implementations mutate runtime state.
- Validation needed: composer fixtures for duplicate `provides`, intentional override labels, provider owner lookup, and direct-install parity.
- Suggested fix direction: build an indexed provider registry that records token -> provider kit ids and rejects or explicitly marks duplicates.
- Blocks DSK promotion: yes for broad graph dependency diagnostics.

### 2. SequenceNode type registration silently overwrites existing type definitions
- Severity: medium
- Owner: SequenceNode library/type registry
- Evidence files and line references:
  - `src/sequence-node-library.js:73-80` stores types in a `Map` with `types.set(normalized.type, normalized)` and no duplicate guard.
  - `src/runtime-kit.js:186-189` registers kit-provided SequenceNode types during kit install.
- Reproduction path: register two type definitions with `type:"dup"` and different titles.
- Probe result: the second registration replaced the first; `get("dup").title` became `second`, and `list()` returned one `dup` type.
- Expected behavior: duplicate type registration should reject, namespace, or explicitly override with diagnostics.
- Actual behavior: later kits can silently change the meaning of an already-registered node type.
- Why it matters: SequenceNode validation, plans, and runtime behavior can drift when multiple kits contribute common type names.
- Validation needed: duplicate type, duplicate built-in type, same-object reinstall, explicit override, and kit install ordering fixtures.
- Suggested fix direction: reject duplicates by default and add an explicit override flag if type replacement is intended.
- Blocks DSK promotion: promotion-adjacent for SequenceNode-backed DSK orchestration.

### 3. SequenceNode event-bus snapshots expose mutable history events
- Severity: medium
- Owner: SequenceNode diagnostics/read-model isolation
- Evidence files and line references:
  - `src/sequence-node.js:154-157` stores dispatched event objects directly in history.
  - `src/sequence-node.js:203-208` returns the same event object that enters history.
  - `src/sequence-node.js:215-221` snapshot behavior returns `history.slice()` from the same live event object list.
- Reproduction path: dispatch an event with nested payload, read `bus.snapshot().history`, mutate the nested payload, then read another snapshot.
- Probe result: mutating the snapshot history changed the original dispatched event payload and later history snapshots from `1` to `99`.
- Expected behavior: diagnostic snapshots should clone or freeze history entries so readers cannot mutate proof history.
- Actual behavior: history snapshots are a shallow array copy around live mutable event objects.
- Why it matters: proof harnesses, telemetry, and debugging UIs can accidentally change the event history they are inspecting.
- Validation needed: event-bus history cloning/freezing fixtures for payload, meta, returned event, snapshot history, `onAny` listeners, and disposed history.
- Suggested fix direction: clone/freeze remembered events on insert and clone/freeze entries returned by `snapshot()`.
- Blocks DSK promotion: promotion-adjacent for proof/read-model integrity.

### 4. AR launch device override can select camera support but camera-overlay startup reads global navigator
- Severity: medium
- Owner: AR launch deterministic device/runtime source
- Evidence files and line references:
  - `src/ar-device.js:24-73` classifies support from `options.device` overrides.
  - `src/ar-launcher.js:39-50` stores `ARSupportState` from the override-based classification.
  - `src/ar-modes/camera-overlay.js:10-18` checks global `navigator.mediaDevices.getUserMedia` instead of the same classified device/global source.
  - `src/ar-launcher.js:87-98` returns state after mode start without reconciling support state with start failure.
- Reproduction path: create AR launch runtime with `options.device.navigator.mediaDevices.getUserMedia`, no matching global `navigator.mediaDevices`, and preferred mode `camera-overlay`.
- Probe result: selected mode was `camera-overlay`, support said `camera_available`, then `start()` failed session with `camera_unavailable` while support remained `supported:true`.
- Expected behavior: classification and startup should use one device/runtime source, or support should be updated after failed startup.
- Actual behavior: launch support and mode startup can disagree in deterministic harnesses and embedded runtimes.
- Why it matters: browser proof automation and device simulators can report supported camera AR while the selected mode fails immediately.
- Validation needed: AR launch fixtures for override navigator, global navigator, unsupported global, failed start reconciliation, and support/session consistency.
- Suggested fix direction: pass the classified runtime globals into camera-overlay mode or reconcile `ARSupportState` when selected mode startup returns `ok:false`.
- Blocks DSK promotion: promotion-adjacent for AR proof reliability.

## Domain and kit expansion risks
- Large described-example graphs need provider ownership diagnostics before capability tokens become proof of unambiguous service availability.
- SequenceNode-backed kits need duplicate type policy before multiple ProtoKits register orchestration primitives.
- Proof/read-model domains need immutable snapshots for event history, not only ECS surface snapshots.
- AR/device proof needs one runtime-global source so simulator, browser, and embedded harness results stay comparable.

## Cross-cutting risks
- Passing smoke tests does not cover duplicate capability providers, duplicate SequenceNode types, event-bus history isolation, or AR device override/global mismatch.
- These findings are separate from public module-source blockers; fixing public imports would not prove composition ownership or read-model isolation.
- Duplicate provider diagnostics were known as a DSK risk, but this run adds concrete `createRealtimeGame()` installation evidence.

## Missing validation
- Composer provider registry fixtures for duplicate and intentional override behavior.
- SequenceNode type registry duplicate/override fixtures.
- SequenceNode event-bus immutable history/read-model fixtures.
- AR launch support/session consistency fixtures across override and global runtime sources.

## DSK promotion blockers
- Do not treat capability-token presence as unambiguous provider proof until duplicate provider policy is executable.
- Do not allow broad SequenceNode/DSK orchestration graphs to register type names without duplicate/override policy.
- Do not treat SequenceNode event-bus history snapshots as proof-safe until they are clone/freeze isolated.
- Do not use override-based AR launch classification as browser/device proof until startup uses the same runtime source or reconciles support after failure.

## Suggested next review item
- In a non-scout lane, add compact fixtures for composer duplicate providers, SequenceNode duplicate type registration, event-bus snapshot immutability, and AR launch support/session consistency.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, DSK hardening, provider registry hardening, SequenceNode hardening, AR launch hardening, or any prior bug root is fixed.
