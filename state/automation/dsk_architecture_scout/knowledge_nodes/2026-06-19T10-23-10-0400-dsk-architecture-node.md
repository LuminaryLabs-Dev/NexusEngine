# Knowledge Nodes: dsk_architecture_scout 2026-06-19T10-23-10-0400

## Root Lesson
- id: dsk-state-signal-fixture-root-2026-06-19-1023
- statement: DSK remains release-aligned and test-green, but promotion fixtures must now include state-signal contracts: descriptor invalidation, action repeat policy, small state-machine transition receipts, coordinate-axis policy, and derived-state boundaries alongside namespace, install, dependency, state-contract, service-call, operations data, spatial/mobility, receipt, bridge, wrapper-state, and source-state gates.
- why it matters: Fresh live probes show reusable services can preserve public shape while suppressing needed rebuilds, repeating one-shot actions, starting in contradictory terminal states, ignoring common world coordinates, or mutating source view state; those failures undermine replay, proof rows, async partitioning, and broad DSK promotion claims.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-19-1023
  parent: dsk-state-signal-fixture-root-2026-06-19-1023
  lesson: Core still matches the latest release branch, so the state-signal conclusion is not caused by branch drift.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat old packet commit hashes as context only.
- id: dsk-install-hardening-unchanged-2026-06-19-1023
  parent: dsk-state-signal-fixture-root-2026-06-19-1023
  lesson: Namespace, failed-install transaction, and direct dependency policy blockers remain unchanged on the live checkout.
  evidence: `src/domain-service-kit.js:143-161` still uses plain-object `engine.n` and late API assignment; `src/runtime-kit.js:135-157` still records DSK metadata and pushes kits before late install hooks; `src/runtime-kit.js:142-145` still filters missing direct DSK requirements to `n:` tokens; probe returned `protoOwn:false`, retained `n-late-collision-kit` after collision, and installed a kit requiring missing `runtime:needed`.
  look further: Add fixtures for reserved API names, install rollback, and direct-install dependency policy before new DSK promotion claims.
- id: dsk-descriptor-invalidation-gap-2026-06-19-1023
  parent: dsk-state-signal-fixture-root-2026-06-19-1023
  lesson: Descriptor-producing services need rebuild signatures based on output-affecting content and config, not only counts.
  evidence: `src/forest-placement-kit.js:154-168` keys by `routeLength` while descriptors and snapshots depend on route coordinates; probe changed a same-length route from z `0` to z `80`, but snapshot version stayed `1` and route stayed `[0,0]`.
  look further: Add fixtures for route content, filter/config, terrain query identity, and output-affecting descriptor signatures.
- id: dsk-action-repeat-policy-gap-2026-06-19-1023
  parent: dsk-state-signal-fixture-root-2026-06-19-1023
  lesson: Service actions need explicit edge, held, repeatable, ignored, and duplicate-attempt semantics.
  evidence: `src/interaction-kit.js:49-60` emits gather/activate whenever held booleans stay true; probe emitted gathered counts `[1]`, `[2]` and repeated activation for `switch` across two ticks.
  look further: Decide whether one-shot service actions suppress repeats, emit duplicate receipts, or opt into held-continuous behavior by config.
- id: dsk-state-machine-transition-gap-2026-06-19-1023
  parent: dsk-state-signal-fixture-root-2026-06-19-1023
  lesson: Small state-machine kits need false-to-true transition receipts plus initial terminal normalization.
  evidence: `src/shrine-puzzle-kit.js:23-26` emits `ShrineCharged` on every qualifying tick; `src/light-combat-kit.js:42-49` can initialize `enemyHealth:0` with `enemyDefeated:false`; probe returned charged batches `[1,1]` and contradictory initial combat state.
  look further: Add transition-only and initial-terminal rows for puzzle, combat, objective, pressure, recovery, and proof domains.
