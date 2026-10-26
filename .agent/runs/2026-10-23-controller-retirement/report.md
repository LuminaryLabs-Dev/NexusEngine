# Editor controller retirement

Status: PASS. Retired by explicit user authorization. No commit or push.

## 1. Outcome

The mandatory NexusEngine-Editor controller and its completion tracker are retired. Active instructions use existing Engine Agent task/session state and actual validation reports. No replacement controller, new domain, plugin skill or runtime implementation was added. The Editor remains an optional application and its product capabilities are retained.

The old tracker is a historical pointer. Original AGENTS, tracker and related entry documents are preserved byte-for-byte with SHA-256 records at `/Users/crimsonwheeler/Documents/GitHub/NexusEngine/.agent/archive/2026-10-23-editor-controller/preservation.json`. Historical runs were not edited; the unrelated Agora target is byte-identical to its pre-retirement copy.

## 2. Changes

Updated `AGENTS.md`, root README, `.agent/start-here.md`, `.agent/instructions.md`, `.agent/automation-rules.md`, `.agent/repository-profile.md` and `.agent/tracker.md`. Added `.agent/development.md` and this run's goal/resume references. The active documentation validator now excludes the specific historical `.agent/archive/` directory, while archive integrity is checked independently. Updated Nexus Engine Kit's current goal, validation status and cleanup checklist; previous versions were preserved in `controller-retirement/before/`.

## 3. Validation

The full 128-entry Engine suite passes. All 33 existing production checks pass, including actual web building. All eight browser gameplay checks pass. Installed MCP verifies one public skill and 23 tools. All 17 preserved procedure routes retain their recorded resource hashes. Active documentation checks and diff whitespace checks pass.

The real Engine task `controller-retirement` and answer session `controller-retirement` were persisted, reopened with validation still pending, and checked to reject failed completion receipts. After successful validation, both were completed with the actual validation report path/hash. Reopen recovered completed task/session state and the matching hash. `run.json` identifies the workspace and IDs; `validation.json` and `completion-proof.json` hold the evidence. No Editor command or retired tracker was used as authority.

Previous door/chest/large-scene, streaming-memory and 10,000-call evidence remains preserved; this documentation/process retirement does not claim a new endurance or asset-modeling run.

## 4. Remaining work

Review unrelated dirty Engine work and integrate upstream safely; review scoped source/generated outputs, package identity and secrets before separately authorized commit/push. Publish Engine first, then replace the plugin's local overlay pin with the immutable published revision and revalidate. No controller restoration is needed. See the updated `streaming-saves/cleanup-and-push.md` in the Nexus Engine Kit project.
