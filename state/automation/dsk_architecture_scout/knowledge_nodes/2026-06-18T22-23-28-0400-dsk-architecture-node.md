# Knowledge Nodes: DSK Architecture Scout 2026-06-18T22-23-28-0400

## Root Lesson
- id: dsk-production-hardening-root-2026-06-18-2223
- statement: DSK remains release-aligned and test-green, but production viability is still gated by namespace safety, install atomicity, dependency policy, and enforceable state contracts.
- why it matters: The described domain and kit expansion docs imply many composed services; without these hardening rules, large DSK graphs can install partially, hide missing requirements, or expose unsafe `engine.n` APIs.

## Child Nodes
- id: dsk-namespace-reserved-key-gap-2026-06-18-2223
  parent: dsk-production-hardening-root-2026-06-18-2223
  lesson: Plain-object `engine.n` permits reserved API-name behavior such as `__proto__` prototype mutation instead of an own namespace slot.
  evidence: `src/domain-service-kit.js` creates `engine.n = {}` and assigns `engine.n[apiName]`; ad hoc probe reported `own:false` and `protoMarker:"proto-risk-api"`.
  look further: Reject reserved keys or create a null-prototype namespace with own-property validation.
- id: dsk-install-atomicity-gap-2026-06-18-2223
  parent: dsk-production-hardening-root-2026-06-18-2223
  lesson: DSK install mutates metadata, bindings, kits, world, scheduler, sequence runtimes, and API namespace in stages without rollback.
  evidence: `src/runtime-kit.js` registers `engine.domainServiceKits[kit.id]` before later install stages; collision probe leaves failed kit id in `engine.kits` and `engine.domainServiceKits`.
  look further: Add preflight checks before mutation or rollback around every mutable install stage.
- id: dsk-direct-dependency-policy-gap-2026-06-18-2223
  parent: dsk-production-hardening-root-2026-06-18-2223
  lesson: Composer enforces all `requires` tokens, while direct DSK install currently checks only missing `n:` tokens.
  evidence: `src/game-kit-composer.js` checks every `requires` token; `src/runtime-kit.js` filters missing DSK requirements with `token.startsWith("n:")`.
  look further: Decide whether direct install should enforce all requirements or document composer as mandatory for generic dependency resolution.
- id: dsk-state-contract-gap-2026-06-18-2223
  parent: dsk-production-hardening-root-2026-06-18-2223
  lesson: Reset, snapshot, serialization, and async readiness are metadata and examples, not enforced DSK interfaces.
  evidence: `src/domain-service-kit.js` defaults execution metadata for `snapshot`, `reset`, `serializableState`, and `asyncReady`; tests only serialize one smoke API snapshot manually.
  look further: Define minimal API/state-adapter requirements for promoted DSKs and add focused tests.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/packets/2026-06-18T21-21-57-0400-dsk-architecture-state-packet.md`
- relationship: reinforces
- reason: Prior run found the same production blockers; this run reconfirmed them against the same release-aligned checkout and the new expansion docs.

## Next Search Branches
- branch: DSK hardening design review
- files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `tests/domain-service-kit-smoke.mjs`
- question: What is the smallest implementation/test change that makes DSK install safe without changing public architecture?
- branch: DSK dependency graph scale review
- files or folders: `src/game-kit-composer.js`, `src/runtime-kit.js`, `docs/kits_ideas.md`
- question: When kit count grows, should provider lookup move from repeated scans to an indexed service registry?
- branch: DSK state contract review
- files or folders: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`, `docs/domain_ideas.md`
- question: Which reset/snapshot/serialization rules must be enforced before a DSK can be promoted?

## Not Claimed
- This node does not fix DSK bugs, promote ProtoKits, edit public docs, or prove production readiness.
