# DSK Architecture State Packet

Timestamp: 2026-06-18T20:25:55-04:00
Automation: nexusengine-dsk-architecture-state-packet

## Timestamp
- Local: 2026-06-18T20:25:55-04:00
- Preflight: 2026-06-19T00:24:18.421Z

## Latest branch
- Latest remote release branch: `0.0.2`
- Current branch: `0.0.2`
- Branch status: `current-is-latest-release-branch`
- Remote heads observed: `0.0.1`, `0.0.2`, `main`
- Comparison to `origin/0.0.2`: inspected source and test files match the latest release branch; local drift in the inspected set is limited to `README.md` and `memory.md` DSK/automation notes.

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
- `state/automation/dsk_architecture_scout/packets/2026-06-18T19-22-58-0400-dsk-architecture-state-packet.md`
- `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T19-22-58-0400-dsk-architecture-node.md`
- `state/automation/dsk_architecture_scout/master_dsk_architecture.md`
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
  - Result: branch `0.0.2...origin/0.0.2`; existing dirty/untracked `.agent`, `README.md`, `memory.md`, `package.json`, `scripts/`, and `state/` files observed before this run's lane writes.
- `git ls-remote --heads origin`
  - Result: remote heads include `0.0.1`, `0.0.2`, `main`; highest semver-like release branch is `0.0.2`.
- `npm run automation:preflight`
  - Result: required GitHub/raw/CDN public links passed; optional npm package metadata returned 404.
- `npm test`
  - Result: pass, 8 smoke tests.
- `git diff --stat origin/0.0.2 -- src/domain-service-kit.js src/runtime-kit.js src/game-kit-composer.js src/index.js tests/domain-service-kit-smoke.mjs tests/public-api-freeze.mjs tests/run-all.mjs README.md memory.md`
  - Result: only `README.md` and `memory.md` differ from `origin/0.0.2`.
- `node --input-type=module` ad hoc DSK probe
  - Result: reserved `apiName: "__proto__"` does not create an own `engine.n.__proto__` property and exposes the API through prototype behavior; failed duplicate API install leaves the failed kit in `engine.kits` and `engine.domainServiceKits`; direct install allows a DSK with missing non-`n:` requirement.

## DSK contract state
- `defineRuntimeKit()` remains the low-level installable kit primitive for components, resources, events, systems, bindings, shaders, materials, sequences, and install hooks.
- `defineDomainServiceKit()` is the promoted DSK wrapper with required `domain`, `stability`, and `version`, default stable id `n-<domain>-kit`, default `n:<domain>` provide token, optional service tokens, DSK metadata, and an `engine.n.<apiName>` install surface.
- `createDomainServiceToken()` normalizes domains/services into `n:` capability tokens.
- DSK metadata declares linear execution, async-readiness, serializable-state expectation, declared inputs/outputs, and reset/snapshot expectations.
- DSK execution still runs through normal `installRuntimeKit()` and scheduler phase order. Async-readiness is metadata only.
- `src/index.js` exports the DSK API surface and `tests/public-api-freeze.mjs` guards those exports.

## Invariant coverage
- Covered:
  - default `n-<domain>-kit` id
  - `n:` token creation and default/service provides
  - metadata kind, namespace, linear execution, and default async readiness
  - invalid domain/provides/version errors
  - extension duplicate resource/system rejection
  - missing `n:` dependency rejection in direct `createEngine({ kits })`
  - `engine.n.<api>` install for the normal camel-case domain path
  - simple snapshot JSON serialization
  - same-object duplicate install idempotence
  - same-id new-object duplicate rejection
  - normal API namespace collision rejection
  - public export presence
- Not covered:
  - reserved `apiName` keys
  - failed-install rollback
  - non-`n:` direct dependency enforcement
  - reset/snapshot API shape beyond one happy path
  - large kit-count dependency scaling
  - async metadata override behavior beyond defaults

## Scaling risks
- `createGameKitComposer()` repeatedly scans pending kits until dependencies resolve, which is simple but trends quadratically as promoted kit count grows.
- `installRuntimeKit()` rebuilds installed provides from `engine.kits` for each DSK install instead of maintaining an indexed provider set.
- `engine.n` is a flat namespace; large numbers of promoted domains increase collision, reserved-key, and discoverability risk.
- DSK execution remains linear; metadata does not yet create partition groups, dependency-indexed scheduling, or async-safe boundaries.
- Composer blocked-kit errors serialize the pending graph; with many kits this may become noisy without summarization.

## Bug candidates
- Confirmed: reserved `apiName` values such as `__proto__` pass identifier validation. Installing a DSK with `apiName: "__proto__"` does not create an own API property and can expose the API through object prototype behavior.
- Confirmed: failed DSK install is not atomic. When `engine.installKit()` throws on an `engine.n` API collision, the failed kit is already present in `engine.kits` and `engine.domainServiceKits`.
- Confirmed/design gap: direct `createEngine({ kits })` enforces missing dependencies only for `n:` tokens. A DSK requiring a missing non-`n:` token installs without error unless the caller used `createGameKitComposer()` first.
- Candidate: `engine.n` is initialized as a normal object, so prototype-bearing keys and inherited behavior remain in the API namespace unless explicitly blocked or the namespace is created with a null prototype.

## Missing tests
- Reject or safely handle reserved `apiName` values: `__proto__`, `prototype`, `constructor`.
- Assert failed DSK installs leave no added `engine.kits`, `engine.domainServiceKits`, `engine.kitBindings`, resources, systems, or `engine.n` entries.
- Assert direct install behavior for missing non-`n:` requirements, either rejection or documented composer-only dependency ordering.
- Assert `engine.n` owns installed API properties and does not expose DSK APIs through prototype mutation.
- Exercise `extendDomainServiceKit()` installation end to end, not only definition-time duplicate checks.
- Cover multiple DSKs providing the same `n:` service token under different ids.
- Cover reset/snapshot contract expectations with non-trivial state and API absence/failure cases.
- Cover async metadata overrides and make clear they remain metadata-only.

## Promotion risks
- Do not promote ProtoKits on this DSK contract yet. The normal-path smoke test passes, but the namespace and failed-install atomicity gaps are production blockers for long-lived engines.
- Do not claim async DSK execution; current support is metadata and linear scheduler execution.
- Do not claim npm package availability; optional npm metadata still returns 404.
- Do not claim public release docs include local `README.md`/`memory.md` DSK notes unless those changes are intentionally committed and released.
- Do not scale DSK count aggressively without deciding composer/direct-install dependency parity and provider indexing.

## Suggested next review item
- Review DSK install hardening: reserved `engine.n` keys, null-prototype namespace options, and rollback/preflight ordering in `src/domain-service-kit.js` and `src/runtime-kit.js`.

## Not claimed
- This packet does not fix bugs.
- This packet does not promote ProtoKits.
- This packet does not edit runtime code, tests, public docs, package metadata, repo memory, or public claims.
- This packet does not prove browser UX or Playwright-visible behavior; DSK is a source/test architecture surface.
- This packet does not prove npm publication.
