# Deep Bug Report Packet: 2026-06-19T18:55:33-04:00

Timestamp: 2026-06-19T18:55:33-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine registry/surface isolation and SequenceNode sibling lifecycle receipts

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-guidance-affordance-route-query`.
- Recent deep packets already cover DSK install/scheduler failure boundaries, SequenceNode invalid deployment/disposed mutation/frame-driver duplication, terrain/AR lifecycle cleanup, query/command semantics, data/reset leaks, repeated receipts, navigation/procedural/physics invariants, and renderer fallback mismatch.
- Latest ecosystem state/proof packets keep public module-source strategy, fetched-ref proof, browser proof, npm metadata, aggregate proof, and package-version policy separate from runtime hardening.
- Latest DSK architecture/domain idea packets keep runtime failure-boundary, lifecycle parity, query/command semantics, experience-edge, and proof-readiness queueing as separate hardening tranches.
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
- Worktree had pre-existing modified/untracked automation and planning files before this run.
- This lane wrote only this packet, its knowledge node, and the lane master tracker update.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/shaders.js`, `src/surfaces.js`, `src/engine.js`, `src/ecs.js`, `src/runtime-kit.js`, `src/sequence-node.js`, `src/sequence-node-library.js`, `src/sequence-node-kit.js`, `src/sequences.js`, `src/game-kit-composer.js`, `src/domain-service-kit.js`
- `tests/run-all.mjs`, `tests/procedural-navigation-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- Existing-packet duplicate scan for shader/material registries, surface snapshots, SequenceNode race/any sibling behavior, and surface/history aliasing.
- Inline Node probe: shader program uniform aliasing.
  - Result: mutating `programInfo.uniforms.cfg.value.nested` changed both the caller-owned uniform object and registry descriptor.
- Inline Node probe: material registry descriptor aliasing.
  - Result: mutating `registry.get("mat").metadata.tags` and `registry.list()[0].color.tint` changed caller-owned material config.
- Inline Node probe: resource/event surface snapshot aliasing.
  - Result: mutating `resourceSurface.snapshot()[0].value` changed live world resource state; mutating `eventSurface.snapshot()[0].payload` changed the original emitted payload object.
- Inline Node probe: SequenceNode race failure.
  - Result: after `runtime.fail("loser-a")`, race parent became `failed` while sibling `loser-b` stayed `running`.
- Inline Node probe: SequenceNode any winner.
  - Result: completing one child finished the parent and skipped the sibling, but emitted two `sequence.child.finished` receipts for the same parent.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T16-54-05-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover invalid SequenceNode deployment side effects, disposed SequenceNode runtime mutation, lifecycle surface frame duplication, DSK partial install/scheduler failure replay, renderer fallback mismatch, route query live-object mutation, and many domain-kit receipt/reset/id bugs.
- No prior deep packet reported shader/material registry descriptor aliasing, engine surface snapshot mutation of world resources/event payloads, race failure leaving sibling nodes running under a failed parent, or `any` sibling skips emitting duplicate parent child-finished receipts.

## Executive summary
- Current smoke tests still pass, but core proof and orchestration surfaces have fresh isolation and lifecycle receipt gaps.
- Shader/material registries return and reuse live nested descriptor objects; renderer/program setup can mutate caller-owned config and future registry state.
- Engine event/resource surface snapshots expose live journal values; snapshot consumers can mutate world resource state and original event payload objects.
- SequenceNode `race` failure handling fails the parent before race cleanup runs, leaving sibling nodes running under a failed parent.
- SequenceNode `any` winner handling counts skipped siblings as successful child completions, emitting duplicate `sequence.child.finished` receipts for one actual winner.

## Deep bug reports

### 1. Shader and material registries expose live nested descriptors
- Severity: medium
- Owner: renderer/proof descriptor isolation
- Evidence files and line references:
  - `src/shaders.js:70-76` stores shader descriptors with a shallow spread.
  - `src/shaders.js:80-87` returns live shader descriptor objects from `get()` and `list()`.
  - `src/shaders.js:1-8` clones only the uniform wrapper, not nested `value` objects.
  - `src/shaders.js:123-134` stores and returns material descriptors with the same shallow/live-object behavior.
- Reproduction path: register a shader with uniform `{ cfg:{ value: originalObject } }`, call `createProgram()`, mutate `programInfo.uniforms.cfg.value`; separately mutate material data returned by `get()` / `list()`.
- Probe result: shader program uniform mutation changed the caller-owned uniform object and registry descriptor; material registry reads mutated caller-owned `metadata.tags` and `color.tint`.
- Expected behavior: registries should return immutable/cloned descriptor snapshots, and program uniform creation should isolate nested uniform values.
- Actual behavior: descriptor reads and program setup share nested objects with source config and registry state.
- Why it matters: renderers, debug tooling, and proof harnesses can corrupt shader/material definitions during inspection or per-frame uniform edits, making visual proof non-replayable.
- Validation needed: shader/material registry fixtures for nested uniforms, metadata arrays, `get()`, `list()`, `register()`, and `createProgram()` isolation.
- Suggested fix direction: deep-clone or freeze registered descriptors and deep-clone uniform `value` payloads when creating programs.
- Blocks DSK promotion: promotion-adjacent for presentation/render proof services.

### 2. Event and resource surface snapshots expose live payload/resource objects
- Severity: medium
- Owner: engine surface read-model isolation
- Evidence files and line references:
  - `src/ecs.js:211-221` records resource journal entries with the live `value` object.
  - `src/ecs.js:251-255` records event journal entries with the live `payload` object.
  - `src/engine.js:226-241` groups those journal records and publishes them directly to surfaces.
  - `src/surfaces.js:35-45` stores and returns the current batch by reference from `snapshot()`.
- Reproduction path: set an object resource, tick with a resource surface, mutate `surface.snapshot()[0].value`; emit an object event, tick with an event surface, mutate `eventSurface.snapshot()[0].payload`.
- Probe result: resource snapshot mutation changed `engine.world.getResource(State)` to `{ count:99, nested:{ ok:false } }`; event snapshot mutation changed the original emitted payload object.
- Expected behavior: surface snapshots should be read models, or they should be clearly isolated from live world/event payload state.
- Actual behavior: surface snapshot consumers can mutate live resource state and event payload objects outside ECS APIs.
- Why it matters: SequenceNode bridges, analytics, debug panels, renderer adapters, and proof recorders can accidentally change simulation state while reading surfaces.
- Validation needed: surface snapshot immutability fixtures for resource, event, lifecycle, and query surfaces, including nested object payloads.
- Suggested fix direction: clone or freeze surface batches at publish/snapshot boundaries; at minimum clone resource/event record payloads before publishing.
- Blocks DSK promotion: yes for event/resource surfaces used as DSK proof and orchestration bridges.

### 3. SequenceNode race failure leaves sibling nodes running under a failed parent
- Severity: medium
- Owner: SequenceNode sibling lifecycle cleanup
- Evidence files and line references:
  - `src/sequence-node.js:787-792` marks a child failed and immediately calls `notifyParent(child, true)`.
  - `src/sequence-node.js:821-823` fails any parent on child failure before checking completion mode.
  - `src/sequence-node.js:846-849` contains race-specific sibling cancellation, but that branch is unreachable for a failing child because the earlier failure guard returns first.
- Reproduction path: mount a `flow` root with `completionMode:"race"` and two running `waitForEvent` children, then call `runtime.fail("loser-a")`.
- Probe result: runner states became `{ race-root:"failed", loser-a:"failed", loser-b:"running" }`.
- Expected behavior: race termination should cancel/skip every still-running sibling before or while failing the parent.
- Actual behavior: one sibling remains running after the parent has failed.
- Why it matters: timed races, objective races, fallback flows, and proof harnesses can keep receiving events or frame updates from orphaned sibling nodes after the owning flow is terminal.
- Validation needed: SequenceNode race fixtures for child success, child failure, manual failure, event failure, nested race, and sibling cancellation event counts.
- Suggested fix direction: handle `Race` completion mode before the generic `failed && !continueOnFailure` guard, or make `failNode(parent)` recursively cancel active children.
- Blocks DSK promotion: yes for SequenceNode-driven DSK orchestration.

### 4. SequenceNode `any` emits duplicate parent child-finished receipts when skipping siblings
- Severity: medium
- Owner: SequenceNode parent receipt semantics
- Evidence files and line references:
  - `src/sequence-node.js:777-784` finishes the winning child and calls `notifyParent(child, false)`.
  - `src/sequence-node.js:840-843` handles `Any` by skipping every active sibling and then finishing the parent.
  - `src/sequence-node.js:795-801` uses `cancelOrSkip()` for skipped siblings and calls `notifyParent()` for each skipped sibling.
  - `src/sequence-node.js:816-819` emits `sequence.child.finished` for both the real winner and the skipped sibling.
- Reproduction path: mount an `any` root with two running `waitForEvent` children, start it, then call `runtime.complete("a")`.
- Probe result: root finished and sibling `b` became `skipped`, but the event history contained two `sequence.child.finished` receipts for parent `root`.
- Expected behavior: `Any` should emit one child-finished receipt for the actual winner and separate skip/cancel receipts for losers.
- Actual behavior: skipped siblings also notify the parent as finished children.
- Why it matters: objective graphs, telemetry, analytics, and proof rows can count one winning branch as multiple successful children.
- Validation needed: SequenceNode `Any` fixtures for one winner, multiple siblings, skipped loser event counts, nested `any`, and manual skip semantics.
- Suggested fix direction: avoid parent success notification from skip/cancel during parent-managed sibling cleanup, or emit a separate child-skipped receipt.
- Blocks DSK promotion: promotion-adjacent for SequenceNode proof and objective orchestration.

## Domain and kit expansion risks
- Presentation and renderer services need immutable descriptor and uniform snapshots before visual proof can be replayed safely.
- Event/resource surfaces need read-model isolation before they can serve as trustworthy bridges for SequenceNode, analytics, UI, or DSK proof.
- SequenceNode race/any orchestration needs sibling terminal cleanup and receipt-count fixtures before it can coordinate domain proof flows.

## Cross-cutting risks
- Passing smoke tests does not cover registry aliasing, surface snapshot mutation, race failure cleanup, or `any` receipt overcounting.
- Public module-source proof blockers are separate; fixing browser imports would not prove these runtime isolation and orchestration semantics.
- Prior query live-object and authored-source leaks are related but narrower; this packet adds core registry and engine surface read-model aliasing.

## Missing validation
- Shader/material descriptor isolation tests.
- Surface snapshot read-only/isolation tests for nested event and resource payloads.
- SequenceNode race failure sibling-cancellation tests.
- SequenceNode `any` child receipt-count tests.
- Cross-surface proof harness tests that assert read-only observers cannot mutate runtime state.

## DSK promotion blockers
- Do not use renderer/material descriptors as proof artifacts until registry snapshots are isolated or immutable.
- Do not use event/resource surfaces as DSK proof bridges until snapshot consumers cannot mutate live state.
- Do not use SequenceNode `race` or `any` as promotion proof orchestration until sibling cleanup and child receipt semantics are explicit.

## Suggested next review item
- In a non-scout lane, add a compact core fixture set for registry isolation, surface snapshot isolation, and SequenceNode `race`/`any` sibling receipt semantics.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, DSK hardening, lifecycle parity, query/command semantics, experience-edge proof, or prior bug roots are fixed.
