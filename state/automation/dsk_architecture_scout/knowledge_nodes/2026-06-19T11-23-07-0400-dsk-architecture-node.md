# Knowledge Nodes: dsk_architecture_scout 2026-06-19T11-23-07-0400

## Root Lesson
- id: dsk-fixture-boundary-root-2026-06-19-1123
- statement: DSK remains release-aligned and test-green, but repeated live evidence now points to one next action: move from scout packets to executable hardening fixtures that cover namespace/install/dependency boundaries plus source-state and state-signal contracts.
- why it matters: Current smoke tests prove the happy-path DSK surface, not production safety. The open risks now span core install atomicity, `engine.n` namespace policy, direct dependency parity, reset/snapshot contracts, source-state isolation, signal semantics, and proof-boundary separation.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-19-1123
  parent: dsk-fixture-boundary-root-2026-06-19-1123
  lesson: Core still matches the latest release branch, so the fixture-boundary conclusion is not caused by branch drift.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat old packet commit hashes as context only.
- id: dsk-install-hardening-still-open-2026-06-19-1123
  parent: dsk-fixture-boundary-root-2026-06-19-1123
  lesson: Namespace, install transaction, and direct dependency policy blockers remain unchanged on live source.
  evidence: `src/domain-service-kit.js:143-161` still uses plain-object `engine.n` and late API assignment; `src/runtime-kit.js:135-157` still records DSK metadata and pushes kits before late hooks; `src/runtime-kit.js:142-145` still filters direct missing requirements to `n:` tokens; probe returned `protoOwn:false`, retained failed collision kit/metadata, and installed missing `runtime:needed`.
  look further: Write fixtures for reserved API names, null-prototype or reserved-key policy, install rollback, and direct-install dependency parity.
- id: dsk-source-state-and-signal-gates-2026-06-19-1123
  parent: dsk-fixture-boundary-root-2026-06-19-1123
  lesson: Source-state and state-signal rows are now required promotion gates, not optional idea-doc polish.
  evidence: Latest source reads and probes confirm WaterSurface/RouteField/RenderDescriptor source-state risks, Economy retention policy gaps, PursuitPressure initial-terminal contradictions, ForestPlacement stale signatures, Interaction held repeats, LightCombat terminal starts, ScenarioDriver `{ x, z }` loss, and CameraOcclusion source mutation.
  look further: Convert these into small executable fixture rows before treating dataset, interaction, puzzle/combat, validation-driver, camera, ledger, or pressure services as promoted DSK-safe surfaces.
- id: dsk-proof-boundary-separation-2026-06-19-1123
  parent: dsk-fixture-boundary-root-2026-06-19-1123
  lesson: DSK runtime hardening proof must remain separate from sibling latest-ref proof, public browser proof, aggregate proof, npm availability, and package-version policy.
  evidence: Ecosystem state node `2026-06-19T11-08-56-0400` says core and ProtoKits are green, but Experiments fetched `origin/0.0.2` is 24 commits ahead; public proof still stalls at `Booting...`; aggregate DSK smoke coverage, npm metadata, and package-version policy remain open.
  look further: Keep runtime fixtures, Experiments fetched-ref validation, public module loading, aggregate checks, and distribution wording as separate evidence branches.
- id: dsk-non-scout-handoff-2026-06-19-1123
  parent: dsk-fixture-boundary-root-2026-06-19-1123
  lesson: More scout packets are now lower value than a non-scout fixture-writing lane unless source or release refs materially change.
  evidence: Multiple consecutive DSK packets reconfirm the same base blockers while adding adjacent fixture rows; this run's preflight, tests, source reads, and probe again show no source/test/runtime drift resolving them.
  look further: Start with hardening fixtures for namespace/install/dependency, then add selected source-state and state-signal examples as regression rows.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T10-23-10-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves state-signal fixture gates while reframing the next useful work as executable non-scout fixtures.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T11-08-56-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Updates proof-boundary context with Experiments now 24 commits behind fetched release ref.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T10-45-02-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Confirms public browser proof, aggregate proof, latest-ref Experiments proof, npm availability, and runtime hardening are separate proof categories.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T09-54-20-0400-deep-bug-node.md`
- relationship: constrains
- reason: Placement, interaction, transition, coordinate, and camera bugs remain signal-contract fixture inputs.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T10-02-21-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts signal-contract bugs into proof-row planning inventory, still advisory until executable coverage exists.

## Next Search Branches
- branch: DSK hardening fixture implementation
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, reset/snapshot policy, and async metadata truth?
- branch: source-state fixture rows
  files or folders: `src/water-surface-kit.js`, `src/route-field-kit.js`, `src/render-descriptor-kit.js`, `src/economy-kit.js`, `src/pursuit-pressure-kit.js`
  question: Which authored-source, reset-source, retention-limit, and initial-terminal rows should join DSK promotion coverage first?
- branch: state-signal fixture rows
  files or folders: `src/forest-placement-kit.js`, `src/interaction-kit.js`, `src/shrine-puzzle-kit.js`, `src/light-combat-kit.js`, `src/scenario-driver-kit.js`, `src/camera-occlusion-kit.js`
  question: Which invalidation, action-repeat, transition, coordinate, and derived-state rows should join DSK promotion coverage first?
- branch: proof-boundary separation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, public raw/CDN/GitHub Pages URLs
  question: Which evidence belongs to core runtime hardening versus Experiments latest-ref validation, public browser proof, aggregate proof, and distribution proof?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate Experiments fetched refs, fix public proof routes, or prove browser-complete public DSK proof.
