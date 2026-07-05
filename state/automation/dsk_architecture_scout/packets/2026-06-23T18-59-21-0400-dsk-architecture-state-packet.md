# DSK Architecture State Packet: 2026-06-23T18-59-21-0400

## Timestamp
- local: 2026-06-23T18-59-21-0400
- preflight: 2026-06-23T22:58:51.797Z
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Latest DSK tracker root before this run was `dsk-extension-service-refresh-root-2026-06-23-0617`: Runtime Failure Boundary and DSK Extension Service Ownership still block promotion; Host Public State Ownership and proof-route drift remain adjacent gates.
- Latest DSK packet/node `2026-06-23T06-17-21-0400` reconfirmed reserved `engine.n` API names, extension service-token/API parity, base-plus-extension install atomicity, same-name ECS definition identity, and direct/composer dependency parity as live fixture needs.
- Latest ecosystem state/proof packets `2026-06-23T06-06-22-0400` and `2026-06-23T06-38-41-0400` keep core commit parity and smoke-green status separate from ProtoKits local/release/main drift, package resolution, Experiments aggregate route failure, targeted `engine.n.zoneField`, npm 404, package-version policy, optional ProtoKits CDN 502, and public `Booting...`.
- Latest deep bug packet/node `2026-06-23T06-49-16-0400` adds Composer Read-Model Handoff: mutable nested composer arrays/maps, stale supplied-composer install bypass, and mutable `engine.game` proof metadata.
- Latest domain idea packet/node `2026-06-23T07-02-55-0400` maps that composer evidence under Composition Proof Ownership, separate from DSK Extension Service Ownership, Host Graph Lifecycle Ownership, and public proof.
- State packets were context only. Live source, docs, tests, git refs, preflight, and focused probes were authority for this run.

## Latest branch
- `npm run automation:preflight` passed.
- latest remote release branch: `0.0.2`
- compare target: `0.0.2`
- current branch: `main`
- branch status: `current-differs-from-latest-release-branch`
- remote branches observed: `0.0.1`, `0.0.2`, `main`
- `HEAD`, `origin/main`, and `origin/0.0.2`: `6c450b3073825ddd495979474f57342556658972`
- ahead/behind vs `origin/0.0.2`: `0 0`
- required public links: pass
- optional npm metadata: 404
- package metadata: `nexusengine@0.1.0`
- worktree note: pre-existing dirty docs/source/test/state changes and untracked neighboring lane artifacts were present before this run. This lane wrote only this packet, its knowledge node, and the DSK tracker update.

## Files inspected
- `/Users/crimsonwheeler/.codex/automations/nexusengine-dsk-architecture-state-packet/memory.md`
- `/Users/crimsonwheeler/.codex/skills/agent-it/SKILL.md`
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- latest 1-3 DSK packets/nodes through `2026-06-23T06-17-21-0400`
- latest neighboring packets/nodes from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander` through `2026-06-23T07-02-55-0400`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/engine.js`
- `src/index.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`
- `README.md`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest branch `0.0.2`; required public links OK; optional npm metadata 404.
- `git status --short --branch` -> branch `main...origin/main`; dirty docs/source/test/state and untracked neighboring lane files existed before this run.
- `git rev-parse HEAD origin/main origin/0.0.2` -> all refs `6c450b3073825ddd495979474f57342556658972`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- `npm test` -> passed 9 smoke tests.
- Focused `node --input-type=module` probes for reserved `engine.n` API names, extension API/token parity, extension install atomicity, duplicate ECS definition names, composer nested mutation, supplied-composer install bypass, and composer proof metadata parity.

## DSK contract state
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` install behavior (`src/domain-service-kit.js:112-195`).
- `wrapInstall()` still creates `engine.n` as a normal object and writes late to `engine.n[apiName]` (`src/domain-service-kit.js:143-161`).
- `extendDomainServiceKit()` still checks duplicate config object keys and system names, then merges base and extension configs and calls `baseKit.install()` before `extensionConfig.install()` (`src/domain-service-kit.js:198-244`).
- `installRuntimeKit()` still records DSK metadata, bindings, and `engine.kits` before later world, scheduler, sequence, and install hooks can throw (`src/runtime-kit.js:135-215`).
- `createGameKitComposer()` resolves dependency order but returns a frozen outer object with mutable nested `kits`, `orderedKits`, `installOrder`, `provides`, and `bindings` (`src/game-kit-composer.js:27-92`).
- `createRealtimeGame({ composer })` still trusts supplied `composer.kits`, then copies `composer.bindings` and `composer.installOrder` into `engine.game` without recomposition or parity checks (`src/game-kit-composer.js:95-114`).
- Core/ProtoKits/Experiments boundary remains stable: core owns runtime, ECS, scheduler, DSK/composer/host primitives and validation; ProtoKits owns new reusable implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:53-78`).

## Invariant coverage
- Current smoke coverage proves happy-path DSK shape, metadata, token creation, extension duplicate object-key checks, missing `n:` rejection through `createEngine({ kits })`, normal API installation, snapshot serialization happy path, same-object reinstall idempotency, same-id duplicate rejection, API collision throw, public API export presence, host smoke, procedural/navigation smoke, and SequenceNode smoke.
- Missing executable coverage remains: reserved/prototype `apiName`, own-key namespace policy, failed install rollback/retry, extension service-token/API parity, base-already-installed extension transactions, same-name ECS definition identity, direct/composer dependency parity, duplicate provider/binding diagnostics, scheduler/world mutation isolation, event payload isolation, reset/snapshot/async metadata truth, composer nested immutability, supplied-composer validation, and `engine.game` proof metadata parity.

