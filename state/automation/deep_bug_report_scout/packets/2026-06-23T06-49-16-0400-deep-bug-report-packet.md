# Deep Bug Report Packet: 2026-06-23T06:49:16-04:00

Timestamp: 2026-06-23T06:49:16-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for `createGameKitComposer()` read-model immutability and `createRealtimeGame()` composer handoff boundaries

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-22-host-public-state-mutation`.
- Recent deep packets already cover Host Public State Ownership, DSK Extension Service Ownership, Host Graph Lifecycle Ownership, domain command/config ownership, telemetry/command ownership, procedural/navigation state ownership, scheduler/world mutation isolation, query read-model leaks, runtime identity/lifecycle, DSK install failure boundaries, duplicate providers, duplicate bindings, and direct/composer dependency parity.
- Latest ecosystem state/proof packets report core commit alignment with `origin/main` and `origin/0.0.2`, 9 passing local smoke tests, ProtoKits local/release/main drift, targeted ProtoKits package-resolution failure, Experiments aggregate route failure, targeted `engine.n.zoneField` failure, npm 404, package-version split, optional ProtoKits jsDelivr 502, and public browser proof stuck at `Booting...`.
- Latest DSK architecture packet keeps DSK Extension Service Ownership, Runtime Failure Boundary, Host Graph Lifecycle Ownership, Host Public State Ownership, and proof-route blockers as separate rows.
- Latest domain idea packet maps Host Public State Ownership under Host Graph Lifecycle Ownership, separate from DSK extension hardening and public proof.
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
- Worktree had pre-existing dirty docs/source/test/state and untracked host/lane files before this run, including `src/index.js`, untracked `src/host.js`, host tests/examples/docs, ideal docs, and newer neighboring lane artifacts.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/game-kit-composer.js`, `src/runtime-kit.js`, `src/engine.js`, `src/domain-service-kit.js`, `src/index.js`
- `tests/procedural-navigation-smoke.mjs`, `tests/domain-service-kit-smoke.mjs`, `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404; current branch `main` differs from latest release branch name.
- `npm test`
  - Result: passed 9 smoke tests.
- `git status --short --branch`
  - Result: branch `main...origin/main`; pre-existing source/docs/test/state and untracked host/lane files were present.
- `git rev-parse HEAD origin/main origin/0.0.2`
  - Result: all three refs resolve to `6c450b3073825ddd495979474f57342556658972`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing packet duplicate scan for `createRealtimeGame`, `createGameKitComposer`, `composer`, `bindings`, duplicate providers, duplicate bindings, direct/composer dependency parity, mutable composer, and install order.
- Inline Node probe: mutate `composer.kits` after successful dependency resolution, then pass the composer into `createRealtimeGame()`.
  - Result: `Object.isFrozen(composer)` was `true`, `Object.isFrozen(composer.kits)` was `false`, the pushed kit had unresolved `requires:["runtime:missing"]`, and `createRealtimeGame({ composer })` installed it anyway while `composer.hasProvider("runtime:missing")` stayed `false`.
- Inline Node probe: mutate `composer.bindings` and `composer.installOrder` after composition, then pass the composer into `createRealtimeGame()`.
  - Result: `engine.game.bindings.service` exposed the injected binding and `engine.game.installOrder` included `fake-kit` while `engine.kits` contained only the real provider kit.

## Existing bug packets checked
- Prior deep packets through `2026-06-22T18-49-24-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover direct DSK install ignoring non-`n:` requirements, duplicate runtime kit ids through direct install, duplicate provider tokens, duplicate binding names, and runtime binding ownership.
- This packet does not duplicate those rows. It isolates the stale/mutable composer handoff: a previously valid composer can be mutated after resolution, and `createRealtimeGame({ composer })` trusts the mutated arrays/maps without re-running dependency, identity, or proof-surface validation.

