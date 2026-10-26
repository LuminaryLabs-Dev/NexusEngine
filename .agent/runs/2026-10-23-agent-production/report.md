# Engine workflow migration report

Status: local implementation validated. Active evidence run: `2026-10-23-agent-production`. Official controller/promotion remains pending for the reasons in broader-checks.json.

## Ownership and changes

- Agent: portable workflow definitions/progress, sessions, interaction snapshots and count/byte-bounded working records. Full production receipts remain durable outside ECS; large interaction payloads use references.
- Runtime/ECS: public headless operation commit, observer delivery, acknowledgement and diagnostics. Persistence and observer failure retain backlog; delivery is at least once on retry. Gameplay time does not advance.
- Authoring Mesh: portable geometry inspection and revision-bound selection/binding APIs. Project remains the sole geometry writer.
- Authoring Project: immutable source/history versions, optional synchronous history/receipt archives, hot-memory budgets and self-contained portable snapshot compatibility.
- Authoring Publishing: focus/dependency closure is resolved before geometry evaluation and export.
- Optional Engine production provider: existing recipes, preparation/build orchestration, workspace lock/path policy, durable content-addressed checkpoints/results, browser capture/comparison, generic MCP and CLI implementation.
- Build dependency source: local npm archives must be captured in project source, match SHA-512 lock integrity and have installed-tree identity; existing remote/registry rules remain.
- Nexus Engine Kit: forwarding wrappers, one skill, compatible public tools and retained legacy procedure routes. Default authoring proof is persistent; inspection phases remain optional.

Concrete door/chest recipes stay outside portable Core under the Engine's optional kit boundary. No competing harness, memory, workflow or recipe domain was introduced. The 25 top-level domains are retained.

## Validation and observed differences

Before: queued full Agent state and mutation journals retained historical copies; the plugin duplicated full results/checkpoints and used isolated authoring phases after heap exhaustion.

After: the main validation host modeled both assets and a dense larger scene, then completed 10,000 calls with retained heap 166.88–166.94 MiB. Pending journal/events remained zero at every sample. The initial receipt was usable after hot-cache eviction. Recovery restored source and interaction state without republishing all historical executions. An additional 1,000 calls after the metadata path hardening remained flat near 58.5 MiB in the smaller recovery harness.

The scene contains 870 nodes, 822 rendered meshes, 162,240 triangles and an 8,450-vertex authored curved shell. Images and exports pass their stated mechanical and visual checks. See validation-summary.json, visual-review.md and the persistent proof for exact scope.

Executed existing checks: `node --test tests/core-kits/core-agent-kit-smoke.mjs tests/realtime-core-tick-contract-smoke.mjs tests/core-domains/core-authoring-consolidation.mjs tests/core-domains/core-authoring-roundtrip.mjs tests/core-domains/core-authoring-io-safety.mjs` (25 pass); Build dependency-resolution/project-immutability/full-build-loop suites (3 pass); production proof (33); game browser proof (8); gallery (3); source/installed MCP validation; independent canonical Engine MCP; targeted lifecycle, archive, migration, corruption, cancellation and symlink checks.

## Preservation, failure handling and delivery

All 17 procedure trees retain their recorded resource hashes. Source, canonical dependency and installed dependency agree on all 31 Engine overlay files; 93 plugin package files match install. Original plugin/source snapshots and failed attempts are retained in before/ and evidence archives. The disk-full failure was external storage exhaustion, not a passing memory test; it was recovered and a fresh uninterrupted 10,000-call proof completed.

Unrelated Engine Build/Spatial changes, the existing target/tracker, Luminary workspace changes and older user previews were preserved. Guided-controller bootstrap was attempted through the available CLI/help and recorded unavailable; no generated tracker was fabricated. Route sequence followed manually: inspect -> ownership/baseline -> implement -> focused tests -> failure/repair -> persistent proof -> visual review -> installed parity -> report.

The Engine distribution is a local tarball overlay over the recorded base commit, not a published revision. Remaining resource/profile limits and pre-existing broader gates are explicit in validation.md. Native/XR readiness, automatic aesthetic judgment and unlimited-memory portable saves are not claimed.

Final storage checks additionally verified header/content deduplication, old compact-format compatibility, current-source GLB/capture identity and 500 further operations. Independent agent handoff preserves origin attribution. See content-storage-proof.json and agent-handoff-proof.json.
