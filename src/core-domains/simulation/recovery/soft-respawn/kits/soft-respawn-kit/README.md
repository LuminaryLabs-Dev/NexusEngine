# soft-respawn-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:simulation:recovery:soft-respawn`
- Import: `nexusengine/domains/simulation/recovery/soft-respawn`
- Factory: `createSoftRespawnKit`
- Registry version: `0.0.4`

## Responsibility

Produce exact-once coherent subject recovery records at configured portable points.

## Contract

- Requires: `n:simulation`
- Provides: `n:simulation:recovery:soft-respawn`, `simulation:soft-respawn`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/world-physics-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
