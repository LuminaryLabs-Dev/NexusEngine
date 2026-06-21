# Knowledge Nodes: dsk_architecture_scout 2026-06-21T06-19-09-0400

## Root Lesson
- id: dsk-main-parity-telemetry-command-context-root-2026-06-21-0619
- statement: Core `main` is commit-aligned with the preflight-resolved `origin/0.0.2` and smoke-green, but DSK promotion remains blocked by runtime failure-boundary and telemetry/command evidence ownership fixtures.
- why it matters: Branch-name drift should be treated as a release-proof policy question, not a runtime contract fix. The source-level DSK risks are still namespace safety, non-atomic install, dependency parity, binding ownership, and mutable proof/command evidence.

## Child Nodes
- id: dsk-main-equals-release-ref-2026-06-21-0619
  parent: dsk-main-parity-telemetry-command-context-root-2026-06-21-0619
  lesson: Preflight reports branch-name drift because the checkout is `main`, but commit parity with the latest release ref holds.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2` and `branchStatus: current-differs-from-latest-release-branch`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `ff97ba47af4197952eca0aded593d66e1a0e4887`; ahead/behind against `origin/0.0.2` was `0 0`.
  look further: Decide whether release proof requires branch-name checkout or commit equality against the resolved release target.
- id: dsk-runtime-failure-boundary-still-first-2026-06-21-0619
  parent: dsk-main-parity-telemetry-command-context-root-2026-06-21-0619
  lesson: Namespace safety, install transaction semantics, dependency parity, duplicate binding/provider ownership, scheduler/world mutation, event payload isolation, and metadata truth remain the first hardening tranche.
  evidence: Focused probe returned inherited `__proto__` API marker with no own key, retained failed API-collision DSK metadata plus false same-object reinstall success, direct install of missing `runtime:missing`, and duplicate binding overwrite.
  look further: Write executable fixtures for reserved keys, null-prototype or own-key policy, rollback/preflight, dependency parity, duplicate ownership diagnostics, scheduler/world mutation, event queue isolation, and reset/snapshot/async metadata truth.
- id: dsk-telemetry-command-evidence-confirmed-2026-06-21-0619
  parent: dsk-main-parity-telemetry-command-context-root-2026-06-21-0619
  lesson: Telemetry/command evidence ownership remains live in the current checkout and should become executable hardening fixtures, not another planning row.
  evidence: Focused probe showed telemetry returned and stored selected values mutate source/history, RequestQueue metadata stays caller-owned and returned state is live, TransportRoute command metadata stays live through rider state, and InputIntent metadata/state/payload stay live; source evidence includes `src/telemetry-kit.js:21-72`, `src/request-queue-kit.js:13-147`, `src/transport-route-kit.js:44-113`, and `src/input-intent-kit.js:13-72`.
  look further: Add fixtures for clone/freeze policy, submitted metadata ownership, returned command state mutation, emitted payload ownership, and replay-safe input frames.
- id: dsk-module-source-proof-separate-2026-06-21-0619
  parent: dsk-main-parity-telemetry-command-context-root-2026-06-21-0619
  lesson: Public/local/fetched DSK proof remains a distribution and proof-lane problem, separate from DSK runtime hardening.
  evidence: Ecosystem state node `2026-06-21T06-05-46-0400` reports ProtoKits targeted package resolution failure, Experiments aggregate route failure, targeted `engine.n.zoneField` failure, npm 404, and public `Booting...`; ecosystem proof node `2026-06-20T18-41-30-0400` keeps aggregate, targeted, browser, npm, package-version, and release-ref proof separate.
  look further: Let ecosystem/proof lanes choose one package/workspace/CDN/same-origin/build-step import-map model.
- id: dsk-core-boundary-preserved-2026-06-21-0619
  parent: dsk-main-parity-telemetry-command-context-root-2026-06-21-0619
  lesson: Telemetry/command fixtures target existing core validation surfaces; new reusable gameplay/domain implementation still belongs in ProtoKits and playable/browser proof in Experiments.
  evidence: `docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:56-64`, and `docs/how-to-protokit.md:265-284` keep the ownership boundary explicit.
  look further: Harden core contracts without moving proof routing or new reusable implementation into NexusRealtime core.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T18-23-40-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves Telemetry Command Evidence Ownership while adding current branch-name drift and commit-parity evidence.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-21T06-05-46-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Separates branch-name drift, module-source proof, Experiments aggregate/targeted proof, npm 404, and public browser proof from DSK runtime hardening.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T18-41-30-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Keeps release-ref proof, available checkout health, aggregate proof, targeted proof, browser proof, and package policy separate from hardening rows.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T17-54-14-0400-deep-bug-node.md`
- relationship: confirms
- reason: Supplies telemetry selected-value, service command metadata, and input-frame ownership bugs for the hardening queue.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T19-02-02-0400-domain-kit-idea-node.md`
- relationship: confirms
- reason: Confirms no duplicate idea row is needed for current proof drift or telemetry/command evidence.

## Next Search Branches
- branch: runtime-failure-boundary-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, duplicate ownership, scheduler/world mutation, event payload isolation, and metadata truth?
- branch: telemetry-proof-snapshot-fixtures
  files or folders: `src/telemetry-kit.js`, telemetry proof fixtures
  question: Should Telemetry clone selected values on capture, on read, freeze history entries, or expose explicit mutable handles?
- branch: service-command-payload-fixtures
  files or folders: `src/request-queue-kit.js`, `src/transport-route-kit.js`, operations command fixtures
  question: Which submitted command payloads and returned states still alias caller-owned objects?
- branch: input-frame-ownership-fixtures
  files or folders: `src/input-intent-kit.js`, input/replay fixtures
  question: Should input command methods return immutable summaries while separate APIs expose mutable state intentionally?
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, `git rev-parse HEAD origin/main origin/0.0.2`
  question: Should automation proof require checkout of the latest release branch name, or is commit equality against the resolved target enough?
- branch: module-source-proof-boundary
  files or folders: ecosystem proof/state packets, sibling ProtoKits and Experiments proof paths, public CDN/raw URLs
  question: Which proof claims are distribution/module-source issues rather than runtime hardening?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, prove runtime failure-boundary readiness, prove scheduler/world mutation readiness, prove procedural/navigation ownership readiness, prove telemetry/command evidence ownership readiness, prove query-read-model readiness, prove content-boundary/objective readiness, prove runtime identity/lifecycle readiness, prove composition-proof ownership readiness, prove proof-signal integrity readiness, or prove broad DSK promotion readiness.
