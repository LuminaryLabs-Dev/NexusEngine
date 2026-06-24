# Knowledge Nodes: dsk_architecture_scout 2026-06-23T18-59-21-0400

## Root Lesson
- id: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
- statement: Core `main` remains commit-aligned with `origin/0.0.2` and smoke-green with 9 tests, but DSK promotion now needs Composition Proof Ownership fixtures beside Runtime Failure Boundary and DSK Extension Service Ownership; mutable composer state can make a previously resolved graph install unresolved kits and publish fake proof metadata.
- why it matters: Large ProtoKit and Experiments proof graphs rely on `createGameKitComposer()` and `createRealtimeGame({ composer })` as the safe composed install path. If composer output is mutable after dependency resolution, proof packets, host inspectors, and `engine.game` metadata can claim a graph that was not actually resolved or installed.

## Child Nodes
- id: dsk-main-release-ref-still-equal-2026-06-23-1859
  parent: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
  lesson: Preflight still reports branch-name drift because checkout is `main`, but commit equality with the latest release ref holds.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `6c450b3073825ddd495979474f57342556658972`; `git rev-list --left-right --count HEAD...origin/0.0.2` returned `0 0`; `npm test` passed 9 smoke tests.
  look further: Decide whether release proof requires branch-name checkout, commit equality, clean worktrees, or explicit local/release proof separation.
- id: dsk-runtime-failure-boundary-still-first-2026-06-23-1859
  parent: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
  lesson: Namespace safety and install transaction semantics remain first-order DSK fixtures.
  evidence: Focused probe for `apiName:"__proto__"` returned `own:false`, no own keys, and inherited/prototype marker `reserved-api`; source still creates `engine.n = {}` and writes `engine.n[apiName] = api`.
  look further: Add reserved-key, null-prototype or own-key, rollback/preflight, dependency parity, duplicate ownership, scheduler/world mutation, event payload isolation, and metadata truth fixtures.
- id: dsk-extension-api-token-parity-live-2026-06-23-1859
  parent: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
  lesson: Extension metadata can advertise a distinct service/API without installing the corresponding extension API.
  evidence: Focused probe installed an extension with `apiName:"plainExtExtra"` and `provides:["n:plain-ext-base:extra"]`; installed `engine.n` keys were only `["plainExtBase"]`.
  look further: Add extension service-token/API parity fixtures and define explicit policy for API-less extensions if allowed.
- id: dsk-extension-install-atomicity-live-2026-06-23-1859
  parent: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
  lesson: Base-plus-extension install can throw on base API collision while retaining extension state.
  evidence: Focused probe failed with `cannot overwrite engine.n.atomicBase` while `engine.n.atomicExtExtra`, kit record `n-atomic-ext-extra-kit`, and extension DSK metadata remained installed.
  look further: Add rollback/retry fixtures for base-already-installed behavior, API collisions, kit records, DSK metadata, scheduler additions, resources, and service APIs.
- id: dsk-extension-definition-identity-live-2026-06-23-1859
  parent: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
  lesson: Extension duplicate checks still key by config object key, not ECS definition name.
  evidence: Focused probe created two `defineResource("dupShared.name")` definitions under keys `sharedA` and `sharedB`; `extendDomainServiceKit()` accepted the extension.
  look further: Add component/resource/event definition-name identity fixtures and decide how intentional aliases are declared.
- id: dsk-composer-nested-mutation-live-2026-06-23-1859
  parent: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
  lesson: Composer output is frozen only at the outer object; nested arrays/maps can be mutated after dependency resolution.
  evidence: Focused probe returned `Object.isFrozen(composer) === true`, but `kits`, `orderedKits`, `installOrder`, `provides`, and `bindings` were not frozen; after `composer.kits.push(missingDependentKit)`, `createRealtimeGame({ composer })` installed `missing-dependent-kit` even though `composer.hasProvider("runtime:missing")` was false.
  look further: Freeze or clone nested composer state and add post-compose mutation fixtures.
