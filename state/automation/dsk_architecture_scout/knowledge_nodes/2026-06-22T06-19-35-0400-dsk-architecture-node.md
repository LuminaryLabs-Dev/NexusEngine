# Knowledge Nodes: dsk_architecture_scout 2026-06-22T06-19-35-0400

## Root Lesson
- id: dsk-host-graph-and-release-separation-root-2026-06-22-0619
- statement: Core remains commit-aligned with the preflight-resolved `origin/0.0.2` and smoke-green with 9 tests, but DSK promotion still needs the same runtime failure-boundary fixtures plus explicit Host Graph Lifecycle Ownership and local-vs-release proof separation.
- why it matters: Dirty host graph APIs and ProtoKits local drift can make local proof look stronger than release/public proof, while the source-level DSK blockers remain namespace safety, install atomicity, dependency parity, ownership isolation, and metadata truth.

## Child Nodes
- id: dsk-main-equals-release-ref-2026-06-22-0619
  parent: dsk-host-graph-and-release-separation-root-2026-06-22-0619
  lesson: Preflight still reports branch-name drift because the checkout is `main`, but commit parity with the latest release ref holds.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2` and `branchStatus: current-differs-from-latest-release-branch`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `6c450b3073825ddd495979474f57342556658972`; ahead/behind against `origin/0.0.2` was `0 0`.
  look further: Decide whether release proof requires branch-name checkout, commit equality against the resolved release target, and/or clean worktrees.
- id: dsk-runtime-failure-boundary-still-first-2026-06-22-0619
  parent: dsk-host-graph-and-release-separation-root-2026-06-22-0619
  lesson: Namespace safety, install transaction semantics, dependency parity, duplicate binding/provider ownership, scheduler/world mutation, event payload isolation, and metadata truth remain the first DSK hardening tranche.
  evidence: Focused probe returned inherited `__proto__` API marker with no own key, retained failed API-collision DSK metadata plus false same-object reinstall success, direct install of missing `runtime:missing`, and duplicate binding overwrite.
  look further: Write executable fixtures for reserved keys, null-prototype or own-key policy, rollback/preflight, dependency parity, duplicate ownership diagnostics, scheduler/world mutation, event queue isolation, and reset/snapshot/async metadata truth.
- id: dsk-domain-command-config-still-live-2026-06-22-0619
  parent: dsk-host-graph-and-release-separation-root-2026-06-22-0619
  lesson: Domain Command Config Ownership remains live in the current checkout and should stay in the hardening queue.
  evidence: Focused probes showed Economy ledger metadata and returned state are live; TimingWindow action/window metadata are live through results and active reads; ResourcePressure resource/adjustment metadata are live through changes and reads; LifecycleProgression add payloads are live; FacilityOperations add payloads can mutate later output and economy cash.
  look further: Add fixtures for Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations metadata cloning, nested payload capture, returned state mutation, read isolation, emitted payload ownership, and future simulation side effects.
- id: dsk-host-graph-lifecycle-separate-2026-06-22-0619
  parent: dsk-host-graph-and-release-separation-root-2026-06-22-0619
  lesson: Host Graph Lifecycle Ownership is a real hardening row for dirty `Nexus.Host`, but it is not proof that DSK runtime promotion is safe.
  evidence: Focused probe showed forged adapter dependency satisfaction through mutable `provides`, duplicate adapter ids collapsed to one snapshot key, throwing unmount lost the adapter record while lifecycle stayed stale, and adapter `snapshot()` mutated host diagnostics during a read; source evidence includes `src/host.js:48-52`, `src/host.js:86-95`, `src/host.js:124-149`, and `src/host.js:181-205`.
  look further: Add host fixtures for adapter token immutability, duplicate adapter identity/domain/provider policy, mount/unmount failure transactions, graph record parity, snapshot purity, diagnostics timing, and repeated polling idempotency.
- id: dsk-protokits-local-release-proof-split-2026-06-22-0619
  parent: dsk-host-graph-and-release-separation-root-2026-06-22-0619
  lesson: ProtoKits local development proof and `origin/0.0.2` release proof must stay separated before DSK promotion claims consume sibling evidence.
  evidence: Ecosystem state node `2026-06-22T06-05-45-0400` reports ProtoKits local `main` is clean and aggregate-green at 470 modules, but 103 commits ahead of `origin/0.0.2`; targeted ProtoKits package resolution, Experiments aggregate, targeted `engine.n.zoneField`, npm, and public browser proof remain red.
  look further: Decide whether the next proof target is local ProtoKits `main`, `origin/main`, or preflight-resolved `origin/0.0.2`.
- id: dsk-module-source-proof-separate-2026-06-22-0619
  parent: dsk-host-graph-and-release-separation-root-2026-06-22-0619
  lesson: Public/local/fetched DSK proof remains a distribution and proof-lane problem, separate from DSK runtime hardening and host graph hardening.
  evidence: Ecosystem proof and state nodes keep package resolution, aggregate-route validation, targeted DSK API installation, npm publication, package-version policy, and browser import deployment as separate gates.
  look further: Let ecosystem/proof lanes choose one package/workspace/CDN/same-origin/build-step import-map model.
- id: dsk-core-boundary-preserved-2026-06-22-0619
  parent: dsk-host-graph-and-release-separation-root-2026-06-22-0619
  lesson: Hardening fixtures target existing core validation surfaces; new reusable gameplay/domain implementation still belongs in ProtoKits and playable/browser proof in Experiments.
  evidence: `docs/how-to-protokit.md` keeps core as runtime/DSK/composer/primitive owner, ProtoKits as reusable implementation owner, and Experiments as playable proof owner.
  look further: Harden core contracts without moving proof routing, host demos, or new reusable implementation into NexusRealtime core.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-21T18-18-55-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves runtime failure-boundary, domain command/config ownership, telemetry/command evidence ownership, dirty host-surface separation, module-source separation, and core boundary rows while adding current Host Graph Lifecycle Ownership and ProtoKits local-vs-release separation.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-22T06-05-45-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Adds latest ProtoKits local-ahead release split and keeps public proof failures separate from DSK hardening.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-21T18-35-45-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Keeps branch/ref policy, package resolution, aggregate-route validation, targeted DSK API installation, npm, and browser import deployment separate from hardening rows.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-21T18-48-04-0400-deep-bug-node.md`
