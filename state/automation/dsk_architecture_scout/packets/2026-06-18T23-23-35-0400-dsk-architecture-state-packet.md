# DSK Architecture State Packet

## Timestamp
- 2026-06-18T23-23-35-0400

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-production-hardening-root-2026-06-18-2223`.
- Latest DSK packet `2026-06-18T22-23-28-0400` kept the main blockers open: `engine.n` namespace safety, install atomicity, direct dependency policy, and reset/snapshot contract enforcement.
- Latest ecosystem state packet `2026-06-18T23-08-42-0400` says core remains aligned with latest release branch `0.0.2`, local tests pass, GitHub/raw/jsDelivr links pass, npm metadata is 404, and public proof is still browser-broken.
- Latest ecosystem proof packet `2026-06-18T22-40-48-0400` says local/raw DSK proof is green, but the public GitHub Pages proof route stalls at `Booting...` because module paths 404.
- Latest deep bug packet `2026-06-18T22-52-38-0400` found operations/logistics composition bugs around event order, default rewards, cargo value bounds, and telemetry retention.
- Latest domain idea packet `2026-06-18T23-01-44-0400` reframed expansion around governance, event handoff, proof surfaces, retention, and accounting policy before broad DSK promotion.

## Latest branch
- Latest remote release branch: `0.0.2`
- Current branch: `0.0.2`
- `HEAD`: `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`
- `origin/0.0.2`: `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`
- Branch status: current checkout is on the latest release branch.
- Preflight required public links: pass.
- Optional npm package metadata: 404.
- Local state note: worktree already had modified/untracked automation and planning docs before this run. Targeted source/test files matched `origin/0.0.2`; this lane wrote only its packet, node, and tracker.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/dsk_architecture_scout/PROMPT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- latest DSK packets/nodes from this lane
- latest neighboring ecosystem state, ecosystem proof, deep bug, and domain idea packets/nodes
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/engine.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning docs.
- `git ls-remote --heads origin`
  - Result: remote heads `0.0.1`, `0.0.2`, and `main`; highest semver-like branch is `0.0.2`.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md state/automation/dsk_architecture_scout`
  - Result: tracked source/test/docs compared here had no diff; `docs/described_examples.md`, `docs/domain_ideas.md`, and `docs/kits_ideas.md` are untracked local planning docs; existing local tracked diff is in `state/automation/dsk_architecture_scout/master_dsk_architecture.md`.
- `npm test`
  - Result: pass, 8 smoke tests.
- `node --input-type=module` focused DSK probe
  - Result: `apiName:"__proto__"` installs through prototype behavior instead of an own key; API collision leaves failed kit metadata installed; direct DSK install allows a missing non-`n:` requirement.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for ECS definitions, systems, bindings, registries, sequences, sequence nodes, metadata, and install hooks.
- `defineDomainServiceKit()` wraps runtime kits with required `domain`, `stability`, `version`, default stable id `n-<domain>-kit`, default `n:<domain>` provide token, optional service tokens, DSK metadata, and an `engine.n.<apiName>` API bridge.
- `createDomainServiceToken()` normalizes domain/service names into `n:` capability tokens.
- `src/index.js` exports the DSK API surface and `tests/public-api-freeze.mjs` guards export presence.
- DSK execution is still normal runtime-kit install plus linear scheduler phases. `asyncReady`, snapshot, reset, and serializable-state fields are metadata and convention today, not enforced lifecycle boundaries.
- `createGameKitComposer()` enforces all declared `requires` tokens during composition, while direct `installRuntimeKit()` only rejects missing DSK `requires` tokens that start with `n:`.

## Invariant coverage
- Covered by current smoke/freeze tests:
  - default `n-<domain>-kit` id
  - default `n:<domain>` and service tokens
  - metadata kind, namespace, linear execution, async-ready default
  - invalid domain/provides/version errors
  - extension duplicate resource/system checks
  - missing `n:` dependency rejection on direct engine install
  - normal `engine.n.<api>` install path
  - simple JSON-serializable snapshot happy path
  - same-object duplicate install no-op
  - same-id duplicate DSK rejection
  - normal API collision throws
  - public export presence
- Still not covered:
  - reserved `apiName` keys and own-property namespace guarantees
  - rollback after any failed install stage
  - direct install behavior for missing non-`n:` requirements
  - path ownership and private-resource coupling between domains
  - reset/snapshot contract shape and failure behavior
  - async metadata override behavior and async boundary expectations
  - large service graph dependency resolution, duplicate provider diagnostics, and readable blocked-graph reports

