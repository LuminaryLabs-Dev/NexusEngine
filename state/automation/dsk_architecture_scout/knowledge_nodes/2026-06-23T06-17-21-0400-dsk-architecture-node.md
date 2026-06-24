# Knowledge Nodes: dsk_architecture_scout 2026-06-23T06-17-21-0400

## Root Lesson
- id: dsk-extension-service-refresh-root-2026-06-23-0617
- statement: Core `main` remains commit-aligned with `origin/0.0.2` and smoke-green with 9 tests, but DSK promotion is still blocked by Runtime Failure Boundary and DSK Extension Service Ownership fixtures; the newest ecosystem context adds Host Public State Ownership and proof-route drift without changing the DSK hardening order.
- why it matters: Service graphs can look release-ready while `engine.n` namespace ownership, extension API/token parity, extension install transactions, ECS definition identity, direct/composer parity, host proof surfaces, and public proof gates are still separate unproven claims.

## Child Nodes
- id: dsk-main-release-ref-still-equal-2026-06-23-0617
  parent: dsk-extension-service-refresh-root-2026-06-23-0617
  lesson: Preflight still reports branch-name drift because the checkout is `main`, but commit equality with the latest release ref holds.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `git rev-parse HEAD origin/main origin/0.0.2` returned `6c450b3073825ddd495979474f57342556658972` for all three refs; `git rev-list --left-right --count HEAD...origin/0.0.2` returned `0 0`.
  look further: Decide whether release proof requires branch-name checkout, commit equality, and/or clean worktrees.
- id: dsk-extension-api-token-parity-live-2026-06-23-0617
  parent: dsk-extension-service-refresh-root-2026-06-23-0617
  lesson: Extension `services`, `provides`, and `apiName` can advertise a promoted service without installing the corresponding extension API.
  evidence: Focused probe installed an extension with `services:["extra"]`, `provides:["n:plain-ext-base:extra"]`, and `apiName:"plainExtExtra"`; installed `engine.n` keys were only `["plainExtBase"]`.
  look further: Add fixtures for extension service-token/API parity and decide whether API-less extensions are allowed through an explicit contract.
- id: dsk-extension-install-atomicity-live-2026-06-23-0617
  parent: dsk-extension-service-refresh-root-2026-06-23-0617
  lesson: Base-plus-extension install can leave partial extension state after throwing on a base API collision.
  evidence: Focused probe failed with `cannot overwrite engine.n.atomicBase` while `engine.n.atomicExtExtra`, `engine.kits` entry `n-atomic-ext-extra-kit`, and `engine.domainServiceKits` metadata for the extension remained installed.
  look further: Add rollback/retry fixtures for staged extension installs, base-already-installed behavior, API collisions, kit records, DSK metadata, scheduler additions, resources, and service APIs.
- id: dsk-extension-definition-identity-live-2026-06-23-0617
  parent: dsk-extension-service-refresh-root-2026-06-23-0617
  lesson: Extension duplicate checks still key by config object key, not ECS definition name.
  evidence: Focused probe created two `defineResource("dupShared.name")` definitions under keys `sharedA` and `sharedB`; `extendDomainServiceKit()` accepted the extension.
  look further: Add component/resource/event definition-name identity fixtures and decide how intentional aliases should be declared.
- id: dsk-runtime-failure-boundary-still-first-2026-06-23-0617
  parent: dsk-extension-service-refresh-root-2026-06-23-0617
  lesson: Base runtime failure-boundary remains the first DSK fixture family alongside extension ownership.
  evidence: Focused probe for `apiName:"__proto__"` produced no own key and exposed `reserved-api` through `engine.n` prototype inheritance; source still creates `engine.n = {}` and writes `engine.n[apiName] = api`.
  look further: Add reserved key, null-prototype or own-key, dependency parity, duplicate ownership, scheduler/world mutation, event payload isolation, and reset/snapshot/async metadata fixtures.
- id: dsk-host-public-state-adjacent-2026-06-23-0617
  parent: dsk-extension-service-refresh-root-2026-06-23-0617
  lesson: Host Public State Ownership is a real adjacent host proof-surface risk, but it does not replace DSK extension or runtime failure-boundary work.
  evidence: Neighboring deep bug and domain idea nodes report mutable root `provides`, public `adapterRecords`, record/lifecycle disagreement, and mount side-effect leaks under Host Graph Lifecycle Ownership.
  look further: Keep host fixtures in a host graph hardening lane while DSK fixtures target `domain-service-kit.js`, `runtime-kit.js`, and composer semantics.
- id: dsk-proof-gates-still-separate-2026-06-23-0617
  parent: dsk-extension-service-refresh-root-2026-06-23-0617
  lesson: Public, sibling, and package proof gates remain separate from DSK runtime hardening.
  evidence: Latest ecosystem state reports ProtoKits targeted package resolution red, Experiments aggregate route validation red, targeted `engine.n.zoneField` red, npm 404, package-version split, public route still `Booting...`, and optional ProtoKits jsDelivr proof path 502.
  look further: Let ecosystem/proof lanes pick package/workspace/CDN/same-origin/build-step import-map strategy and decide local-vs-release-vs-main proof targets.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-22T18-19-08-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves DSK Extension Service Ownership, runtime failure-boundary, command/config, host graph, and proof-separation rows while refreshing live probes and 2026-06-23 ecosystem context.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-23T06-06-22-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Adds current public/browser, sibling drift, npm, package-version, optional CDN, and Host Public State context that remains separate from DSK hardening.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-22T18-49-24-0400-deep-bug-node.md`
- relationship: adjacent
- reason: Supplies Host Public State Ownership evidence without replacing DSK extension-service or runtime failure-boundary fixtures.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-22T19-04-12-0400-domain-kit-idea-node.md`
- relationship: separates
- reason: Maps host public-state planning under Host Graph Lifecycle Ownership while keeping DSK Extension Service Ownership distinct.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-22T18-36-17-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Keeps branch/ref policy, package resolution, aggregate-route validation, targeted DSK API installation, npm, package-version policy, and browser imports as proof gates.

## Next Search Branches
- branch: dsk-extension-service-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest fixture set for extension API/token parity, base-already-installed install semantics, rollback/retry, and same-name ECS definition identity?
- branch: runtime-failure-boundary-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, duplicate ownership, scheduler/world mutation, event payload isolation, and metadata truth?
- branch: host-public-state-fixtures
  files or folders: `src/host.js`, `tests/host-smoke.mjs`
  question: Which host capability, record privacy, lifecycle parity, and mount transaction policies must be executable before host graph snapshots count as proof surfaces?
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, `git rev-parse HEAD origin/main origin/0.0.2`
  question: Should automation proof require checkout of the latest release branch name, commit equality against the resolved target, and/or clean worktrees?
- branch: module-source-proof-boundary
  files or folders: ecosystem proof/state packets, sibling ProtoKits and Experiments proof paths, public CDN/raw/GitHub Pages URLs
  question: Which proof claims are distribution/module-source issues rather than runtime hardening?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit docs, edit public claims, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, prove DSK Extension Service Ownership readiness, prove Runtime Failure Boundary readiness, prove Host Graph Lifecycle Ownership readiness, prove Host Public State Ownership readiness, prove Domain Command Config Ownership readiness, prove Telemetry Command Evidence Ownership readiness, or prove broad DSK promotion readiness.
