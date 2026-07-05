# DSK Architecture State Packet: 2026-06-23T06-17-21-0400

## Timestamp
- 2026-06-23 06:17:21 EDT

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Latest current-lane packet `2026-06-22T18-19-08-0400` made DSK Extension Service Ownership the active DSK root: `extendDomainServiceKit()` needs API/token parity, base-plus-extension install atomicity, and ECS definition-name identity fixtures.
- Latest ecosystem state packet `2026-06-23T06-06-22-0400` reports core remains commit-aligned with `origin/0.0.2` and smoke-green, while ProtoKits local/release proof, targeted package resolution, Experiments aggregate route validation, targeted `engine.n.zoneField`, npm metadata, package-version policy, public `Booting...`, optional ProtoKits jsDelivr, dirty host/docs release boundary, Host Public State Ownership, and DSK Extension Service Ownership remain separate open gates.
- Latest ecosystem proof packet/node `2026-06-22T18-36-17-0400` keeps branch/ref policy, package resolution, aggregate-route validation, targeted DSK API installation, npm, package-version policy, and browser import deployment as proof gates rather than DSK runtime fixes.
- Latest deep bug packet/node `2026-06-22T18-49-24-0400` adds Host Public State Ownership under Host Graph Lifecycle Ownership: mutable root `provides`, public `adapterRecords`, record/lifecycle disagreement, and mount callback side-effect leaks.
- Latest domain idea packet/node `2026-06-22T19-04-12-0400` maps Host Public State Ownership under the host graph family and keeps it separate from DSK extension hardening and public distribution proof.
- These packets were context only. Live source, docs, tests, git refs, preflight, and focused probes were authority for this run.

