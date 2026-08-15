# cargo-manifest-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:simulation:economy:cargo`
- Import: `nexusengine/domains/simulation/economy/cargo`
- Factory: `createCargoManifestKit`
- Registry version: `0.0.4`

## Responsibility

Own portable cargo inventory, capacity, condition, pickup, deposit, and quota state.

## Contract

- Requires: `n:simulation`
- Provides: `economy:cargo-manifest`, `n:simulation:economy:cargo`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/cargo-manifest-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
