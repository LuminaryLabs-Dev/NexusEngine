# Knowledge Nodes: dsk_architecture_scout 2026-06-19T06-24-24-0400

## Root Lesson
- id: dsk-spatial-mobility-fixture-root-2026-06-19-0624
- statement: DSK remains release-aligned and test-green, but the promotion fixture plan must now include spatial and mobility invariants in addition to namespace, install, dependency, state-contract, service-call, and operations data gates.
- why it matters: Fresh neighboring bug and idea lanes show promoted service APIs can fail through missed transition receipts, inert immediate thresholds, generated id collisions, and unnormalized resource bounds even when DSK install mechanics and smoke tests pass.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-19-0624
  parent: dsk-spatial-mobility-fixture-root-2026-06-19-0624
  lesson: Core still matches the latest release branch, so the new DSK conclusion is not caused by branch drift.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat prior packet commit hashes as context only.
- id: dsk-install-hardening-unchanged-2026-06-19-0624
  parent: dsk-spatial-mobility-fixture-root-2026-06-19-0624
  lesson: Namespace, failed-install transaction, and direct dependency policy blockers remain unchanged on the live checkout.
  evidence: `src/domain-service-kit.js:143-161` still uses plain-object `engine.n` and late API assignment; `src/runtime-kit.js:135-157` still records DSK metadata and pushes kits before late install hooks; `src/runtime-kit.js:142-145` still filters missing direct DSK requirements to `n:` tokens; focused probe returned `own:false` for `__proto__`, retained `n-late-collision-kit` after collision, and installed a kit requiring missing `runtime:needed`.
  look further: Add fixtures for reserved API names, install rollback, and direct-install dependency policy before new DSK promotion claims.
- id: dsk-spatial-transition-threshold-gap-2026-06-19-0624
  parent: dsk-spatial-mobility-fixture-root-2026-06-19-0624
  lesson: Spatial/time promotion needs explicit transition and immediate-threshold fixtures.
  evidence: `src/spatial-scale-kit.js:85-95` stores nearest anchor state and emits entry only when the inside anchor differs from prior `activeAnchorId`; probe returned `enteredCount:0` after outside-nearest then inside. `src/scenario-duration-kit.js:22-56` initializes zero-time state incomplete and returns early for zero-delta ticks; probe kept zero-duration state incomplete with zero events.
  look further: Decide whether transition receipts and immediate thresholds settle through core DSK fixtures, ProtoKit policy kits, or both.
- id: dsk-identity-resource-bound-gap-2026-06-19-0624
  parent: dsk-spatial-mobility-fixture-root-2026-06-19-0624
  lesson: Hazard and mobility promotion needs generated-id and resource-bound normalization fixtures.
  evidence: `src/hazard-field-kit.js:86-100` initializes `nextSequence:1` regardless of authored hazards and `src/hazard-field-kit.js:132-141` pushes generated hazards without collision checks; probe returned duplicate `pulse-1` ids. `src/vehicle-dynamics-kit.js:40-43` initializes boost value and max independently and `src/vehicle-dynamics-kit.js:69-82` activates boost from value before clamping; probe granted boosted motion with `max:0`.
  look further: Add stable generated-id and resource-bound capacity fixtures before spatial, hazard, rescue, runner, or mobility DSK promotion language expands.
- id: dsk-proof-boundary-still-separated-2026-06-19-0624
  parent: dsk-spatial-mobility-fixture-root-2026-06-19-0624
  lesson: DSK architecture hardening remains separate from public browser proof and sibling latest-ref validation.
  evidence: Ecosystem proof/state nodes `2026-06-19T05-42-20-0400` and `2026-06-19T06-09-33-0400` keep local targeted proof green while public proof remains `Booting...`, sibling checkouts are behind fetched release refs, and npm metadata remains unavailable.
  look further: Fix public proof imports and sibling latest-ref validation separately from DSK runtime hardening fixtures.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T05-40-58-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves the fixture-plan-ready root but expands the plan with spatial and mobility invariant gates from fresher neighboring lanes.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T05-53-25-0400-deep-bug-node.md`
- relationship: constrains
- reason: Spatial, scenario-time, hazard, and vehicle bugs are now DSK promotion fixture inputs.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T06-00-34-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts the latest bug class into transition-state, immediate-threshold, hazard-identity, resource-bound, and proof-row planning inventory.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T05-42-20-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Public proof loading and sibling latest-ref validation remain separate from DSK runtime-hardening readiness.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T06-09-33-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Core release alignment and available-checkout proof do not close DSK hardening or public proof gates.

## Next Search Branches
- branch: DSK promotion hardening fixture plan
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`, selected domain smoke coverage
  question: What is the smallest executable fixture set that locks namespace, install rollback, dependency policy, reset/snapshot contract, service-call policy, operations data, and spatial/mobility invariants?
- branch: spatial-transition-and-threshold-fixtures
  files or folders: `src/spatial-scale-kit.js`, `src/scenario-duration-kit.js`, `src/objective-flow-kit.js`, smoke coverage
  question: Which transition receipts and zero-threshold settlement rules must be true before spatial/time DSK promotion?
- branch: generated-identity-and-resource-bound-fixtures
  files or folders: `src/hazard-field-kit.js`, `src/vehicle-dynamics-kit.js`, `src/resource-pressure-kit.js`, smoke coverage
  question: Which generated id and resource capacity normalization rules must pass before hazard/mobility DSK promotion?
- branch: public-proof-separation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof`, sibling fetched refs, public CDN/raw URLs
  question: Which evidence belongs to runtime hardening versus browser-complete public proof?

## Not Claimed
- This node does not fix bugs, add tests, edit public docs, promote ProtoKits, publish npm metadata, fast-forward siblings, fix public proof routes, or prove browser-complete public DSK proof.
