# Knowledge Nodes: dsk_architecture_scout 2026-06-19T12-23-47-0400

## Root Lesson
- id: dsk-lifecycle-config-fixture-root-2026-06-19-1223
- statement: DSK remains release-aligned and test-green, but the executable hardening fixture handoff must now include lifecycle/config rows: command lifecycle receipts, elapsed-rate semantics, descriptor normalization/source isolation, and finite generated geometry.
- why it matters: Current smoke tests prove the happy-path DSK surface, not production safety. Fresh live source and probe evidence shows reusable services can lock after one command, vary terminal results by tick rate, preserve invalid descriptor fields while mutating caller config, or crash/publish non-finite traversal state from invalid generation bounds.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-19-1223
  parent: dsk-lifecycle-config-fixture-root-2026-06-19-1223
  lesson: Core still matches the latest release branch, so the lifecycle/config conclusion is not caused by branch drift.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat old packet commit hashes as context only.
- id: dsk-install-hardening-still-open-2026-06-19-1223
  parent: dsk-lifecycle-config-fixture-root-2026-06-19-1223
  lesson: Namespace, install transaction, and direct dependency policy blockers remain unchanged on live source.
  evidence: `src/domain-service-kit.js:143-161` still uses plain-object `engine.n` and late API assignment; `src/runtime-kit.js:135-157` still records DSK metadata and pushes kits before late hooks; `src/runtime-kit.js:142-145` still filters direct missing requirements to `n:` tokens; probe returned `reservedApi.own:false`, retained failed collision kit/metadata, and installed missing `runtime:needed`.
  look further: Write fixtures for reserved API names, null-prototype or reserved-key policy, install rollback, and direct-install dependency parity.
- id: dsk-command-lifecycle-gap-2026-06-19-1223
  parent: dsk-lifecycle-config-fixture-root-2026-06-19-1223
  lesson: Command-style services need accepted, duplicate, retargeted, arrived, reset, and rejected receipts before promotion.
  evidence: `src/companion-command-kit.js:23-35` accepts only when `!state.commanded` and never resets command state; probe emitted command/arrival only for `node-a` and kept target `node-a` after a second command to `node-b`.
  look further: Add post-arrival retarget and duplicate-command fixtures for companion, guide, assistance, AR training, and interaction command services.
- id: dsk-elapsed-rate-policy-gap-2026-06-19-1223
  parent: dsk-lifecycle-config-fixture-root-2026-06-19-1223
  lesson: Progression services need explicit per-second versus per-tick rate semantics and terminal threshold settlement.
  evidence: `src/corruption-world-kit.js:23-30` adds `cleanseRate` once per tick; probe showed one elapsed second cleansed at 60Hz but not at 10Hz.
  look further: Add equal-elapsed-time fixtures and declare fixed-step-only or per-second rate policy.
- id: dsk-descriptor-normalization-source-gap-2026-06-19-1223
  parent: dsk-lifecycle-config-fixture-root-2026-06-19-1223
  lesson: Descriptor normalizers must preserve canonical fields after copying source and isolate caller-owned nested data.
  evidence: `src/spatial-room-kit.js:10-20` spreads `...anchor` after numeric fields; `src/spatial-room-kit.js:46-58` stores connections, props, and metadata by reference; probe kept anchor `x:"bad-x"` and leaked runtime tags into caller config.
  look further: Add canonical-field, clone/freeze, snapshot, and reset-safe descriptor fixtures for room, building, AR, and render descriptor services.
- id: dsk-generated-geometry-bounds-gap-2026-06-19-1223
  parent: dsk-lifecycle-config-fixture-root-2026-06-19-1223
  lesson: Procedural/traversal generators need reject-or-clamp policy plus finite coordinate assertions before their snapshots feed proof, renderers, physics, or replay.
  evidence: `src/tree-runner-kit.js:13-18` uses modulo by `laneCount`; `src/tree-runner-kit.js:197-212` assumes at least one branch; probe showed `initialBranches:0` throws and `laneCount:0` produces non-finite branch/player x values.
  look further: Add positive count, lane, spacing, and finite snapshot fixtures for runner, traversal, route, terrain, and streaming generators.
- id: dsk-proof-boundary-separation-2026-06-19-1223
  parent: dsk-lifecycle-config-fixture-root-2026-06-19-1223
  lesson: Lifecycle/config hardening proof remains separate from sibling latest-ref proof, public browser proof, aggregate proof, npm availability, and package-version policy.
  evidence: Ecosystem state node `2026-06-19T12-08-54-0400` says core is current, but ProtoKits and Experiments fetched refs are ahead of local checkouts; public proof still stalls at `Booting...`; aggregate DSK coverage, npm metadata, and package-version policy remain open.
  look further: Keep runtime fixtures, sibling fetched-ref validation, public module loading, aggregate checks, and distribution wording as separate evidence branches.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T11-23-07-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves fixture-boundary handoff while adding lifecycle/config proof rows from fresher neighboring lanes and live probes.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T12-08-54-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Separates core runtime hardening from sibling latest-ref drift, public proof, aggregate proof, npm metadata, and package-version policy.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T11-40-11-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Confirms available-checkout command proof is not latest-ref or browser-complete public proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T11-55-07-0400-deep-bug-node.md`
- relationship: constrains
- reason: CompanionCommand, CorruptionWorld, SpatialRoom, and TreeRunner bugs are lifecycle/config fixture inputs.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T12-01-34-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts lifecycle/config bugs into advisory proof-row inventory until executable coverage exists.

## Next Search Branches
- branch: DSK hardening fixture implementation
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest executable fixture set for namespace policy, install rollback, dependency parity, reset/snapshot policy, and async metadata truth?
- branch: lifecycle-config fixture rows
  files or folders: `src/companion-command-kit.js`, `src/corruption-world-kit.js`, `src/spatial-room-kit.js`, `src/tree-runner-kit.js`
  question: Which command lifecycle, elapsed-rate, descriptor normalization, and generated-geometry rows must join DSK promotion coverage first?
- branch: source-state and state-signal fixture rows
  files or folders: selected source-state, interaction, transition, coordinate, and derived-state kits
  question: Which prior source-state and state-signal rows should be bundled with lifecycle/config rows in the first fixture handoff?
- branch: proof-boundary separation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, public raw/CDN/GitHub Pages URLs
  question: Which evidence belongs to core runtime hardening versus sibling latest-ref validation, public browser proof, aggregate proof, and distribution proof?

## Not Claimed
- This node does not fix bugs, add tests, edit source, edit public docs, promote ProtoKits, publish npm metadata, validate sibling fetched refs, fix public proof routes, or prove browser-complete public DSK proof.
