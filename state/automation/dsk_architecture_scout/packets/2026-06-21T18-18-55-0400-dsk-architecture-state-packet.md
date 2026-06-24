# DSK Architecture State Packet: 2026-06-21T18-18-55-0400

## Timestamp
- local: 2026-06-21T18-18-55-0400
- UTC preflight: 2026-06-21T22:16:36.078Z
- automation: Nexus Realtime: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusRealtime production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-main-parity-telemetry-command-context-root-2026-06-21-0619`.
- Latest DSK packet kept runtime failure-boundary and telemetry/command evidence ownership as hardening inventory, with branch-name drift treated as a release-proof policy question.
- Latest ecosystem state node `2026-06-21T18-05-09-0400` says core and sibling `origin/0.0.2` refs are aligned, core now has dirty host-surface source/test/example work and 9 passing smoke tests, but ProtoKits targeted package resolution, Experiments aggregate route validation, Experiments targeted `engine.n.zoneField`, npm metadata, and public browser proof remain red.
- Latest ecosystem proof node `2026-06-21T06-36-07-0400` keeps branch-name policy, package resolution, aggregate-route validation, DSK API installation, npm publication, and browser import deployment as separate proof gates.
- Latest deep bug node `2026-06-21T06:48:34-04:00` adds Domain Command Config Ownership: Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations retain caller-owned nested payloads or return mutable state/read handles.
- Latest domain idea node `2026-06-21T07-02-40-0400` maps that evidence into planning inventory without replacing telemetry/command evidence ownership, runtime failure-boundary, or public proof gates.
- State packets were context only. Live source, docs, tests, git refs, preflight, and focused probes were treated as authority.

## Latest branch
- preflight command: `npm run automation:preflight`
- latest remote release branch: `0.0.2`
- compare target: `0.0.2`
- current branch: `main`
- branch status: `current-differs-from-latest-release-branch`
- required public links: pass
- optional npm metadata: 404
- `HEAD`: `6c450b3073825ddd495979474f57342556658972`
- `origin/main`: `6c450b3073825ddd495979474f57342556658972`
- `origin/0.0.2`: `6c450b3073825ddd495979474f57342556658972`
- ahead/behind against `origin/0.0.2`: `0 0`
- package metadata: `nexusrealtime@0.1.0`
- worktree note: pre-existing modified `src/index.js`, `tests/public-api-freeze.mjs`, and `tests/run-all.mjs` plus untracked host docs/examples/source/test files were present before this DSK run. This lane wrote only this packet, its knowledge node, and the DSK tracker update.

## Files inspected
- `/Users/crimsonwheeler/.codex/automations/nexusrealtime-dsk-architecture-state-packet/memory.md`
- `/Users/crimsonwheeler/.codex/skills/agent-it/SKILL.md`
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/README.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/dsk_architecture_scout/PROMPT.md`, `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- latest DSK packets/nodes: `2026-06-20T17-38-41-0400`, `2026-06-20T18-23-40-0400`, `2026-06-21T06-19-09-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/index.js`
- `src/economy-kit.js`, `src/timing-window-kit.js`, `src/resource-pressure-kit.js`, `src/lifecycle-progression-kit.js`, `src/facility-operations-kit.js`
- `tests/domain-service-kit-smoke.mjs`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404; current branch `main` differs from the release branch name.
- `git status --short && git branch --show-current && git rev-parse HEAD` -> current branch `main`; dirty source/test host-surface changes were present before lane writes.
- `git rev-parse HEAD origin/main origin/0.0.2` -> all refs `6c450b3073825ddd495979474f57342556658972`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- `git diff --stat origin/0.0.2 -- src tests docs README.md package.json memory.md state/automation/dsk_architecture_scout` -> source/test diff against release ref is limited to host export/freeze/run-all additions.
- `git diff -- src/index.js tests/public-api-freeze.mjs tests/run-all.mjs` -> dirty delta exports `createNexusHost`, `defineHostAdapter`, `createHostGraphSnapshot`, adds them to public API freeze, and adds `tests/host-smoke.mjs` to `tests/run-all.mjs`.
- `npm test` -> passed 9 smoke tests.
- Focused `node --input-type=module` probe -> reconfirmed DSK namespace/install/dependency/binding blockers plus Economy/TimingWindow/ResourcePressure/LifecycleProgression/FacilityOperations command/config ownership blockers.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for components, resources, events, systems, registries, sequences, SequenceNode fields, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares async-ready, serializable state, snapshot, and reset expectations while current execution remains scheduler-linear (`src/domain-service-kit.js:131-139`; `README.md:136-140`).
- `engine.n` is still initialized as a normal object and assigned late through the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, bindings, and kit identity before later init/registry/scheduler/SequenceNode/install work can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still checks only missing `n:` requirements, while `createGameKitComposer()` resolves every required token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- Dirty host-surface exports in `src/index.js` are public API surface growth, not DSK runtime hardening. They should stay under ecosystem/release proof until intentionally committed and promoted.

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK validation, metadata shape, token creation, extension duplicate checks, missing `n:` rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, normal API collision throw, procedural/navigation smoke coverage, SequenceNode smoke coverage, and host smoke coverage.
- Not covered: dirty host-surface release policy, branch-name versus commit-equality release policy, reserved API names, own-property namespace policy, failed-install rollback, direct non-`n:` dependency parity, duplicate provider/binding diagnostics, scheduler/world mutation policy, event payload isolation, procedural/navigation ownership, telemetry/command evidence ownership, domain command/config ownership, reset/snapshot failure behavior, and async metadata truth.
- Focused DSK probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed clean API collision: first collision threw, second same-object reinstall returned `n-late-collision-probe-kit`, API owner stayed `base`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit after `initWorld` mutation.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-probe-kit`; composer rejected the same graph as unresolved.
  - binding ownership: composer and engine both kept duplicate binding `service` from second kit `binding-b`.