- id: dsk-realtime-game-composer-handoff-live-2026-06-23-1859
  parent: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
  lesson: `createRealtimeGame({ composer })` trusts supplied composer state without dependency, id, provider, or install-order parity checks.
  evidence: Source passes `composer.kits` directly into `createEngine()` and copies `composer.bindings`/`composer.installOrder` into `engine.game`; probe installed a kit requiring unresolved `runtime:missing` after the composer had already resolved.
  look further: Add supplied-composer fixtures for stale arrays, fake composer objects, duplicate ids, missing requirements, provider parity, and install-order parity.
- id: dsk-composer-proof-metadata-parity-live-2026-06-23-1859
  parent: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
  lesson: `engine.game` proof metadata can diverge from actual installed kits.
  evidence: Probe mutated `composer.bindings.injected` and pushed `fake-kit` into `composer.installOrder`; `engine.game.bindings` exposed the injected binding and `engine.game.installOrder` included `fake-kit`, while `engine.kits` contained only `binding-provider`.
  look further: Derive proof metadata from actual installed kits or frozen snapshots before host/debug/proof tools rely on `engine.game`.
- id: dsk-proof-gates-still-separate-2026-06-23-1859
  parent: dsk-composer-handoff-extension-refresh-root-2026-06-23-1859
  lesson: Composer, extension, and runtime hardening do not fix distribution or browser proof gates.
  evidence: Latest ecosystem state/proof nodes still report ProtoKits package-resolution red, Experiments aggregate route red, targeted `engine.n.zoneField` red, npm 404, package-version split, optional ProtoKits jsDelivr 502, and public route `Booting...`.
  look further: Keep package/workspace/CDN/same-origin/build-step import-map decisions in ecosystem/proof lanes.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-23T06-17-21-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves Runtime Failure Boundary and DSK Extension Service Ownership while adding current composer handoff proof-integrity evidence.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-23T06-49-16-0400-deep-bug-node.md`
- relationship: extends
- reason: Supplies composer nested mutation, stale supplied-composer handoff, and proof metadata drift evidence.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-23T07-02-55-0400-domain-kit-idea-node.md`
- relationship: maps
- reason: Maps composer handoff under Composition Proof Ownership rather than public proof, host graph, or DSK extension ownership.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-23T06-38-41-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Keeps public/browser, npm, package-version, ProtoKits, and Experiments proof blockers separate from hardening fixtures.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-23T06-06-22-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Keeps dirty core host/docs context and sibling drift from being treated as DSK readiness.

## Next Search Branches
- branch: composer-read-model-immutability
  files or folders: `src/game-kit-composer.js`, composer fixtures
  question: Which composer fields should be deeply frozen, cloned, branded, or exposed only through read snapshots?
- branch: realtime-game-supplied-composer-contract
  files or folders: `src/game-kit-composer.js`, `src/engine.js`, tests
  question: Should `createRealtimeGame()` recompose supplied composer kits, reject unbranded composers, or assert provider/install-order parity before install?
- branch: composer-proof-metadata-parity
  files or folders: `src/game-kit-composer.js`, proof-route fixtures, host inspectors
  question: Should `engine.game.installOrder` and `engine.game.bindings` be derived from actual installed kits instead of live composer metadata?
- branch: dsk-extension-service-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest fixture set for extension API/token parity, base-already-installed install semantics, rollback/retry, and same-name ECS definition identity?
- branch: runtime-failure-boundary-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, tests
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, duplicate ownership, scheduler/world mutation, event payload isolation, and metadata truth?
- branch: module-source-proof-boundary
  files or folders: ecosystem proof/state packets, sibling ProtoKits and Experiments proof paths, public URLs
  question: Which proof claims are distribution/module-source issues rather than runtime hardening?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit docs, edit public claims, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, prove composer hardening, prove DSK Extension Service Ownership readiness, prove Runtime Failure Boundary readiness, prove Host Graph Lifecycle Ownership readiness, prove Host Public State Ownership readiness, or prove broad DSK promotion readiness.
