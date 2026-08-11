# NexusEngine 0.0.5 Strong-Model Goal Prompt

Mission: Deliver canonical `n:physics` and `n:render`, deterministic Physics, actual rendered frames, and provider composition; publish immutable `0.0.5` from the approved release commit; leave `main` ready for progress toward `0.0.6`; and prove The Open Above repeatedly rebuilds against an exact lock-resolved `main` SHA.

Use these control planes:

- Master execution matrix: `.agent/versions/0.0.5/master-matrix.jsonl`
- Detailed evidence matrix: `.agent/versions/0.0.5/feature-matrix.jsonl`
- Detailed checklist: `.agent/versions/0.0.5/checklist.md`

The master matrix selects work; the detailed matrix remains the authority for individual requirements, evidence, status, and history.

For each goal cycle:

1. Run `node .agent/versions/0.0.5/tools/generate-master-matrix.mjs --check` and reject drift, missing coverage, cycles, stale projection, or protected-branch changes.
2. Select one dependency-ready master `atomic-action` package using leverage, risk reduction, and proof readiness.
3. Load only that package, its dependencies, its `detailedNodeIds`, repository instructions, current code, and current evidence.
4. Treat the referenced detailed nodes as one coherent strong-model batch. Implement the full semantic package when feasible; record a bounded partial commit only when the package remains honestly `in_progress`.
5. Prevent duplicate ownership, private imports, hidden provider installation, product-specific Core behavior, forwarding exports, and unproved compatibility claims.
6. Run package-specific direct, lifecycle, composition, provider, deterministic replay, packaging, documentation, and consumer proof required by the referenced detailed nodes.
7. Update every affected detailed node independently with observed evidence and append-only transitions. Do not mark untouched children complete.
8. Regenerate the master matrix. Its package completes only when every referenced detailed child is complete.
9. Commit reproducible source, generated outputs, evidence, and matrix transitions together.
10. Recalculate priorities and select the next dependency-ready master package.

Release boundary:

- Work in the isolated feature branch until committed-SHA proof is complete.
- Keep `origin/0.0.4` unchanged.
- Do not push `main` without explicit approval for the exact final SHA.
- Create immutable `origin/0.0.5` only after explicit release approval for the exact SHA already proven on `main`; never force-update or delete it.
- After the freeze, keep `main` as the mutable next-development line and validate The Open Above through HTTPS `#main` with an exact lock-resolved SHA per run.
- Completion requires Physics, Render, providers, MCP, clean packaging, browser proof, full The Open Above feature coverage, restart/replay/disconnection proof, two repeatable clean main-SHA validation cycles, generated-doc agreement, and all detailed completion gates.
