# terrain-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:world:terrain`
- Import: `nexusengine/domains/world/terrain`
- Factory: `createTerrainKit`
- Registry version: `0.0.4`

## Responsibility

Evaluate deterministic terrain layers and manage portable sampled terrain cells without rendering ownership.

## Contract

- Requires: `n:world`
- Provides: `n:world:terrain`, `world:terrain-provider`, `world:terrain-sampling`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/terrain-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
