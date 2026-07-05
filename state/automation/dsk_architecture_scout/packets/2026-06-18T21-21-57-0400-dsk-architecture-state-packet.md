# DSK Architecture State Packet

Timestamp: 2026-06-18T21:21:57-04:00
Automation: nexusengine-dsk-architecture-state-packet

## Timestamp
- Local: 2026-06-18T21:21:57-04:00
- Preflight: 2026-06-19T01:21:25.983Z

## Latest branch
- Latest remote release branch: `0.0.2`
- Current branch: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Remote heads observed: `0.0.1`, `0.0.2`, `main`
- Comparison to `origin/0.0.2`: `HEAD` and `origin/0.0.2` both resolve to `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`; no diff was observed in the inspected DSK/source/test/docs set.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- `state/automation/dsk_architecture_scout/packets/2026-06-18T20-25-55-0400-dsk-architecture-state-packet.md`
- `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T20-25-55-0400-dsk-architecture-node.md`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/engine.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`
- `README.md` DSK section

## Commands run
- `git status --short --branch`
  - Result: branch `0.0.2...origin/0.0.2`; unrelated dirty/untracked automation and example artifacts exist outside this lane and were not touched.
- `git ls-remote --heads origin`
  - Result: remote heads include `0.0.1`, `0.0.2`, `main`; highest semver-like release branch is `0.0.2`.
- `npm run automation:preflight`
  - Result: required GitHub/raw/CDN public links passed; optional npm package metadata returned 404.
- `git rev-parse HEAD origin/0.0.2 && git diff --stat origin/0.0.2...HEAD`
  - Result: both refs resolve to `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`; no compare diff output.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js src/engine.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md`
  - Result: no diff output.
- `node --input-type=module` ad hoc DSK probe
  - Result: reserved `apiName: "__proto__"` installs without an own namespace property; failed API collision install leaves the failed kit in `engine.kits` and `engine.domainServiceKits`; missing non-`n:` direct requirement installs.
- `npm test`
  - Result: pass, 8 smoke tests.

## DSK contract state
- `defineRuntimeKit()` is still the low-level installable primitive for ECS definitions, systems, bindings, render/sequence assets, metadata, and install hooks.
- `defineDomainServiceKit()` wraps runtime kits with required `domain`, `stability`, and `version`, default id `n-<domain>-kit`, default `n:<domain>` provide token, optional service tokens, DSK metadata, and `engine.n.<apiName>` installation.
- `createDomainServiceToken()` normalizes domain/service values into `n:` tokens with slug validation.
- DSK metadata declares linear execution, async-readiness, serializable-state expectation, inputs/outputs, snapshot expectation, and reset expectation.
- Runtime execution is still linear through `installRuntimeKit()` plus scheduler phases. Async-readiness remains metadata, not async execution.
- Public exports for DSK functions/constants are present in `src/index.js` and guarded by `tests/public-api-freeze.mjs`.
- README and `memory.md` describe the DSK boundary consistently with source behavior, while also making clear async execution is future-facing.

## Invariant coverage
- Covered by current smoke/freeze tests:
  - default `n-<domain>-kit` id
  - `n:` token creation and default/service provides
  - metadata kind, namespace, linear execution, and default async readiness
  - invalid domain/provides/version errors
  - extension duplicate resource/system rejection
  - missing `n:` dependency rejection during direct engine creation
  - normal `engine.n.<api>` install path
  - simple JSON-serializable snapshot happy path
  - same-object duplicate install idempotence
  - same-id new-object duplicate rejection
  - normal API namespace collision rejection
  - public export presence
- Still not covered:
  - reserved `apiName` keys and own-property namespace guarantees
  - failed-install rollback after any DSK install stage throws
  - direct install behavior for missing non-`n:` requirements
  - reset/snapshot enforcement beyond one happy-path API
  - multiple providers for the same `n:` token under different ids
  - large kit-count dependency scaling
  - async metadata override behavior and async boundary expectations

## Scaling risks
- `createGameKitComposer()` resolves dependencies by repeatedly scanning pending kits. This is readable and fine at low counts, but trends quadratically with many promoted domains.
- `installRuntimeKit()` rebuilds installed provides from `engine.kits` for every DSK install instead of using an indexed provider registry.
- `engine.n` is a flat normal object; broad DSK promotion increases collision, reserved-key, inherited-key, and discoverability risks.
- DSK state/reset/snapshot is a metadata expectation plus API convention today; no central state partition or serialization adapter exists yet.
- DSK async-readiness metadata does not map to scheduler partitioning, worker boundaries, promise-aware install hooks, or async failure handling.

## Bug candidates
- Confirmed: `apiName: "__proto__"` passes current identifier validation. Probe result: `reservedOwnProperty: false`, `reservedPrototypeApi: true`, with the kit recorded as installed.
- Confirmed: failed DSK install is not atomic. Probe result after duplicate `engine.n.probeBase` collision: thrown error plus `rollbackKitIds` and `rollbackDomainServiceKitIds` both include the failed collision kit.
- Confirmed/design gap: direct DSK install only rejects missing `n:` tokens. Probe result: a DSK requiring `runtime:missing` installed with `missingNonNError: null`.
- Candidate: `constructor` and `prototype` are accepted identifier-like `apiName` values and should be explicitly reviewed even if they do not behave exactly like `__proto__`.

## Missing tests
- Reserved `apiName` handling for `__proto__`, `constructor`, and `prototype`.
- Own-property assertions for `engine.n` APIs.
- Failed-install rollback across `engine.domainServiceKits`, `engine.kits`, `engine.kitBindings`, scheduler systems, world init state, registry writes, and namespace APIs.
- Direct install parity for non-`n:` `requires` tokens, or a test that documents composer as the required dependency-ordering path.
- End-to-end `extendDomainServiceKit()` install behavior.
- Duplicate provide-token behavior across different DSK ids.
- Reset/snapshot absence and failure cases.
- Async metadata override behavior, with tests stating it is metadata-only today.

## Promotion risks
- Do not promote ProtoKits on this DSK surface until namespace safety and failed-install atomicity are hardened.
- Do not claim async DSK execution; only metadata exists.
- Do not claim npm package availability; optional npm registry metadata still returns 404.
- Do not assume direct engine install and composer enforce the same dependency contract.
- Do not scale DSK count aggressively without deciding provider indexing and namespace discoverability.

## Suggested next review item
- Review the smallest hardening design for DSK install preflight/rollback and `engine.n` namespace safety, then identify the exact tests that would lock the decision before implementation.

## Not claimed
- This packet does not fix bugs.
- This packet does not promote ProtoKits.
- This packet does not edit runtime code, tests, docs, package metadata, repo memory, or public claims.
- This packet does not prove browser UX or Playwright-visible behavior; DSK is a source/test architecture surface.
- This packet does not prove npm publication.
