# Knowledge Nodes: dsk_architecture_scout 2026-06-20T01-54-13-0400

## Root Lesson
- id: dsk-distribution-boundary-still-root-2026-06-20-0154
- statement: DSK remains release-aligned and smoke-green, and the newest neighboring idea pass adds no new durable proof family; distribution-proof source strategy stays separate from runtime failure-boundary and proof-signal hardening.
- why it matters: The useful queue should not be reordered by repeated module-source evidence. Core still needs executable DSK/runtime fixtures first, while proof-readiness and public browser proof remain claim-management and distribution-routing work.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-20-0154
  parent: dsk-distribution-boundary-still-root-2026-06-20-0154
  lesson: Core still matches the preflight-resolved latest release branch and passes the existing smoke suite.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat old packet commit hashes as context only.
- id: dsk-runtime-failure-boundary-first-2026-06-20-0154
  parent: dsk-distribution-boundary-still-root-2026-06-20-0154
  lesson: Namespace safety, install transaction semantics, dependency parity, scheduler failed-tick lifetime, and metadata truth remain tranche 1.
  evidence: Current probes returned inherited `__proto__` API marker with no own key, retained failed API-collision DSK metadata plus false same-object reinstall success, direct install of missing `runtime:missing`, and failed-tick event replay with the recovery tick; source evidence remains `src/domain-service-kit.js:143-161`, `src/runtime-kit.js:135-215`, `src/game-kit-composer.js:49-76`, and `src/engine.js:168-287`.
  look further: Write fixtures for reserved keys, null-prototype or own-key policy, rollback/preflight, dependency parity, failed-tick cleanup/diagnostics, and reset/snapshot/async metadata truth.
- id: dsk-proof-signal-eighth-still-2026-06-20-0154
  parent: dsk-distribution-boundary-still-root-2026-06-20-0154
  lesson: ARExperience terminal receipts, WebXR hit-test rejection policy, monotonic normal tick time, and finite greybox/spatial scale stay as tranche 8 proof-signal integrity.
  evidence: Current probes again found repeated ARExperience final completion, duplicate manual completion payloads, `createHitTestSource()` throwing `hit-test denied`, negative elapsed time after `tick(-2)`, and `NaN` greybox/spatial scale; source evidence includes `src/ar-experience-kit.js:112-149`, `src/ar-session.js:61-75`, `src/engine.js:168-287`, `src/greybox-building-kit.js:26-67`, and `src/spatial-room-kit.js:46-58`.
  look further: Add terminal receipt event-count, hit-test rejection, negative normal tick, SequenceNode/surface propagation, and finite spatial-scale fixtures after base hardening work starts.
- id: dsk-distribution-proof-separate-2026-06-20-0154
  parent: dsk-distribution-boundary-still-root-2026-06-20-0154
  lesson: Module-source strategy, fetched-ref validation, public browser proof, npm availability, package-version policy, and aggregate/targeted parity are proof-readiness concerns, not new DSK runtime hardening categories.
  evidence: Domain idea node `2026-06-20T00-00-47-0400` deferred a new distribution-proof source domain because existing Proof Readiness Queue and Proof Surface inventory already cover those rows; ecosystem proof node `2026-06-19T22-40-52-0400` keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof-signal claims separate.
  look further: Use proof-readiness taxonomy to prevent overclaiming after executable fixtures start, not as evidence that any tranche is complete.
- id: dsk-core-boundary-preserved-2026-06-20-0154
  parent: dsk-distribution-boundary-still-root-2026-06-20-0154
  lesson: Repeated distribution-proof evidence should not pull proof routing, public imports, reusable implementation, or release checklist tooling into NexusEngine core.
  evidence: `docs/how-to-protokit.md` keeps core focused on runtime/DSK/composer primitives, ProtoKits on reusable implementations, and Experiments on playable/browser proof; latest idea node preserves that boundary.
  look further: Route future proof-source helpers to ProtoKits proof tooling or Experiments proof routing unless a true core validation invariant is identified.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T22-25-35-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves the proof-signal tranche while adding the latest no-new-family distribution-proof boundary.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T00-00-47-0400-domain-kit-idea-node.md`
- relationship: constrains
- reason: Confirms repeated module-source and proof-signal evidence should not create duplicate idea families or reorder DSK hardening.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T22-40-52-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof-signal claims separate.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T22-10-08-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Confirms module-source strategy remains a distribution-proof blocker, not a runtime hardening fix.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T21-55-21-0400-deep-bug-node.md`
- relationship: references
- reason: Keeps ARExperience receipt idempotency, hit-test source rejection, negative tick time, and finite spatial scale rows as hardening fixture inputs.

## Next Search Branches
- branch: runtime-failure-boundary-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest non-scout executable fixture set for namespace policy, install rollback, dependency parity, failed-tick lifetime, and metadata truth?
- branch: proof-signal-integrity-fixtures
  files or folders: `src/ar-experience-kit.js`, `src/ar-session.js`, `src/engine.js`, `src/greybox-building-kit.js`, `src/spatial-room-kit.js`, proof fixtures
  question: Which terminal receipt, helper failure, monotonic time, and finite geometry rows belong in the first executable proof-signal fixture set?
- branch: proof-readiness-claim-taxonomy
  files or folders: ecosystem proof packets, domain idea proof-readiness rows, release evidence checklists
  question: Which claim labels prevent local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, proof-signal, and distribution evidence from being conflated?
- branch: module-source-gate
  files or folders: sibling Experiments DSK proof route, sibling ProtoKits package metadata, public CDN/raw URLs
  question: Which module-source model should become canonical for fetched-ref and public browser proof?
- branch: core-boundary-preservation
  files or folders: `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, proof routing docs
  question: Which proof-source helpers belong in ProtoKits proof tooling or Experiments proof routing rather than NexusEngine core?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, prove browser-complete public DSK proof, prove proof-signal integrity readiness, or prove broad DSK promotion readiness.