## Latest branch
- preflight command: `npm run automation:preflight`
- preflight timestamp: `2026-06-23T10:16:10.698Z`
- latest remote release branch: `0.0.2`
- compare target: `0.0.2`
- branch status: `current-differs-from-latest-release-branch`
- current branch: `main`
- `HEAD`, `origin/main`, and `origin/0.0.2`: `6c450b3073825ddd495979474f57342556658972`
- ahead/behind vs `origin/0.0.2`: `0 0`
- required public links: pass
- optional npm metadata: 404

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/README.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- Latest 1-3 DSK architecture packets and nodes through `2026-06-22T18-19-08-0400`
- Latest neighboring ecosystem state, ecosystem proof, deep bug, and domain idea packets/nodes through `2026-06-23T06-06-22-0400`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight`
- `git status --short`
- `git rev-parse HEAD origin/main origin/0.0.2`
- `git rev-list --left-right --count HEAD...origin/0.0.2`
- `npm test`
- focused `node --input-type=module` probes for reserved `engine.n` API names, extension API/token parity, extension install atomicity, and duplicate ECS definition-name acceptance.

## DSK contract state
- `defineDomainServiceKit()` remains the promoted DSK contract over `defineRuntimeKit()`: stable `n-<domain>-kit` ids, `n:<domain>` tokens, `engine.n.<apiName>` APIs, required version/stability metadata, and linear execution metadata with future async/reset/snapshot expectations.
- `wrapInstall()` still creates `engine.n` as a normal object and accepts any JS identifier-like `apiName`, including reserved/prototype names.
- `extendDomainServiceKit()` still merges base and extension config, installs by calling `baseKit.install()` then `extensionConfig.install()`, and validates duplicate config keys and system names but not same-name ECS definitions under different keys.
- `installRuntimeKit()` still records `engine.domainServiceKits[kit.id]`, kit bindings, and `engine.kits` before later `initWorld`, scheduler, registry, sequence, and DSK install paths can throw.
- Composer dependency checks and direct `engine.installKit()` DSK checks still do not represent a fully unified dependency/transaction policy.

## Invariant coverage
- Current smoke coverage proves the happy DSK path, metadata shape, service tokens, dependency failure through `createEngine({ kits })`, extension duplicate config keys, duplicate system names, API collision throw, same-object reinstall idempotency, and duplicate same-id DSK install throw.
- Missing executable coverage remains: reserved/prototype `apiName`, null-prototype or own-key namespace policy, failed install rollback/retry, partial extension install, duplicate binding/provider ownership, same-name ECS definition identity, direct/composer parity, scheduler/world mutation isolation, event payload isolation, returned/read state ownership, and reset/snapshot/async metadata truth.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments boundary remains stable: NexusEngine core owns runtime, ECS, scheduler, DSK/composer/host primitives, and validation invariants; new reusable implementation belongs in ProtoKits; browser/playable proof belongs in Experiments.
- DSK Extension Service Ownership is core validation-surface work because it concerns `extendDomainServiceKit()` itself.
- Host Public State Ownership is adjacent host graph hardening. It does not supersede DSK Extension Service Ownership, Runtime Failure Boundary, or public proof gates.
- Proof Readiness Queue remains separate: module-source strategy, npm availability, package-version policy, public browser imports, aggregate/targeted parity, and sibling branch targets are proof claims, not DSK source hardening evidence.

## Scaling risks
- Large DSK graphs can appear service-complete when `provides` contains a token but no corresponding promoted `engine.n.*` API is installed.
- Extension installs can leave partial state after a base API collision, making retry and proof snapshots ambiguous.
- Same-name ECS definitions under different object keys can merge silently across base and extension kits, risking shared resource/component/event identity without explicit ownership.
- `engine.n` prototype exposure means a reserved API name can install an inherited service instead of an own service key, making service discovery and proof snapshots unreliable.
- Public host state and adapter records add graph proof risk if host shells become the lifecycle wrapper for DSK proof pages before host fixtures exist.

## Bug candidates
- Reserved `apiName:"__proto__"` still produces no own `engine.n.__proto__` key while exposing the API marker through prototype inheritance.
- An extension with `services:["extra"]`, `provides:["n:plain-ext-base:extra"]`, and `apiName:"plainExtExtra"` can install only the base `engine.n.plainExtBase` API when the extension has no `createApi()` or install return.
- Installing an extension whose base API collides with an already installed DSK can throw while retaining the extension API, kit record, and DSK metadata.
- `extendDomainServiceKit()` accepts same-name ECS resources under different config keys.
- Direct kit install and composed kit install still need one documented dependency and transaction policy.

## Missing tests
- Reserved/prototype `engine.n` API-name policy and service discovery.
- Extension service-token/API parity, including explicit API-less extension policy if allowed.
- Base-already-installed extension transaction behavior, rollback, retry, and partial-state diagnostics.
- Same-name component/resource/event definition rejection or intentional alias declaration.
- Duplicate binding/provider diagnostics across direct and composed installs.
- Runtime failure-boundary fixtures for scheduler/world mutation, event payload isolation, and reset/snapshot/async metadata truth.
- Host public-state ownership fixtures if host graph snapshots will be used as DSK proof surfaces.

## Promotion risks
- DSK promotion should not consume local green smoke tests as production readiness while runtime failure-boundary and extension ownership fixtures are absent.
- DSK promotion should not consume ProtoKits local `main` proof as release-ref proof while local ProtoKits remains separated from `origin/0.0.2` and `origin/main`.
- DSK promotion should not claim public/browser readiness while npm metadata is 404, public proof stays at `Booting...`, module paths 404, and targeted Experiments proof misses `engine.n.zoneField`.
- DSK promotion should not rely on Host graph snapshots as authoritative proof until Host Graph Lifecycle Ownership and Host Public State Ownership fixtures exist.

## Suggested next review item
- In a non-scout lane, add compact executable DSK fixtures for: `engine.n` reserved-key/null-prototype/own-property policy; extension service token/API parity; base-already-installed extension rollback/retry; same-name ECS definition identity; and direct/composer dependency parity. Keep host public-state fixtures and public module-source proof in their own lanes.

## Not claimed
- This packet does not edit source, tests, docs, examples, package metadata, `.agent`, `memory.md`, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not fix DSK bugs or add fixtures.
- This packet does not claim DSK Extension Service Ownership, Runtime Failure Boundary, Host Graph Lifecycle Ownership, Host Public State Ownership, Domain Command Config Ownership, Telemetry Command Evidence Ownership, public proof, npm proof, ProtoKits targeted proof, or Experiments aggregate/targeted proof is fixed.
- Playwright/Human View validation was not run in this DSK scout because this lane produced review artifacts only; the latest neighboring ecosystem state packet carries current browser-visible public proof status and still reports the public proof route stuck at `Booting...`.
