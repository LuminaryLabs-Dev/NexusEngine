# Deep Bug Report Packet: 2026-06-19T19:54:18-04:00

Timestamp: 2026-06-19T19:54:18-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for legacy sequence runtime replay/kit lookup and AR DOM renderer content safety

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-registry-surface-sequence-isolation`.
- Recent deep packets already cover DSK install/scheduler failure boundaries, modern SequenceNode boot/frame/disposed/race/any issues, terrain/AR lifecycle cleanup, query/command side effects, data/reset leaks, repeated receipts, navigation/procedural/physics invariants, renderer fallback mismatch, registry descriptor aliasing, and engine surface snapshot aliasing.
- Latest ecosystem state/proof packets keep public module-source strategy as the shared proof blocker across ProtoKits fetched-ref proof, Experiments targeted proof, and public browser proof.
- Latest DSK architecture/domain idea packets add read-model/orchestration isolation as hardening inventory after runtime failure-boundary, lifecycle parity, query/command, and experience-edge rows.
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
- `src/sequences.js`, `src/sequence-node.js`, `src/sequence-node-kit.js`, `src/sequence-node-library.js`, `src/fishing-kit.js`, `src/ar-renderer.js`, `src/runtime-kit.js`, `src/domain-service-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `src/surfaces.js`, `src/renderers.js`, `src/ar-device.js`, `src/ar-experience-kit.js`, `src/surface-placement-kit.js`, `src/realism-kit.js`, `src/render-descriptor-kit.js`
- `tests/run-all.mjs`, `tests/public-api-freeze.mjs`, `tests/sequence-node-runtime-smoke.mjs`

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
- Existing-packet duplicate scan for legacy `createSequenceRuntime`, restart/replay, `AnyChild`, UIControllerSequence, AR renderer DOM insertion, and raw HTML content.
- Inline Node probe: legacy sequence root restart.
  - Result: first run started/ticked the child once; restarting the completed root did not rerun the unloaded child, leaving counters at `{ starts:1, ticks:1 }`.
- Inline Node probe: legacy `AnyChild` cleanup.
  - Result: after one child completed, parent was `Unloaded` but the losing child stayed `running` until directly started/ticked later, where it became `skipped`.
- Inline Node probe: fishing `UIControllerSequence` after trailing kit install.
  - Result: fishing-only sequence set `FishingSession.uiPanel` to `probe-panel`; fishing plus a trailing kit left `uiPanel` undefined because `engine.kit` pointed at the trailing kit.
- Inline Node probe: AR renderer default caption insertion.
  - Result: `createARRenderer().mount()` inserted raw step instruction HTML containing `onerror` into `root.innerHTML`.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T18-55-33-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover invalid SequenceNode deployment side effects, disposed SequenceNode mutation, lifecycle frame-driver duplication, SequenceNode race/any receipt issues, DSK partial install/scheduler failure replay, renderer fallback mismatch, route query live-object mutation, AR lifecycle cleanup, and many domain-kit receipt/reset/id bugs.
- No prior deep packet reported legacy `createSequenceRuntime()` restart skipping child replay, legacy `AnyChild` leaving losers running after parent completion, legacy sequence controllers resolving only the latest `engine.kit`, or AR DOM renderer default templates inserting raw authored HTML into caption/object slots.

## Executive summary
- Current smoke tests still pass, but legacy sequence/runtime and AR DOM proof surfaces have fresh replay, cleanup, composition, and content-safety gaps.
- Legacy `createSequenceRuntime()` can restart a completed root without resetting unloaded child state, so replay/redo flows can complete without rerunning child behavior.
- Legacy `AnyChild` completion finishes the parent while active losers remain running until separately ticked.
- Legacy `UIControllerSequence` and `EntityControllerSequence` inspect only `engine.kit`, so sequences from earlier kits can silently stop working after any later kit is installed.
- Default AR DOM rendering inserts authored instructions and manifest content into `innerHTML` without escaping, so untrusted or CMS-authored AR lesson text can become markup-capable DOM.

## Deep bug reports

