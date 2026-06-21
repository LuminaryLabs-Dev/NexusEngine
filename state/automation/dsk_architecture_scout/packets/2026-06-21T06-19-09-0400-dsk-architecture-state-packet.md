# DSK Architecture State Packet: 2026-06-21T06-19-09-0400

## Timestamp
- local: 2026-06-21T06-19-09-0400
- UTC preflight: 2026-06-21T10:17:19.228Z
- automation: Nexus Realtime: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusRealtime production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-telemetry-command-evidence-context-root-2026-06-20-1823`.
- Latest DSK packet kept runtime failure-boundary as tranche 1 and added Telemetry Command Evidence Ownership for telemetry selected-value snapshots, path selector isolation, RequestQueue/TransportRoute command metadata ownership, and InputIntent frame ownership.
- Latest ecosystem state node `2026-06-21T06-05-46-0400` says core commit alignment remains stable even though the local branch name is now `main`; ecosystem proof remains red on targeted ProtoKits package resolution, Experiments aggregate route validation, targeted DSK API installation, npm 404, and public browser module 404s.
- Latest ecosystem proof node `2026-06-20T18-41-30-0400` keeps available-checkout health, release-ref proof, aggregate proof, targeted DSK proof, public browser proof, npm metadata, and package-version policy separate.
- Latest deep bug node `2026-06-20T17-54-14-0400` identifies telemetry, RequestQueue, TransportRoute, and InputIntent ownership bugs as hardening inputs.
- Latest domain idea node `2026-06-20T19-02-02-0400` deferred duplicate proof-readiness and telemetry/command idea additions because existing inventory already owns that evidence.
- State packets were context only. Live source, docs, tests, git refs, preflight, and focused probes were treated as authority.

## Latest branch
- preflight command: `npm run automation:preflight`
- latest remote release branch: `0.0.2`
- compare target: `0.0.2`
- current branch: `main`
- branch status: `current-differs-from-latest-release-branch`
- required public links: pass
- optional npm metadata: 404
- `HEAD`: `ff97ba47af4197952eca0aded593d66e1a0e4887`
- `origin/main`: `ff97ba47af4197952eca0aded593d66e1a0e4887`
- `origin/0.0.2`: `ff97ba47af4197952eca0aded593d66e1a0e4887`
- ahead/behind against `origin/0.0.2`: `0 0`
- package metadata: `nexusrealtime@0.1.0`
- worktree note: pre-existing ecosystem-state scout tracker/packet/node changes were present before this DSK run. This lane wrote only this packet, its knowledge node, and the DSK tracker update.

## Files inspected
- `/Users/crimsonwheeler/.codex/automations/nexusrealtime-dsk-architecture-state-packet/memory.md`
- `/Users/crimsonwheeler/.codex/skills/agent-it/SKILL.md`
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/dsk_architecture_scout/PROMPT.md`, `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- latest DSK packets/nodes: `2026-06-20T06-23-50-0400`, `2026-06-20T17-38-41-0400`, `2026-06-20T18-23-40-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/engine.js`, `src/ecs.js`, `src/index.js`
- `src/telemetry-kit.js`, `src/request-queue-kit.js`, `src/transport-route-kit.js`, `src/input-intent-kit.js`
- `tests/domain-service-kit-smoke.mjs`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404; current branch `main` differs from the release branch name.
- `git rev-parse HEAD origin/0.0.2 origin/main` -> all refs `ff97ba47af4197952eca0aded593d66e1a0e4887`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` -> `0 0`.
- `git status --short --branch` -> `## main...origin/main` plus pre-existing ecosystem-state scout changes.
- `git diff --stat origin/0.0.2 -- src tests docs README.md package.json memory.md state/automation/dsk_architecture_scout` -> no output; inspected DSK/source/doc surfaces had no diff against `origin/0.0.2`.
- `npm test` -> passed 8 smoke tests.
- Focused `node --input-type=module` probe -> reconfirmed DSK namespace/install/dependency/binding blockers and telemetry/command ownership blockers on current checkout.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for components, resources, events, systems, registries, sequences, SequenceNode fields, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares async-ready, serializable state, snapshot, and reset expectations while current execution remains scheduler-linear (`src/domain-service-kit.js:131-139`; `README.md:136-140`).
- `engine.n` is still initialized as a normal object and assigned late through the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, bindings, and kit identity before later init/registry/scheduler/SequenceNode/install work can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still only checks missing `n:` requirements while `createGameKitComposer()` resolves every required token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- Public exports still include DSK, RuntimeKit, composer, ECS scheduler/world primitives, SequenceNode, AR/session/launch APIs, telemetry/command kits, and existing public kit/query surfaces (`src/index.js:1-360`).

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK validation, metadata shape, token creation, extension duplicate checks, missing `n:` rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, and normal API collision throw (`tests/domain-service-kit-smoke.mjs:64-135`; `tests/public-api-freeze.mjs:16-24`; `tests/run-all.mjs:3-11`).
- Not covered: branch-name versus commit-equality release policy, reserved API names, own-property namespace policy, failed-install rollback, direct non-`n:` dependency parity, duplicate provider/binding diagnostics, scheduler/world mutation policy, event payload isolation, procedural/navigation ownership, telemetry/command evidence ownership, reset/snapshot failure behavior, and async metadata truth.
- Focused probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed clean API collision: first collision threw, second same-object reinstall returned `n-late-collision-probe-kit`, API owner stayed `base`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit after `initWorld` mutation.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-probe-kit`; composer rejected the same graph as unresolved.
  - binding ownership: composer and engine both kept duplicate binding `service` from second kit `binding-b`.
  - telemetry ownership: mutating returned whole-resource and path-selected snapshot values changed the source resource and stored history to `9`.
  - RequestQueue ownership: caller metadata and stored request metadata both reached `6` after returned/live mutation.
  - TransportRoute ownership: submitted metadata moved into `carriers[0].riders[0]`; caller, stored, and returned metadata all reached `5`.
  - InputIntent ownership: caller metadata, stored state, returned state, and queued payload stayed live; queued payload id changed to `pad-2`.

## Domain and kit expansion architecture notes
- Core/ProtoKits/Experiments ownership stayed stable: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation surfaces; ProtoKits owns new reusable domain implementations; Experiments owns playable/browser proof (`docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:56-64`, `docs/how-to-protokit.md:265-284`).
- Telemetry Command Evidence Ownership is now confirmed against the current checkout, but it is not a new gameplay kit request and not a distribution proof fix.
- Branch-name drift is a proof-policy issue: current `main` equals `origin/0.0.2`, but preflight correctly reports the branch name differs from the latest release branch.
- Public module-source failures, npm 404, package-version policy, Experiments aggregate route failure, and targeted DSK API installation failure stay in ecosystem/proof lanes.
- Scheduler/world mutation and procedural/navigation ownership remain lower-level or separate hardening rows before telemetry/command proof can be trusted as immutable release evidence.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registries, systems, sequence runtimes, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Duplicate provider tokens and binding names can make large graphs appear satisfied while ownership is ambiguous or last-writer-wins.
- Telemetry and command APIs can turn proof/history/replay surfaces into mutable handles when selected values, submitted metadata, returned state, or event payloads retain caller-owned objects.
- Branch-name drift can make automation status look red even when commit equality holds; the proof contract needs to decide whether checkout branch name or resolved target commit is authoritative.
- Local/fetched/public DSK proof can regress independently of core smoke tests when module-source, aggregate-targeted, npm, and package-version policy are implicit.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation rejects.
- Confirmed: runtime binding names silently overwrite across composer and direct install.
- Confirmed: Telemetry stores selected whole-resource and path-selected objects by reference (`src/telemetry-kit.js:21-33`, `src/telemetry-kit.js:47-52`, `src/telemetry-kit.js:64-72`).
- Confirmed: RequestQueue retains caller-owned metadata and returns live state (`src/request-queue-kit.js:13-24`, `src/request-queue-kit.js:76-78`, `src/request-queue-kit.js:139-147`).
- Confirmed: TransportRoute retains submitted metadata through waiting/rider state and arrival payloads and returns live state (`src/transport-route-kit.js:44-51`, `src/transport-route-kit.js:83-85`, `src/transport-route-kit.js:110-113`).
- Confirmed: InputIntent retains caller-owned metadata, emits caller payload, and returns live state (`src/input-intent-kit.js:13-23`, `src/input-intent-kit.js:50-64`, `src/input-intent-kit.js:70-72`).
- Carried: scheduler/world mutation, procedural/navigation ownership, query read-model, content-boundary/objective, runtime identity/lifecycle, composition-proof ownership, proof-signal, AR/spatial, traversal, source-state, state-signal, receipt, bridge, operations, and spatial rows remain fixture inventory.

## Missing tests
- Branch-name versus resolved-release-ref proof policy.
- Reserved `apiName` handling for `__proto__`, `constructor`, `prototype`, inherited keys, and own-property service lookup.
- Null-prototype or reserved-key namespace policy for `engine.n`.
- Failed install rollback/retryability for API collision, `createApi` throw, install hook throw, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, and SequenceNode runtime throw.
- Direct install versus composer dependency policy for `n:*`, `runtime:*`, kit ids, and custom capability tokens.
- Duplicate provider-token diagnostics and duplicate binding-name diagnostics with owner lookup and explicit override policy.
- Telemetry fixtures for whole-resource selectors, path selectors, system snapshots, manual snapshots, history mutation, source-resource mutation through snapshot values, clone-on-capture, clone-on-read, and freeze policy.
- RequestQueue/TransportRoute fixtures for submitted metadata cloning, returned state mutation, arrival/fulfillment payload isolation, reward/penalty metadata, and immutable command summaries.
- InputIntent fixtures for submitted metadata cloning, event payload isolation, returned state mutation, immutable per-frame snapshots, and replay-safe action events.
- Reset/snapshot absence, failure, restore, non-serializable state behavior, and async metadata truth.

## Promotion risks
- Do not promote broad DSK graphs until runtime failure-boundary fixtures exist for namespace safety, install transaction semantics, dependency parity, scheduler/world mutation, event queue isolation, telemetry/command ownership, and metadata truth.
- Do not treat current branch-name drift as a DSK runtime failure; decide release-proof policy separately from source hardening.
- Do not use telemetry history, RequestQueue/TransportRoute command state, or InputIntent frames as proof evidence until ownership semantics are fixed or explicitly documented as mutable handles.
- Do not treat `npm test`, HTTP 200 routes, aggregate Experiments checks, fetched raw files, CDN reachability, npm metadata, query helper availability, or commit equality alone as production DSK safety.
- Do not move proof routing, package-resolution shims, browser routes, or reusable gameplay implementation into NexusRealtime core to solve distribution proof issues.

## Suggested next review item
- Use a non-scout lane to write the smallest executable tranche 1 fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, duplicate binding/provider diagnostics, scheduler/world mutation/event payload policy, telemetry selected-value/path isolation, RequestQueue/TransportRoute/InputIntent command ownership, and reset/snapshot/async metadata truth.
- Separately decide whether automation release proof requires checking out branch `0.0.2` or whether commit equality against preflight `latestReleaseBranch` is sufficient.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Playwright/Human View validation was not run for this DSK architecture scout because this pass had no UI/browser deliverable; neighboring ecosystem state/proof lanes carry current public browser proof status.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, read-model/orchestration readiness, runtime identity/lifecycle readiness, composition-proof ownership readiness, content-boundary/objective readiness, query-read-model readiness, scheduler/world readiness, telemetry/command ownership readiness, AR/spatial readiness, proof-signal integrity, proof-readiness taxonomy, or broad domain graph promotion.
