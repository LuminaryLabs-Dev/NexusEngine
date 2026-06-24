# Knowledge Nodes: dsk_architecture_scout 2026-06-21T18-18-55-0400

## Root Lesson
- id: dsk-command-config-context-root-2026-06-21-1818
- statement: Core `main` remains commit-aligned with the preflight-resolved `origin/0.0.2` and smoke-green with 9 tests, but DSK promotion now needs Domain Command Config Ownership fixtures in addition to runtime failure-boundary and telemetry/command evidence ownership.
- why it matters: Economy ledgers, timing receipts, pressure resources, lifecycle payloads, and facility outputs can look like reusable DSK proof while caller-owned nested data or returned/read handles can still mutate accepted commands, stored state, and future simulation.

## Child Nodes
- id: dsk-main-equals-release-ref-2026-06-21-1818
  parent: dsk-command-config-context-root-2026-06-21-1818
  lesson: Preflight still reports branch-name drift because the checkout is `main`, but commit parity with the latest release ref holds at the current newer commit.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2` and `branchStatus: current-differs-from-latest-release-branch`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `6c450b3073825ddd495979474f57342556658972`; ahead/behind against `origin/0.0.2` was `0 0`.
  look further: Decide whether release proof requires branch-name checkout or commit equality against the resolved release target.
- id: dsk-dirty-host-surface-separate-2026-06-21-1818
  parent: dsk-command-config-context-root-2026-06-21-1818
  lesson: Dirty host-surface exports and smoke coverage are live source/test context, not DSK hardening proof.
  evidence: `git diff` showed `src/index.js` exporting `createNexusHost`, `defineHostAdapter`, and `createHostGraphSnapshot`; `tests/public-api-freeze.mjs` and `tests/run-all.mjs` include host coverage; `npm test` passed 9 smoke tests.
  look further: Let ecosystem/release lanes decide whether dirty host work is part of the next release proof before public/package claims reference it.
- id: dsk-runtime-failure-boundary-still-first-2026-06-21-1818
  parent: dsk-command-config-context-root-2026-06-21-1818
  lesson: Namespace safety, install transaction semantics, dependency parity, duplicate binding/provider ownership, scheduler/world mutation, event payload isolation, and metadata truth remain the first hardening tranche.
  evidence: Focused probe returned inherited `__proto__` API marker with no own key, retained failed API-collision DSK metadata plus false same-object reinstall success, direct install of missing `runtime:missing`, and duplicate binding overwrite.
  look further: Write executable fixtures for reserved keys, null-prototype or own-key policy, rollback/preflight, dependency parity, duplicate ownership diagnostics, scheduler/world mutation, event queue isolation, and reset/snapshot/async metadata truth.
- id: dsk-command-config-ownership-confirmed-2026-06-21-1818
  parent: dsk-command-config-context-root-2026-06-21-1818
  lesson: Domain Command Config Ownership is live in the current checkout and should become executable fixtures, not another planning-only row.
  evidence: Focused probes showed Economy ledger metadata and returned state are live; TimingWindow action/window metadata is live through results and active reads; ResourcePressure resource/adjustment metadata is live through changes and reads; LifecycleProgression add payloads are live; FacilityOperations add payloads can mutate later output and economy cash.
  look further: Add fixtures for Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations metadata cloning, nested payload capture, returned state mutation, read isolation, emitted payload ownership, and future simulation side effects.
- id: dsk-telemetry-command-evidence-still-separate-2026-06-21-1818
  parent: dsk-command-config-context-root-2026-06-21-1818
  lesson: Domain command/config ownership extends but does not replace Telemetry Command Evidence Ownership.
  evidence: Prior DSK node `2026-06-21T06-19-09-0400` keeps telemetry selected-value/path ownership, RequestQueue/TransportRoute command metadata ownership, and InputIntent frame ownership active; current probes target Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations.
  look further: Preserve both fixture families under the hardening queue while keeping query read-model, procedural/navigation ownership, and source reset leakage distinct.
- id: dsk-module-source-proof-separate-2026-06-21-1818
  parent: dsk-command-config-context-root-2026-06-21-1818
  lesson: Public/local/fetched DSK proof remains a distribution and proof-lane problem, separate from DSK runtime hardening and command/config ownership.
  evidence: Ecosystem state node `2026-06-21T18-05-09-0400` reports ProtoKits targeted package resolution failure, Experiments aggregate route failure, targeted `engine.n.zoneField` failure, npm 404, and public `Booting...`; ecosystem proof node `2026-06-21T06-36-07-0400` keeps aggregate, targeted, browser, npm, package-version, and release-ref proof separate.
  look further: Let ecosystem/proof lanes choose one package/workspace/CDN/same-origin/build-step import-map model.
- id: dsk-core-boundary-preserved-2026-06-21-1818
  parent: dsk-command-config-context-root-2026-06-21-1818
  lesson: Command/config fixtures target existing core validation surfaces; new reusable gameplay/domain implementation still belongs in ProtoKits and playable/browser proof in Experiments.
  evidence: `docs/how-to-protokit.md` keeps core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable proof owner.
  look further: Harden core contracts without moving proof routing, host demos, or new reusable implementation into NexusRealtime core.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-21T06-19-09-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves branch-name drift, runtime failure-boundary, telemetry/command ownership, module-source separation, and core boundary rows while adding current dirty host-surface context and Domain Command Config Ownership.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-21T18-05-09-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Keeps dirty host-surface evidence, public proof failures, module-source proof, npm 404, and targeted DSK API installation in ecosystem/proof lanes.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-21T06-36-07-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Keeps release-ref proof, package resolution, aggregate route validation, targeted DSK API installation, npm publication, and browser import deployment separate from hardening rows.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-21T06-48-34-0400-deep-bug-node.md`
