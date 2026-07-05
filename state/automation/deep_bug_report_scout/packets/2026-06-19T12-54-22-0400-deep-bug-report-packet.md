# Deep Bug Report Packet: 2026-06-19T12:54:22-04:00

Timestamp: 2026-06-19T12:54:22-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine runtime and reusable domain-kit invariants

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-command-time-descriptor-generation`.
- Recent deep packets already cover SequenceNode deployment side effects, terrain retention, stale AR failure sessions, DSK install atomicity, boot/frame order, default camera crash, ActionMovement killY masking, duplicate kit ids, cleanup event lifetime, disposed SequenceNode mutation, renderer fallback mismatch, operations/logistics issues, spatial/mobility invariants, receipt/idempotency bugs, AR/objective bridge gaps, source-state leaks, state-signal issues, command lifecycle, elapsed-rate, spatial-room, and runner bounds bugs.
- Neighboring ecosystem state/proof packets say core remains latest-ref aligned and local proof is green, but sibling latest-ref proof, public browser proof, aggregate DSK proof, npm metadata, and package-version policy remain open.
- Neighboring DSK architecture packet says the next high-value work is executable hardening fixtures, including lifecycle/config rows from the latest deep bug packet.
- Neighboring domain idea packet maps lifecycle/config findings into planning rows, not source authority.
- These packets were context only. Live source, docs, tests, probes, and preflight are authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404
- Current `HEAD` and `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- Ahead/behind against `origin/0.0.2`: `0 0`

## Current branch
- `0.0.2`, tracking `origin/0.0.2`
- Worktree had pre-existing modified/untracked automation and planning files before this run.
- This lane wrote only this packet, its knowledge node, and the lane master tracker update.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `package.json`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/deep_bug_report_scout/PROMPT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/pathfinding-kit.js`
- `src/navmesh-kit.js`
- `src/procedural-kit.js`
- `src/world-physics-kit.js`
- `src/moving-target-kit.js`
- `src/reveal-light-kit.js`
- `src/lock-and-socket-kit.js`
- `src/sorting-kit.js`
- `src/index.js`
- `tests/procedural-navigation-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan for `SoftRespawn`, `negative cost`, duplicate navmesh, algorithm signature, path cost, world physics, and navigation terms.
- Inline Node probe: negative-cost grid path.
  - Result: a walkable cell with `cost:-5` produced a resolved path with total `cost:-4`.
- Inline Node probe: duplicate walkability keys.
  - Result: two cells with `key:"shared"` produced duplicate navmesh ids `cell-shared` and duplicate graph waypoint ids `wp-cell-shared`.
- Inline Node probe: procedural algorithm signature.
  - Result: two snapshots with the same seed but different algorithm ids/params both produced signature `8108f624`.
