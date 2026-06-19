# Knowledge Nodes: DSK Architecture Scout 2026-06-18T21:21:57-04:00

## Root Lesson
- id: dsk-production-viability-root-2026-06-18-2121
- statement: DSK remains release-aligned and test-green, but production viability is still blocked by install atomicity, namespace safety, and dependency-contract parity.
- why it matters: DSK is the intended long-term promotion path for reusable domains, so partial installs or unsafe `engine.n` APIs can corrupt long-lived engines even when normal-path smoke tests pass.

## Child Nodes
- id: dsk-release-aligned-contract
  parent: dsk-production-viability-root-2026-06-18-2121
  lesson: Current checkout matches `origin/0.0.2` for the inspected DSK/source/test/docs set.
  evidence: `HEAD` and `origin/0.0.2` both resolve to `aba770f25e9ac0dcb5f440c3f79ae7140f0a8c0a`; preflight resolved latest release branch as `0.0.2`.
  look further: Continue resolving latest remote branch per run before assuming `0.0.2` remains current.
- id: dsk-namespace-own-property-gap
  parent: dsk-production-viability-root-2026-06-18-2121
  lesson: `engine.n` needs reserved-key rejection or null-prototype own-property semantics before production promotion.
  evidence: An ad hoc probe installed `apiName: "__proto__"` with `reservedOwnProperty: false` and `reservedPrototypeApi: true`.
  look further: Inspect validation in `src/domain-service-kit.js` and namespace initialization in the wrapped install path.
- id: dsk-install-atomicity-gap
  parent: dsk-production-viability-root-2026-06-18-2121
  lesson: DSK install can throw after mutating engine registries.
  evidence: `src/runtime-kit.js` records DSK metadata and pushes the kit before `kit.install()`; a duplicate namespace probe left the failed kit in `engine.kits` and `engine.domainServiceKits`.
  look further: Review a preflight-first or rollback design around `installRuntimeKit()`.
- id: dsk-direct-requires-parity-gap
  parent: dsk-production-viability-root-2026-06-18-2121
  lesson: Direct engine installs and composer installs still enforce different dependency contracts.
  evidence: `createGameKitComposer()` checks all `requires`, while direct DSK install rejects only missing `n:` tokens; a DSK requiring `runtime:missing` installed directly.
  look further: Decide whether direct install rejects all missing requirements or docs/tests make composer mandatory for dependency ordering.
- id: dsk-async-and-serialization-contract-gap
  parent: dsk-production-viability-root-2026-06-18-2121
  lesson: Async-readiness, reset, snapshot, and serializable state remain metadata/convention, not enforced runtime contracts.
  evidence: `domain-service-kit.js` builds metadata for these fields, and smoke tests only cover one happy-path snapshot API.
  look further: Define whether enforcement belongs in DSK validation, adapters, or promotion checklist tests.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T20-25-55-0400-dsk-architecture-node.md`
- relationship: continuation
- reason: Previous node confirmed the same hardening branches; this run rechecked them against a release-aligned checkout and passing tests.
- source: `state/automation/dsk_architecture_scout/packets/2026-06-18T21-21-57-0400-dsk-architecture-state-packet.md`
- relationship: source packet
- reason: Captures latest branch, validation commands, source/test inspection, probes, and missing coverage.

## Next Search Branches
- branch: DSK hardening design review
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `tests/domain-service-kit-smoke.mjs`
  question: What is the smallest production-safe design for namespace preflight and failed-install rollback?
- branch: DSK dependency contract decision
  files or folders: `src/game-kit-composer.js`, `src/runtime-kit.js`, `README.md`
  question: Should all direct installs enforce all `requires`, or should composer be the explicit dependency-ordering boundary?
- branch: DSK state contract tests
  files or folders: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`
  question: Which reset/snapshot/serialization expectations must be enforced before ProtoKits rely on DSK as a stable bridge?

## Not Claimed
- This node does not fix DSK install hardening.
- This node does not promote ProtoKits.
- This node does not prove async DSK execution.
- This node does not prove npm package publication.
