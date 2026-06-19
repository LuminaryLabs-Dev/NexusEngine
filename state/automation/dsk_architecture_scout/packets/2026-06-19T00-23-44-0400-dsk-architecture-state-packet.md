# DSK Architecture State Packet

## Timestamp
- 2026-06-19T00-23-44-0400

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusRealtime production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-governance-hardening-root-2026-06-18-2323`.
- Latest DSK packet `2026-06-18T23-23-35-0400` kept broad DSK use gated by namespace safety, install transactions, dependency policy, state contracts, and cross-domain event handoff.
- Latest ecosystem state packet `2026-06-19T00-11-28-0400` says core, ProtoKits, and Experiments remain aligned on `0.0.2`; local proof is green; public browser proof remains stuck at `Booting...`; npm metadata is still 404.
- Latest ecosystem proof packet `2026-06-18T23-39-46-0400` says local/raw DSK proof remains green, but public proof needs browser-complete module loading and explicit aggregate DSK proof coverage.
- Latest deep bug packet `2026-06-18T23-53-22-0400` adds state-machine risks around recovery terminal states, transfer constraints, restored progress counts, and input edge semantics.
- Latest domain idea packet `2026-06-19T00-00-19-0400` converts those bugs into state-policy, transfer-policy, input-edge, and proof-coverage planning inventory.
- These packets are context only. Live source, tests, docs, and preflight are the authority for this run.

## Latest branch
- Latest remote release branch from preflight: `0.0.2`
- Current branch: `0.0.2`
- `HEAD`: `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`
- `origin/0.0.2`: `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`
- Ahead/behind against `origin/0.0.2`: `0 0`
- Branch status: `current-is-latest-release-branch`
- Required public links: pass
- Optional npm package metadata: 404
- Local state note: worktree already had modified/untracked automation and planning docs before this run. Targeted source/test files had no diff against `origin/0.0.2`; this lane wrote only its packet, node, and tracker.

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
- Latest DSK packets/nodes from this lane
- Latest neighboring ecosystem state, ecosystem proof, deep bug, and domain idea packets/nodes
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`

## Commands run
- `npm run automation:preflight`
  - Result: pass; latest release branch `0.0.2`; required GitHub/raw/CDN links OK; optional npm metadata 404.
- `git status --short --branch`
  - Result: `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning docs.
- `git rev-parse HEAD origin/0.0.2`
  - Result: both refs resolve to `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`.
- `git rev-list --left-right --count HEAD...origin/0.0.2`
  - Result: `0 0`.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md state/automation/dsk_architecture_scout`
  - Result: only existing DSK tracker diff was reported; targeted source/test files had no diff.
- `npm test`
  - Result: pass, 8 smoke tests.
- Focused `node --input-type=module` DSK probe
  - Result: `apiName:"__proto__"` installs through prototype behavior instead of an own key; API collision leaves failed DSK metadata installed; direct DSK install allows missing non-`n:` requirement.

## DSK contract state
- `defineRuntimeKit()` is still the low-level installable primitive for ECS definitions, systems, bindings, registries, sequences, sequence nodes, metadata, and install hooks.
- `defineDomainServiceKit()` wraps runtime kits with required `domain`, `stability`, `version`, default stable id `n-<domain>-kit`, default `n:<domain>` provide token, optional service tokens, DSK metadata, and an `engine.n.<apiName>` bridge.
- `createDomainServiceToken()` normalizes domain/service names into `n:` capability tokens.
- `src/index.js` exports the DSK API surface; `tests/public-api-freeze.mjs` guards export presence.
- DSK execution remains the normal runtime-kit install path plus linear scheduler phases. `asyncReady`, `snapshot`, `reset`, and `serializableState` remain metadata/convention, not enforced runtime boundaries.
- `createGameKitComposer()` enforces all declared `requires` tokens during composition. Direct `installRuntimeKit()` only rejects missing DSK requirements whose tokens start with `n:`.

## Invariant coverage
- Covered by current smoke/freeze tests:
  - default `n-<domain>-kit` id
  - default `n:<domain>` and service tokens
  - metadata kind, namespace, linear execution, and async-ready default
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
  - duplicate provider-token diagnostics across different DSK ids
  - path ownership and private-resource coupling between domains
  - reset/snapshot absence, failure, non-serializable state, and restore policy
  - async metadata override behavior and async boundary expectations
  - state-machine policy fixtures for terminal states, transfer constraints, restored counts, and input edges

