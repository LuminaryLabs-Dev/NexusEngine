# Streaming portable saves

Target: stream filesystem portable saves, resolve executable Engine validation gates and preserve authoring/build workflows. Run: 2026-10-23-streaming-saves.

Route: inspect -> ownership -> plan -> implement -> focused tests -> failure/repair -> full suite -> persistent proof -> distribution/upgrade repair -> visual/browser proof -> installed parity -> report. Agent, Runtime and Authoring workflows remain intact; Authoring Project/Persistence own the new lazy snapshot and package stream, with filesystem backpressure. The optional Authoring storage host owns IndexedDB browser execution. Existing Editor-owned controller is absent; this report is evidence, not generated tracker state or official promotion.

Executed: full 128-entry smoke suite; focused 25 Authoring/Agent/Runtime tests; streamed/eager byte equality and failure safety; 160-version memory probe; 26-hash historical recovery and tamper rejection; real browser IndexedDB; one-host door/chest/large scene and 10,000 operations; final-source save/load/export/captures and checkpoint upgrade; 33 production checks; eight browser game checks; gallery checks; installed MCP and 100-file Engine overlay parity.

Observed change: full-history save materialization replaced with per-record/object streaming; 53,294,575-byte synthetic package adds 1.46 MiB sampled streaming heap versus 59.32 MiB retained eager heap. Persistent retained heap stayed 166.92-167.07 MiB. Cancellation/archive failure preserve the old manifest; v1 package bytes match. Checkpoint revision compatibility was repaired and unknown revisions still reject.

Exact external blocker: NexusEngine-Editor supplies neither nexus-editor nor guided-development APIs. Existing target/tracker and unrelated Build/Spatial/Graphics work were preserved. No commit/push. Local confidence is high within the demonstrated profile; publication is pending. Portable loading/other providers retain materialization and byte budgets. ENOSPC in temporary extraction was repaired by removing only task-created reproducible staging and using code-only extraction.

Canonical details and changed-file categories: /Users/crimsonwheeler/Documents/GitHub/LuminaryLabs/.agent/projects/nexus-engine-kit/validation.md and streaming-saves/. Cleanup/push checklist is maintained there.
