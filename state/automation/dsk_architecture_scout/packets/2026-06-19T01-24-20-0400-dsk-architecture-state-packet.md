# DSK Architecture State Packet

## Timestamp
- 2026-06-19T01-24-20-0400

## Lane Goal
- Audit DSK architecture, contracts, invariants, scaling, and promotion risk for long-term NexusEngine production viability.

## Prior State Context
- Current lane tracker latest root before this run: `dsk-state-policy-hardening-root-2026-06-19-0023`.
- Latest DSK packet `2026-06-19T00-23-44-0400` kept production DSK promotion blocked by namespace safety, install transactions, dependency policy, state contracts, and domain state-machine semantics.
- Latest ecosystem state packet `2026-06-19T01-11-04-0400` says core and sibling release `HEAD`s remain aligned and validation-green, but sibling worktree dirt, public browser proof, aggregate DSK proof coverage, npm metadata, and branch/package version policy remain open.
- Latest ecosystem proof packet `2026-06-18T23-39-46-0400` says local/raw DSK proof remains green, but public browser proof still stalls at `Booting...` and Experiments aggregate checks do not list the targeted DSK smoke.
- Latest deep bug packet `2026-06-19T00-54-03-0400` adds objective reset/idempotency, lifecycle accepted-mutation, transport large-delta, and schedule numeric-config bugs.
- Latest domain idea packet `2026-06-19T01-00-48-0400` turns those bugs into accepted mutation, completion idempotency, simulation time, and config normalization planning inventory.
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
- Local state note: worktree already had modified/untracked automation and planning docs before this run. Targeted source/test files had no diff against `origin/0.0.2`; this lane wrote only its packet, node, and tracker update.

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
- `docs/how-to-protokit.md`
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
- `src/objective-flow-kit.js`
- `src/lifecycle-progression-kit.js`
- `src/transport-route-kit.js`
- `src/schedule-kit.js`
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
  - Result before this packet: `memory.md` and the DSK master tracker had tracked diffs; targeted source/test files had no diff.
- `npm test`
  - Result: pass, 8 smoke tests.
- Focused `node --input-type=module` DSK probe
  - Result: `apiName:"__proto__"` installs through prototype behavior instead of an own key; API collision leaves failed DSK metadata installed; direct DSK install allows missing non-`n:` requirement.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive for ECS definitions, systems, bindings, registries, sequences, sequence nodes, metadata, and install hooks.
- `defineDomainServiceKit()` wraps runtime kits with required `domain`, `stability`, `version`, default stable id `n-<domain>-kit`, default `n:<domain>` provide token, optional service tokens, DSK metadata, and an `engine.n.<apiName>` bridge.
- `createDomainServiceToken()` normalizes domain/service names into `n:` capability tokens.
- `src/index.js` exports the DSK API surface; `tests/public-api-freeze.mjs` guards export presence.
- DSK execution remains the normal runtime-kit install path plus linear scheduler phases. `asyncReady`, `snapshot`, `reset`, and `serializableState` remain metadata/convention, not enforced runtime boundaries.
- `createGameKitComposer()` enforces all declared `requires` tokens during composition. Direct `installRuntimeKit()` only rejects missing DSK requirements whose tokens start with `n:`.
- No live source drift was found that resolves the prior DSK blockers.

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
  - accepted/rejected service-call receipts before side effects
  - one-shot completion events and reset-safe completion state
  - large-delta catch-up and leftover progress policy
  - finite numeric config normalization before simulation state is created

## Domain and kit expansion architecture notes
- Expansion docs remain planning inventory, not public release contract.
- `docs/domain_ideas.md` and `docs/kits_ideas.md` now imply broad DSK service graphs across world, terrain, operations, objective, presentation, telemetry, proof, event, state, transfer, input, mutation, time, and config domains.
- The latest bug and idea lanes make DSK hardening broader than install mechanics: promoted DSKs also need accepted mutation boundaries, completion idempotency, time-step catch-up, and config normalization policy.
- `src/objective-flow-kit.js` shows reset and completion event semantics that should become promotion fixtures before objective/proof DSK claims.
- `src/lifecycle-progression-kit.js` plus `src/economy-kit.js` context shows cross-domain side effects need accepted-state policy before lifecycle/economy DSK promotion.
- `src/transport-route-kit.js` and `src/schedule-kit.js` show time/config invariants need explicit policy before operations/mobility DSK promotion.
- Proof coverage should stay separated by category: local command, aggregate command, raw-public file, CDN import, npm availability, and browser-complete human proof.