## Domain and kit expansion architecture notes
- Expansion docs now imply a governance-first DSK layer: service graph validity, provider lookup, install transaction reports, namespace safety, path ownership, event handoff, proof surfaces, retention, and accounting policy.
- `docs/kits_ideas.md` lists many future `n:` providers/requires around world, terrain, operations, objective, presentation, telemetry, composition, event, state, and proof services. This makes provider indexing and dependency diagnostics production-critical before broad promotion.
- Deep bug findings around request/economy event order are concrete evidence that DSK scaling needs a cross-domain event handoff policy, not only install-order dependency sorting.
- Public proof context remains separate from DSK architecture: local/raw proof can be green while browser proof fails, so DSK proof surfaces should distinguish local, raw-public, CDN, npm, and browser-complete states.
- Current docs are planning inventory, not release contract; they should not be treated as authority over source, tests, or preflight.

## Scaling risks
- `installRuntimeKit()` rebuilds installed provides from `engine.kits.flatMap(...)` for each DSK install. This is acceptable at smoke scale but should become an indexed provider registry if promoted DSK count grows.
- `createGameKitComposer()` repeatedly scans pending kits until dependencies resolve, which trends quadratically with larger kit graphs.
- `engine.n` is a flat normal object. Broad DSK promotion increases collision, reserved-key, inherited-key, discoverability, and API ownership risks.
- Direct-install dependency behavior differs from composer behavior. A large ecosystem needs one explicit policy or reviewers will see different results depending on entry path.
- State/reset/snapshot/async readiness remain declared expectations. Production DSK graphs need enforceable boundaries before worker, network, replay, or restore claims.
- Cross-domain event handoff is currently phase/order-sensitive at the ECS level; operations/logistics bugs show that composed services need deterministic delivery policy.

## Bug candidates
- Confirmed: reserved namespace API key. Probe result for `apiName:"__proto__"`: `own:false`, `keys:[]`, `valueMarker:"__proto__-api"`, and `protoMarker:"__proto__-api"`.
- Confirmed: `constructor` and `prototype` install as own keys today, but they are still reserved-looking namespace names and should be explicitly accepted or rejected by policy.
- Confirmed: failed API collision install is non-atomic. Probe result after collision: thrown error plus `engine.kits` and `engine.domainServiceKits` both contain `n-late-collision-kit`.
- Confirmed/design gap: direct DSK install allows missing non-`n:` requirement. Probe result: `n-generic-dependent-kit` installs without a provider for `runtime:needed`.
- Candidate: failed-install rollback should cover bindings, world init state, shader/material registries, scheduler systems, sequence runtimes, sequence node runtimes, domain metadata, kit list, and `engine.n`.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, and `prototype`.
- Own-property assertions for every installed `engine.n` API.
- Failed install rollback after API collision, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, and install hook throw.
- Direct install parity or documented divergence for non-`n:` `requires` tokens.
- Duplicate provider-token diagnostics across different DSK ids.
- End-to-end `extendDomainServiceKit()` install behavior, not only definition-time duplicate checks.
- Reset/snapshot absence, failure, non-serializable state, and restore/reset policy coverage.
- Async metadata override tests that explicitly state async is metadata-only today.
- Multi-domain graph fixture for governance, event handoff, provider lookup, path ownership, and readable blocked dependency errors.

## Promotion risks
- Do not promote broad ProtoKit or domain idea graphs into core until namespace safety, install atomicity, dependency policy, and state contract enforcement are designed and tested.
- Do not claim async DSK execution, worker readiness, network partitioning, or replay/restore support from current metadata.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not treat public route HTTP 200 as a working DSK browser proof; neighboring proof lane still shows `Booting...` with 404 module loads.
- Do not treat untracked planning docs as canonical public architecture.

## Suggested next review item
- Draft the smallest DSK hardening plan and test fixture set around four decisions:
  - null-prototype or reserved-key rejection for `engine.n`
  - install preflight/rollback transaction boundaries
  - direct-install dependency parity versus composer-only policy
  - minimal reset/snapshot/serialization contract for promoted DSKs

## Not claimed
- No bugs were fixed.
- No source, tests, docs, package metadata, repo memory, public claims, or ProtoKits were edited.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, async execution, worker/network readiness, or broad domain graph promotion.
