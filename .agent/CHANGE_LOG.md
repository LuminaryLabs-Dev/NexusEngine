# Agent Change Log

Durable record of agent-made changes in this repository. New entries should be added at the top.

## 2026-10-23 — Validated Engine integration prepared for local commit

- Combined upstream Code/toolchain/IDE and Agent features with Engine production workflows, bounded execution state, modeling inspection and streaming portable saves.
- Curated source and portable reports; raw rollback/runtime evidence and unrelated Layout/Build-provider work remain preserved separately.
- Current evidence: `.agent/runs/2026-10-23-integration-commit/`. Local commit authorized; push and publication remain unauthorized.

## 2026-10-23 — Editor controller retirement

- Retired the mandatory Editor controller and completion tracker by explicit user authorization. Original contract/tracker bytes are preserved under `.agent/archive/2026-10-23-editor-controller/`. Existing Engine Agent task/session state and actual validation reports now provide continuity and completion evidence; no replacement controller or domain was added.
- Evidence: `.agent/runs/2026-10-23-controller-retirement/`; no commit or push.

## 2026-06-18

- Added lower-case `.agent` operating files for `agent-it` style automation entry.
- Added NexusEngine automation rules requiring latest-branch discovery and public-link preflight checks.

## 2026-06-17

- Created `.agent/` tracking folder.
- Added `CHANGE_LOG.md` for future agent change entries.
- Added `AGENT_MEMORY.md` for repo-specific agent operating memory.
