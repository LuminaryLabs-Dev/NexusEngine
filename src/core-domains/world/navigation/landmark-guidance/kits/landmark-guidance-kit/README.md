# landmark-guidance-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:world:navigation:landmark-guidance`
- Import: `nexusengine/domains/world/navigation/landmark-guidance`
- Factory: `createLandmarkGuidanceKit`
- Registry version: `0.0.4`

## Responsibility

Manage deterministic landmark discovery, reach, completion, priority, and proximity state.

## Contract

- Requires: `n:world`
- Provides: `n:world:navigation:landmark-guidance`, `navigation:landmark-guidance`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/landmark-guidance-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