## Domain and kit expansion architecture notes
- Expansion docs remain planning inventory, not public release contract.
- `docs/domain_ideas.md` and `docs/kits_ideas.md` now imply broad DSK service graphs across world, terrain, operations, objective, presentation, telemetry, proof, event, state, transfer, and input domains.
- The latest bug and idea lanes make DSK hardening broader than install mechanics: promoted DSKs also need terminal-state policy, transfer constraint semantics, restored-progress normalization, and input edge/held contracts.
- Proof coverage should stay separated by category: local command, aggregate command, raw-public file, CDN import, npm availability, and browser-complete human proof.
- Public proof route failure is not a DSK source-code failure, but it constrains promotion language because reviewers can see HTTP 200 without a working browser proof.

## Scaling risks
- `installRuntimeKit()` rebuilds installed provides from `engine.kits.flatMap(...)` for each DSK install. This is acceptable at smoke scale but weak for larger provider graphs.
- `createGameKitComposer()` repeatedly scans pending kits until dependencies resolve, trending quadratically with larger kit counts.
- `engine.n` is a flat normal object, so broad DSK promotion increases collision, inherited-key, reserved-key, discoverability, and ownership risks.
- Direct-install dependency behavior differs from composer behavior, which can produce different outcomes for the same kit graph depending on entry path.
- Metadata-only reset/snapshot/async claims are insufficient for replay, restore, network, worker, or long-lived engine promotion.
- Cross-domain state-machine semantics are not part of DSK validation today, but recovery/transfer/input bugs show they need to be part of promotion review.

## Bug candidates
- Confirmed: reserved namespace API key. Probe result for `apiName:"__proto__"`: `own:false`, `keys:[]`, `protoMarker:"__proto__-api"`, and `valueMarker:"__proto__-api"`.
- Confirmed: `constructor` and `prototype` install as own keys today, but they are reserved-looking names that should be explicitly accepted or rejected by policy.
- Confirmed: failed API collision install is non-atomic. Probe result after collision: thrown error plus `engine.kits` and `engine.domainServiceKits` both contain `n-late-collision-kit`.
- Confirmed/design gap: direct DSK install allows a missing non-`n:` requirement. Probe result: `n-generic-dependent-kit` installs with `requires:["runtime:needed"]` and no provider.
- Candidate: DSK promotion needs fixtures that combine install hardening with state-machine invariants from recovery, transfer, progress, and input domains.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, and `prototype`.
- Own-property assertions for every installed `engine.n` API.
- Failed install rollback after API collision, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, sequence node runtime throw, and install hook throw.
- Direct install parity or documented divergence for non-`n:` `requires` tokens.
- Duplicate provider-token diagnostics across different DSK ids.
- End-to-end `extendDomainServiceKit()` install behavior, not only definition-time duplicate checks.
- Reset/snapshot absence, failure, non-serializable state, and restore/reset policy coverage.
- Async metadata override tests that explicitly state async is metadata-only today.
- Multi-domain graph fixture for provider lookup, path ownership, event handoff, terminal-state policy, transfer constraints, restored counters, input edge semantics, and readable blocked dependency errors.

## Promotion risks
- Do not promote broad ProtoKit or domain idea graphs into core until namespace safety, install atomicity, dependency policy, and state contract enforcement are designed and tested.
- Do not claim async DSK execution, worker readiness, network partitioning, or replay/restore support from current metadata.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not treat public route HTTP 200 as a working DSK browser proof; neighboring lanes still show `Booting...` with missing module paths.
- Do not treat untracked planning docs as canonical public architecture.
- Do not treat current smoke tests as state-machine policy proof for recovery, transfer, restored progress, or input semantics.

## Suggested next review item
- Draft the smallest DSK hardening plan and test fixture set that covers:
  - `engine.n` namespace policy
  - install preflight/rollback transaction boundaries
  - direct-install dependency parity versus composer-only policy
  - minimal reset/snapshot/serialization contract
  - state-machine promotion gates for terminal states, transfer constraints, restored counts, and input edges

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, or ProtoKits were edited.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, async execution, worker/network readiness, or broad domain graph promotion.