## Executive summary
- Current smoke tests pass, but `createGameKitComposer()` freezes only the outer composer object.
- The returned `composer.kits` / `composer.orderedKits`, `composer.installOrder`, `composer.provides`, and `composer.bindings` structures remain mutable.
- `createRealtimeGame({ composer })` trusts `composer.kits`, `composer.bindings`, and `composer.installOrder` directly, so callers can mutate a valid composer after dependency resolution and install kits that the composer never resolved.
- The resulting engine can report proof metadata that disagrees with runtime state: unresolved kits can install, fake install-order entries can appear in `engine.game.installOrder`, and injected bindings can appear in `engine.game.bindings`.

## Deep bug reports

### 1. Composer kit arrays remain mutable after dependency resolution
- Severity: high
- Owner: composer read-model isolation
- Evidence files and line references:
  - `src/game-kit-composer.js:46-76` builds a dependency-resolved `orderedKits` array and `available` provider set.
  - `src/game-kit-composer.js:80-84` returns `kits`, `orderedKits`, `installOrder`, and `provides` on a frozen outer object, but does not freeze or clone the nested arrays.
  - `src/game-kit-composer.js:103-107` passes `composer.kits` directly into `createEngine()`.
  - `tests/procedural-navigation-smoke.mjs:132-139` verifies dependency ordering and missing dependency rejection only at composer creation time.
- Reproduction path: create a valid composer with provider/dependent kits, push a new kit with `requires:["runtime:missing"]` into `composer.kits`, then call `createRealtimeGame({ composer })`.
- Probe result: the unresolved kit installed and ran its install hook even though `composer.hasProvider("runtime:missing")` returned `false` and `composer.installOrder` did not include the pushed kit.
- Expected behavior: a composer should be immutable after resolution, or `createRealtimeGame()` should revalidate the provided composer before installing.
- Actual behavior: nested arrays remain mutable, so a resolved composer can be made stale and unsafe after validation.
- Why it matters: experiments and proof routes may reuse or pass composer objects across setup layers. A stale composer can bypass the exact dependency ordering guarantees that make composed DSK graphs safer than direct install.
- Validation needed: fixtures asserting composer nested arrays are frozen/cloned, post-compose mutation attempts do not affect engine install, and `createRealtimeGame({ composer })` rejects stale/unresolved composer state.
- Suggested fix direction: freeze cloned `orderedKits`, `installOrder`, and `provides` arrays; expose read-only copies; and re-run composer validation when accepting a caller-provided composer.
- Blocks DSK promotion: promotion-adjacent for composed proof integrity and dependency-policy trust.

### 2. `createRealtimeGame()` trusts caller-provided composer state without parity checks
- Severity: high
- Owner: realtime game composer handoff
- Evidence files and line references:
  - `src/game-kit-composer.js:95-107` accepts `providedComposer` without shape, dependency, id, or provider parity validation.
  - `src/game-kit-composer.js:109-114` copies `composer.bindings` and `composer.installOrder` directly into `engine.game`.
  - `src/engine.js:350-354` installs every kit from `options.kits` in order without knowing whether a composer resolved those kits.
- Reproduction path: pass a composer whose `kits` array was mutated after validation into `createRealtimeGame({ composer })`.
- Probe result: `engine.kits` included `missing-dependent-kit`, while `composer.installOrder` still reported only `provider-kit,dependent-kit`.
- Expected behavior: `createRealtimeGame()` should either only accept composers produced by the current `createGameKitComposer()` and still-current nested state, or it should validate the supplied composer before using it as install authority.
- Actual behavior: any object assigned as `composer` can become the install authority if it has a `kits` field; even a once-valid composer can drift before handoff.
- Why it matters: `createRealtimeGame()` is the README-facing composition API. If it accepts stale composer state, host apps can accidentally prove one composition while running another.
- Validation needed: supplied-composer contract fixtures for stale arrays, fake composer objects, duplicate ids, missing requirements, install-order parity, and provider-set parity.
- Suggested fix direction: treat supplied composers as advisory, clone and validate their `kits` through `createGameKitComposer()` again, or brand/freeze composer internals and assert install-order/provider parity before engine creation.
- Blocks DSK promotion: yes for proof routes that use `createRealtimeGame()` as the canonical composed DSK install path.

