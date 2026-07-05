# Deep Bug Report Packet: 2026-06-23T19:00:40-04:00

Timestamp: 2026-06-23T19:00:40-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for `defineRuntimeKit()` nested definition immutability and composition token trust

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-23-composer-read-model-handoff`.
- Recent deep packets already cover composer read-model mutation, host public state, DSK extension install contracts, host graph lifecycle, command/config ownership, telemetry/command ownership, procedural/navigation state ownership, scheduler/world mutation isolation, query read-model leaks, runtime identity/lifecycle, DSK install failure boundaries, duplicate providers/bindings, AR launch, and ReefRescue/FishingKit boundary issues.
- Latest ecosystem/proof packets keep core commit-aligned and smoke-green while ProtoKits targeted package resolution, Experiments aggregate route/API proof, public browser `Booting...`, npm metadata, package-version policy, optional ProtoKits CDN, Host Public State Ownership, DSK Extension Service Ownership, and composer handoff hardening remain open.
- Latest DSK architecture packet keeps Runtime Failure Boundary and DSK Extension Service Ownership as hardening inventory, and lists runtime namespace/transaction/dependency/definition isolation fixtures as promotion blockers.
- Latest domain idea packet maps composer read-model/handoff under Composition Proof Ownership.
- State packets were context only. Live source, tests, preflight, duplicate scans, and focused probes were authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-differs-from-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404
- Current `HEAD`, `origin/main`, and `origin/0.0.2`: `6c450b3073825ddd495979474f57342556658972`
- Ahead/behind against `origin/0.0.2`: `0 0`

## Current branch
- `main`, tracking `origin/main`
- Worktree had pre-existing dirty docs/source/test/state and untracked host/lane files before this run.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `src/index.js`
- `tests/domain-service-kit-smoke.mjs`, `tests/procedural-navigation-smoke.mjs`, `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404; current branch `main` differs from latest release branch name.
- `npm test`
  - Result: passed 9 smoke tests.
- `git status --short --branch`
  - Result: branch `main...origin/main`; pre-existing dirty source/docs/test/state and untracked lane/host files were present.
- `git rev-parse HEAD origin/main origin/0.0.2`
  - Result: all three refs resolve to `6c450b3073825ddd495979474f57342556658972`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing packet duplicate scan for `defineRuntimeKit`, runtime kit, mutable systems, kit definitions, providers, requires, components/resources/events, and composer/runtime validation.
- Inline Node probe: mutate `kit.systems` and `kit.provides` after `defineRuntimeKit()` and before `createEngine({ kits:[kit] })`.
  - Result: outer kit was frozen, but `systems` and `provides` were not; injected cleanup system ran and provider token list included the injected token.
- Inline Node probe: mutate a kit's `provides` before composition, then compose a dependent kit requiring the forged token.
  - Result: `createGameKitComposer()` accepted the forged token and ordered `provider` before `dependent`.
- Inline Node probe: mutate a kit's `requires` after validation, then install directly through `createEngine()`.
  - Result: the mutated missing `runtime:missing-after-validate` requirement remained on the installed dependent kit; direct runtime install still installed it.
- Inline Node probe: mutate `kit.systems` after install, call `engine.installKit(kit)` again, then tick.
  - Result: same-object idempotency skipped the injected post-install system, showing definition mutation creates stale kit metadata that does not match installed scheduler state.

