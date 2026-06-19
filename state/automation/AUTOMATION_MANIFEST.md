# NexusRealtime Automation Manifest

Last updated: 2026-06-18

## Scope

This manifest indexes repo-local audit lanes for NexusRealtime. It does not replace `memory.md`, `.agent/*`, source files, tests, or release notes.

## .agent Status

- Status: active repo-local automation operating layer.
- Present guidance: `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`.
- Operating model: use `.agent` first, resolve latest remote release branch, check public links, then write lane-local evidence.

## Local Lanes

| Lane | Prompt | Output | Knowledge Nodes | Master |
| --- | --- | --- | --- | --- |
| Ecosystem State Scout | `ecosystem_state_scout/PROMPT.md` | `ecosystem_state_scout/packets/` | `ecosystem_state_scout/knowledge_nodes/` | `ecosystem_state_scout/master_ecosystem_state.md` |
| Runtime Bug Scout | `runtime_bug_scout/PROMPT.md` | `runtime_bug_scout/findings/` | `runtime_bug_scout/knowledge_nodes/` | `runtime_bug_scout/master_runtime_bugs.md` |
| Public Link Scout | `public_link_scout/PROMPT.md` | `public_link_scout/reports/` | `public_link_scout/knowledge_nodes/` | `public_link_scout/master_public_links.md` |

## Shared Preflight

- Command: `npm run automation:preflight`
- Purpose: resolve latest release branch from `origin`, compare it with the current branch, and check public GitHub/raw/CDN/package URLs.
- Branch rule: choose the highest semver-like branch from remote refs, currently expected to resolve to `0.0.2` until a newer branch exists.

## Cadence

- Intended cadence: every 30 minutes when active.
- Each lane is independent and append-only.
- Main Goal Mode later decides what to merge into canonical docs, code, tests, releases, or memory.