- Inline Node probe: WorldPhysics fall respawn event surface.
  - Result: one below-`killY` tick published two `world-soft-respawn` events, one before respawn at y `-17.166...` and one after respawn at y `1.25`; `PhysicsState.playerPosition` remained `{ x:0, y:0, z:0 }` while the player resource was `{ x:0, y:1.25, z:0 }`.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T11-55-07-0400` were scanned to avoid repeating the known findings listed in the prior state context.
- The 2026-06-18 boot/frame packet already noted late kill-plane checks in ActionMovement and that WorldPhysics emits before its own `softRespawn()`. This packet records the narrower duplicate receipt and stale state evidence for WorldPhysics.
- No prior deep packet reported negative path costs resolving as valid, duplicate walkability keys collapsing navmesh identity, or procedural algorithm descriptors being omitted from signatures.

## Executive summary
- Current smoke tests still pass, but navigation/procedural/physics surfaces have untested invariant failures.
- Highest-impact bug: Pathfinding accepts negative traversal costs and returns a negative total path cost, which violates A* cost assumptions and can destabilize routing proofs.
- NavMesh generation accepts duplicate walkability keys and creates duplicate stable ids, collapsing graph identity for downstream pathfinding and telemetry.
- Procedural snapshot signatures ignore algorithm descriptors, so proof/rebuild metadata can claim no content-relevant change even when algorithm rows changed.
- WorldPhysics publishes duplicate fall respawn receipts and leaves `PhysicsState.playerPosition` stale after early respawn return.

## Deep bug reports

### 1. Pathfinding resolves negative-cost routes as valid paths
- Severity: high
- Owner: pathfinding/navigation cost policy
- Evidence files and line references:
  - `src/pathfinding-kit.js:147-157` accepts adapter costs into A* `g`/`f` scores.
  - `src/pathfinding-kit.js:218-220` multiplies step cost by `cell.cost` without clamping or rejecting negative values.
  - `src/pathfinding-kit.js:128-135` reports the resulting negative `cost` as a resolved path.
- Reproduction path: build a 3-cell grid with middle cell `cost:-5`, then run `createAStarPathfinder()` over `navigationAdapters.grid()`.
- Probe result: `status:"resolved"` with `cost:-4`.
- Expected behavior: traversal costs should be finite and non-negative, or the adapter should reject the graph/request as invalid.
- Actual behavior: negative terrain costs are accepted and can make shortest-path scores negative.
- Why it matters: A* assumes non-negative edge costs; negative costs can produce invalid route ranking, misleading telemetry, and unsafe proof claims for terrain/navigation DSKs.
- Validation needed: pathfinding smokes for negative, zero, non-finite, and extremely large cell/link costs.
- Suggested fix direction: normalize adapter costs with a finite non-negative lower bound or fail fast with an invalid-cost reason.
- Blocks DSK promotion: yes for navigation/pathfinding DSK promotion.

### 2. NavMesh generation allows duplicate walkability keys to collapse stable identity
- Severity: high
- Owner: navmesh/graph identity
- Evidence files and line references:
  - `src/navmesh-kit.js:52-53` builds `byKey` with a `Map`, so later duplicate source keys overwrite earlier entries for adjacency checks.
  - `src/navmesh-kit.js:85-97` still emits every source cell with id `cell-${key}`, even when ids duplicate.
  - `src/navmesh-kit.js:144-145` maps waypoints by cell id, so duplicate ids collapse graph lookup identity.
- Reproduction path: pass two walkable cells with `key:"shared"` into `createNavMeshFromWalkability()`, then build `create3DNavigationGraph(navmesh)`.
- Probe result: navmesh cell ids were `["cell-shared","cell-shared"]`; graph waypoint ids were `["wp-cell-shared","wp-cell-shared"]`; graph links were empty.
- Expected behavior: duplicate source keys should be rejected, disambiguated, or normalized to coordinate keys before ids are emitted.
- Actual behavior: duplicate ids are published while lookup maps collapse to the last duplicate.
- Why it matters: streaming terrain, imported walkability, and generated-room proof can create unreachable or misreported navigation graphs if stable ids are not unique.
- Validation needed: navmesh smokes for duplicate keys, missing keys, duplicate coordinates, and graph waypoint uniqueness.
- Suggested fix direction: validate unique walkability keys up front or derive ids from canonical coordinates and report duplicate-source diagnostics.
- Blocks DSK promotion: yes for navigation and terrain-to-navmesh DSK promotion.

### 3. Procedural snapshot signatures ignore algorithm descriptors
- Severity: medium
- Owner: procedural invalidation/proof metadata
- Evidence files and line references:
  - `src/procedural-kit.js:415-423` includes `algorithms` in the snapshot.
  - `src/procedural-kit.js:455-461` computes `snapshot.signature` from seed, rooms, corridors, blocked cells, and spawns only.
  - `src/procedural-kit.js:541-546` uses previous signature and seed as the generated-snapshot skip gate.
- Reproduction path: create two snapshots with seed `same`, but different algorithm ids and params.
- Probe result: both snapshots reported `signature:"8108f624"` while `algorithms` differed.
- Expected behavior: output-affecting or proof-relevant algorithm descriptors should participate in the signature, or a separate algorithm signature should be published.
- Actual behavior: algorithm metadata can change without changing the signature.
- Why it matters: generated-world proof, cache invalidation, navmesh rebuilds, and audit packets can treat materially different generation policy as the same snapshot.
- Validation needed: procedural smokes for algorithm id/params, cell size, biome set, obstacle policy, and room-size changes that should affect signatures.
- Suggested fix direction: include normalized algorithm descriptors and other output-affecting config in `snapshot.signature`, or split content signature from topology signature explicitly.
- Blocks DSK promotion: promotion-adjacent for procedural/world-generation DSKs.

### 4. WorldPhysics fall respawn publishes duplicate receipts and stale player position state
- Severity: medium
- Owner: physics/fall recovery receipts
- Evidence files and line references:
  - `src/world-physics-kit.js:197-200` emits `SoftRespawn` and then calls `softRespawn()`.
  - `src/world-physics-kit.js:109-122` `softRespawn()` emits `SoftRespawn` again after mutating the player.
  - `src/world-physics-kit.js:203-238` writes final contact/player-position state after the fall branch, but the fall branch returns before these fields update.
- Reproduction path: install `createPhysicsKit({ playerStateResource, killY:-10 })`, set player y to `-20`, subscribe to `SoftRespawn`, and tick once.
- Probe result: two `world-soft-respawn` events were published for one fall, and `PhysicsState.playerPosition` remained `{ x:0, y:0, z:0 }` while the player resource was respawned to y `1.25`.
- Expected behavior: one fall should produce one clear respawn receipt, and published physics state should match the final respawned player position.
- Actual behavior: consumers can receive duplicate fall receipts and stale state in the same tick.
- Why it matters: recovery objectives, analytics, replay, and SequenceNode bridges can double-count falls or read stale post-respawn state.
- Validation needed: WorldPhysics smokes for below-`killY`, boundary respawn, event count, final state consistency, and player-state consistency.
- Suggested fix direction: emit only inside `softRespawn()` or only before it, and update final physics state before returning from fall/boundary recovery.
- Blocks DSK promotion: promotion-adjacent for physics/traversal recovery DSKs.

## Domain and kit expansion risks
- Navigation services need a shared finite/non-negative cost policy before terrain, route, and pathfinding proofs compose safely.
- Walkability-to-navmesh services need stable identity validation for duplicate keys and coordinates.
- Procedural services need explicit signature taxonomy: content signature, topology signature, algorithm/config signature, and proof signature.
- Physics recovery services need one-shot receipt semantics and final-state consistency before recovery events drive objectives or analytics.

## Cross-cutting risks
- Reusable DSK surfaces still lack common validation rows for finite numbers, stable ids, signature completeness, and event idempotency.
- Passing local smoke tests does not cover malformed authored data, imported walkability, generated metadata drift, or one-tick recovery event surfaces.
- Public and sibling proof gaps remain separate from these runtime bugs; fixing one category will not prove the others.

## Missing validation
- Pathfinding invalid-cost fixtures.
- NavMesh duplicate identity fixtures.
- Procedural signature/config-drift fixtures.
- WorldPhysics fall/boundary event-count and final-state fixtures.
- Aggregate DSK hardening fixtures that combine cost, identity, signature, and recovery receipt policies.

## DSK promotion blockers
- Navigation/pathfinding DSKs should not be promoted broadly until invalid costs are rejected or normalized.
- Navmesh/terrain DSKs should not be promoted broadly until stable id uniqueness is enforced.
- Procedural/world-generation DSKs need signature semantics that cover output-affecting algorithm/config changes.
- Physics/traversal recovery DSKs need receipt idempotency and final-state consistency.

## Suggested next review item
- In a non-scout lane, add a small hardening fixture file that covers navigation cost policy, navmesh id uniqueness, procedural signature completeness, and physics respawn receipt/state consistency.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim sibling latest refs, public browser proof, npm publication, or aggregate DSK proof are fixed.