- relationship: confirms
- reason: Supplies Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations command/config ownership bugs for the hardening queue.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-21T07-02-40-0400-domain-kit-idea-node.md`
- relationship: confirms
- reason: Maps the deep-bug evidence into Domain Command Config Ownership planning inventory without replacing proof-readiness gates.

## Next Search Branches
- branch: runtime-failure-boundary-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, duplicate ownership, scheduler/world mutation, event payload isolation, and metadata truth?
- branch: telemetry-command-evidence-fixtures
  files or folders: `src/telemetry-kit.js`, `src/request-queue-kit.js`, `src/transport-route-kit.js`, `src/input-intent-kit.js`
  question: Which telemetry selectors, submitted metadata, returned states, and emitted payloads still alias caller-owned objects?
- branch: domain-command-config-fixtures
  files or folders: `src/economy-kit.js`, `src/timing-window-kit.js`, `src/resource-pressure-kit.js`, `src/lifecycle-progression-kit.js`, `src/facility-operations-kit.js`
  question: Which command/config/read APIs should clone/freeze submitted nested data and return immutable summaries versus explicit mutable handles?
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, `git rev-parse HEAD origin/main origin/0.0.2`
  question: Should automation proof require checkout of the latest release branch name, or is commit equality against the resolved target enough?
- branch: dirty-host-surface-release-boundary
  files or folders: `src/index.js`, `src/host.js`, `tests/host-smoke.mjs`, `examples/three-host/`, `docs/ideal/ideal-hosts.md`
  question: Is the host-surface work intended for release proof, or should DSK proof ignore it until committed and promoted?
- branch: module-source-proof-boundary
  files or folders: ecosystem proof/state packets, sibling ProtoKits and Experiments proof paths, public CDN/raw URLs
  question: Which proof claims are distribution/module-source issues rather than runtime hardening?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, prove runtime failure-boundary readiness, prove scheduler/world mutation readiness, prove procedural/navigation ownership readiness, prove telemetry/command evidence ownership readiness, prove domain command/config ownership readiness, prove query-read-model readiness, prove content-boundary/objective readiness, prove runtime identity/lifecycle readiness, prove composition-proof ownership readiness, prove proof-signal integrity readiness, prove dirty host-surface release readiness, or prove broad DSK promotion readiness.
