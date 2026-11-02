# Four Authoring harnesses and composable loop steps

User authorized implementation and push to main on 2026-11-02.
Baseline: 7d2cb0398887d4d09569cb44d20b11febb58e826.

Implement independently installable Design, Art, Interaction and Craft contracts/Kits; expose them through the optional production host and existing Agent Loop; retain revision-bound creative review, authorized routing, bounded child runs, durable receipts and safe recovery. Authoring Project remains the only source writer. No runtime renderer, provider transport or product-specific museum content enters Core.

Acceptance: contract and installed-composition checks; standalone and composed harness runs; real authoring/export and inspection proof; negative, cancellation, permission, stale-source and recovery cases; regenerated manifests/catalogs; no claimed Unity or historical approval. Retain actual commands, failures and corrections. Preserve unrelated .agent targets and history.

Bootstrap: GitHub connector reads verified current main, AGENTS.md and the existing development procedure. Local container cannot resolve github.com. Initial contracts were tested locally (7 passing Node tests). An implementation branch carries these actual changes and source-bound CI evidence; it is not a permission-test branch. Main remains unchanged until validated integration. Initialize the existing production task/session when the full source checkout is available; record the exact workspace and IDs in run.json.
