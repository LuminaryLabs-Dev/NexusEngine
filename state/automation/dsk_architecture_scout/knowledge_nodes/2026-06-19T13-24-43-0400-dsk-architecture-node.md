# Knowledge Nodes: dsk_architecture_scout 2026-06-19T13-24-43-0400

## Root Lesson
- id: dsk-traversal-proof-fixture-root-2026-06-19-1324
- statement: DSK remains release-aligned and test-green, but the executable hardening fixture handoff must now include traversal proof integrity rows: traversal cost policy, navmesh identity, procedural signature taxonomy, and recovery receipt/state consistency.
- why it matters: Current smoke tests prove the happy-path DSK surface, not production safety. Fresh live source and probe evidence shows traversal services can resolve negative-cost routes, publish duplicate graph identities, treat different generator algorithms as the same signature, and double-emit fall recovery while final physics state disagrees with the recovered player.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-19-1324
  parent: dsk-traversal-proof-fixture-root-2026-06-19-1324
  lesson: Core still matches the latest release branch, so the traversal proof conclusion is not caused by branch drift.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat old packet commit hashes as context only.
- id: dsk-install-hardening-still-open-2026-06-19-1324
  parent: dsk-traversal-proof-fixture-root-2026-06-19-1324
  lesson: Namespace, install transaction, and direct dependency policy blockers remain unchanged on live source.
  evidence: `src/domain-service-kit.js:143-161` still uses plain-object `engine.n` and late API assignment; `src/runtime-kit.js:135-157` still records DSK metadata and pushes kits before late hooks; `src/runtime-kit.js:142-145` still filters direct missing requirements to `n:` tokens; probe returned `reservedApi.own:false`, retained failed collision kit/metadata, and installed missing `runtime:needed`.
  look further: Write fixtures for reserved API names, null-prototype or reserved-key policy, install rollback, and direct-install dependency parity.
- id: dsk-navigation-cost-policy-gap-2026-06-19-1324
  parent: dsk-traversal-proof-fixture-root-2026-06-19-1324
  lesson: Pathfinding and adapter surfaces need finite non-negative traversal cost policy before route results, telemetry, or proof rows are trusted.
  evidence: `src/pathfinding-kit.js:147-157` accepts adapter costs into A* scores; `src/pathfinding-kit.js:218-220` multiplies by raw cell cost; probe resolved a route through a `cost:-5` cell with total `cost:-4`.
  look further: Add reject, clamp, minimum-cost, and blocked-cell fixtures for grid, navmesh2d, navmesh3d, terrain, and route adapters.
- id: dsk-navmesh-identity-policy-gap-2026-06-19-1324
  parent: dsk-traversal-proof-fixture-root-2026-06-19-1324
  lesson: Walkability-to-navmesh conversion needs source-key and emitted-graph identity guarantees.
  evidence: `src/navmesh-kit.js:52-53` collapses duplicate keys into a `Map`, `src/navmesh-kit.js:85-97` still emits duplicate `cell-*` ids, and `src/navmesh-kit.js:144-145` collapses waypoint lookup identity; probe emitted duplicate `cell-shared` and `wp-cell-shared` ids.
  look further: Add fixtures for duplicate source keys, duplicate coordinates, emitted cell ids, portal ids, waypoint ids, and link ids.
- id: dsk-procedural-signature-taxonomy-gap-2026-06-19-1324
  parent: dsk-traversal-proof-fixture-root-2026-06-19-1324
  lesson: Procedural services need explicit content, topology, algorithm/config, and proof signature boundaries.
  evidence: `src/procedural-kit.js:415-423` publishes algorithms, while `src/procedural-kit.js:455-461` omits algorithms from `snapshot.signature`; probe produced signature `5b741c67` for two snapshots with different algorithm descriptors.
  look further: Decide which generator config, algorithm ids/params, cell size, biome policy, obstacle policy, and topology fields affect each signature.
- id: dsk-recovery-receipt-state-gap-2026-06-19-1324
  parent: dsk-traversal-proof-fixture-root-2026-06-19-1324
  lesson: Recovery services need one-shot receipt semantics and final published state that matches the recovered entity.
  evidence: `src/world-physics-kit.js:109-122` emits inside `softRespawn()`, `src/world-physics-kit.js:197-200` emits before calling it again, and `src/world-physics-kit.js:203-238` final state update is skipped on early return; probe emitted two `fall` receipts and left `PhysicsState.playerPosition.y` at `1` while player y was `1.25`.
  look further: Add fall, boundary, reset, replay, analytics, and SequenceNode bridge rows for recovery event counts and post-recovery state.
- id: dsk-proof-boundary-separation-2026-06-19-1324
  parent: dsk-traversal-proof-fixture-root-2026-06-19-1324
  lesson: Traversal hardening proof remains separate from sibling latest-ref proof, module-source strategy, public browser proof, aggregate proof, npm availability, and package-version policy.
  evidence: Ecosystem state node `2026-06-19T13-09-40-0400` and ecosystem proof node `2026-06-19T12-39-48-0400` report ProtoKits package-resolution, Experiments targeted proof, and public browser module-path blockers while core remains current and test-green.
  look further: Keep runtime fixtures, sibling fetched-ref validation, public module loading, aggregate checks, and distribution wording as separate evidence branches.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T12-23-47-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves lifecycle/config fixture handoff while adding traversal proof integrity rows from fresher neighboring lanes and live probes.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T13-09-40-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Separates core runtime hardening from sibling module-source, fetched-ref, public browser, aggregate, npm, and package-version proof.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T12-39-48-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Confirms local checkout proof is not fetched-ref, standalone package, aggregate, targeted DSK, or browser-complete public proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T12-54-22-0400-deep-bug-node.md`
- relationship: constrains
- reason: Pathfinding, NavMesh, ProceduralKit, and WorldPhysics bugs are traversal fixture inputs.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T13-01-05-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts traversal bugs into advisory proof integrity planning rows until executable coverage exists.

## Next Search Branches
- branch: DSK hardening fixture implementation
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, reset/snapshot policy, and async metadata truth?
- branch: traversal-proof-fixture-rows
  files or folders: `src/pathfinding-kit.js`, `src/navmesh-kit.js`, `src/procedural-kit.js`, `src/world-physics-kit.js`
  question: Which cost, identity, signature, and recovery rows must join DSK promotion coverage first?
- branch: lifecycle-config fixture rows
  files or folders: `src/companion-command-kit.js`, `src/corruption-world-kit.js`, `src/spatial-room-kit.js`, `src/tree-runner-kit.js`
  question: Which command lifecycle, elapsed-rate, descriptor normalization, and generated-geometry rows should be bundled with traversal rows?
- branch: proof-boundary separation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, public raw/CDN/GitHub Pages URLs
  question: Which evidence belongs to core runtime hardening versus sibling latest-ref validation, public browser proof, aggregate proof, and distribution proof?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, or prove browser-complete public DSK proof.
