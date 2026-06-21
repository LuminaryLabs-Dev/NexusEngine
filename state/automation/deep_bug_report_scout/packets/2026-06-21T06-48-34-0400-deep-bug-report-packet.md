# Deep Bug Report Packet: 2026-06-21T06:48:34-04:00

Timestamp: 2026-06-21T06:48:34-04:00
Automation: nexusrealtime-deep-bug-report-packet
Scope: read-only deep bug scout for remaining domain command/config ownership gaps

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-20-telemetry-command-payload-ownership`.
- Recent deep packets already cover telemetry selected-value ownership, RequestQueue/TransportRoute/InputIntent command metadata ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model aliasing, runtime identity/lifecycle, SequenceNode registry/history, timing receipt id overwrite, lifecycle cost-before-prereq mutation, facility/economy non-finite transactions, and resource-pressure restored-state contradictions.
- Latest ecosystem state/proof packets keep branch-name drift, npm metadata, public browser module 404s, ProtoKits package resolution, Experiments aggregate route failure, and targeted `engine.n.zoneField` failure separate from runtime hardening.
- Latest DSK architecture packet keeps telemetry/command ownership, runtime failure-boundaries, scheduler/world mutation, and direct/composer dependency parity in tranche 1 hardening inventory.
- State packets were context only. Live source, docs, tests, preflight, duplicate scans, and focused probes were authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-differs-from-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404
- Current `HEAD`, `origin/main`, and `origin/0.0.2`: `ff97ba47af4197952eca0aded593d66e1a0e4887`
- Ahead/behind against `origin/0.0.2`: `0 0`

## Current branch
- `main`, tracking `origin/main`
- Worktree had pre-existing neighboring automation tracker/packet/node changes before this run.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/economy-kit.js`, `src/timing-window-kit.js`, `src/resource-pressure-kit.js`, `src/lifecycle-progression-kit.js`, `src/facility-operations-kit.js`, `src/index.js`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404; current branch `main` differs from latest release branch name.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: branch `main...origin/main`; pre-existing neighboring lane automation changes were present.
- `git rev-parse HEAD origin/0.0.2 origin/main`
  - Result: all refs resolve to `ff97ba47af4197952eca0aded593d66e1a0e4887`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan for economy, timing, resource pressure, lifecycle, facility, metadata aliasing, command metadata, caller-owned payloads, returned live state, and live read-model rows.
- Inline Node probe: Economy transaction metadata ownership.
  - Result: mutating the original transaction metadata and the returned state changed the stored ledger metadata to `3`; `engine.economy.transact()` returned the live `EconomyState`.
- Inline Node probe: TimingWindow action and active-window metadata ownership.
  - Result: mutating original action metadata and returned result changed `lastResult.metadata` to `30`; mutating `getActive().metadata` changed caller-owned window metadata and active snapshot metadata to `40`.
- Inline Node probe: ResourcePressure adjustment and resource metadata ownership.
  - Result: mutating original adjustment metadata and returned state changed `lastChange.metadata` to `7`; mutating `engine.resourcePressure.get("energy").metadata` changed caller-owned resource metadata and snapshot metadata to `8`.
- Inline Node probe: LifecycleProgression.add() and FacilityOperations.add() nested payload ownership.
  - Result: mutating caller-owned lifecycle item metadata changed stored lifecycle state to `20`; mutating nested `effects.facility.metadata` through returned state changed lifecycle state to `22`; mutating caller-owned facility metadata and output amount changed stored facility state to metadata `31`, output amount `9`, and same-tick economy cash to `8` after output/upkeep.