## Existing bug packets checked
- Prior deep packets through `2026-06-23T06-49-16-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover duplicate runtime kit ids, duplicate providers/bindings, same-name ECS definition aliasing across kits, DSK direct dependency parity, composer nested array mutation, and supplied-composer handoff.
- This packet does not duplicate those rows. It isolates `defineRuntimeKit()` itself: the returned frozen kit still exposes mutable nested definition arrays/maps, so the definition object can change after validation and before composition/install.

## Executive summary
- Current smoke tests pass, but `defineRuntimeKit()` freezes only the outer kit plus a few selected fields.
- `systems`, `requires`, `provides`, `components`, `resources`, `events`, `shaders`, `materials`, `sequences`, and `subscriptions` remain mutable references.
- A caller can inject systems after kit validation and before install; the injected system is scheduled and runs.
- A caller can forge `provides` tokens before composition; `createGameKitComposer()` trusts the mutated provider set.
- A caller can mutate `requires` after validation; direct runtime install has no generic requirement parity check and installs the now-mutated kit anyway.
- Mutating a kit after install creates stale metadata because same-object reinstall returns early and does not reconcile scheduler state with the changed definition object.

## Deep bug reports

### 1. RuntimeKit nested arrays remain mutable after validation
- Severity: high
- Owner: runtime kit definition immutability
- Evidence files and line references:
  - `src/runtime-kit.js:35-58` returns `Object.freeze(kit)`, but leaves `systems`, `requires`, `provides`, `shaders`, `materials`, `sequences`, and `subscriptions` mutable unless separately frozen.
  - `src/runtime-kit.js:119-121` validates the kit at install time, but validation reads the already-mutated arrays.
  - `src/runtime-kit.js:171-173` schedules every current `kit.systems` entry.
  - `tests/run-all.mjs:3-12` has 9 smoke tests, but none assert RuntimeKit nested immutability.
- Reproduction path: create a runtime kit with one system, push a second system into `kit.systems`, push a token into `kit.provides`, install through `createEngine()`, then tick.
- Probe result: `Object.isFrozen(kit)` was `true`; `Object.isFrozen(kit.systems)` and `Object.isFrozen(kit.provides)` were `false`; the injected system ran and overwrote the probe resource.
- Expected behavior: a validated/frozen RuntimeKit definition should not accept post-definition system/provider mutation, or should expose cloned read-only definitions only.
- Actual behavior: post-definition mutations alter what installs and runs.
- Why it matters: RuntimeKit is the low-level primitive under DSK, composer, SequenceNode kits, render/shader/material registration, and host proof. If definitions are mutable after validation, a packet/proof can review one kit shape while the engine installs another.
- Validation needed: fixtures asserting nested arrays/maps are frozen or cloned for systems, tokens, definitions, shader/material lists, sequences, and subscriptions.
- Suggested fix direction: normalize and freeze cloned arrays/maps in `defineRuntimeKit()`, including system entries and token lists.
- Blocks DSK promotion: yes for definition trust and proof reproducibility.

### 2. Mutable `provides` lets composition dependencies be forged after kit creation
- Severity: high
- Owner: runtime kit provider ownership
- Evidence files and line references:
  - `src/runtime-kit.js:50-51` normalizes `requires` and `provides` into mutable arrays.
  - `src/game-kit-composer.js:52-75` trusts current `kit.requires` and `kit.provides` when resolving dependency order.
  - `tests/procedural-navigation-smoke.mjs:132-139` verifies normal dependency ordering and missing-dependency rejection, but not post-definition token mutation.
- Reproduction path: define `provider` without declared providers, push `runtime:forged` into `provider.provides`, define `dependent` requiring `runtime:forged`, then call `createGameKitComposer({ kits:[dependent, provider] })`.
- Probe result: composer installed `provider` before `dependent` and `hasProvider("runtime:forged")` returned true.
- Expected behavior: provider tokens should be immutable once the kit is defined, or composer should validate against an immutable definition snapshot.
- Actual behavior: external code can add capabilities to a kit after creation and satisfy dependencies the kit did not originally declare.
- Why it matters: composed DSK/ProtoKit graphs rely on provider tokens as proof of capability ownership. Mutable tokens let a host or wrapper accidentally satisfy dependency checks with forged capability state.
- Validation needed: fixtures for post-definition `provides` and `requires` mutation before composer resolution, and provider-set parity against frozen kit definitions.
- Suggested fix direction: freeze token arrays and consider storing normalized provider/require snapshots in non-mutable internal fields.
- Blocks DSK promotion: yes for dependency proof integrity.

### 3. Direct runtime install accepts mutated requirements and stale post-install definitions
- Severity: medium
- Owner: runtime install definition parity
- Evidence files and line references:
  - `src/runtime-kit.js:90-100` validates token shape only.
  - `src/runtime-kit.js:131-133` returns early for same-object reinstall.
  - `src/runtime-kit.js:142-146` checks missing requirements only for DSK tokens that start with `n:`.
  - `src/engine.js:363-368` installs every runtime kit provided in engine options without composer dependency resolution.
- Reproduction path: define a dependent kit requiring `runtime:provided`, push `runtime:missing-after-validate` into `dependent.requires`, then install provider and dependent directly through `createEngine({ kits })`.
- Probe result: direct install succeeded and `engine.kits` contained both kits even though the dependent now required the missing runtime token.
- Reproduction path for stale metadata: install a kit, push a new system into `kit.systems`, call `engine.installKit(kit)` again, then tick.
- Probe result: same-object reinstall skipped the newly added system, while `kit.systems.length` reported two entries.
- Expected behavior: direct runtime install should either enforce generic requirements consistently or document that direct install bypasses dependency policy; installed-kit metadata should not drift after install.
- Actual behavior: mutated requirements remain visible on installed kits but are not enforced, and post-install definition mutation can make the kit object disagree with scheduler state.
- Why it matters: proof panels and automation may inspect `engine.kits` and kit definitions as installed truth. Mutable post-install definitions make those readouts unreliable.
- Validation needed: direct install requirement-parity fixtures, same-object reinstall after definition mutation fixtures, and installed-definition snapshot parity checks.
- Suggested fix direction: freeze definitions up front and unify direct install dependency policy with composer, or mark direct install as intentionally unsafe and hide mutable kit definitions from proof surfaces.
- Blocks DSK promotion: promotion-adjacent; direct runtime install remains a lower-trust path until definition mutation is impossible.

## Domain and kit expansion risks
- ProtoKits and Experiments will compose many RuntimeKits and DSKs. Mutable low-level definitions weaken every higher-level proof surface built on composer and DSK metadata.
- This extends Composition Proof Ownership downward: composer immutability is not enough if the kits inside the composer can mutate after definition.
- This also extends Runtime Identity And Lifecycle Ownership: duplicate ids and aliases are not the only risk; a single kit object can change its declared capabilities and systems over time.

## Cross-cutting risks
- Passing smoke tests prove normal RuntimeKit/DSK install paths only. They do not prove definitions are immutable after factory return.
- Earlier composer findings show a resolved composer can become stale; this packet shows the kit definitions inside and outside a composer are also mutable.
- Earlier direct-install findings show duplicate ids and direct non-`n:` dependency bypass; this packet adds post-definition mutation as the source of stale or forged install evidence.
- Fixing this will not resolve public module-source proof, npm 404, package-version policy, ProtoKits package resolution, Experiments route/API failures, optional ProtoKits CDN, Host Graph Lifecycle Ownership, Host Public State Ownership, DSK Extension Service Ownership, or composer supplied-handoff validation.

## Missing validation
- `defineRuntimeKit()` nested immutability fixtures for systems, tokens, definitions, registries, sequences, and subscriptions.
- Composer fixtures that mutate kit `provides`/`requires` after definition and before composition.
- Direct install fixtures for generic `runtime:*` dependency parity after mutation.
- Installed-kit snapshot parity fixtures proving `engine.kits` cannot expose mutated definitions that were not installed into scheduler/world/registries.

## DSK promotion blockers
- Do not treat RuntimeKit definitions as immutable proof artifacts until nested arrays/maps are frozen or cloned.
- Do not treat composed provider tokens as trustworthy while `kit.provides` can be changed after definition.
- Do not use `engine.kits` as an installed-definition proof surface while post-install mutation can make kit objects disagree with scheduler state.

## Suggested next review item
- In a non-scout lane, add compact RuntimeKit definition immutability fixtures first, then align direct install dependency policy with composer and DSK install expectations.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, RuntimeKit hardening, DSK hardening, composer hardening, host hardening, extension hardening, or any prior bug root is fixed.
- Playwright/Human View validation was not run because this deep bug scout had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current browser-visible proof status and still report the public proof route stuck at `Booting...`.
