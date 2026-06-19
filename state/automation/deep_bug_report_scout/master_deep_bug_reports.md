# Master Deep Bug Reports Tracker

## Current Root Lessons
- id: deep-bug-root-2026-06-18
- status: open
- latest packet: `state/automation/deep_bug_report_scout/packets/2026-06-18T19-54-00-0400-deep-bug-report-packet.md`
- latest node: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-18T19-54-00-0400-deep-bug-node.md`
- summary: Current smoke tests pass, but validation and cleanup boundaries still allow invalid SequenceNode side effects, unbounded terrain cache growth, stale AR sessions, and DSK install rollback risk.

## Branch Tree
- parent: deep-bug-root-2026-06-18
- child: deep-bug-sequence-validation-001
- relationship: mutation-boundary bug
- look further: Guard `deploySequenceNode()` before kit installation and mounting.
- parent: deep-bug-root-2026-06-18
- child: deep-bug-terrain-cache-001
- relationship: long-session scaling bug
- look further: Enforce `streaming.unloadRadius` and clarify `preloadRadius`.
- parent: deep-bug-root-2026-06-18
- child: deep-bug-ar-failure-001
- relationship: failure-state cleanup bug
- look further: Clear or quarantine stale AR session references on failure.
- parent: deep-bug-root-2026-06-18
- child: deep-bug-install-atomicity-001
- relationship: DSK promotion blocker
- look further: Stage or roll back runtime/DSK install mutations.

## Open Search Branches
- branch: sequence-deploy-guard
- owner: sequence
- priority: high
- next files: `src/sequence-node-kit.js`, `src/sequence-node.js`, `tests/sequence-node-kit-deploy-smoke.mjs`
- branch: dsk-install-rollback
- owner: runtime-kit/DSK
- priority: high
- next files: `src/runtime-kit.js`, `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`
- branch: terrain-streaming-retention
- owner: terrain
- priority: high
- next files: `src/terrain-kit.js`, terrain smoke coverage
- branch: ar-session-cleanup
- owner: AR
- priority: medium
- next files: `src/ar-kit.js`, `src/ar-session.js`, `src/ar-modes/`

## Resolved Or Superseded
- id: none
- reason: First deep bug report scout packet for this lane.
- evidence: no previous `state/automation/deep_bug_report_scout/` packet existed before this run.
