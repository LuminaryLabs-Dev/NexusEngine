

Before: queued full Agent state and mutation journals retained historical copies; the plugin duplicated full results/checkpoints and used isolated authoring phases after heap exhaustion.

After: the main validation host modeled both assets and a dense larger scene, then completed 10,000 calls with retained heap 166.88–166.94 MiB. Pending journal/events remained zero at every sample. The initial receipt was usable after hot-cache eviction. Recovery restored source and interaction state without republishing all historical executions. An additional 1,000 calls after the metadata path hardening remained flat near 58.5 MiB in the smaller recovery harness.

The scene contains 870 nodes, 822 rendered meshes, 162,240 triangles and an 8,450-vertex authored curved shell. Images and exports pass their stated mechanical and visual checks. See validation-summary.json, visual-review.md and the persistent proof for exact scope.

Executed existing checks: `node --test tests/core-kits/core-agent-kit-smoke.mjs tests/realtime-core-tick-contract-smoke.mjs tests/core-domains/core-authoring-consolidation.mjs tests/core-domains/core-authoring-roundtrip.mjs tests/core-domains/core-authoring-io-safety.mjs` (25 pass); Build dependency-resolution/project-immutability/full-build-loop suites (3 pass); production proof (33); game browser proof (8); gallery (3); source/installed MCP validation; independent canonical Engine MCP; targeted lifecycle, archive, migration, corruption, cancellation and symlink checks.

