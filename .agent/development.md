# Engine-backed repository development

Status: active. The Editor controller requirement and completion tracker are retired.

## 1. Start or resume

Read `AGENTS.md` and the current request. Reuse the applicable run folder. Read `.agent/target.md` only as an applicable task input; preserve it when unrelated. Store the task-specific goal and acceptance criteria in the run's `goal.md`.

Record the existing Engine host workspace and Agent task/session IDs in `run.json`. Bind that workspace using the optional Engine production host, Nexus Engine Kit, MCP or CLI; discover available operations. Use the existing task/session APIs rather than creating another controller. Filesystem host state persists under the recorded workspace's `.nexus-engine-kit/`; retain its object store with the checkpoint. Do not copy large geometry or full logs into Agent working context.

## 2. Execute and verify

Find the owning Domain and Kit, inspect composition, make the authorized change and run relevant existing checks. Record commands, exit codes, source/distribution identity and evidence paths/hashes in the run folder. Use Engine task dependencies and session handoffs for progress. Failure or missing evidence keeps the affected work unfinished. Revise dependent work when its inputs change.

A successful receipt proves that its specific operation ran. External test results must be checked against the actual validator output and referenced explicitly; a status call cannot serve as proof that tests passed. Task completion is progress state, not an independent validation verdict. Review images or gameplay when required by the goal.

## 3. Handoff and completion

Persist Engine state through the selected host. On reopen, read the same task/session and verify its evidence references. Record blockers and next actions explicitly. Finish only after acceptance checks pass and the report identifies material limits. Keep commit/push/release authorization separate from validation.

Current integration run: `runs/2026-10-23-integration-commit/`; workspace and task/session IDs are in its `run.json`. Previous retirement evidence remains historical.

## 4. History

The old tracker and contract are archived at `archive/2026-10-23-editor-controller/` with SHA-256 preservation records. Existing historical run state is unchanged. Historical `nexus-editor` routes and historical completion claims are not current instructions. The Editor remains an optional consumer; this retirement does not remove Editor product features or build capabilities.
