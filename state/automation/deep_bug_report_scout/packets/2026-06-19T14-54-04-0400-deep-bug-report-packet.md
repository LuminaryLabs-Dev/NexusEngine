# Deep Bug Report Packet: 2026-06-19T14:54:04-04:00

Timestamp: 2026-06-19T14:54:04-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine runtime, AR launch, presentation quality, fishing config, and character-control receipt semantics

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-dsk-scheduler-failure-boundaries`.
- Recent deep packets already cover DSK namespace/install/scheduler failure boundaries, navigation/procedural/physics proof gaps, command/time/descriptor generation issues, interaction/puzzle/camera state-signal gaps, source-state leaks, receipt/idempotency bugs, AR/objective bridge phase, spatial/mobility invariants, operations/logistics issues, direct install/lifecycle gaps, renderer fallback mismatch, stale AR failure sessions, terrain retention, and invalid SequenceNode side effects.
- Latest DSK architecture packet adds runtime failure-boundary fixture rows while keeping public/browser proof separate.
- Latest ecosystem state/proof packets say core remains latest-ref aligned and local proof is green, while sibling fetched-ref proof, public browser proof, npm metadata, and module-source strategy remain open.
- Latest domain idea packet maps runtime failure-boundary bugs into planning inventory, not source authority.
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
- `src/character-ragdoll-kit.js`
- `src/ar-launcher.js`
- `src/ar-device.js`
- `src/ar-session.js`
- `src/ar-kit.js`
- `src/ar-experience-kit.js`
- `src/ar-modes/webxr-plane.js`
- `src/ar-modes/camera-overlay.js`
- `src/ar-modes/fallback-preview.js`
- `src/ar-modes/page-marker.js`
- `src/realism-kit.js`
- `src/fishing-kit.js`
- `src/reef-rescue-kit.js`
- `src/renderers.js`
- `src/index.js`
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
- Existing-packet duplicate scan for `ragdoll`, `Staggered`, `AR launch`, `webxr`, `fallback`, `realism`, `quality`, `fishing`, `species`, and `lure`.
- Inline Node probe: CharacterRagdoll settled-state stagger repeat.
  - Result: one knockdown with no recover input emitted 8 `Staggered` events across 8 later ticks while state stayed `settled`.
- Inline Node probe: AR launch WebXR request failure with camera/fallback preferences.
  - Result: selected `webxr-plane`, request failed, session became `failed`, placement stayed `unplaced`, and runtime did not try `camera-overlay` or `fallback-preview`.
- Inline Node probe: RealismKit custom quality object.
  - Result: requested `{ id:"cinematic", pixelRatio:3, ... }`, but snapshot quality became built-in `high` and pipeline pixel ratio stayed `1.75`.
- Inline Node probe: FishingKit empty species/lures content.
  - Result: `content.species:[]` still spawned 4 fish with undefined species fields; `content.lures:[]` allowed a cast with a lure component lacking an id/depth/attraction.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T13-53-17-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover stale AR failure session handles, renderer fallback mismatch, repeated objective/input/interaction receipts, wrapper state, source-state leaks, numeric config gaps, and generated-id collisions.
- No prior deep packet reported CharacterRagdoll settled-state `Staggered` event spam, AR launch no fallback after selected WebXR start failure, RealismKit custom quality object replacement, or FishingKit empty content spawning placeholder fish/lures.

## Executive summary
- Current smoke tests still pass, but presentation, AR launch, fishing content, and character-control surfaces have untested edge failures.
- Highest-impact user-visible bug: AR launch selects the first supported mode once; if WebXR support check passes but session request fails, it reports failure and never tries the preferred fallback modes.
- CharacterRagdoll emits `Staggered` every settled tick after `recoverDelay`, turning one knockdown into unbounded repeated receipts.
- RealismKit accepts a custom quality object syntactically but resolves it by id only; unknown ids silently fall back to built-in `high`.
- FishingKit accepts empty species/lure content but still creates fish and casts lure entities with missing identity/config fields.

## Deep bug reports

### 1. CharacterRagdoll emits `Staggered` every settled tick after recovery delay
- Severity: medium
- Owner: character-control receipt semantics
- Evidence files and line references:
  - `src/character-ragdoll-kit.js:124` marks `recoveryReady` once the timer crosses `recoverDelay`.
  - `src/character-ragdoll-kit.js:145-147` enters recovery only when `input.recover` is true.
  - `src/character-ragdoll-kit.js:172-173` emits `Staggered` on every non-recovering tick after the delay.
- Reproduction path: install `createCharacterRagdollKit({ recoverDelay:0.05 })`, trigger one knockdown, clear knockdown, do not send recover, and tick 8 times.
- Probe result: 8 `Staggered` events were published with phase `settled`, while state remained `settled` and `recoveryReady:true`.
- Expected behavior: `Staggered` should be transition/edge based, rate-limited, or represented as state rather than a repeated one-shot event.
- Actual behavior: every settled tick emits another receipt.
- Why it matters: analytics, objective bridges, SequenceNode flows, tutorial prompts, and recovery proof can overcount one knockdown as many stagger events.
- Validation needed: ragdoll smokes for knocked-down, impact, settled, repeated settled ticks, recover transition, recovered event count, and held recover/knockdown behavior.
- Suggested fix direction: store a `staggeredEmitted` or phase-transition marker, or replace repeated event emission with a state field plus optional periodic diagnostics.
- Blocks DSK promotion: promotion-adjacent for character-control and recovery domains.

### 2. AR launch does not fall back after selected WebXR start failure
- Severity: high
- Owner: AR launch mode fallback
- Evidence files and line references:
  - `src/ar-launcher.js:39-41` chooses exactly one mode before start.
  - `src/ar-launcher.js:87-98` starts that mode and returns state regardless of `result.ok`, with no attempt to advance to the next preferred mode.
  - `src/ar-modes/webxr-plane.js:18-29` reports failed WebXR session requests but does not request fallback itself.
- Reproduction path: mock a secure Android Chrome device where `navigator.xr.isSessionSupported("immersive-ar")` returns true, but `navigator.xr.requestSession()` throws; pass preferred modes `["webxr-plane","camera-overlay","fallback-preview"]`.
- Probe result: selected `webxr-plane`; `ARSupportState.supported:true`; `ARSessionState.status:"failed"` with `error:"request_session_failed"`; placement remained `unplaced`; no camera or fallback mode started.
- Expected behavior: runtime should try the next preferred available mode after a recoverable start failure, or clearly expose that preferred fallback is disabled.
- Actual behavior: launch stops at failed WebXR even though lower modes were preferred and available.
- Why it matters: mobile AR can fail at permission/session time after support checks; user-visible proof routes can strand users instead of showing camera overlay or fallback preview.
- Validation needed: AR launch fixtures for support-pass/request-fail, camera permission fail, fallback success, preferred mode order, and support-state updates after fallback.
- Suggested fix direction: make `start()` iterate supported preferred modes until one returns `ok`, updating `selectedMode`, `ARSupportState`, and diagnostics with failed attempts.
- Blocks DSK promotion: yes for AR launch/runtime proof reliability.

### 3. RealismKit silently replaces custom quality objects with built-in `high`
- Severity: medium
- Owner: presentation quality contract
- Evidence files and line references:
  - `src/realism-kit.js:165-168` reduces object quality input to `input.id`.
  - `src/realism-kit.js:170-174` falls back unknown non-adaptive ids to `qualityProfiles.high`.
  - `src/realism-kit.js:360-381` stores the original requested object but resolves quality through the id-only path.
- Reproduction path: call `createRealismKit({ quality:{ id:"cinematic", pixelRatio:3, shadowMapSize:8192, scatterDensity:1, post:"full" } })` and tick once.
- Probe result: `kit.quality` preserved the custom object, but `RealismSnapshot.quality.id` was `high`, `pixelRatio` was `1.75`, and shadow map size was `2048`.
- Expected behavior: custom quality objects should be used, rejected, or normalized with diagnostics.
- Actual behavior: custom data is silently ignored while metadata still suggests `requestedQuality:"cinematic"`.
- Why it matters: high-end presentations, accessibility/performance profiles, and renderer proof can believe a custom quality profile is active when the renderer is using built-in `high`.
- Validation needed: RealismKit smokes for built-in quality names, adaptive transitions, custom objects, unknown ids, invalid numeric fields, and emitted quality diagnostics.
- Suggested fix direction: accept object profiles directly after finite-field normalization, or throw on unknown ids and require callers to register named profiles.
- Blocks DSK promotion: promotion-adjacent for presentation/proof domains.

### 4. FishingKit empty species/lure content spawns placeholder entities with missing identity
- Severity: medium
- Owner: fishing content normalization
- Evidence files and line references:
  - `src/fishing-kit.js:26-28` returns `{}` when no item matches and the array is empty.
  - `src/fishing-kit.js:181-188` always creates four initial fish from `content.species`.
  - `src/fishing-kit.js:849-860` writes fish components from `species.*` without validating required fields.
  - `src/fishing-kit.js:793-802` initializes `lureId` from content or `"spinner"` even when no lure exists; cast creation then uses the empty object fallback.
- Reproduction path: create `createFishingKit({ content:{ species:[], lures:[], waterZones:[], objective:{ target:0 } } })`, tick, then cast.
- Probe result: the engine contained 4 fish whose speciesId/label/fight/stamina/score were undefined; casting created a lure component with no `id`, `depth`, or `attraction`.
- Expected behavior: empty content should mean no spawned fish/lures, or the kit should reject missing required species/lure definitions with a clear error.
- Actual behavior: placeholder entities are created with incomplete component data.
- Why it matters: data-driven hosts and ProtoKits may intentionally supply empty datasets during loading, testing, or scenario variants; missing ids break telemetry, scoring, rendering labels, and content proof.
- Validation needed: FishingKit smokes for empty species, empty lures, unknown ids, duplicate ids, zero-objective state, and content fallback policy.
- Suggested fix direction: validate required species/lure arrays before install, or only spawn/cast from valid normalized entries and expose disabled states when content is empty.
- Blocks DSK promotion: promotion-adjacent for fishing/content-driven domains.

## Domain and kit expansion risks
- Character-control domains need edge/level receipt policy before recovery events drive objectives or analytics.
- AR launch/runtime domains need start-failure fallback semantics before browser-visible proof can stand in for AR readiness.
- Presentation domains need explicit profile registration/validation before custom visual profiles are proof evidence.
- Content-driven kits need required-field validation and empty-dataset semantics before host-authored datasets can be trusted.

## Cross-cutting risks
- Passing smoke tests does not cover repeated receipts, start-time fallback, custom profile normalization, or empty content datasets.
- Public browser proof blockers remain separate from AR launch fallback; fixing module paths will not prove launch fallback behavior.
- DSK hardening remains separate from these domain-kit bugs; runtime contract fixes alone will not validate presentation/content/AR-control edge cases.

## Missing validation
- CharacterRagdoll event-count and transition fixtures.
- AR launch fallback-chain fixtures for support-pass/start-fail modes.
- RealismKit custom/unknown quality profile fixtures.
- FishingKit empty/invalid content fixtures.
- Aggregate proof rows for receipt policy, launch fallback, presentation profile validation, and content normalization.

## DSK promotion blockers
- Do not promote character-control/recovery domains until repeated receipts are normalized.
- Do not treat AR launch proof as production-ready until failed selected modes can fall back or fail with explicit no-fallback policy.
- Do not treat custom presentation profile proof as valid until RealismKit accepts or rejects custom profiles explicitly.
- Do not promote content-driven fishing or ecosystem kits until empty and malformed content datasets are validated.

## Suggested next review item
- In a non-scout lane, add a compact domain-kit edge fixture file covering ragdoll event idempotency, AR launch fallback, RealismKit custom quality validation, and FishingKit empty content handling.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim sibling latest refs, public browser proof, npm publication, DSK hardening, AR public launch proof, or prior bug roots are fixed.
