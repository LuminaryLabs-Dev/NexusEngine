# Deep Bug Report Packet: 2026-06-19T13:53:17-04:00

Timestamp: 2026-06-19T13:53:17-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for NexusEngine runtime, DSK install boundaries, scheduler failure semantics, and promotion blockers

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-19-navigation-procedural-physics`.
- Recent deep packets already cover SequenceNode deployment side effects, terrain retention, stale AR failure sessions, DSK install atomicity as a broad blocker, boot/frame order, default camera crash, ActionMovement killY masking, duplicate kit ids, cleanup event lifetime, disposed SequenceNode mutation, renderer fallback mismatch, operations/logistics issues, spatial/mobility invariants, receipt/idempotency bugs, AR/objective bridge gaps, source-state leaks, state-signal issues, command lifecycle, elapsed-rate, descriptor normalization, runner bounds, and navigation/procedural/physics cost and identity bugs.
- Latest ecosystem state/proof packets say core is latest-ref aligned and local proof is green, but sibling fetched-ref proof, public browser proof, aggregate DSK proof, npm metadata, and package-version policy remain open.
- Latest DSK architecture packet says executable hardening fixtures should include namespace, install rollback, dependency policy, traversal integrity, and failure-boundary rows.
- Latest domain idea packet maps traversal proof integrity into planning inventory, not source authority.
- These packets were context only. Live source, docs, tests, probes, and preflight are authority for this run.

## Latest branch
- Preflight latest release branch: `0.0.2`
- Compare target: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm metadata: 404
- Current `HEAD` and `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- Ahead/behind against `origin/0.0.2`: `0 0`

## Current branch
- `0.0.2`, tracking `origin/0.0.2`
- Worktree had pre-existing modified/untracked automation and planning files before this run.
- This lane wrote only this packet, its knowledge node, and the lane master tracker update.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `package.json`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/deep_bug_report_scout/PROMPT.md`
- `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/runtime-kit.js`
- `src/domain-service-kit.js`
- `src/engine.js`
- `src/ecs.js`
- `src/game-kit-composer.js`
- `src/surfaces.js`
- `src/shaders.js`
- `src/renderers.js`
- `src/index.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required public links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan through latest deep packets and neighboring DSK/proof/state packets.
- Inline Node probe: DSK API collision failure.
  - Result: `engine.installKit()` threw but left `n-late-collision-kit` in `engine.kits` and `engine.domainServiceKits`; reinstalling the same object returned success while `engine.n.collision` still pointed at the old API.
- Inline Node probe: reserved DSK `apiName:"__proto__"`.
  - Result: install produced no own `engine.n.__proto__` key, but `engine.n.marker` resolved through the mutated namespace prototype.
- Inline Node probe: direct DSK install with `requires:["runtime:missing"]`.
  - Result: no error; kit installed and `engine.n.needsRuntime.ready` was true.
- Inline Node probe: throwing system after emitting an event.
  - Result: failed tick advanced clock to frame 1 and retained queued/journaled event with no surface publication.
- Inline Node probe: throw-once system followed by successful tick.
  - Result: event surface published the failed tick event and recovery tick event together on frame 2.

## Existing bug packets checked
- Prior deep packets through `2026-06-19T12-54-22-0400` were scanned to avoid repeating known findings.
- Earlier packets already identified broad DSK install atomicity risk and cleanup event lifetime issues. This packet narrows new evidence to late DSK API-collision partial installs, reserved namespace API names, direct non-`n:` dependency bypass, and failed-tick stale event replay.
- No prior deep packet reported `apiName:"__proto__"` prototype mutation, same-object reinstall after failed DSK API collision, direct DSK install allowing `runtime:*` requirements, or stale failed-tick event publication on the next successful tick.

## Executive summary
- Current smoke tests still pass, but DSK install and scheduler failure boundaries have untested production-risk gaps.
- Highest-impact bug: a DSK that fails during late `engine.n.*` API installation is recorded as installed, so later same-object reinstall returns success without installing the API.
- DSK `apiName` validation allows reserved names such as `__proto__`, which mutates the namespace prototype instead of creating an own API slot.
- Direct DSK install enforces only missing `n:` tokens and can ignore missing `runtime:*` requirements that the composer would reject.
- If a system throws after emitting events, the failed tick advances the clock and its events can publish with the next successful tick.

