# Knowledge Nodes: dsk_architecture_scout 2026-06-20T02-23-35-0400

## Root Lesson
- id: dsk-composition-proof-ownership-root-2026-06-20-0223
- statement: DSK remains release-aligned and smoke-green, but fresh composition-proof evidence adds provider ownership, SequenceNode type/history isolation, and AR runtime-source consistency as a later validation tranche without replacing runtime failure-boundary.
- why it matters: Large DSK/ProtoKit graphs can appear valid while capability providers are ambiguous, node type semantics are overwritten, proof history is mutable, or AR support and session state disagree; those risks harm proof trust but base namespace/install/dependency hardening still comes first.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-20-0223
  parent: dsk-composition-proof-ownership-root-2026-06-20-0223
  lesson: Core still matches the preflight-resolved latest release branch and passes the existing smoke suite.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat old packet commit hashes as context only.
- id: dsk-runtime-failure-boundary-first-2026-06-20-0223
  parent: dsk-composition-proof-ownership-root-2026-06-20-0223
  lesson: Namespace safety, install transaction semantics, dependency parity, scheduler failed-tick lifetime, and metadata truth remain tranche 1.
  evidence: Focused probe returned inherited `__proto__` API marker with no own key, retained failed API-collision DSK metadata plus false same-object reinstall success, and direct install of missing `runtime:missing`; source evidence remains `src/domain-service-kit.js:143-161`, `src/runtime-kit.js:135-215`, and `src/game-kit-composer.js:49-76`.
  look further: Write fixtures for reserved keys, null-prototype or own-key policy, rollback/preflight, dependency parity, failed-tick cleanup/diagnostics, and reset/snapshot/async metadata truth.
- id: dsk-composition-proof-ownership-later-2026-06-20-0223
  parent: dsk-composition-proof-ownership-root-2026-06-20-0223
  lesson: Duplicate provider ownership, SequenceNode type policy, SequenceNode event history isolation, and AR runtime-source consistency are a distinct composition-proof validation tranche.
  evidence: Focused probe found two `cap:x` providers installed with only boolean provider presence, duplicate SequenceNode type `dup` overwrote title `first` with `second`, event-bus snapshot mutation changed original history to `99`, and override-based `camera-overlay` support stayed true while AR session failed with `camera_unavailable`; source evidence includes `src/game-kit-composer.js:27-91`, `src/sequence-node-library.js:73-80`, `src/sequence-node.js:154-221`, `src/ar-device.js:24-87`, `src/ar-launcher.js:39-98`, and `src/ar-modes/camera-overlay.js:10-18`.
  look further: Add fixtures for provider owner diagnostics, explicit provider/type override policy, clone/freeze event history, and AR support/session reconciliation after tranche 1 begins.
- id: dsk-module-source-regression-separate-2026-06-20-0223
  parent: dsk-composition-proof-ownership-root-2026-06-20-0223
  lesson: Local/fetched/public DSK proof regression is now a shared module-source blocker, not DSK runtime hardening evidence.
  evidence: Ecosystem state/proof nodes `2026-06-20T01-59-37-0400` and `2026-06-20T01-59-45-0400` show local ProtoKits/Experiments targeted proof fails on unresolved package `nexusengine`, fetched Experiments targeted proof fails on sibling path assumptions, public browser proof remains stuck at `Booting...`, and npm metadata remains 404.
  look further: Let ecosystem/proof lanes choose one package/workspace/CDN/same-origin/build-step import-map model.
- id: dsk-core-boundary-preserved-2026-06-20-0223
  parent: dsk-composition-proof-ownership-root-2026-06-20-0223
  lesson: Composition-proof rows are core validation-surface candidates, while reusable gameplay implementations and browser proof routing still belong outside core.
  evidence: `docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:53-68`, and `docs/how-to-protokit.md:253-286` keep core focused on runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation invariants.
  look further: Route implementation kits to ProtoKits and playable/browser proof to Experiments unless the work is a true core invariant.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T01-54-13-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves runtime failure-boundary and distribution-proof separation while adding composition-proof ownership rows.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T01-55-55-0400-deep-bug-node.md`
- relationship: extends
- reason: Adds provider ownership, SequenceNode registry/history isolation, and AR runtime-source consistency as DSK promotion-adjacent validation inventory.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T02-01-55-0400-domain-kit-idea-node.md`
- relationship: confirms
- reason: Maps the newest deep-bug evidence to Composition Proof Ownership instead of duplicating distribution or proof-signal families.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T01-59-37-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Keeps module-source/package-resolution proof regression separate from DSK runtime and composition hardening.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T01-59-45-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Separates local, fetched-ref, targeted, browser, npm, package-version, hardening, composition, and proof-signal claims.

## Next Search Branches
- branch: runtime-failure-boundary-fixtures
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest non-scout executable fixture set for namespace policy, install rollback, dependency parity, failed-tick lifetime, and metadata truth?
- branch: composer-provider-ownership
  files or folders: `src/game-kit-composer.js`, `src/runtime-kit.js`, `tests/domain-service-kit-smoke.mjs`
  question: Should duplicate capability providers reject, namespace, expose owners, or require explicit override metadata?
- branch: sequence-type-registry-policy
  files or folders: `src/sequence-node-library.js`, `src/runtime-kit.js`, `tests/sequence-node-kit-deploy-smoke.mjs`
  question: Which duplicate SequenceNode type registrations should reject versus require explicit override metadata?
- branch: sequence-event-history-isolation
  files or folders: `src/sequence-node.js`, SequenceNode proof/telemetry fixtures
  question: Which event-bus reads should clone or freeze event history to protect proof diagnostics?
- branch: ar-runtime-source-consistency
  files or folders: `src/ar-device.js`, `src/ar-launcher.js`, `src/ar-modes/camera-overlay.js`
  question: Should AR mode startup use classified runtime globals or reconcile support state after failed start?
- branch: module-source-proof-boundary
  files or folders: ecosystem proof/state packets, sibling ProtoKits/Experiments proof paths, public CDN/raw URLs
  question: Which proof claims are distribution/module-source issues rather than runtime or composition hardening?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, prove composition-proof ownership readiness, prove proof-signal integrity readiness, or prove broad DSK promotion readiness.
