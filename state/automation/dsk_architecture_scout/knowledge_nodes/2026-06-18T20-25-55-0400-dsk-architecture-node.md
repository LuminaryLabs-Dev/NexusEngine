# Knowledge Nodes: DSK Architecture Scout 2026-06-18T20:25:55-04:00

## Root Lesson
- id: dsk-install-hardening-root-2026-06-18
- statement: DSK's public contract is coherent, but production viability is blocked by install hardening before broader promotion.
- why it matters: DSK is meant to be the reusable-domain promotion path, so failed installs, reserved namespace keys, and dependency parity gaps can corrupt or misrepresent long-lived engines even when normal smoke tests pass.

## Child Nodes
- id: dsk-reserved-api-name
  parent: dsk-install-hardening-root-2026-06-18
  lesson: `engine.n.<apiName>` needs reserved-key protection or a null-prototype namespace.
  evidence: An ad hoc probe showed `apiName: "__proto__"` passes validation, creates no own `engine.n.__proto__` property, and exposes the DSK API through prototype behavior.
  look further: Inspect `src/domain-service-kit.js` validation and namespace initialization around `engine.n`.
- id: dsk-install-rollback
  parent: dsk-install-hardening-root-2026-06-18
  lesson: DSK install can fail after engine state has already been mutated.
  evidence: `src/runtime-kit.js` writes `engine.domainServiceKits[kit.id]` and pushes into `engine.kits` before `kit.install()` can throw; a duplicate API probe left the failed kit recorded after the thrown collision.
  look further: Move DSK-specific preflight before mutation or add rollback around install stages.
- id: dsk-direct-dependency-parity
  parent: dsk-install-hardening-root-2026-06-18
  lesson: Direct engine installs and composer installs do not enforce the same dependency contract.
  evidence: `createGameKitComposer()` checks all `requires` tokens, while `installRuntimeKit()` rejects only missing `n:` tokens for DSKs; an ad hoc probe installed a DSK with a missing non-`n:` requirement.
  look further: Decide whether direct install should reject all missing requirements or clearly document composer as the dependency-ordering contract.
- id: dsk-scale-indexing
  parent: dsk-install-hardening-root-2026-06-18
  lesson: Current provider lookup is simple and likely fine for small counts but not optimized for many promoted DSKs.
  evidence: Composer scans pending kits repeatedly and direct install rebuilds installed provides from `engine.kits`.
  look further: Revisit provider indexing if DSK count grows beyond smoke/demo scale.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T19-22-58-0400-dsk-architecture-node.md`
- relationship: follow-up and confirmation
- reason: The prior node named namespace safety, install atomicity, and dependency parity as next review branches; this run confirmed each with direct source and ad hoc runtime probes.
- source: `state/automation/dsk_architecture_scout/packets/2026-06-18T20-25-55-0400-dsk-architecture-state-packet.md`
- relationship: source packet
- reason: Captures branch resolution, command evidence, inspected files, confirmed bug candidates, and missing tests.

## Next Search Branches
- branch: DSK install hardening
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `tests/domain-service-kit-smoke.mjs`
  question: Can DSK validate namespace, dependency, and collision state before mutating a live engine?
- branch: DSK dependency parity decision
  files or folders: `src/game-kit-composer.js`, `src/runtime-kit.js`, `README.md`
  question: Should direct engine install enforce all `requires`, or should public docs make composer mandatory for dependency ordering?
- branch: DSK reset/snapshot contract
  files or folders: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`
  question: Should reset/snapshot be enforced as API functions, metadata-only expectations, or adapter-level conventions?

## Not Claimed
- This node does not fix DSK install hardening.
- This node does not promote ProtoKits.
- This node does not prove async DSK execution.
- This node does not prove npm package publication.
