# NexusEngine 0.0.5 Control Plane

This directory is the canonical, repository-local planning and evidence index
for the `0.0.5` Physics and Render version cycle. No file in this packet may
depend on a specific user name, home directory, temporary directory, or sibling
checkout path.

## Reading Order

1. `contract.json`: version scope, branch policy, and completion contract.
2. `goal.md`: mission, execution model, current iteration, and end state.
3. `master-matrix.md`: human-readable work-package structure.
4. `master-matrix.jsonl`: ordered execution projection.
5. `feature-matrix.jsonl`: detailed evidence authority.
6. `checklist.md`: per-Kit implementation and proof requirements.
7. `readiness.json`: current release projection and exact next action.
8. `delivery/review-queue.json`: source-first candidate review queue.
9. `source-integration-ledger.jsonl`: append-only source integration history.
10. `sanitization-report.json`: publish-safety and portability scan result.
11. `events.jsonl`: append-only version lifecycle history.

## Path Conventions

- Repository files use repository-relative paths.
- `repo://<name>` identifies a sibling repository by remote identity, not by
  machine location.
- `${HOME}` is supplied by the operating system; it never stores a username.
- `${CODEX_HOME}` defaults to `${HOME}/.codex`.
- `${CODEX_WORKSPACE}` is an optional local workspace root.
- `${NEXUSENGINE_REPO_ROOT}` is resolved with
  `git rev-parse --show-toplevel`.
- `${NEXUSENGINE_BATCH_WORKSPACE}` identifies disposable generated candidate
  material that is intentionally not committed with the canonical plan.
- `${TMPDIR}` identifies non-durable isolated worktrees.

Generated source candidates are review inputs, not planning authority and not
proof. The matrices and ledgers remain authoritative.

## Publish Safety

Run planning tools from the repository root. Generated records must use the
path conventions above. Before any push, refresh `sanitization-report.json`
and require every credential and machine-identity finding to remain zero in
both the candidate tree and the commits that the push would introduce. The
current development history requires a clean squashed candidate based directly
on `origin/main`; pushing the development branch history is prohibited.