### 1. Legacy sequence root restart skips unloaded child replay
- Severity: medium
- Owner: legacy sequence runtime replay/reset semantics
- Evidence files and line references:
  - `src/sequences.js:223-237` reuses existing child runtime state by id.
  - `src/sequences.js:246-252` finishes nodes into `Unloaded` state.
  - `src/sequences.js:332-337` treats any `Unloaded` node as already done.
  - `src/sequences.js:348-357` deletes only the explicitly restarted root state, not descendant states.
- Reproduction path: create a legacy `Group` root with a counting child, `start("root")`, tick to completion, then `start("root")` and tick again.
- Probe result: first tick completed root and child with `{ starts:1, ticks:1 }`; second run completed root again while child counters stayed `{ starts:1, ticks:1 }`.
- Expected behavior: restarting a root should reset or recreate descendant states, or the API should reject restart without an explicit reset.
- Actual behavior: descendants remain `Unloaded`, `tickNode()` returns true for them, and the parent can complete without rerunning work.
- Why it matters: legacy sequence graphs remain exported and used by FishingKit defaults; replay, retry, scene reset, and tutorial flows can claim completion without performing child actions.
- Validation needed: legacy sequence restart fixtures for root restart, nested restart, event-wait restart, skipped child restart, and explicit reset policy.
- Suggested fix direction: recursively clear descendant runtime state when restarting an unloaded root, or add an explicit reset API and reject implicit replay.
- Blocks DSK promotion: promotion-adjacent for legacy sequence compatibility and replay proof.

### 2. Legacy `AnyChild` completes parent while losing children remain running
- Severity: medium
- Owner: legacy sequence sibling cleanup
- Evidence files and line references:
  - `src/sequences.js:307-314` ticks all children and counts completed children.
  - `src/sequences.js:316-321` marks non-unloaded children with `forceSkip` and immediately finishes the parent.
  - `src/sequences.js:263-265` only converts `forceSkip` into a skipped/unloaded state when that child is ticked later.
- Reproduction path: mount a legacy `Group` with `completionMode:"any"`, one child that completes and one child that runs, then tick once.
- Probe result: parent became `completed/Unloaded`, winner became `completed/Unloaded`, but loser stayed `running`; only direct later start/tick moved the loser to `skipped/Unloaded`.
- Expected behavior: `AnyChild` should cancel/skip every active loser before or while finishing the parent.
- Actual behavior: parent terminal state can coexist with a running losing child.
- Why it matters: event subscriptions, replay state, and UI/proof rows can observe an active child under a completed parent; this mirrors the modern SequenceNode cleanup class in a separate legacy surface.
- Validation needed: legacy `AnyChild` fixtures for one winner, multiple losers, nested any, event-wait losers, and loser lifecycle event counts.
- Suggested fix direction: call `tickNode()` or a direct recursive skip/cancel function for active losers before finishing the parent.
- Blocks DSK promotion: promotion-adjacent for legacy sequence compatibility and orchestration proof.

### 3. Legacy sequence controllers use only the latest installed kit
- Severity: medium
- Owner: legacy sequence kit lookup/composition
- Evidence files and line references:
  - `src/sequences.js:150-156` resolves `FishingSession` through `context.engine?.kit?.resources`.
  - `src/sequences.js:170-177` resolves invoke handlers through `context.engine?.kit?.invokes`.
  - `src/runtime-kit.js:126` overwrites `engine.kit` on every installed kit.
  - `src/runtime-kit.js:175-183` appends legacy sequences from installed kits into the shared sequence runtime.
  - `src/fishing-kit.js:709-764` provides default legacy `UIControllerSequence` nodes for fishing flow.
