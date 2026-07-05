# Deep Bug Report Packet: 2026-06-20T02:54:27-04:00

Timestamp: 2026-06-20T02:54:27-04:00
Automation: nexusengine-deep-bug-report-packet
Scope: read-only deep bug scout for runtime binding ownership, ECS definition identity, SequenceNode install-only kits, and disposed event-bus subscription behavior

## Lane Goal
- Find evidence-backed runtime bugs, edge cases, scaling risks, and DSK promotion blockers.

## Prior State Context
- Current lane tracker latest root before this run: `deep-bug-root-2026-06-20-composer-sequence-ar-proof-isolation`.
- Recent deep packets already cover duplicate capability providers, duplicate SequenceNode type overwrite, mutable SequenceNode event history snapshots, AR launch device-source mismatch, ARExperience completion repeats, hit-test rejection, negative engine deltas, greybox non-finite scale, AR launch preconditions, mutable launcher support state, SpatialRoom live getters, surface/registry aliasing, DSK partial install, direct dependency parity, scheduler failed ticks, bridge phase, and disposed SequenceNode runtime mutation.
- Latest ecosystem state/proof packets keep core current and smoke-green, while local/fetched/public DSK proof remains blocked by module-source strategy and unresolved `nexusengine` package or sibling imports.
- Latest DSK architecture packet keeps runtime failure-boundary first and composition-proof ownership later; this packet adds concrete rows for binding ownership, ECS definition identity, SequenceNode install-only idempotency, and event-bus disposed-state parity.
- Latest domain idea packet maps duplicate providers, SequenceNode type/history, and AR runtime-source issues to Composition Proof Ownership planning inventory.
- State packets were context only. Live source, docs, tests, preflight, git refs, and focused probes were authority for this run.

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
- Worktree had pre-existing modified docs/automation trackers and many untracked prior automation artifacts before this run.
- This lane wrote only this packet, its knowledge node, the lane master tracker update, and sidecar automation memory.

