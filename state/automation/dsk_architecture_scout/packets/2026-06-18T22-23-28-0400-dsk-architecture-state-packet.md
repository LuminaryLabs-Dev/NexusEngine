# DSK Architecture State Packet

## Timestamp
- 2026-06-18T22-23-28-0400

## Latest branch
- Latest remote release branch: `0.0.2`
- Current branch: `0.0.2`
- `HEAD`: `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`
- `origin/0.0.2`: `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`
- Branch status: current checkout is on the latest release branch.
- Local state note: `git status --short --branch` shows existing dirty/untracked files. Targeted source/test files match `origin/0.0.2`; the DSK lane tracker already had local edits, and `docs/described_examples.md`, `docs/domain_ideas.md`, and `docs/kits_ideas.md` are untracked local docs inspected because this automation requested them.

## Files inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md` DSK section
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `state/automation/AUTOMATION_MANIFEST.md`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
- `src/domain-service-kit.js`
- `src/runtime-kit.js`
- `src/game-kit-composer.js`
- `src/index.js`
- `src/engine.js`
- `tests/domain-service-kit-smoke.mjs`
- `tests/public-api-freeze.mjs`
- `tests/run-all.mjs`

## Commands run
- `rg --files .agent`
- `git status --short --branch`
- `git ls-remote --heads origin`
- `git branch -r --list 'origin/*'`
- `git rev-parse HEAD origin/0.0.2`
- `git diff --stat origin/0.0.2 -- state/automation/dsk_architecture_scout src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md docs/described_examples.md docs/domain_ideas.md docs/kits_ideas.md`
- `npm run automation:preflight`
- `npm test`
- `node --input-type=module` ad hoc DSK probes for reserved API names, failed collision state, and non-`n:` direct requires.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable primitive; `defineDomainServiceKit()` wraps it with DSK metadata, `n:` tokens, default `n-<domain>-kit` ids, `engine.n.<apiName>` API install, stability/version requirements, and execution metadata.
- README and `memory.md` align on the intended split: DSK is the promoted reusable-domain contract; RuntimeKit remains the lower-level components/resources/events/systems/materials/shaders/surfaces/sequences layer.
- Public API export coverage is present in `src/index.js` and `tests/public-api-freeze.mjs`.
- Current implementation is still linear. Async readiness, snapshot, reset, and serializable-state expectations are metadata/documented expectations, not enforced lifecycle contracts.

## Invariant coverage
- Covered by smoke tests:
  - default id `n-scan-survey-kit`
  - default `n:<domain>` and service tokens
  - metadata kind/namespace/execution mode
  - invalid domain/provides/version cases
  - extension duplicate resource/system detection
  - missing `n:` dependency rejection on direct engine install
  - same-object duplicate install no-op
  - same-id DSK duplicate rejection
  - API collision throws
  - simple snapshot JSON serialization through an example API
- Not covered:
  - reserved `apiName` values such as `__proto__`, `constructor`, and `prototype`
  - failed-install rollback/atomicity after late-stage errors
  - non-`n:` dependency enforcement on direct install
  - duplicate binding/system/resource side effects after partial failures
  - automatic reset/snapshot interface shape validation
  - async-readiness invariants
  - large service graph performance or lookup indexing

## Domain and kit expansion architecture notes
- `docs/described_examples.md` frames DSK expansion around composed domains, not monolithic app kits. That matches the DSK goal if each domain has explicit ownership, service tokens, reset/snapshot semantics, and path boundaries.
- `docs/domain_ideas.md` has plausible DSK boundaries: world, terrain, boundary, water, object inspection, mobility, operations, objective, presentation, and replicated state. These are architecture candidates, not implementation claims.
- `docs/kits_ideas.md` implies a broad dependency graph where many kits require `n:world:space`, `n:terrain:data`, `n:scenario:driver`, or domain-specific services. This makes dependency enforcement and readable resolution errors production-critical before scaling kit count.
- Domain/service/path ownership is mostly documented as desired shape. The runtime does not yet enforce path ownership or prevent private-resource coupling between domains.

## Scaling risks
- Direct DSK install rebuilds `installedProvides` from `engine.kits.flatMap(...)` per DSK install. This is fine for smoke scale but grows linearly with kit count and token count.
- `createGameKitComposer()` resolves dependencies by scanning pending kits repeatedly, which can become quadratic as kit count grows.
- `engine.n` is a plain object, so namespace safety depends on property behavior and is exposed to prototype-key edge cases.
- A broad DSK library needs an indexed provider registry, duplicate provider diagnostics, path ownership checks, and clearer dependency failure reporting before large described-example graphs are promoted.
- Async readiness is metadata-only. Future worker/network partitioning will need deterministic snapshot/reset/restore boundaries plus side-effect isolation.

## Bug candidates
- Reserved namespace API key: a DSK with `apiName: "__proto__"` installs without an own `engine.n.__proto__` key and changes the prototype object. Probe output: `{"own":false,"protoMarker":"proto-risk-api","keys":[]}`.
- Failed API collision is non-atomic: installing a second DSK with a colliding `apiName` throws, but the failed kit remains in `engine.kits` and `engine.domainServiceKits`. Probe output: `{"kits":["n-alpha-risk-kit","n-beta-risk-kit"],"domainServiceKitIds":["n-alpha-risk-kit","n-beta-risk-kit"],"apiKeys":["sharedRisk"]}`.
- Direct DSK install ignores missing non-`n:` requirements. Probe output: `{"installedWithoutProvider":["n-generic-dependent-kit"],"providerUnused":"generic-provider"}`.
- Error readability is mixed: composer dependency errors include JSON blocked kits; direct DSK missing-token errors are concise for `n:` tokens, but partial-install failures do not explain that rollback did not happen.

## Missing tests
- Reject or safely handle reserved `apiName` values.
- Assert failed `engine.n` API collision does not mutate `engine.kits`, `engine.domainServiceKits`, bindings, world state, scheduler state, or namespace APIs.
- Decide and test whether direct DSK install must enforce all `requires` tokens or only `n:` tokens.
- Assert composer/direct-install dependency behavior parity or explicitly document their difference.
- Validate reset/snapshot API contract shape for promoted DSKs.
- Validate `serializableState`, `asyncReady`, inputs, and outputs metadata against actual exposed API or state adapter conventions.
- Add a multi-domain dependency graph fixture that exercises world/terrain/objective/service dependency ordering and failure readability.

## Promotion risks
- Do not promote ProtoKits or large domain ideas into core from the scout lane.
- DSK is public, documented, exported, and test-green, but still not production-hardened for broad third-party kit graphs.
- The current branch is release-aligned, but local untracked docs and automation artifacts mean this checkout contains more planning context than the remote release branch.
- Existing tests prove a happy-path DSK and selected validation errors; they do not prove atomic install, namespace safety, reset/snapshot enforcement, async readiness, or large dependency graph behavior.

## Suggested next review item
- Design the smallest DSK hardening/test plan before implementation:
  - namespace safety for `engine.n`
  - install preflight/rollback atomicity
  - direct-install dependency policy
  - reset/snapshot contract enforcement

## Not claimed
- No bugs were fixed.
- No runtime code, tests, docs, package metadata, repo memory, public claims, or ProtoKits were edited.
- Passing `npm test` does not prove browser behavior, async execution, worker/network readiness, npm publication, or production promotion readiness.
- This packet does not claim the untracked expansion docs are released public contract.