- Reproduction path: create an engine with a fishing kit sequence, then install any trailing runtime kit after it, start the fishing sequence root, and inspect `FishingSession.uiPanel`.
- Probe result: fishing-only sequence set `uiPanel:"probe-panel"`; fishing plus trailing kit left `uiPanel` undefined and `engine.kit` was `trailing-kit`.
- Expected behavior: legacy sequence controllers should resolve resources/invokes from the owning kit or scan `engine.kits`, not depend on the last installed kit.
- Actual behavior: adding a later kit can silently disable earlier kit sequence actions.
- Why it matters: composed games and DSK/ProtoKit stacks routinely install multiple kits; order-dependent sequence controller lookup can break UI/tutorial/proof flows without failing validation.
- Validation needed: multi-kit legacy sequence fixtures for UIControllerSequence, EntityControllerSequence, owning-kit lookup, trailing-kit install, and missing invoke diagnostics.
- Suggested fix direction: pass owning kit context into sequence nodes when appended, or resolve resources/invokes across `engine.kits` with deterministic conflict diagnostics.
- Blocks DSK promotion: yes for legacy sequence compatibility in composed kit graphs.

### 4. Default AR DOM renderer inserts authored text as raw HTML
- Severity: medium
- Owner: AR renderer content safety
- Evidence files and line references:
  - `src/ar-renderer.js:8-16` interpolates `manifest.render()`, `manifest.preview()`, step instruction, and prompt strings into template HTML.
  - `src/ar-renderer.js:19-34` interpolates immersive manifest scene/preview/title/instruction strings into template HTML.
  - `src/ar-renderer.js:54-60` assigns the rendered string to `root.innerHTML` on mount.
  - `src/ar-renderer.js:67-73` assigns the rendered string to `root.innerHTML` on every render.
- Reproduction path: mount the default AR renderer with a step instruction containing `<img src=x onerror="...">`.
- Probe result: `root.innerHTML` contained the raw `onerror` attribute inside `.nexus-ar-caption`.
- Expected behavior: authored labels, prompts, and instructions should be inserted as text or sanitized; only explicitly trusted render callbacks should return HTML.
- Actual behavior: default templates treat normal instruction/prompt/title fields as HTML.
- Why it matters: AR training content is likely authored outside core and may come from CMS/docs/experiment data; raw insertion can create script-capable DOM and misleading proof pages.
- Validation needed: AR renderer fixtures for escaping default title/instruction/prompt fields, preserving trusted custom render callbacks, and avoiding event-handler markup injection.
- Suggested fix direction: build default DOM with `textContent` for labels/prompts/instructions and reserve raw HTML only for explicitly named trusted callbacks.
- Blocks DSK promotion: promotion-adjacent for browser/AR proof safety.

## Domain and kit expansion risks
- Legacy sequence compatibility needs replay/reset, sibling cleanup, and owning-kit lookup rules before older sequence graphs can remain a reliable compatibility layer.
- Multi-kit games need sequence action lookup that is independent of install order.
- AR lesson/proof content needs a trusted-versus-text rendering boundary before public or user-authored proof routes rely on default templates.

## Cross-cutting risks
- Passing smoke tests does not cover legacy sequence replay, legacy any loser cleanup, multi-kit legacy sequence controllers, or AR DOM text escaping.
- These bugs are separate from public module-source blockers; fixing imports would not prove replay/cleanup/content-safety semantics.
- Modern SequenceNode cleanup findings are related but not duplicates; this packet covers the older exported `createSequenceRuntime()` surface and the FishingKit default sequence path.

## Missing validation
- Legacy sequence root/nested restart fixtures.
- Legacy `AnyChild` loser cleanup fixtures.
- Multi-kit legacy UIControllerSequence and EntityControllerSequence lookup fixtures.
- AR renderer escaping/sanitization fixtures for default template fields.
- Browser proof fixtures that distinguish trusted render callbacks from authored text fields.

## DSK promotion blockers
- Do not rely on legacy sequences for replayable proof until restart and sibling cleanup semantics are explicit.
- Do not rely on legacy sequence controllers in composed DSK/ProtoKit graphs until they resolve owning kit context or deterministic multi-kit lookups.
- Do not expose AR default renderer content to external/user-authored text without escaping or a trusted-content policy.

## Suggested next review item
- In a non-scout lane, add a compact compatibility fixture set for legacy sequence restart, legacy any cleanup, multi-kit sequence controller lookup, and AR renderer default text escaping.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, DSK hardening, lifecycle parity, query/command semantics, experience-edge proof, read-model/orchestration isolation, or prior bug roots are fixed.