## Files inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/deep_bug_report_scout/PROMPT.md`, `state/automation/deep_bug_report_scout/master_deep_bug_reports.md`
- Latest current-lane packets/nodes and latest neighboring packets/nodes from ecosystem state, DSK architecture, ecosystem proof, and domain kit idea lanes.
- `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/ecs.js`, `src/sequence-node-kit.js`, `src/sequence-node.js`, `src/engine.js`, `src/domain-service-kit.js`
- `tests/run-all.mjs`, `tests/domain-service-kit-smoke.mjs`, `tests/sequence-node-kit-deploy-smoke.mjs`, `tests/sequence-node-runtime-smoke.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `npm test`
  - Result: passed 8 smoke tests.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- Existing-packet duplicate scan for binding collisions, ECS definition collisions, SequenceNode install-only kits, disposed event bus, kit registry, scheduler phase, and related ownership terms.
- Inline Node probe: duplicate runtime binding names.
  - Result: composer and engine both kept `service` from the second kit, silently overwriting the first binding while install order was `["binding-a","binding-b"]`.
- Inline Node probe: same-named ECS component/resource/event definitions from separate kits.
  - Result: component, resource, and event reads through the second definition returned data written through the first definition.
- Inline Node probe: install-only SequenceNode kit deployment.
  - Result: deploying two graphs requiring the same raw install-only kit ran its install hook twice, left `engine.kits` empty, and provided no idempotency record for future skip checks.
- Inline Node probe: disposed SequenceNode event bus `onAny()`.
  - Result: `subscribe()` and `once()` reject after dispose, but `onAny()` accepted a listener; snapshot showed `disposed:true` and `anyListenerCount:1`.

## Existing bug packets checked
- Prior deep packets through `2026-06-20T01-55-55-0400` were scanned to avoid repeating known findings.
- Earlier packets already cover duplicate provider tokens, direct duplicate kit ids, partial install rollback, bridge phase, surface/registry read-model aliasing, SequenceNode event history mutation, SequenceNode duplicate type overwrite, and disposed SequenceNode runtime mutation.
- No prior deep packet reported silent binding-name overwrite through both composer and install, same-named ECS definition aliasing across kits, repeated install-only SequenceNode kit side effects due to no `engine.kits` record, or `onAny()` disposed-state parity.

## Executive summary
- Current smoke tests still pass, but lower-level ownership and lifecycle contracts have fresh proof gaps.
- Runtime bindings are last-writer-wins in both `createGameKitComposer()` and `installRuntimeKit()`, so two kits can claim one binding name without diagnostics.
- ECS definitions are keyed only by `kind` plus `name`, so separate kits can define same-named components/resources/events and read/write one shared store or queue.
- Raw SequenceNode install-only kits bypass `engine.installKit()`, so repeated graph deployments reinstall the same kit side effects instead of skipping by id/provides.
- SequenceNode event-bus disposed-state behavior is inconsistent: `subscribe()` and `once()` reject after dispose, while `onAny()` still mutates listener state.

## Deep bug reports

### 1. Runtime binding names silently overwrite across kits
- Severity: medium
- Owner: runtime binding/composer ownership
- Evidence files and line references:
  - `src/game-kit-composer.js:17-24` collects bindings into a plain object and overwrites duplicate names.
  - `src/game-kit-composer.js:78-87` exposes only the final binding value.
  - `src/runtime-kit.js:150-155` writes kit bindings directly into `engine.kitBindings` with no collision check.
- Reproduction path: define two runtime kits with different ids and `bindings:{ service:{ owner } }`, compose/install both, then inspect `composer.getBinding("service")` and `engine.kitBindings.service`.
- Probe result: both composer and engine reported `{ owner:"b" }`; the first binding owner was lost without diagnostics.
- Expected behavior: duplicate binding names should reject, namespace, or require explicit override metadata.
- Actual behavior: later kit order decides the binding value silently.
- Why it matters: broad DSK/ProtoKit graphs can wire host adapters, renderers, input maps, or proof services by binding name while a later kit changes the dependency invisibly.
- Validation needed: duplicate binding fixtures for composer, direct install, intentional override, and owner diagnostics.
- Suggested fix direction: record binding owner ids and reject duplicates by default unless a kit declares an explicit override policy.
- Blocks DSK promotion: yes for composition ownership diagnostics.

### 2. Same-named ECS definitions from separate kits alias one store or queue
- Severity: medium
- Owner: ECS definition identity and kit definition registry
- Evidence files and line references:
  - `src/ecs.js:17-26` keys component/event stores by `definition.name`.
  - `src/ecs.js:101-110` creates frozen definitions with only `kind` and `name`.
  - `src/ecs.js:167-185`, `src/ecs.js:211-227`, and `src/ecs.js:251-259` read/write components, resources, and events through the definition name.
  - `src/runtime-kit.js:66-82` validates definition kind but does not detect duplicate names across installed kits.
- Reproduction path: define two component/resource/event objects with the same names in two different kits, write through the first definitions, then read through the second definitions.
- Probe result: `PositionB`, `StateB`, and `EventB` read data written through `PositionA`, `StateA`, and `EventA`.
- Expected behavior: duplicate ECS definition names across kits should be rejected, intentionally shared, or reported as shared identity.
- Actual behavior: separate definitions with the same name are indistinguishable at runtime.
- Why it matters: domain kits can accidentally share or overwrite state/events when authors choose a common name, especially as ProtoKit graphs scale.
- Validation needed: duplicate component/resource/event name fixtures across direct install and composed install, plus intentional shared-definition policy.
- Suggested fix direction: track installed definition names with owning kit ids and require explicit shared-definition metadata for collisions.
- Blocks DSK promotion: yes for domain state isolation and service ownership.

### 3. Install-only SequenceNode kits reinstall on every deployment
- Severity: medium
- Owner: SequenceNode kit installation/idempotency
- Evidence files and line references:
  - `src/sequence-node-kit.js:40-43` skips only kits found in `engine.kits` by id or provides token.
  - `src/sequence-node-kit.js:55-58` calls raw install-only kit hooks directly instead of `engine.installKit()`.
  - `src/sequence-node-kit.js:61-69` reports installed ids but does not persist them for future skip checks.
  - `src/sequence-node-kit.js:82-92` validates, plans, installs required kits, then mounts the graph.
- Reproduction path: register a raw kit object `{ id:"raw", install(engine) { count++ } }`, deploy one graph requiring `raw`, then deploy another graph requiring `raw`.
- Probe result: raw install count became `2`, `engine.rawInstalled` became `2`, and `engine.kits` stayed empty.
- Expected behavior: SequenceNode kit installation should be idempotent by id/provides or record install-only kits in a separate registry.
- Actual behavior: install-only kits can replay global side effects every time a graph requiring them is deployed.
- Why it matters: SequenceNode mission/proof graphs can repeatedly attach adapters, globals, listeners, resources, or host bridges without an installed-state record.
- Validation needed: install-only kit idempotency fixtures for raw kit objects, factory kits, runtime kits, repeated deployments, missing kits, and failed installs.
- Suggested fix direction: normalize install-only kits into runtime kits or maintain an `engine.sequenceNodeInstalledKits` owner registry used by skip checks.
- Blocks DSK promotion: promotion-adjacent for SequenceNode-backed proof graph idempotency.

### 4. Disposed SequenceNode event bus still accepts `onAny()` listeners
- Severity: low
- Owner: SequenceNode event-bus lifecycle parity
- Evidence files and line references:
  - `src/sequence-node.js:183-195` rejects `subscribe()` and `once()` after dispose.
  - `src/sequence-node.js:210-214` adds `onAny()` listeners without checking `disposed`.
  - `src/sequence-node.js:215-221` reports `anyListenerCount` in snapshots.
  - `src/sequence-node.js:227-233` clears listeners and marks the bus disposed.
- Reproduction path: create an event bus, dispose it, call `onAny(() => {})`, then inspect `snapshot()`.
- Probe result: `onAny()` was accepted; snapshot showed `disposed:true` and `anyListenerCount:1`.
- Expected behavior: all event subscription APIs should share the same disposed-state policy.
- Actual behavior: one subscription path still mutates listener state after disposal.
- Why it matters: teardown and proof harnesses can observe disposed-but-growing listener counts, and lifecycle contracts become inconsistent across listener APIs.
- Validation needed: disposed bus fixtures for `subscribe`, `once`, `onAny`, dispatch, clear, snapshot, and repeated dispose.
- Suggested fix direction: add the same disposed guard to `onAny()` that `subscribe()` and `once()` already use.
- Blocks DSK promotion: no by itself, but it is part of proof/runtime lifecycle hygiene.

## Domain and kit expansion risks
- Composition Proof Ownership should include binding ownership, not only capability-token provider ownership.
- Runtime State Isolation should include ECS definition-name ownership because same-name definitions are shared by implementation, not by kit identity.
- SequenceNode-backed proof harnesses need installed-state records for install-only adapters before repeated deploys can be trusted.
- Lifecycle cleanup fixtures should cover every subscription API, including `onAny()`, not only typed listeners.

## Cross-cutting risks
- Passing smoke tests does not cover binding ownership, definition-name collisions, raw SequenceNode kit idempotency, or disposed event-bus `onAny()` parity.
- These findings are separate from public module-source blockers; fixing package/import resolution would not prove composition ownership.
- Binding and ECS definition issues are related to duplicate provider diagnostics, but not duplicates: they cover different ownership surfaces that currently also collapse silently.

## Missing validation
- Runtime binding collision and override-policy fixtures.
- ECS definition-name collision fixtures across components, resources, and events.
- SequenceNode install-only kit idempotency and installed-state fixtures.
- Disposed event-bus lifecycle parity fixtures.

## DSK promotion blockers
- Do not treat binding names as unambiguous service ownership until duplicate binding policy is executable.
- Do not scale domain kits with common ECS definition names until collisions are either rejected or explicitly shared.
- Do not rely on repeated SequenceNode deployment as idempotent proof when install-only kit side effects are not recorded.
- Keep disposed-state listener parity in the lifecycle hardening queue.

## Suggested next review item
- In a non-scout lane, add compact fixtures for binding collisions, ECS definition-name collisions, SequenceNode install-only kit idempotency, and disposed event-bus subscription parity.

## Not claimed
- This packet does not fix source.
- This packet does not add tests.
- This packet does not edit docs, examples, package metadata, repo memory, `.agent` files, public claims, ProtoKits, Experiments, deployments, or release branches.
- This packet does not claim public browser proof, npm publication, sibling fetched-ref proof, DSK hardening, binding hardening, ECS definition isolation, SequenceNode install hardening, event-bus lifecycle hardening, or any prior bug root is fixed.