- Focused domain command/config probe evidence:
  - Economy caller metadata and stored ledger metadata both reached `3`; `transact()` returned the live `EconomyState`.
  - TimingWindow caller action metadata and stored last-result metadata both reached `30`; caller window metadata and active snapshot metadata both reached `40`.
  - ResourcePressure caller adjustment metadata and stored `lastChange` metadata both reached `7`; caller resource metadata and snapshot resource metadata both reached `8`; `adjust()` returned live state.
  - LifecycleProgression `add()` kept caller metadata and nested `effects.facility` data live; returned state was the live state.
  - FacilityOperations `add()` let returned/caller-owned nested data change stored facility metadata to `32`, output amount to `9`, and first economy output to cash `9`.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments ownership stayed stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation surfaces; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:53-68`, `docs/how-to-protokit.md:99-105`).
- Domain Command Config Ownership is a core validation-surface row for existing Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations APIs. It is not a new gameplay implementation request and not a distribution proof fix.
- This row extends Telemetry Command Evidence Ownership but should remain named separately because it targets command/add/config/read boundaries and future simulation effects rather than telemetry selectors, request queues, transport riders, or input frames.
- Public module-source failures, npm 404, package-version policy, Experiments aggregate route failure, public `Booting...`, and targeted `engine.n.zoneField` failure stay in ecosystem/proof lanes.
- Dirty host-surface work is public API/release proof context. It does not reorder DSK hardening, but it means current `npm test` is now 9 tests and includes uncommitted source/test state.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registries, systems, sequence runtimes, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Duplicate provider tokens and binding names can make large graphs appear satisfied while ownership is ambiguous or last-writer-wins.
- Telemetry and command APIs can turn proof/history/replay surfaces into mutable handles when selected values, submitted metadata, returned state, or event payloads retain caller-owned objects.
- Economy, timing, pressure, lifecycle, and facility APIs can let UI/editor/proof objects mutate accepted commands, active reads, ledgers, resources, lifecycle payloads, future facility outputs, and economy transactions after submission.
- Branch-name drift and dirty host-surface work can make release proof look mixed even when commit equality holds; the proof contract needs to define branch checkout, commit parity, and dirty-worktree policy separately.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation rejects.
- Confirmed: runtime binding names silently overwrite across composer and direct install.
- Confirmed: Economy stores transaction metadata by reference and `transact()` returns live state (`src/economy-kit.js:23-60`, `src/economy-kit.js:89-100`).
- Confirmed: TimingWindow stores window/action metadata by reference and returns live active/result handles (`src/timing-window-kit.js:17-27`, `src/timing-window-kit.js:40-58`, `src/timing-window-kit.js:70-84`, `src/timing-window-kit.js:102-109`).
- Confirmed: ResourcePressure keeps resource/adjustment metadata by reference and returns live state/resource handles (`src/resource-pressure-kit.js:18-31`, `src/resource-pressure-kit.js:78-90`, `src/resource-pressure-kit.js:120-132`).
- Confirmed: LifecycleProgression and FacilityOperations keep nested add/config payloads live into stored state and later facility/economy output (`src/lifecycle-progression-kit.js:9-20`, `src/lifecycle-progression-kit.js:106-110`, `src/facility-operations-kit.js:10-22`, `src/facility-operations-kit.js:61-91`, `src/facility-operations-kit.js:109-119`).
- Carried: scheduler/world mutation, procedural/navigation ownership, telemetry/command ownership, query read-model, content-boundary/objective, runtime identity/lifecycle, composition-proof ownership, proof-signal, AR/spatial, traversal, source-state, state-signal, receipt, bridge, operations, and spatial rows remain fixture inventory.

## Missing tests
- Dirty host-surface release policy and public proof impact.
- Branch-name versus resolved-release-ref proof policy.
- Reserved `apiName` handling for `__proto__`, `constructor`, `prototype`, inherited keys, and own-property service lookup.
- Null-prototype or reserved-key namespace policy for `engine.n`.
- Failed install rollback/retryability for API collision, `createApi` throw, install hook throw, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, and SequenceNode runtime throw.
- Direct install versus composer dependency policy for `n:*`, `runtime:*`, kit ids, and custom capability tokens.
- Duplicate provider-token diagnostics and duplicate binding-name diagnostics with owner lookup and explicit override policy.
- Telemetry/RequestQueue/TransportRoute/InputIntent fixtures for selected-value/path ownership, submitted metadata ownership, returned state mutation, emitted payload ownership, and replay-safe input frames.
- Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations fixtures for metadata cloning, nested payload capture, returned state mutation, active read isolation, event payload isolation, and future simulation side effects.
- Reset/snapshot absence, failure, restore, non-serializable state behavior, and async metadata truth.

## Promotion risks
- Do not promote broad DSK graphs until runtime failure-boundary fixtures exist for namespace safety, install transaction semantics, dependency parity, duplicate ownership diagnostics, scheduler/world mutation, event queue isolation, telemetry/command ownership, domain command/config ownership, and metadata truth.
- Do not treat current branch-name drift as a DSK runtime failure; decide release-proof policy separately from source hardening.
- Do not treat dirty host-surface work as released DSK proof until the release lane decides whether the changes are intentional, committed, and public-consumption-ready.
- Do not use Economy ledgers, TimingWindow receipts, ResourcePressure changes, lifecycle/facility configs, telemetry history, RequestQueue/TransportRoute command state, or InputIntent frames as proof evidence until ownership semantics are fixed or explicitly documented as mutable handles.
- Do not treat `npm test`, HTTP 200 routes, aggregate Experiments checks, fetched raw files, CDN reachability, npm metadata, query helper availability, host exports, or commit equality alone as production DSK safety.
- Do not move proof routing, package-resolution shims, browser routes, host demos, or reusable gameplay implementation into NexusRealtime core to solve distribution proof issues.

## Suggested next review item
- Use a non-scout lane to write the smallest executable tranche 1 fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, duplicate binding/provider diagnostics, scheduler/world mutation/event payload policy, telemetry selected-value/path isolation, RequestQueue/TransportRoute/InputIntent command ownership, Economy/TimingWindow/ResourcePressure/LifecycleProgression/FacilityOperations command-config ownership, and reset/snapshot/async metadata truth.
- Separately decide whether automation release proof requires checking out branch `0.0.2`, whether commit equality against preflight `latestReleaseBranch` is sufficient, and how dirty host-surface work should be handled before public/package proof claims reference it.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Playwright/Human View validation was not run for this DSK architecture scout because this pass had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current public browser proof status.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, read-model/orchestration readiness, runtime identity/lifecycle readiness, composition-proof ownership readiness, content-boundary/objective readiness, query-read-model readiness, scheduler/world readiness, telemetry/command ownership readiness, domain command/config ownership readiness, AR/spatial readiness, proof-signal integrity, proof-readiness taxonomy, host-surface release readiness, or broad domain graph promotion.