## Scaling risks
- `installRuntimeKit()` rebuilds installed provides from `engine.kits.flatMap(...)` for each DSK install. This is acceptable at smoke scale but weak for larger provider graphs.
- `createGameKitComposer()` repeatedly scans pending kits until dependencies resolve, trending quadratically with larger kit counts.
- `engine.n` is a flat normal object, so broad DSK promotion increases collision, inherited-key, reserved-key, discoverability, and ownership risks.
- Direct-install dependency behavior differs from composer behavior, which can produce different outcomes for the same kit graph depending on entry path.
- Metadata-only reset/snapshot/async claims are insufficient for replay, restore, network, worker, or long-lived engine promotion.
- Domain service APIs can be structurally valid while still violating accepted-mutation, idempotency, time-step, or config-normalization policy.

## Bug candidates
- Confirmed: reserved namespace API key. Probe result for `apiName:"__proto__"`: `own:false`, `keys:[]`, `protoMarker:"__proto__-api"`, and `valueMarker:"__proto__-api"`.
- Confirmed: `constructor` and `prototype` install as own keys today, but they are reserved-looking names that should be explicitly accepted or rejected by policy.
- Confirmed: failed API collision install is non-atomic. Probe result after collision: thrown error plus `engine.kits` and `engine.domainServiceKits` both contain `n-late-collision-kit`.
- Confirmed/design gap: direct DSK install allows a missing non-`n:` requirement. Probe result: `n-generic-dependent-kit` installs with `requires:["runtime:needed"]` and no provider.
- Candidate: DSK promotion fixtures should now join install hardening with accepted mutation, completion idempotency, time catch-up, and config normalization.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, and `prototype`.
- Own-property assertions for every installed `engine.n` API.
- Failed install rollback after API collision, `initWorld` throw, registry throw, scheduler add throw, sequence runtime throw, sequence node runtime throw, and install hook throw.
- Direct install parity or documented divergence for non-`n:` `requires` tokens.
- Duplicate provider-token diagnostics across different DSK ids.
- End-to-end `extendDomainServiceKit()` install behavior, not only definition-time duplicate checks.
- Reset/snapshot absence, failure, non-serializable state, and restore/reset policy coverage.
- Async metadata override tests that explicitly state async is metadata-only today.
- Promotion fixture for objective reset and completion-event idempotency.
- Promotion fixture for lifecycle/economy accepted-state side effects.
- Promotion fixture for transport large-delta catch-up.
- Promotion fixture for schedule/config finite numeric normalization.

## Promotion risks
- Do not promote broad ProtoKit or domain idea graphs into core until namespace safety, install atomicity, dependency policy, state contract enforcement, and service-call policy fixtures are designed and tested.
- Do not claim async DSK execution, worker readiness, network partitioning, or replay/restore support from current metadata.
- Do not claim npm package availability; optional npm metadata remains 404.
- Do not treat public route HTTP 200 as a working DSK browser proof; neighboring lanes still show `Booting...` with missing module paths.
- Do not treat local aggregate validation as DSK first-wave proof coverage unless the targeted DSK smoke is included or explicitly documented.
- Do not treat untracked planning docs as canonical public architecture.
- Do not treat current smoke tests as proof for accepted mutation, completion idempotency, time catch-up, config normalization, recovery, transfer, restored progress, or input semantics.

## Suggested next review item
- Draft the smallest DSK hardening plan and test fixture set that covers:
  - `engine.n` namespace policy
  - install preflight/rollback transaction boundaries
  - direct-install dependency parity versus composer-only policy
  - minimal reset/snapshot/serialization contract
  - service-call promotion gates for accepted mutation, completion idempotency, time catch-up, and config normalization

## Not claimed
- No bugs were fixed.
- No source, tests, docs, examples, package metadata, repo memory, public claims, `.agent` files, or ProtoKits were edited.
- Passing `npm test` does not prove production DSK readiness.
- This packet does not prove browser UX, public proof completion, npm publication, async execution, worker/network readiness, or broad domain graph promotion.
