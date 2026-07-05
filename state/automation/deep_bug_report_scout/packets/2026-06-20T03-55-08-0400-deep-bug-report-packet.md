# Deep Bug Report Packet: 2026-06-20T03:55:08-04:00

Timestamp: 2026-06-20T03:55:08-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for fishing preset identity, core/product boundary drift, and content objective validation

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-20-runtime-identity-lifecycle-ownership`.
- Recent deep packets already cover duplicate runtime ids as a generic direct-install primitive, duplicate bindings, ECS definition-name aliasing, SequenceNode install-only repeat side effects, disposed event-bus `onAny()` parity, AR launch fallback/source issues, RealismKit custom quality replacement, and FishingKit empty content placeholder entities.
- Latest DSK architecture packet keeps runtime failure-boundary first, then composition-proof and runtime identity/lifecycle ownership as later validation inventory.
- Latest ecosystem proof packet keeps module-source, fetched-ref, public browser, npm, and package-version proof blockers separate from local runtime hardening.
- Latest domain idea packet maps runtime identity/lifecycle rows into planning inventory.
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
- `docs/how-to-protokit.md`, `docs/protokit-boundaries.md`, `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/fishing-kit.js`, `src/reef-rescue-kit.js`, `src/index.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/ar-renderer.js`, `src/realism-kit.js`, `src/engine.js`, `src/surfaces.js`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked docs and automation artifacts.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan for ReefRescue, fixed kit id, zero objective, negative objective, `options.id`, and product-specific boundary terms.
- Inline Node probe: `createFishingKit({ id:"custom-fishing" })` and `createReefRescueKit({ id:"reef-custom" })`.
  - Result: both returned runtime kit id `fishing`; installing generic fishing plus reef rescue directly produced `engine.kits.map(id) === ["fishing","fishing"]`, and `engine.kit.metadata.title` became `Reef Rescue`.
- Inline Node probe: zero and negative fishing objectives.
  - Result: after one tick, target `0` and target `-2` both produced `FishingSession.status:"complete"` with `caught:0`.

## Existing bug packets checked
- Prior deep packets through `2026-06-20T02-54-27-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover generic direct duplicate runtime ids and FishingKit empty species/lures creating placeholder entities.
- No prior deep packet isolated the public `createReefRescueKit()` export as current core/product boundary drift, `createFishingKit()` ignoring `options.id`, or zero/negative fishing objectives completing with no catch.

## Executive summary
- Current smoke tests still pass, but the fishing preset surface mixes product-specific content into core and weakens kit identity.
- `createReefRescueKit()` is exported from the core package even though repo memory and ProtoKit docs say new reusable kit/product behavior should live outside NexusEngine core.
- `createFishingKit()` hardcodes runtime kit id `fishing`, so callers cannot create stable unique fishing-kit instances and ReefRescue cannot have its own runtime identity.
- Fishing objectives accept zero or negative targets and complete after one tick with zero catches.

## Deep bug reports

### 1. Product-themed ReefRescue preset is exported from NexusEngine core
- Severity: medium
- Owner: core/ProtoKit boundary and public API shape
- Evidence files and line references:
  - `memory.md:12-17` says new reusable kits target ProtoKits and NexusEngine must not contain product-specific copy, routes, assets, level names, or app lore.
  - `docs/how-to-protokit.md:53-68` says core owns runtime contracts, validation, scheduler, ECS, composer, and shared primitives.
  - `docs/protokit-boundaries.md:5-15` frames NexusEngine as a read-only runtime dependency for gameplay/domain kit work.
  - `src/reef-rescue-kit.js:4-91` defines a themed preset with `gameId:"reef-rescue"`, title `Reef Rescue`, reef species, lures, water zones, terrain ids, and reef material labels.
  - `src/index.js:118-120` exports `createReefRescueKit()` from the public core package.
- Reproduction path: import `createReefRescueKit` from `./src/index.js` and inspect returned metadata/content.
- Probe result: public API exposes a product-themed preset from core rather than a generic runtime primitive.
- Expected behavior: product/theme presets should live in Experiments or ProtoKits, while core exposes generic FishingKit/runtime primitives.
- Actual behavior: core package API includes the themed ReefRescue preset and authored reef content.
- Why it matters: it blurs the core/ProtoKits/Experiments boundary and can turn one playable preset into a precedent for placing more product-specific kits in core.
- Validation needed: public API freeze/boundary fixture that flags product-themed exports and authored game presets in core.
- Suggested fix direction: deprecate or move ReefRescue into Experiments/ProtoKits, keeping core focused on `createFishingKit()` and generic content hooks.
- Blocks DSK promotion: promotion-adjacent for repository boundary discipline.

### 2. FishingKit ignores caller ids and gives themed presets the same runtime identity
- Severity: medium
- Owner: runtime kit identity and fishing preset composition
- Evidence files and line references:
  - `src/fishing-kit.js:683-704` reads caller options but passes fixed `id:"fishing"` to `defineRuntimeKit()`.
  - `src/reef-rescue-kit.js:73-91` spreads caller options into `createFishingKit()`, but the downstream fixed id still wins.
  - `src/fishing-kit.js:870-872` writes the installed kit into `engine.kit`, so the last installed same-id fishing preset becomes the visible active kit.
  - `src/runtime-kit.js:131-157` skips only same-object installs and allows different objects with the same id to install directly.