## Deep bug reports

### 1. Failed late DSK API install leaves partial kit state and false reinstall success
- Severity: high
- Owner: DSK install transaction boundary
- Evidence files and line references:
  - `src/runtime-kit.js:135-157` records DSK metadata and pushes the kit before late install hooks run.
  - `src/runtime-kit.js:214-215` calls `kit.install()` after all prior mutation has happened.
  - `src/runtime-kit.js:131-132` returns early on same-object reinstall.
  - `src/domain-service-kit.js:149-160` can throw during `engine.n` API collision before installing the API.
- Reproduction path: pre-seed `engine.n.collision`, install a DSK with `apiName:"collision"`, catch the collision, then install the same kit object again.
- Probe result: first install threw; `engine.kits` and `engine.domainServiceKits` contained `n-late-collision-kit`; second install returned `n-late-collision-kit`; `engine.n.collision` still held the old API.
- Expected behavior: failed install should roll back all kit metadata/state or remain retryable after the collision is resolved.
- Actual behavior: failed install is treated as already installed for the same object, without the promised DSK API.
- Why it matters: DSK promotion depends on reliable service availability. Partial installs can make proof harnesses, snapshots, and dependent kits believe a domain exists when `engine.n.*` does not.
- Validation needed: failed-install rollback fixtures for API collision, `initWorld` throw, scheduler add throw, shader/material register throw, sequence runtime throw, and install hook throw.
- Suggested fix direction: preflight namespace collisions and dependencies before mutation, or wrap install in a rollback transaction.
- Blocks DSK promotion: yes.

### 2. Reserved `apiName:"__proto__"` mutates the `engine.n` prototype instead of installing an own API
- Severity: high
- Owner: DSK namespace safety
- Evidence files and line references:
  - `src/domain-service-kit.js:175-177` accepts any JS identifier-shaped API name, including `__proto__`.
  - `src/domain-service-kit.js:146-147` creates `engine.n` as a normal object.
  - `src/domain-service-kit.js:153-160` assigns `engine.n[apiName] = api`.
- Reproduction path: define a DSK with `apiName:"__proto__"` and a marker API, then install it.
- Probe result: `Object.keys(engine.n)` was empty; `hasOwnProperty("__proto__")` was false; `engine.n.marker` and `Object.getPrototypeOf(engine.n).marker` returned the marker from the API object.
- Expected behavior: reserved namespace keys should be rejected, or `engine.n` should be a null-prototype object with own-property-only API slots.
- Actual behavior: the DSK installs as a kit while the service API is hidden on the namespace prototype.
- Why it matters: inherited service APIs can evade own-key checks, collide unpredictably with future services, and make DSK snapshots or proof code misreport installed services.
- Validation needed: DSK namespace fixtures for `__proto__`, `constructor`, `prototype`, inherited keys, own-property guarantees, and null-prototype behavior.
- Suggested fix direction: reject reserved names and initialize `engine.n` with `Object.create(null)`; require own-property API installation.
- Blocks DSK promotion: yes.

### 3. Direct DSK install ignores missing non-`n:` runtime requirements
- Severity: medium
- Owner: dependency policy parity
- Evidence files and line references:
  - `src/runtime-kit.js:142-145` filters missing DSK requirements to tokens starting with `n:`.
  - `src/game-kit-composer.js:49-76` resolves all `requires` tokens before composition.
  - `src/domain-service-kit.js:180-184` preserves arbitrary valid capability tokens in DSK `requires`.
