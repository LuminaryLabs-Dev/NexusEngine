# vehicle-dynamics-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:simulation:motion:vehicle`
- Import: `nexusengine/domains/simulation/motion/vehicle`
- Factory: `createVehicleDynamicsKit`
- Registry version: `0.0.4`

## Responsibility

Advance deterministic vehicle motion, boost, bounds, and impact state without owning surface policy.

## Contract

- Requires: `n:simulation:motion`
- Provides: `motion:vehicle-dynamics`, `n:simulation:motion:vehicle`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/vehicle-dynamics-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