### 3. Composer bindings and install-order proof fields are mutable and reused by `engine.game`
- Severity: medium
- Owner: composer proof metadata ownership
- Evidence files and line references:
  - `src/game-kit-composer.js:17-24` builds a plain mutable `bindings` object.
  - `src/game-kit-composer.js:80-87` exposes that same mutable binding map and `getBinding()` returns values from it.
  - `src/game-kit-composer.js:109-114` stores `composer.bindings` and `composer.installOrder` directly on `engine.game`.
- Reproduction path: after composition, set `composer.bindings.service = { owner:"injected-after-compose" }` and push `fake-kit` into `composer.installOrder`, then call `createRealtimeGame({ composer })`.
- Probe result: `engine.game.bindings.service` returned the injected binding and `engine.game.installOrder` contained `fake-kit`, while `engine.kits` contained only the real provider kit.
- Expected behavior: `engine.game` proof metadata should reflect the actual resolved install, not live caller-mutated composer metadata.
- Actual behavior: post-compose metadata mutation leaks into the engine-facing game descriptor.
- Why it matters: binding maps and install orders are likely to feed host UI, debug panels, proof packets, and human-view inspectors. Mutable proof metadata can make an engine appear to contain services or installs that never happened.
- Validation needed: fixtures for binding map immutability, returned binding cloning, install-order parity with `engine.kits`, and mutation attempts before/after `createRealtimeGame()`.
- Suggested fix direction: freeze or clone composer binding maps and binding values where feasible, derive `engine.game.installOrder` from actual installed kits, and expose snapshots rather than live metadata.
- Blocks DSK promotion: promotion-adjacent for proof metadata trust.

## Domain and kit expansion risks
- Composer output is part of the core contract because ProtoKits and Experiments rely on it to prove dependency ordering and `n:` service graph installation.
- A mutable composer read model weakens the intended split between safe composed installs and unsafe direct installs.
- Proof routes should not use `composer.installOrder`, `composer.bindings`, or `engine.game` as evidence until composer nested state is immutable or revalidated at handoff.

## Cross-cutting risks
- Passing smoke tests prove dependency ordering at the moment `createGameKitComposer()` runs, not that the returned composer remains valid after creation.
- This extends but does not duplicate earlier direct/composer dependency parity. The older row shows direct install can bypass composer policy; this row shows a provided composer can become stale and let `createRealtimeGame()` bypass its own previously resolved policy.
- This extends but does not duplicate duplicate binding/provider rows. The affected surface is post-compose mutation and engine proof metadata, not only same-name collisions during composition.
- These findings do not change package/public proof status. Fixing composer immutability would not resolve ProtoKits package resolution, Experiments route/API failures, npm 404, package-version split, optional ProtoKits CDN availability, or public browser imports.

## Missing validation
- Composer nested immutability fixtures for `kits`, `orderedKits`, `installOrder`, `provides`, and `bindings`.
- `createRealtimeGame({ composer })` validation fixtures for stale composer arrays, fake composer objects, missing requirements, duplicate ids, provider parity, and install-order parity.
- Engine game proof metadata fixtures that compare `engine.game.installOrder` with `engine.kits`.
- Binding snapshot fixtures that prevent post-compose or post-engine mutation from injecting uninstalled services.

## DSK promotion blockers
- Do not treat a caller-provided composer as proof of dependency-resolved DSK installation until its nested state is immutable or revalidated.
- Do not use `engine.game.installOrder` or `engine.game.bindings` as release/proof evidence while they can be caller-mutated separately from actual `engine.kits`.
- Keep composer read-model hardening separate from public module-source proof, DSK Extension Service Ownership, and Host Graph Lifecycle Ownership; all remain open.

## Suggested next review item
- In a non-scout lane, add compact composer fixtures that freeze/clone nested composer state and require `createRealtimeGame({ composer })` to reject stale arrays, fake composer objects, and install-order/provider mismatches before using composer metadata as proof.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, DSK hardening, host hardening, extension hardening, command/config ownership hardening, query read-model hardening, composer hardening, or any prior bug root is fixed.
- Playwright/Human View validation was not run because this deep bug scout had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current browser-visible proof status and still report the public proof route stuck at `Booting...`.
