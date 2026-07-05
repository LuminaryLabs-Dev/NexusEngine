# DSK Architecture State Packet

## Timestamp
- 2026-06-19T10-23-10-0400

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-source-state-fixture-root-2026-06-19-0925`.
- Latest DSK packet `2026-06-19T09-25-20-0400` kept core release-aligned and test-green, and added source-state integrity to DSK promotion fixtures: authored-source isolation, reset-source guarantees, retention-limit normalization, and initial terminal-state receipts.
- Latest ecosystem state node `2026-06-19T10-10-19-0400` says core and ProtoKits remain latest-ref aligned and validation-green, while Experiments is still behind fetched release ref, public browser proof still stalls, aggregate DSK smoke coverage omits targeted proof, npm/package policy remains unresolved, and DSK hardening now includes source-state plus state-signal contracts.
- Latest ecosystem proof node `2026-06-19T09-44-04-0400` keeps runtime hardening separate from public proof, aggregate validation, latest-ref Experiments validation, and npm availability.
- Latest deep bug node `2026-06-19T09-54-20-0400` adds signal/state-contract gaps: ForestPlacement count-only invalidation, held Interaction action repeats, Shrine/LightCombat transition contradictions, ScenarioDriver `{ x, z }` steering loss, and CameraOcclusion cumulative `lookAt` mutation.
- Latest domain idea node `2026-06-19T10-02-21-0400` converts those bugs into state-signal contract proof rows.
- State packets were context only. Live source, docs, tests, preflight, and runtime probes were authority for this run.

## Latest branch
- `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`.
- Current branch: `0.0.2`.
- Compare target: `0.0.2`.
- Branch status: `current-is-latest-release-branch`.
- `HEAD`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- Ahead/behind against `origin/0.0.2`: `0 0`.
- Required GitHub/raw/jsDelivr public links passed; optional npm metadata remained 404.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- Latest DSK packets/nodes: `2026-06-19T09-25-20-0400`, `2026-06-19T08-23-23-0400`, `2026-06-19T07-24-53-0400`
- Neighboring packets/nodes: ecosystem state `2026-06-19T10-10-19-0400` and `2026-06-19T09-12-09-0400`, ecosystem proof `2026-06-19T09-44-04-0400` and `2026-06-19T08-48-39-0400`, deep bug `2026-06-19T09-54-20-0400`, domain idea `2026-06-19T10-02-21-0400`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/forest-placement-kit.js`
- `src/interaction-kit.js`
- `src/shrine-puzzle-kit.js`
- `src/light-combat-kit.js`
- `src/scenario-driver-kit.js`
- `src/camera-occlusion-kit.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`
- `README.md`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed required links; optional npm metadata 404.
- `git status --short --branch` -> current branch `0.0.2` with pre-existing modified/untracked automation/doc artifacts.
- `git rev-parse HEAD origin/0.0.2` -> both `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- `npm test` -> passed 8 smoke tests.
- Focused `node --input-type=module` runtime probe for DSK base blockers plus state-signal contracts.
- `rg`, `sed`, and `nl` inspections for source, docs, tests, lane packets, and trackers.

## DSK contract state
- `defineDomainServiceKit()` still normalizes `n:` tokens, creates stable `n-<domain>-kit` ids by default, installs APIs under `engine.n.<apiName>`, and records linear/async-ready/snapshot/reset metadata (`src/domain-service-kit.js:74-195`).
- The public API freeze still exports DSK primitives (`tests/public-api-freeze.mjs:19-24`), and the DSK smoke still covers creation, extension, `n:` dependency failure, API install, snapshots, idempotent same-object reinstall, and API collision throw (`tests/domain-service-kit-smoke.mjs:64-134`).
- Base blockers remain live: `engine.n` is a plain object (`src/domain-service-kit.js:143-148`), DSK metadata and kit references are recorded before install completes (`src/runtime-kit.js:135-157`, `src/runtime-kit.js:214-216`), and direct DSK install only enforces missing `n:` requirements (`src/runtime-kit.js:142-145`).
- Probe evidence: reserved `apiName: "__proto__"` installed without an own namespace slot (`protoOwn:false`); failed API collision left `n-late-collision-kit` retained in `engine.kits` and `engine.domainServiceKits`; direct install accepted a missing `runtime:needed` requirement.

## Invariant coverage
- Covered today: export presence, basic DSK creation/validation, metadata shape, `n:` token generation, DSK extension duplicate checks, direct missing `n:` requirement failure, basic API collision throw, and serializable snapshot example.
- Not covered today: reserved namespace key rejection, install rollback across metadata/bindings/kits/world/scheduler/API writes, non-`n:` direct dependency policy, reset/snapshot enforcement, source-state isolation, bridge/event delivery policy, receipt idempotency, generated identity, operations finite data, spatial/mobility bounds, and state-signal contracts.
- New live state-signal evidence:
  - ForestPlacement uses `routeLength` in its rebuild signature while descriptors depend on route coordinates and query output (`src/forest-placement-kit.js:154-168`); probe changed a same-length route from z `0` to z `80`, but version stayed `1` and snapshot route stayed `[0,0]`.
  - InteractionKit treats held booleans as repeat actions (`src/interaction-kit.js:49-60`); probe emitted gathered counts `[1]`, `[2]` and repeated activation for `switch` across two ticks.
  - ShrinePuzzle emits charged every tick once conditions are true (`src/shrine-puzzle-kit.js:23-26`); LightCombat can initialize `enemyHealth:0` with `enemyDefeated:false` (`src/light-combat-kit.js:42-49`).
  - ScenarioDriver steering reads `{ x, y }` only (`src/scenario-driver-kit.js:19-27`); probe returned zero vector for `{ x, z }` target.
  - CameraOcclusion mutates source `cameraState.lookAt.y` during terrain-line adjustment (`src/camera-occlusion-kit.js:84-88`); probe moved lookAt y from `0` to `1.87875` to `3.226753125` across ticks.

## Domain and kit expansion architecture notes
- Repo memory and docs keep the split stable: core owns ECS/runtime/DSK/composer primitives and invariants; ProtoKits owns new reusable domain kits; Experiments owns playable/browser proof.
- `docs/how-to-protokit.md` says new reusable kits belong in NexusEngine-ProtoKits, while core receives only runtime contract, validation invariant, scheduler, ECS, or DSK primitive changes.
- `docs/kits_ideas.md` now includes state-signal inventory: descriptor invalidation, action repeat policy, state-machine transition, coordinate-axis policy, derived-state boundary, and signal-contract proof rows.
- The new DSK architecture implication is not to move these domains into core; it is to plan executable hardening fixtures that decide which signal contracts belong as core DSK invariants versus ProtoKit policy helpers.

## Scaling risks
- Dataset-heavy descriptor services can look deterministic while stale signatures suppress rebuilds after meaningful authored-data changes.
- Held boolean inputs can amplify one user action into repeated proof events, rewards, objectives, or telemetry unless service APIs declare edge/held/repeat semantics.
- Small state machines can emit terminal/transition receipts every tick or start with contradictory terminal flags unless initial-state and transition-only policies are explicit.
- Route, terrain, camera, and validation helpers can silently disagree on `{ x, y }` versus `{ x, z }`, corrupting proof rows and movement decisions.
- Presentation and safety services can mutate source state instead of publishing derived output, making reset/replay/async partitioning harder.

## Bug candidates
- `ForestPlacementKit` signature does not include route content, route-safe/accent width, terrain query identity, or slope/query-affecting config.
- `InteractionKit` gather/activate semantics are held-repeat by default without duplicate/ignored receipts.
- `ShrinePuzzleKit` `ShrineCharged` is emitted repeatedly after charge state is already true.
- `LightCombatKit` can begin with `enemyHealth <= 0` while `enemyDefeated` remains false.
- `ScenarioDriverKit` drops common `{ x, z }` target coordinates.
- `CameraOcclusionKit` cumulatively mutates upstream camera look target during derived safety adjustment.

## Missing tests
- Base DSK fixture rows: reserved API names, null-prototype or reserved-key policy, failed-install rollback, direct non-`n:` dependency policy, reset/snapshot contract enforcement.
- State-signal fixture rows: descriptor content-signature invalidation, held versus edge action semantics, transition-only receipts, initial terminal normalization, coordinate-axis normalization, and source-versus-derived state boundaries.
- Coverage wiring: aggregate proof should keep runtime hardening, public browser proof, latest-ref Experiments proof, npm availability, and targeted DSK proof as separate categories.

## Promotion risks
- DSK promotion can overclaim production readiness if green smoke tests are treated as covering namespace safety, install transactions, dependency parity, and signal-contract invariants.
- Public proof loading fixes would not prove DSK runtime hardening.
- ProtoKit migration proof would not prove core DSK hardening unless the fixture set exercises the core install/runtime boundary.
- New reusable kit ideas should stay in ProtoKits unless they expose a missing core DSK primitive or validation invariant.

## Suggested next review item
- Use a non-scout lane to write the smallest executable DSK promotion fixture set covering namespace/install/dependency hardening plus state-signal rows: descriptor invalidation, action repeat policy, transition receipts, coordinate-axis policy, and derived-state boundaries.

## Not claimed
- This packet does not fix bugs, add tests, edit source, edit public docs, change package metadata, update canonical repo memory, promote ProtoKits, publish npm metadata, validate Experiments fetched refs, fix public proof loading, or prove browser-complete public DSK proof.