## Domain and kit expansion architecture notes
- DSK Extension Service Ownership remains core hardening inventory because it targets `extendDomainServiceKit()` behavior.
- Composer Read-Model Handoff now belongs beside direct/composer dependency parity under Composition Proof Ownership: a composed graph can pass dependency resolution and later become stale before `createRealtimeGame()` uses it.
- Composer handoff does not replace Runtime Failure Boundary or DSK Extension Service Ownership; it adds proof-integrity fixtures for the composed install path that ProtoKits and Experiments depend on.
- Host Public State Ownership remains adjacent host graph hardening; public module-source, npm, route, and CDN failures remain ecosystem/proof-lane gates.
- New reusable gameplay/domain implementation still belongs in ProtoKits by default; core changes should be limited to runtime/DSK/composer/host primitives and validation invariants.

## Scaling risks
- Large DSK graphs can appear service-complete when `provides` advertises tokens but no matching `engine.n.*` API is installed.
- Extension installs can leave partial API/kit/metadata state after base collisions, making retry and proof snapshots ambiguous.
- Same-name ECS definitions under different keys can alias one store or queue without explicit ownership policy.
- `engine.n` prototype exposure lets reserved API names create inherited services instead of own service slots.
- Mutable composer read models can make dependency-resolved graphs stale after validation, so proof routes may install kits the composer never resolved.
- `engine.game.installOrder` and `engine.game.bindings` can diverge from actual `engine.kits`, weakening host UI, debug panels, packets, and human-view composition evidence.

## Bug candidates
- Reserved `apiName:"__proto__"` still produces no own `engine.n.__proto__` key while exposing the API marker through prototype inheritance.
- An extension with `services:["extra"]`, `provides:["n:plain-ext-base:extra"]`, and `apiName:"plainExtExtra"` installed only `engine.n.plainExtBase`.
- Installing an extension after its base kit threw on `engine.n.atomicBase` while retaining `engine.n.atomicExtExtra`, `n-atomic-ext-extra-kit`, and extension DSK metadata.
- `extendDomainServiceKit()` accepted two `defineResource("dupShared.name")` resources under different config keys.
- A valid composer accepted a post-resolution `composer.kits.push(missingDependentKit)` mutation; `createRealtimeGame({ composer })` installed the unresolved kit even though `composer.hasProvider("runtime:missing")` was false and `composer.installOrder` omitted it.
- Post-compose mutation of `composer.bindings` and `composer.installOrder` appeared in `engine.game` as injected binding metadata and `fake-kit` install order while `engine.kits` contained only the real kit.

## Missing tests
- Reserved `engine.n` key policy for `__proto__`, `constructor`, `prototype`, inherited keys, and own-property service lookup.
- Null-prototype or reserved-key namespace policy for `engine.n`.
- Failed-install rollback/retryability across API collision, `createApi` throw, install hook throw, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, and SequenceNode runtime throw.
- Direct install vs composer dependency policy for `n:*`, `runtime:*`, kit ids, and custom capability tokens.
- Duplicate provider-token and binding-name diagnostics with explicit override policy.
- Extension service-token/API parity, base-already-installed transactions, rollback/retry, and same-name component/resource/event definition identity.
- Composer nested immutability for `kits`, `orderedKits`, `installOrder`, `provides`, and `bindings`.
- `createRealtimeGame({ composer })` supplied-composer validation for stale arrays, fake composer objects, missing requirements, duplicate ids, provider parity, and install-order parity.
- `engine.game.installOrder` and `engine.game.bindings` parity with actual installed kits.
- Host public-state ownership fixtures if host graph snapshots become DSK proof surfaces.

## Promotion risks
- Do not promote broad DSK graphs until runtime failure-boundary fixtures exist for namespace safety, install transaction semantics, dependency parity, duplicate ownership diagnostics, scheduler/world mutation, event queue isolation, and metadata truth.
- Do not treat `extendDomainServiceKit()` as safe service expansion until token/API parity, base-already-installed behavior, rollback/retry, and same-name ECS definition checks are executable.
- Do not treat `createGameKitComposer()` output or `createRealtimeGame({ composer })` as durable proof of resolved DSK installation until nested composer state is immutable or revalidated at handoff.
- Do not use `engine.game.installOrder` or `engine.game.bindings` as release/proof evidence while caller-mutated composer metadata can diverge from actual `engine.kits`.
- Do not collapse local core smoke success with public readiness while npm metadata is 404, public proof remains `Booting...`, module paths 404, optional ProtoKits CDN is red, and targeted Experiments proof misses `engine.n.zoneField`.
- Do not consume Host graph snapshots, dirty host/docs work, or ProtoKits local `main` as release-proof evidence until their proof targets and release policy are explicit.

## Suggested next review item
- In a non-scout lane, add compact executable fixtures for composer read-model immutability and `createRealtimeGame({ composer })` supplied-composer parity beside the existing DSK tranche: reserved `engine.n` keys, failed-install rollback, direct/composer dependency parity, extension API/token parity, base-plus-extension atomicity, same-name ECS definition identity, duplicate provider/binding diagnostics, and `engine.game` metadata parity.

## Not claimed
- This packet does not edit source, tests, docs, examples, package metadata, `.agent`, `memory.md`, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not fix DSK, composer, host, package, public browser, ProtoKits, or Experiments proof bugs.
- This packet does not add fixtures.
- This packet does not claim DSK Extension Service Ownership, Runtime Failure Boundary, Composition Proof Ownership, Host Graph Lifecycle Ownership, Host Public State Ownership, Domain Command Config Ownership, Telemetry Command Evidence Ownership, public proof, npm proof, ProtoKits proof, or Experiments proof is fixed.
- Playwright/Human View validation was not run in this DSK scout because this lane produced review artifacts only; latest neighboring ecosystem state/proof packets carry current browser-visible proof status and still report the public proof route stuck at `Booting...`.