- relationship: confirms
- reason: Supplies Host Graph Lifecycle Ownership bugs for the hardening queue.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-21T19-03-16-0400-domain-kit-idea-node.md`
- relationship: confirms
- reason: Maps host graph lifecycle evidence into planning inventory without replacing proof-readiness or DSK runtime hardening.

## Next Search Branches
- branch: runtime-failure-boundary-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, duplicate ownership, scheduler/world mutation, event payload isolation, and metadata truth?
- branch: domain-command-config-fixtures
  files or folders: `src/economy-kit.js`, `src/timing-window-kit.js`, `src/resource-pressure-kit.js`, `src/lifecycle-progression-kit.js`, `src/facility-operations-kit.js`
  question: Which command/config/read APIs should clone/freeze submitted nested data and return immutable summaries versus explicit mutable handles?
- branch: host-graph-lifecycle-fixtures
  files or folders: `src/host.js`, `tests/host-smoke.mjs`
  question: Which host adapter capability, identity, lifecycle, and snapshot policies must be executable before host graphs count as proof?
- branch: protokits-local-vs-release-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`, fetched `origin/0.0.2`, package metadata, release branch policy
  question: Should DSK proof consume local ProtoKits `main`, `origin/main`, or the preflight-resolved release branch?
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, `git rev-parse HEAD origin/main origin/0.0.2`
  question: Should automation proof require checkout of the latest release branch name, or is commit equality against the resolved target enough?
- branch: module-source-proof-boundary
  files or folders: ecosystem proof/state packets, sibling ProtoKits and Experiments proof paths, public CDN/raw URLs
  question: Which proof claims are distribution/module-source issues rather than runtime hardening?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, prove runtime failure-boundary readiness, prove scheduler/world mutation readiness, prove procedural/navigation ownership readiness, prove telemetry/command evidence ownership readiness, prove domain command/config ownership readiness, prove Host Graph Lifecycle Ownership readiness, prove query-read-model readiness, prove content-boundary/objective readiness, prove runtime identity/lifecycle readiness, prove composition-proof ownership readiness, prove proof-signal integrity readiness, prove dirty host-surface release readiness, or prove broad DSK promotion readiness.
