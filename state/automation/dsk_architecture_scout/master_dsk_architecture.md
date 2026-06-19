# Master DSK Architecture Tracker

## Current Root Lessons
- id: dsk-install-hardening-root-2026-06-18
- status: active
- latest packet: `state/automation/dsk_architecture_scout/packets/2026-06-18T20-25-55-0400-dsk-architecture-state-packet.md`
- latest node: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T20-25-55-0400-dsk-architecture-node.md`
- summary: DSK's public RuntimeKit boundary is coherent and tests pass, but production promotion is blocked by reserved API keys, non-atomic failed installs, and direct-install dependency parity.
- id: dsk-architecture-root-2026-06-18
- status: superseded-by-confirmed-hardening-root
- latest packet: `state/automation/dsk_architecture_scout/packets/2026-06-18T19-22-58-0400-dsk-architecture-state-packet.md`
- latest node: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T19-22-58-0400-dsk-architecture-node.md`
- summary: DSK is present, exported, documented, and smoke-tested, but install atomicity and namespace hardening are the next production-viability gates.

## Branch Tree
- parent: dsk-install-hardening-root-2026-06-18
- child: dsk-reserved-api-name
- relationship: engine API namespace hardening
- look further: Reject or safely handle `__proto__`, `prototype`, `constructor`, and inherited-key behavior in `engine.n`.
- parent: dsk-install-hardening-root-2026-06-18
- child: dsk-install-rollback
- relationship: failed install atomicity
- look further: Validate DSK collision/dependency state before mutating `engine.domainServiceKits`, `engine.kits`, bindings, world state, scheduler state, or namespace APIs.
- parent: dsk-install-hardening-root-2026-06-18
- child: dsk-direct-dependency-parity
- relationship: composer vs direct engine install behavior
- look further: Decide whether direct install should reject all missing `requires` tokens or document composer as mandatory for ordered dependency resolution.
- parent: dsk-install-hardening-root-2026-06-18
- child: dsk-scale-indexing
- relationship: provider lookup and kit-count scaling
- look further: Consider indexed providers if promoted DSK count grows beyond smoke/demo scale.
- parent: dsk-architecture-root-2026-06-18
- child: dsk-namespace-safety
- relationship: engine API namespace hardening
- look further: Reject or safely handle reserved `engine.n` API names before promotion.
- parent: dsk-architecture-root-2026-06-18
- child: dsk-install-atomicity
- relationship: failed install rollback
- look further: Ensure failed DSK installs do not leave partial engine state.
- parent: dsk-architecture-root-2026-06-18
- child: dsk-dependency-parity
- relationship: composer vs direct engine install behavior
- look further: Decide whether all `requires` tokens should be enforced by direct install.

## Open Search Branches
- branch: DSK install hardening
- owner: automation
- priority: high
- next files: `src/domain-service-kit.js`, `src/runtime-kit.js`, `tests/domain-service-kit-smoke.mjs`
- branch: DSK dependency parity
- owner: automation
- priority: high
- next files: `src/game-kit-composer.js`, `src/runtime-kit.js`, `README.md`
- branch: DSK dependency scale
- owner: automation
- priority: medium
- next files: `src/game-kit-composer.js`, `src/runtime-kit.js`
- branch: DSK serialization contract
- owner: automation
- priority: medium
- next files: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`

## Resolved Or Superseded
- id: dsk-architecture-root-2026-06-18
- reason: Superseded by a follow-up run that confirmed the named hardening risks with source inspection and ad hoc runtime probes.
- evidence: `state/automation/dsk_architecture_scout/packets/2026-06-18T20-25-55-0400-dsk-architecture-state-packet.md`
