# DSK Architecture State Packet: 2026-06-22T18-19-08-0400

## Timestamp
- local: 2026-06-22T18:19:08-0400
- UTC preflight: 2026-06-22T22:17:43.517Z
- automation: Nexus Engine: DSK Architecture State Packet

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-host-graph-and-release-separation-root-2026-06-22-0619`.
- Latest DSK packet kept runtime failure-boundary first, with Domain Command Config Ownership, Host Graph Lifecycle Ownership, and ProtoKits local-vs-release proof separation as adjacent but distinct gates.
- Latest ecosystem state node `2026-06-22T18-07-07-0400` says core remains commit-aligned with `origin/0.0.2` and smoke-green, while public/release proof remains red and DSK Extension Service Ownership is fresh core hardening inventory.
- Latest ecosystem proof node `2026-06-22T06-36-22-0400` keeps branch/ref policy, package resolution, Experiments aggregate route failure, targeted `engine.n.zoneField`, npm metadata, and browser imports separate from DSK hardening.
- Latest deep bug node `2026-06-22T06-49-01-0400` adds `extendDomainServiceKit()` evidence for missing extension APIs, non-atomic base-plus-extension install, and same-name ECS definition aliasing.
- Latest domain idea node `2026-06-22T07-03-20-0400` maps that evidence into DSK Extension Service Ownership planning inventory without replacing runtime failure-boundary or proof-readiness gates.
- State packets were context only. Live source, docs, tests, git refs, preflight, and focused probes were authority.

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
- package metadata: `nexusengine@0.1.0`
- worktree note: pre-existing dirty docs/source/test/state changes and untracked neighboring lane artifacts were present before this run. This lane wrote only this packet, its knowledge node, and the DSK tracker update.

## Files inspected
- `/Users/crimsonwheeler/.codex/automations/nexusengine-dsk-architecture-state-packet/memory.md`
- `/Users/crimsonwheeler/.codex/skills/agent-it/SKILL.md`
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `state/automation/AUTOMATION_MANIFEST.md`, `state/automation/README.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/dsk_architecture_scout/PROMPT.md`, `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- latest DSK packets/nodes: `2026-06-21T06-19-09-0400`, `2026-06-21T18-18-55-0400`, `2026-06-22T06-19-35-0400`
- latest neighboring packet/node sets from `ecosystem_state_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/index.js`
- `tests/domain-service-kit-smoke.mjs`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`

## Commands run
- `npm run automation:preflight` -> passed; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404; current branch `main` differs from latest release branch name.
- `git branch --show-current && git rev-parse HEAD origin/main origin/0.0.2 && git rev-list --left-right --count HEAD...origin/0.0.2 && git status --short --branch` -> branch `main`; all three refs `6c450b3073825ddd495979474f57342556658972`; ahead/behind `0 0`; dirty docs/source/test/state and untracked lane artifacts present before writes.
- `git diff --stat origin/0.0.2 -- src tests docs README.md package.json memory.md state/automation/dsk_architecture_scout` -> dirty core deltas include host exports/tests, idea docs, ideal docs, and prior DSK tracker edits.
- `npm test` -> passed 9 smoke tests.
- Focused `node --input-type=module` probe -> reconfirmed base DSK namespace/install/dependency/binding blockers and confirmed extension API/token parity, extension install atomicity, and extension definition identity blockers.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for components, resources, events, systems, registries, sequences, SequenceNode fields, bindings, metadata, and install hooks (`src/runtime-kit.js:35-59`).
- `defineDomainServiceKit()` still wraps RuntimeKit with `n:` tokens, stable `n-<domain>-kit` ids, required version/stability metadata, linear execution metadata, and `engine.n.<apiName>` installation (`src/domain-service-kit.js:123-195`).
- DSK metadata still declares async-ready, serializable state, snapshot, and reset expectations while current execution remains scheduler-linear (`src/domain-service-kit.js:131-139`; `README.md:136-140`).
- `engine.n` is still initialized as a normal object and assigned late through the wrapped install hook (`src/domain-service-kit.js:143-161`).
- `installRuntimeKit()` still records DSK metadata, bindings, and kit identity before later init/registry/scheduler/SequenceNode/install work can throw (`src/runtime-kit.js:135-215`).
- Direct DSK installation still checks only missing `n:` requirements, while `createGameKitComposer()` resolves every required token before composition (`src/runtime-kit.js:142-145`; `src/game-kit-composer.js:49-76`).
- `extendDomainServiceKit()` still merges base and extension shape, checks duplicate config keys and system names, preserves extension `apiName`/metadata/provides, and then calls `baseKit.install` inside the extension install wrapper (`src/domain-service-kit.js:54-72`, `src/domain-service-kit.js:198-244`).
- Core/ProtoKits/Experiments ownership remains explicit: core owns runtime/DSK/composer primitives and validation; ProtoKits owns new reusable kits; Experiments owns playable/browser proof (`docs/how-to-protokit.md:7-15`, `docs/how-to-protokit.md:53-68`).

## Invariant coverage
- Covered by smoke tests: export presence, basic DSK validation, metadata shape, token creation, extension duplicate key checks, missing `n:` rejection, normal API installation, serializable snapshot happy path, same-object reinstall idempotency, same-id duplicate rejection, normal API collision throw, procedural/navigation smoke coverage, SequenceNode smoke coverage, and host smoke coverage.
- Not covered: dirty host-surface release policy, ProtoKits local-vs-release proof policy, branch-name versus commit-equality release policy, reserved API names, own-property namespace policy, failed-install rollback, direct non-`n:` dependency parity, duplicate provider/binding diagnostics, end-to-end extension API/token parity, base-already-installed extension transaction behavior, extension same-name ECS definitions, scheduler/world mutation policy, event payload isolation, domain command/config ownership, Host Graph Lifecycle Ownership, reset/snapshot failure behavior, and async metadata truth.
- Focused base DSK probe evidence:
  - reserved API: `own:false`, `keys:[]`, `inheritedMarker:"__proto__-api"`, `protoMarker:"__proto__-api"`.
  - failed API collision: first collision threw, second same-object retry returned `n-late-collision-probe-kit`, API owner stayed `base`, and `engine.kits`/`engine.domainServiceKits` retained the failed kit.
  - dependency parity: direct install with `requires:["runtime:missing"]` installed `n-needs-runtime-probe-kit`; composer rejected the same graph as unresolved.
  - binding ownership: composer and engine both kept duplicate binding `service` from second kit `binding-b`.
- Focused extension probe evidence:
  - extension API parity: extension metadata promised `apiName:"baseProbeExtra"` and provided `n:base-probe:extra`, but installed `engine.n` keys were only `["baseProbe"]`.
  - extension partial install: installing an extension with `createApi` after the base kit threw on `engine.n.baseProbe`, but retained `engine.n.baseProbeWithApi`, the extension kit record, and extension DSK metadata.
  - extension definition identity: base resource key `BaseSame` and extension resource key `DifferentKey` both had definition name `probe.sameResource`.

## Domain and kit expansion architecture notes
- DSK Extension Service Ownership is now live core validation-surface inventory. It targets `extendDomainServiceKit()` API/token parity, base-plus-extension install atomicity, and ECS definition identity; it does not fix package resolution, public browser proof, npm, or Experiments targeted API installation.
- Extension hardening extends runtime failure-boundary and runtime identity/lifecycle rows, but it should stay named separately because it targets promoted service expansion after a base DSK already exists.
- Host Graph Lifecycle Ownership remains separate from extension ownership and still depends on dirty host-surface release policy before host graphs become public proof surfaces.
- Domain Command Config Ownership and Telemetry Command Evidence Ownership remain distinct API-family hardening rows.
- ProtoKits local `main` being 103 commits ahead of `origin/0.0.2` remains proof-policy context, not a DSK runtime fix.
- New reusable implementation still belongs in ProtoKits by default; DSK extension contract fixes belong in core only because they are runtime/validation invariants.

## Scaling risks
- Broad DSK promotion still increases collision, inherited-key, and ownership risks while `engine.n` is a normal object.
- Partial installs can leave DSK metadata, kit identity, bindings, world mutations, registries, systems, sequence runtimes, extension APIs, or service APIs inconsistent after late throws.
- Direct install and composer dependency behavior can diverge for the same dependency-bearing DSK graph.
- Duplicate provider tokens and binding names can make large graphs appear satisfied while ownership is ambiguous or last-writer-wins.
- Extension kits can advertise new service tokens without installing a matching `engine.n.*` surface, making proof graphs stronger than runtime APIs.
- Extension installs after base installs can expose failed services and retained kit metadata, especially for ProtoKits that layer services onto a base domain.
- Extension duplicate checks can miss ECS storage aliasing because world resources/events/components use definition names, not extension object keys.
- Branch-name drift, dirty core host work, and ProtoKits local-vs-release drift can mix local success with release/public proof unless the proof contract is explicit.

## Bug candidates
- Confirmed: reserved `apiName:"__proto__"` installs through prototype behavior without an own `engine.n` slot.
- Confirmed: failed late API collision is non-atomic and same-object reinstall returns success without installing the promised API.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirements that composer-based installation rejects.
- Confirmed: runtime binding names silently overwrite across composer and direct install.
- Confirmed: extension kits can promise a distinct `apiName` and extra service token while installing only the base API (`src/domain-service-kit.js:143-162`, `src/domain-service-kit.js:210-244`).
- Confirmed: extension install after a base install can throw on the base API collision while retaining extension API, kit record, and DSK metadata (`src/runtime-kit.js:147-157`, `src/runtime-kit.js:214-215`, `src/domain-service-kit.js:143-162`, `src/domain-service-kit.js:240-242`).
- Confirmed: extension duplicate validation compares object keys, so same-name ECS definitions under different keys can pass and alias the same world store (`src/domain-service-kit.js:54-59`, `src/domain-service-kit.js:204-207`).
- Carried: Host Graph Lifecycle Ownership, domain command/config ownership, telemetry/command ownership, scheduler/world mutation, procedural/navigation ownership, query read-model, content-boundary/objective, runtime identity/lifecycle, composition-proof ownership, proof-signal, AR/spatial, traversal, source-state, state-signal, receipt, bridge, operations, and spatial rows remain fixture inventory.

## Missing tests
- Dirty host-surface release policy and public proof impact.
- ProtoKits local-vs-release proof policy for DSK promotion evidence.
- Branch-name versus resolved-release-ref proof policy.
- Reserved `apiName` handling for `__proto__`, `constructor`, `prototype`, inherited keys, and own-property service lookup.
- Null-prototype or reserved-key namespace policy for `engine.n`.
- Failed install rollback/retryability for API collision, `createApi` throw, install hook throw, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, SequenceNode runtime throw, and extension install throw.
- Direct install versus composer dependency policy for `n:*`, `runtime:*`, kit ids, and custom capability tokens.
- Duplicate provider-token diagnostics and duplicate binding-name diagnostics with owner lookup and explicit override policy.
- End-to-end `extendDomainServiceKit()` fixtures for the existing smoke-test `extended` kit.
- Extension service token/API parity for `apiName`, `services`, `provides`, and installed `engine.n.*` keys.
- Extension install atomicity fixtures for base-not-installed, base-already-installed, extension API collision, extension install throw, same-object retry, and rollback of staged APIs/metadata.
- Extension duplicate definition-name fixtures for components, resources, and events across base and extension configs.
- Economy, TimingWindow, ResourcePressure, LifecycleProgression, FacilityOperations, Host Graph, telemetry/command, scheduler/world, reset/snapshot, and async metadata fixtures remain missing.

## Promotion risks
- Do not promote broad DSK graphs until runtime failure-boundary fixtures exist for namespace safety, install transaction semantics, dependency parity, duplicate ownership diagnostics, scheduler/world mutation, event queue isolation, command/config ownership, Host Graph Lifecycle Ownership, DSK Extension Service Ownership, and metadata truth.
- Do not treat `extendDomainServiceKit()` as a safe ProtoKit service-expansion path until token/API parity, base-already-installed behavior, rollback, and same-name definition checks are executable.
- Do not treat current branch-name drift as a DSK runtime failure; decide release-proof policy separately from source hardening.
- Do not treat dirty host-surface work as released DSK proof until the release lane decides whether the changes are intentional, committed, and public-consumption-ready.
- Do not mix ProtoKits local `main` proof with `origin/0.0.2` proof while the sibling checkout remains 103 commits ahead of the release branch.
- Do not treat `npm test`, HTTP 200 routes, aggregate Experiments checks, fetched raw files, CDN reachability, npm metadata, extension metadata, host exports, or commit equality alone as production DSK safety.

## Suggested next review item
- Use a non-scout lane to write the smallest executable DSK contract fixture set: `engine.n` reserved-key/null-prototype/own-property policy, failed-install rollback/retryability, direct/composer dependency parity, duplicate binding/provider diagnostics, and `extendDomainServiceKit()` end-to-end service token/API parity, base-already-installed extension transaction behavior, rollback, and same-name ECS definition rejection.
- Keep Host Graph Lifecycle Ownership, domain command/config ownership, telemetry/command ownership, scheduler/world mutation/event payload policy, and reset/snapshot/async metadata truth in the hardening queue, but do not let them hide the new extension service ownership gap.
- Separately decide release-proof policy for branch checkout versus commit equality, dirty host-surface work, and ProtoKits local `main` versus `origin/main` versus `origin/0.0.2`.

## Not claimed
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, ProtoKits, Experiments, deployments, or release branches were edited.
- No bugs were fixed.
- No new tests were added.
- Playwright/Human View validation was not rerun for this DSK architecture scout because this pass had no UI/browser deliverable; neighboring ecosystem lanes carry current public browser proof status and still report `Booting...` plus module 404s.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, sibling fetched-ref validation, async execution, worker/network readiness, replay/restore support, lifecycle parity, query/command semantics, read-model/orchestration readiness, runtime identity/lifecycle readiness, composition-proof ownership readiness, content-boundary/objective readiness, query-read-model readiness, scheduler/world readiness, telemetry/command ownership readiness, domain command/config ownership readiness, Host Graph Lifecycle Ownership readiness, DSK Extension Service Ownership readiness, AR/spatial readiness, proof-signal integrity, proof-readiness taxonomy, host-surface release readiness, or broad domain graph promotion.