- Reproduction path: define a DSK with `requires:["runtime:missing"]` and install it directly with `engine.installKit()`.
- Probe result: no error; `n-needs-runtime-kit` installed and `engine.n.needsRuntime.ready` was true despite the missing `runtime:missing` requirement.
- Expected behavior: direct install and composer install should share a documented dependency policy, or direct install should reject all missing requirements.
- Actual behavior: composer rejects unresolved non-`n:` tokens, but direct DSK install ignores them.
- Why it matters: promoted DSKs can pass local direct-install smoke tests while failing in composed games, or run without runtime prerequisites they declared.
- Validation needed: direct-vs-composer dependency parity fixtures for `n:*`, `runtime:*`, kit id, and custom capability tokens.
- Suggested fix direction: enforce all `requires` tokens in direct install, or explicitly document and test composer-only dependency enforcement.
- Blocks DSK promotion: yes for dependency-bearing DSKs.

### 4. Thrown systems can replay failed-tick events on the next successful tick
- Severity: high
- Owner: scheduler failure semantics and event lifetime
- Evidence files and line references:
  - `src/engine.js:168-172` advances clock before scheduler execution.
  - `src/engine.js:186-214` calls `scheduler.run()` without a failure cleanup or rollback path.
  - `src/ecs.js:251-255` queues and journals emitted events immediately.
  - `src/ecs.js:331-365` drains the journal and clears events only after all phases finish.
- Reproduction path: install a runtime kit whose system emits `BoomEvent` and throws on the first tick, then succeeds on the second tick.
- Probe result: first tick threw `boom once`; no event surface saw the failed tick; second tick published a single batch containing both `{ frame:1, marker:"failed-tick" }` and `{ frame:2, marker:"recovery-tick" }`; clock reached frame 2 and elapsed 0.5.
- Expected behavior: failed ticks should have explicit semantics: rollback clock/events, clear failed events, or publish a failure surface without mixing failed and successful tick events.
- Actual behavior: failed tick events remain queued/journaled and publish during the next successful tick.
- Why it matters: analytics, SequenceNode bridges, objectives, replay, and domain proof harnesses can consume events from a tick that the engine reported as failed.
- Validation needed: scheduler throw fixtures for before/after emit, phase start/end lifecycle batches, event clearing, journal clearing, clock rollback/commit policy, and next-tick surface publication.
- Suggested fix direction: use try/finally around scheduler drain/clear, define clock commit semantics, and expose failed-tick diagnostics separately from normal event surfaces.
- Blocks DSK promotion: yes for long-running simulation and proof harness reliability.

## Domain and kit expansion risks
- DSK namespace services need own-property, reserved-key, and prototype-safety guarantees before many ProtoKits share `engine.n`.
- DSK install needs transaction/rollback semantics before domains can safely depend on service availability.
- Dependency-bearing DSKs need parity between direct install and composer install before local proof can stand in for composed proof.
- Scheduler failure semantics need a deliberate policy before event-driven objectives, analytics, and SequenceNode bridges are used as proof surfaces.

## Cross-cutting risks
- Passing smoke tests does not cover failure paths, reserved keys, inherited namespace behavior, or partial install state.
- Public proof and sibling fetched-ref blockers remain separate from these runtime bugs; fixing module paths will not prove DSK transaction safety.
- DSK metadata can overstate reset/snapshot/serializable expectations if the service API may be missing or inherited.

## Missing validation
- DSK API namespace reserved-key fixtures.
- DSK install rollback/transaction fixtures.
- Direct install versus composer dependency fixtures.
- Failed scheduler tick fixtures for event lifetime, journal lifetime, lifecycle surfaces, and clock commit semantics.
- Aggregate DSK hardening fixtures that combine namespace, install, dependency, traversal, and scheduler failure rows.

## DSK promotion blockers
- Do not promote broad DSK graphs until `engine.n` namespace safety is hardened.
- Do not treat DSK install as reliable until failed late install rolls back or preflights all mutating failures.
- Do not rely on direct-install smoke tests for dependency-bearing DSKs until dependency policy matches composer behavior.
- Do not use event surfaces as production proof evidence until failed-tick event replay is explicitly prevented or modeled.

## Suggested next review item
- In a non-scout lane, add the smallest DSK hardening fixture set for namespace reserved keys, install rollback, dependency parity, and failed-tick event cleanup.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim sibling latest refs, public browser proof, npm publication, aggregate DSK proof, traversal integrity, or prior domain-kit bugs are fixed.