- Reproduction path: create `createFishingKit({ id:"custom-fishing" })`, `createReefRescueKit({ id:"reef-custom" })`, and a direct engine with both generic fishing and reef rescue kits.
- Probe result: custom and reef kits both returned id `fishing`; direct install produced two installed kits with id `fishing`, and the visible `engine.kit` title became `Reef Rescue`.
- Expected behavior: factory-provided ids should either be honored or rejected, and presets should have stable distinct runtime identity if they remain public.
- Actual behavior: caller ids are silently ignored and themed presets share one logical id.
- Why it matters: hosts cannot compose multiple fishing variants, diagnostics cannot distinguish generic versus themed installs, and direct runtime install inherits the known duplicate-id hazard through a first-party factory.
- Validation needed: FishingKit/ReefRescue identity fixtures for default id, caller id, multiple instances, composer duplicate handling, direct install parity, and metadata ownership.
- Suggested fix direction: honor `options.id` with a safe default, or make themed presets pass explicit unique ids while composer/direct install duplicate-id policy is hardened.
- Blocks DSK promotion: yes for kit identity and composition ownership.

### 3. Zero or negative fishing objectives complete with no catches
- Severity: medium
- Owner: content objective normalization
- Evidence files and line references:
  - `src/fishing-kit.js:683-685` shallow-merges caller content into defaults without normalizing objective targets.
  - `src/fishing-kit.js:794-801` stores the caller objective directly in `FishingSession`.
  - `src/fishing-kit.js:572-584` marks the session complete whenever `caught >= objective.target`.
- Reproduction path: create `createFishingKit({ content:{ objective:{ label:"none", target:0 } } })` and tick once; repeat with `target:-2`.
- Probe result: both sessions became `status:"complete"` with `caught:0`.
- Expected behavior: objective targets should be positive integers, explicitly disabled, or rejected with diagnostics.
- Actual behavior: invalid targets complete immediately without gameplay or catch events.
- Why it matters: authored datasets, loading states, scenario variants, and proof routes can accidentally report complete success before the player does anything.
- Validation needed: objective target fixtures for missing, zero, negative, fractional, string, NaN, and disabled-objective semantics.
- Suggested fix direction: normalize to `Math.max(1, integer)` or require `objective.disabled === true` for no-objective modes.
- Blocks DSK promotion: promotion-adjacent for content-driven objective proof.

### 4. Fishing content contract remains split across placeholder entities and invalid objectives
- Severity: medium
- Owner: content dataset contract and proof readiness
- Evidence files and line references:
  - `src/fishing-kit.js:26-28` falls back to `{}` for empty species/lure arrays.
  - `src/fishing-kit.js:849-867` creates fish entities from `species.*` fields without required-field validation.
  - `src/fishing-kit.js:793-802` sets `lureId` to the first lure or `"spinner"` even when no matching lure exists.
  - `src/fishing-kit.js:572-584` completes objectives based on unvalidated target values.
  - Prior packet `2026-06-19T14-54-04-0400` already proved empty species/lures create placeholder fish/lure entities.
- Reproduction path: combine empty species/lure content with zero or negative objective target, then inspect fish entities and session status after tick/cast.
- Probe result: existing packet shows missing identity fish/lures; this run adds immediate zero-catch completion for invalid objective targets.
- Expected behavior: content validation should happen once before simulation state is spawned.
- Actual behavior: required content fields and objective thresholds are validated in separate ad hoc fallbacks, allowing incomplete entities and false completion.
- Why it matters: broader DSK/ProtoKit content graphs need one executable dataset contract before generated proof state can be trusted.
- Validation needed: one compact FishingKit content-contract fixture covering species, lures, objectives, duplicate ids, unknown ids, disabled content, and validation diagnostics.
- Suggested fix direction: add a normalization function that returns valid content plus diagnostics, and keep simulation spawning disabled until required content is valid.
- Blocks DSK promotion: yes for content-driven kit promotion readiness.

## Domain and kit expansion risks
- Core/product boundary checks should be executable, not just written in memory/docs.
- Fishing-family presets need stable runtime identity before multiple game variants or proofs compose cleanly.
- Content-driven objectives need explicit disabled/invalid semantics before proof routes can use completion as evidence.
- Dataset contracts should validate required content and objective thresholds together rather than relying on per-system fallbacks.

## Cross-cutting risks
- Passing smoke tests does not cover public API product-boundary drift, fishing factory id overrides, or invalid objective thresholds.
- Fixing generic duplicate-id direct install would not remove the need for first-party factories to honor or reject caller ids.
- Moving public proof module sources or publishing npm metadata would not prove content objectives are valid.

## Missing validation
- Public API boundary fixture for themed/product exports in core.
- FishingKit factory identity fixture for `options.id`, multiple instances, and preset ids.
- Fishing objective target normalization fixture.
- Fishing content contract fixture spanning species, lures, objectives, and disabled states.

## DSK promotion blockers
- Do not use core public exports as proof of clean product/runtime separation while ReefRescue remains exported from core.
- Do not promote fishing-family content kits without stable runtime identity and content-objective validation.
- Do not treat zero-catch completion as proof success unless objective disabled semantics are explicit.

## Suggested next review item
- In a non-scout lane, add a focused FishingKit boundary/identity/content fixture set, then decide whether `createReefRescueKit()` moves out of core or becomes a documented deprecated compatibility preset.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim generic duplicate-id install, empty content placeholder entities, public module-source proof, npm publication, DSK hardening, content validation, or any prior bug root is fixed.
