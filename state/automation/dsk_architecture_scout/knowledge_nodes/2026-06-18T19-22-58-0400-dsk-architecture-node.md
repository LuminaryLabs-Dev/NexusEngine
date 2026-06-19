# Knowledge Nodes: DSK Architecture Scout 2026-06-18T19:22:58-04:00

## Root Lesson
- id: dsk-architecture-root-2026-06-18
- statement: DSK is structurally present and smoke-tested, but production viability depends on namespace hardening and install atomicity before promotion.
- why it matters: DSK is intended as the promoted reusable-domain contract, so failed installs and unsafe API keys can corrupt long-lived engines even when smoke tests pass.

## Child Nodes
- id: dsk-namespace-safety
  parent: dsk-architecture-root-2026-06-18
  lesson: `engine.n.<apiName>` is the right DSK boundary, but custom `apiName` values need reserved-key protection.
  evidence: `src/domain-service-kit.js` validates identifier syntax and writes `engine.n[apiName]`; current tests cover normal collision but not reserved keys.
  look further: Add a focused review/test for `__proto__`, `prototype`, and `constructor`.
- id: dsk-install-atomicity
  parent: dsk-architecture-root-2026-06-18
  lesson: DSK install failure can happen after engine state is already mutated.
  evidence: `src/runtime-kit.js` records `engine.domainServiceKits`, pushes the kit, then runs `kit.install()`; namespace collision throws inside DSK install.
  look further: Inspect rollback or preflight validation options before broad production use.
- id: dsk-dependency-parity
  parent: dsk-architecture-root-2026-06-18
  lesson: Composer dependency resolution and direct engine install dependency checks have different coverage.
  evidence: `createGameKitComposer()` resolves all tokens; `installRuntimeKit()` checks missing dependencies only for DSK `n:` tokens.
  look further: Decide whether direct engine install should reject all missing `requires` or document composer as required for dependency ordering.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/packets/2026-06-18T19-22-58-0400-dsk-architecture-state-packet.md`
- relationship: source packet
- reason: Captures the inspected files, commands, branch comparison, risks, and missing tests for this node.

## Next Search Branches
- branch: DSK install hardening
- files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `tests/domain-service-kit-smoke.mjs`
- question: Can DSK install validate namespace and dependencies before mutating a live engine?
- branch: DSK dependency scale
- files or folders: `src/game-kit-composer.js`, `src/runtime-kit.js`
- question: Should provider lookup become indexed before DSK count grows?
- branch: DSK serialization contract
- files or folders: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`
- question: Should reset/snapshot expectations be enforced, introspected, or remain documented metadata?

## Not Claimed
- This node does not fix DSK bugs.
- This node does not prove ProtoKits readiness.
- This node does not prove async execution support.
