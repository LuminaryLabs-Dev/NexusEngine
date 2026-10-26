# Bootstrap

- Engine workspace: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`.
- Studio workspace: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Studio`.
- Engine current checkout: `main` at `5a4da3eba6ac95d2d8c74a008bb12caff0d6b0e8`; it is six commits behind its remote and has 108 pre-existing changed/untracked paths. Preserve them.
- Studio current checkout: `main` at `da9fa3e70734a3aaed89e8ad6e42e7206ad07e11`, clean before this run.
- Studio pins Engine revision `e3b9b589c9eaad144ef815ec9fa5ab20f0806424` in `package.json` and lockfile. Installed `node_modules/nexusengine` matches manifest identity/hash below.
- Engine root `.agent/target.md` belongs to a separate Agora Build-provider task; it has not been changed.
- Engine task/session APIs were exercised in this run's new isolated production-host workspace. The local host receipt reports a stale embedded `engineRevision` (`081fea1cdd9ca1662bc15116e7174d9c27821630+agent-production.4`), so that field is not used as source identity. The source checkout HEAD and Studio package pin are recorded separately.
- Nexus Engine Kit MCP tools are not exposed in this Codex tool session. The repository's local production-host CLI/API was used for `kit_status`, `kit_discover`, and to create the task/session. The discovered local host provides 75 typed authoring operations; Studio's pinned Engine authoring project exposes 82 operations. Treat the differing operation counts and host revision as a compatibility issue to resolve before using plugin receipts as Studio data proof.

## Engine workflow state

- Task: `studio-kit-coverage-20261025`
- Session: `studio-kit-coverage-20261025`
- Host workspace: `.agent/runs/nexus-studio-kit-coverage-20261025/workspace`
- Initial task nodes: `baseline` → `engine-apis` → `studio-gui` → `project-host-export` → `web-native-acceptance`.
- Task and session creation receipts: `nexus-engine-kit:3` and `nexus-engine-kit:4` in the checkpoint receipt store.