## Existing bug packets checked
- Prior deep packets through `2026-06-20T17-54-14-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover Economy `ledgerLimit:0`, RequestQueue reward ordering/defaults, Cargo negative value, Facility non-finite transactions, ResourcePressure initial contradiction, TimingWindow result-id overwrite, Lifecycle cost-before-prereq mutation, RequestQueue/TransportRoute/InputIntent command metadata aliasing, query read-model aliasing, source-config/reset leakage, and procedural/navigation command ownership.
- This packet does not duplicate those rows. It isolates additional domain command/config boundaries where Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations retain caller-owned nested data or return live state handles.

## Executive summary
- Current smoke tests still pass, but several remaining domain APIs still treat command/config submission as a shared-object handoff instead of a captured command boundary.
- `EconomyKit` stores transaction metadata by reference and `transact()` returns the live state, so ledger proof can be mutated after submission.
- `TimingWindowKit` stores action metadata and active-window metadata by reference; `getActive()` and `action()` expose mutable handles into runtime/proof state.
- `ResourcePressureKit` keeps resource metadata and adjustment metadata by reference while `adjust()` and `get()` return live state/resource handles.
- `LifecycleProgressionKit.add()` and `FacilityOperationsKit.add()` keep nested item/facility payloads by reference, so caller mutations can change future facility creation, output amount, emitted output, and economy transactions.

## Deep bug reports

### 1. Economy transactions retain caller-owned metadata and return live ledger state
- Severity: medium
- Owner: economy command/proof ownership
- Evidence files and line references:
  - `src/economy-kit.js:23-60` builds completed/rejected transactions with `metadata: request.metadata ?? {}`.
  - `src/economy-kit.js:96-100` emits the caller request, ticks immediately, and returns `EconomyState`.
  - `src/economy-kit.js:89-90` exposes `getState()` as the live resource.
- Reproduction path: call `engine.economy.transact({ metadata })`, mutate `metadata.nested.value` or the returned state's `ledger[0].metadata`, then inspect `engine.economy.snapshot()`.
- Probe result: original metadata and ledger metadata both ended at `3`; `transact()` returned the live `EconomyState`.
- Expected behavior: transaction ledger entries should be immutable proof records once submitted.
- Actual behavior: caller-owned nested metadata and returned live state can rewrite ledger history after transaction completion.
- Why it matters: Economy is a central operations/logistics proof surface; mutable ledgers break replay, audits, and cross-domain reward evidence.
- Validation needed: economy fixtures for transaction metadata cloning, rejected metadata cloning, returned state mutation, event payload isolation, and ledger proof immutability.
- Suggested fix direction: clone/freeze transaction metadata at event consumption and return snapshots or explicit mutable handles.
- Blocks DSK promotion: yes for economy-ledger proof and replay-safe operations DSKs.

### 2. TimingWindow action and active-window metadata are mutable through read/command APIs
- Severity: medium
- Owner: timing proof ownership
- Evidence files and line references:
  - `src/timing-window-kit.js:17-27` keeps window metadata by reference.
  - `src/timing-window-kit.js:40-58` copies the same window metadata into active timing evaluations.
  - `src/timing-window-kit.js:70-84` stores action metadata by reference in `lastResult` and emitted results.
  - `src/timing-window-kit.js:102-109` returns live active/result objects through `getActive()` and `action()`.
- Reproduction path: submit a timing action with nested metadata, mutate the original metadata and returned result, then mutate `engine.timingWindows.getActive("hit").metadata`.
- Probe result: `lastResult.metadata.nested.value` became `30`; caller-owned window metadata and active snapshot metadata became `40`.
- Expected behavior: timing action receipts and active-window read models should be proof snapshots.
- Actual behavior: action receipts and active-window metadata are mutable after the command/read boundary.
- Why it matters: timing windows are likely to drive combat, rhythm, training, and validation domains; proof receipts cannot double as mutable UI handles.
- Validation needed: timing fixtures for action metadata cloning, active-window metadata isolation, returned result mutation, event payload isolation, and window config mutation.
- Suggested fix direction: clone metadata on window normalization/evaluation and clone returned active/result objects.
- Blocks DSK promotion: promotion-adjacent for timing/action receipt proof.

### 3. ResourcePressure adjustment and resource reads expose caller-owned nested state
- Severity: medium
- Owner: resource-pressure command/read ownership
- Evidence files and line references:
  - `src/resource-pressure-kit.js:18-31` keeps resource metadata by reference.
  - `src/resource-pressure-kit.js:78-90` stores adjustment metadata by reference in `lastChange` and emitted changes.
  - `src/resource-pressure-kit.js:120-132` returns live state/resources through `getState()`, `get()`, and `adjust()`.
- Reproduction path: create a resource with nested metadata, adjust it with nested metadata, mutate original adjustment metadata, returned state, and `engine.resourcePressure.get("energy").metadata`.
- Probe result: `lastChange.metadata.nested.value` became `7`; caller-owned resource metadata and snapshot resource metadata became `8`; `adjust()` returned the live state.
- Expected behavior: pressure-resource config and adjustment proof entries should be isolated from host objects and read-model consumers.
- Actual behavior: submitted metadata, resource metadata, and returned live handles all share mutable nested objects.
- Why it matters: Resource pressure often acts as stamina, oxygen, heat, morale, or hazard budget; mutable proof/change state undermines replay and validation.
- Validation needed: resource-pressure fixtures for resource metadata cloning, adjustment metadata cloning, returned state mutation, `get()` read isolation, depletion payload isolation, and reset from mutated config.
- Suggested fix direction: clone normalized resources and adjustment metadata, and return snapshots from read/command APIs unless the method is explicitly a mutable state handle.
- Blocks DSK promotion: yes for replayable pressure/resource DSKs.

### 4. Lifecycle and facility add APIs keep nested payload objects live into future simulation
- Severity: medium
- Owner: lifecycle/facility config command ownership
- Evidence files and line references:
  - `src/lifecycle-progression-kit.js:9-20` keeps `cost`, `prerequisites`, `effects`, and `metadata` by reference.
  - `src/lifecycle-progression-kit.js:106-110` appends normalized items and returns the live next state.
  - `src/facility-operations-kit.js:10-22` keeps `output`, `upkeep`, and `metadata` by reference.
  - `src/facility-operations-kit.js:61-91` later uses live facility output/upkeep/metadata to emit facility output and economy transactions.
  - `src/facility-operations-kit.js:109-119` appends/returns live facility state.
- Reproduction path: add lifecycle and facility configs with nested effects/output/metadata, mutate caller-owned objects and returned state, then tick facility operations with EconomyKit installed.
- Probe result: lifecycle stored metadata changed to `20`, nested lifecycle facility metadata changed to `22`, facility stored metadata changed to `31`, facility stored output amount changed to `9`, and same-tick economy cash became `8` after output/upkeep.
- Expected behavior: adding an item/facility should capture the authored payload at submission time or expose explicit edit APIs.
- Actual behavior: caller-owned config and returned live state can change future simulation outputs and economy transactions after add.
- Why it matters: city/facility/lifecycle DSKs will often reuse authoring objects for UI/editor state; mutations outside the engine can change simulation and ledger output silently.
- Validation needed: lifecycle/facility add fixtures for nested `effects`, `cost`, `output`, `upkeep`, metadata, returned state mutation, event payload isolation, and reset from mutated config.
- Suggested fix direction: deep-clone normalized item/facility nested fields and return snapshots from add/status APIs, or name mutable APIs explicitly.
- Blocks DSK promotion: yes for operations/facility/lifecycle determinism.

## Domain and kit expansion risks
- Command-boundary ownership is broader than the earlier RequestQueue/TransportRoute/InputIntent packet; economy, timing, pressure, lifecycle, and facility APIs need the same clone/freeze policy.
- `getState()` and command methods returning live state remain risky when those objects are used as proof, replay, editor, or dashboard records.
- Config-driven DSKs need a consistent rule for nested `metadata`, `effects`, `output`, `upkeep`, `cost`, and emitted payload ownership.

## Cross-cutting risks
- Passing smoke tests does not cover post-submit caller mutation, returned state mutation, or active-read mutation.
- These findings are separate from query helper read-model isolation and source-config/reset leakage; they target command/add APIs and domain proof records.
- Browser/public proof, npm metadata, package-version policy, and sibling repo DSK proof remain separate ecosystem blockers.

## Missing validation
- Economy transaction ownership fixtures for completed/rejected ledgers and event payloads.
- Timing action/active-window ownership fixtures for action metadata, window metadata, active reads, and result events.
- ResourcePressure ownership fixtures for initial resource metadata, adjustments, returned state, `get()` reads, and depletion events.
- Lifecycle/Facility add ownership fixtures for nested effects/output/upkeep/cost/metadata and economy transaction side effects.
- A cross-domain command/add/read fixture pattern that distinguishes immutable proof snapshots from intentional mutable handles.

## DSK promotion blockers
- Do not treat Economy ledgers as proof-safe while transaction metadata and returned state can rewrite history.
- Do not promote TimingWindow or ResourcePressure as replay/proof services until action/change/resource metadata is isolated.
- Do not promote LifecycleProgression or FacilityOperations add APIs as deterministic authoring boundaries while nested caller-owned objects can change future simulation output.

## Suggested next review item
- In a non-scout lane, add a compact cross-domain ownership fixture set covering Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations alongside the previously reported RequestQueue/TransportRoute/InputIntent cases.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, DSK hardening, command-boundary hardening, query read-model hardening, source-config hardening, procedural/navigation hardening, telemetry hardening, or any prior bug root is fixed.
- Playwright/Human View validation was not run because this deep bug scout had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current browser-visible proof status.
