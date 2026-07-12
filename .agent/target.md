# Development Target

## Goal

Make the NexusEngine root `AGENTS.md` an executable, target-driven development entry contract backed by the Core Headless Editor.

## Mode

Implementation

## Scope

- NexusEngine `AGENTS.md`
- `.agent/target.md`, `.agent/tracker.md`, runs, evidence, and repository environment
- `core-headless-editor-kit`
- `nexus-editor` CLI
- focused and full smoke tests

## Required outcome

- No static development profile is required.
- `.agent/target.md` is the only task-specific input.
- The Headless Editor creates or resumes a run under `.agent/runs/<run-id>/`.
- `.agent/tracker.md` is generated from run state and always explains the next route.
- Reliability checks are inferred from the target, repository, kit graph, contracts, changes, and existing tests.
- Failed evidence routes through diagnosis and replanning.
- Missing evidence prevents completion.
- The CLI exposes target, start, resume, status, next, continue, and report.
- Tests prove target loading, tracking, resumption, inference, repair routing, and completion gates.

## Constraints

- Work directly on `main`.
- Do not create a pull request or a new branch.
- Reuse the existing Headless Editor runtime, workspaces, and evidence contracts.
- Keep the development layer optional and outside gameplay truth.
- Validate before reporting completion.