- id: dsk-coordinate-axis-policy-gap-2026-06-19-1023
  parent: dsk-state-signal-fixture-root-2026-06-19-1023
  lesson: Validation and mobility helpers need a shared coordinate-axis contract across `{ x, y }` route points and `{ x, z }` world points.
  evidence: `src/scenario-driver-kit.js:19-27` uses `x` and `y` only; probe returned zero vector and `boost:false` for an `{ x, z }` target.
  look further: Normalize `z ?? y`, split 2D and 3D APIs, or require explicit point-shape declarations before route/mobility proof rows are trusted.
- id: dsk-derived-state-boundary-gap-2026-06-19-1023
  parent: dsk-state-signal-fixture-root-2026-06-19-1023
  lesson: Presentation and safety services need source-versus-derived state boundaries.
  evidence: `src/camera-occlusion-kit.js:84-88` mutates source `cameraState.lookAt.y` during terrain-line adjustment; probe moved lookAt y from `0` to `1.87875` to `3.226753125` across ticks.
  look further: Publish derived output paths, require upstream recomputation, or declare mutable source state before camera/render safety services are promoted.
- id: dsk-proof-boundary-still-separated-2026-06-19-1023
  parent: dsk-state-signal-fixture-root-2026-06-19-1023
  lesson: State-signal hardening remains separate from public browser proof, aggregate validation, latest-ref Experiments proof, npm availability, and package-version policy.
  evidence: Ecosystem state node `2026-06-19T10-10-19-0400` keeps public proof stuck at `Booting...`, aggregate DSK smoke omitted, Experiments latest-ref validation open, npm metadata 404, and branch/package policy unresolved.
  look further: Keep runtime hardening fixtures, targeted proof, aggregate validation, public browser proof, and distribution evidence as separate categories.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T09-25-20-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves source-state fixture gates but adds state-signal contracts from fresher neighboring lanes and live probes.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T09-54-20-0400-deep-bug-node.md`
- relationship: constrains
- reason: Placement invalidation, held-action, transition, coordinate, and derived-state bugs are now DSK promotion fixture inputs.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T10-02-21-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts state-signal bugs into descriptor invalidation, action repeat, state-machine transition, coordinate-axis, derived-state, and proof-row planning inventory.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T10-10-19-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Public proof, aggregate proof, npm metadata, package-version policy, latest-ref Experiments proof, and DSK hardening gates remain separate.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T09-44-04-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Targeted/local proof is not enough to claim public browser proof, aggregate proof, latest-ref proof, npm availability, or runtime hardening.

## Next Search Branches
- branch: DSK promotion hardening fixture plan
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, selected domain kits, smoke coverage
  question: What is the smallest executable fixture set that locks namespace, install rollback, dependency policy, reset/snapshot contract, service-call policy, operations data, spatial/mobility invariants, receipt integrity, bridge phase, wrapper state, source-state, and state-signal contracts?
- branch: descriptor-invalidation-fixtures
  files or folders: `src/forest-placement-kit.js`, descriptor-producing kits, route-aware placement proof fixtures
  question: Which services key rebuilds by counts while output depends on full dataset contents, config, query identity, or filter policy?
- branch: action-repeat-and-transition-fixtures
  files or folders: `src/interaction-kit.js`, `src/shrine-puzzle-kit.js`, `src/light-combat-kit.js`, `src/input-intent-kit.js`, `src/interaction-target-kit.js`
  question: Which actions are edge-triggered, held-continuous, repeatable, rejected duplicates, or transition-only receipts?
- branch: coordinate-and-derived-state-fixtures
  files or folders: `src/scenario-driver-kit.js`, `src/camera-occlusion-kit.js`, `src/camera-kit.js`, route/mobility/camera proof fixtures
  question: Which helpers need explicit 2D/3D coordinate policy or source-versus-derived output boundaries?
- branch: public-proof-separation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof`, sibling fetched refs, public CDN/raw URLs
  question: Which evidence belongs to runtime hardening versus browser-complete public proof and aggregate validation?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate Experiments fetched refs, fix public proof routes, or prove browser-complete public DSK proof.
