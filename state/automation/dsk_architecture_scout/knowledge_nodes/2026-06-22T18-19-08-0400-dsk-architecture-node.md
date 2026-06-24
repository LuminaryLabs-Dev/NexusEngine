# Knowledge Nodes: dsk_architecture_scout 2026-06-22T18-19-08-0400

## Root Lesson
- id: dsk-extension-service-ownership-root-2026-06-22-1819
- statement: Core remains commit-aligned with the preflight-resolved `origin/0.0.2` and smoke-green with 9 tests, but DSK promotion now needs explicit DSK Extension Service Ownership fixtures in addition to the existing runtime failure-boundary, command/config, host graph, and proof-separation rows.
- why it matters: `extendDomainServiceKit()` is the natural service-expansion path for ProtoKits, but live probes show extensions can advertise service tokens without installing matching APIs, partially install after base collisions, and merge same-name ECS definitions under different keys.

## Child Nodes
- id: dsk-main-equals-release-ref-2026-06-22-1819
  parent: dsk-extension-service-ownership-root-2026-06-22-1819
  lesson: Preflight still reports branch-name drift because the checkout is `main`, but commit parity with the latest release ref holds.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2` and `branchStatus: current-differs-from-latest-release-branch`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `6c450b3073825ddd495979474f57342556658972`; ahead/behind against `origin/0.0.2` was `0 0`.
  look further: Decide whether release proof requires branch-name checkout, commit equality against the resolved release target, and/or clean worktrees.
- id: dsk-runtime-failure-boundary-still-first-2026-06-22-1819
  parent: dsk-extension-service-ownership-root-2026-06-22-1819
  lesson: Namespace safety, install transaction semantics, dependency parity, duplicate binding/provider ownership, scheduler/world mutation, event payload isolation, and metadata truth remain the first DSK hardening tranche.
  evidence: Focused probe returned inherited `__proto__` API marker with no own key, retained failed API-collision DSK metadata plus false same-object reinstall success, direct install of missing `runtime:missing`, and duplicate binding overwrite.
  look further: Write executable fixtures for reserved keys, null-prototype or own-key policy, rollback/preflight, dependency parity, duplicate ownership diagnostics, scheduler/world mutation, event queue isolation, and reset/snapshot/async metadata truth.
- id: dsk-extension-service-ownership-confirmed-2026-06-22-1819
  parent: dsk-extension-service-ownership-root-2026-06-22-1819
  lesson: `extendDomainServiceKit()` service expansion is live core hardening inventory and should become executable fixtures, not another planning-only row.
  evidence: Focused probe showed extension `baseProbeExtra` provided `n:base-probe:extra` but installed only `engine.n.baseProbe`; installing an extension with its own API after the base kit retained `engine.n.baseProbeWithApi`, kit record, and DSK metadata after throwing; a base resource and extension resource under different keys both used definition name `probe.sameResource`.
  look further: Add fixtures for extension token/API parity, base-already-installed transactions, rollback/retry behavior, and same-name component/resource/event rejection.
- id: dsk-extension-separate-from-proof-2026-06-22-1819
  parent: dsk-extension-service-ownership-root-2026-06-22-1819
  lesson: DSK Extension Service Ownership is a core contract hardening row, not a distribution or public proof fix.
  evidence: Latest ecosystem state/proof nodes still report ProtoKits package-resolution failure, Experiments aggregate route failure, targeted `engine.n.zoneField`, npm 404, package-version split, and public `Booting...` module 404s after extension evidence was found.
  look further: Keep package/workspace/CDN/same-origin/build-step import-map decisions in ecosystem/proof lanes.
- id: dsk-host-graph-and-command-ownership-carried-2026-06-22-1819
  parent: dsk-extension-service-ownership-root-2026-06-22-1819
  lesson: Extension service ownership adds to, but does not replace, Host Graph Lifecycle Ownership, Domain Command Config Ownership, and Telemetry Command Evidence Ownership.
  evidence: Current DSK tracker and latest packets keep host adapter capability/identity/lifecycle/snapshot ownership, Economy/TimingWindow/ResourcePressure/LifecycleProgression/FacilityOperations ownership, and telemetry/RequestQueue/TransportRoute/InputIntent ownership as separate hardening families.
  look further: Preserve each fixture family by API surface rather than merging them into a broad mutable-state bucket.
- id: dsk-core-boundary-preserved-2026-06-22-1819
  parent: dsk-extension-service-ownership-root-2026-06-22-1819
  lesson: DSK extension contract fixes belong in core because they harden runtime primitives; new reusable gameplay/domain implementation still belongs in ProtoKits and playable/browser proof in Experiments.
  evidence: `docs/how-to-protokit.md` keeps core as runtime/DSK/composer/primitive owner, ProtoKits as reusable implementation owner, and Experiments as playable proof owner.
  look further: Harden `extendDomainServiceKit()` and install contracts without moving proof routes or new reusable implementation into NexusRealtime core.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-22T06-19-35-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves runtime failure-boundary, command/config ownership, host graph ownership, proof separation, and core boundary rows while adding DSK Extension Service Ownership.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-22T06-49-01-0400-deep-bug-node.md`
- relationship: confirms
- reason: Supplies extension API/token parity, partial extension install, and same-name definition aliasing evidence.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-22T07-03-20-0400-domain-kit-idea-node.md`
- relationship: confirms
- reason: Maps extension service evidence into planning inventory without replacing proof-readiness or runtime failure-boundary gates.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-22T18-07-07-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Keeps extension service ownership separate from ProtoKits local-vs-release, package resolution, npm, package-version, Experiments, and public browser proof gates.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-22T06-36-22-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Keeps branch/ref policy, package resolution, aggregate-route validation, targeted DSK API installation, npm, and browser import deployment separate from core hardening rows.

## Next Search Branches
- branch: dsk-extension-service-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest end-to-end extension fixture set for token/API parity, base-already-installed behavior, rollback, retry, and definition-name identity?
- branch: runtime-failure-boundary-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, duplicate ownership, scheduler/world mutation, event payload isolation, and metadata truth?
- branch: host-graph-lifecycle-fixtures
  files or folders: `src/host.js`, `tests/host-smoke.mjs`
  question: Which host adapter capability, identity, lifecycle, and snapshot policies must be executable before host graphs count as proof?
- branch: domain-command-config-fixtures
  files or folders: `src/economy-kit.js`, `src/timing-window-kit.js`, `src/resource-pressure-kit.js`, `src/lifecycle-progression-kit.js`, `src/facility-operations-kit.js`
  question: Which command/config/read APIs should clone/freeze submitted nested data and return immutable summaries versus explicit mutable handles?
- branch: protokits-local-vs-release-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`, fetched `origin/0.0.2`, package metadata, release branch policy
  question: Should DSK proof consume local ProtoKits `main`, `origin/main`, or the preflight-resolved release branch?
- branch: module-source-proof-boundary
  files or folders: ecosystem proof/state packets, sibling ProtoKits and Experiments proof paths, public CDN/raw URLs
  question: Which proof claims are distribution/module-source issues rather than runtime hardening?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, prove runtime failure-boundary readiness, prove DSK Extension Service Ownership readiness, prove scheduler/world mutation readiness, prove procedural/navigation ownership readiness, prove telemetry/command evidence ownership readiness, prove domain command/config ownership readiness, prove Host Graph Lifecycle Ownership readiness, prove query-read-model readiness, prove content-boundary/objective readiness, prove runtime identity/lifecycle readiness, prove composition-proof ownership readiness, prove proof-signal integrity readiness, prove dirty host-surface release readiness, or prove broad DSK promotion readiness.
