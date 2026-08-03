# vehicle-water-response-adapter-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `adapter-kit`
- Domain: `n:simulation:motion:vehicle`
- Import: `nexusengine/domains/simulation/adapters/vehicle-water-response`
- Factory: `createVehicleWaterResponseAdapterKit`
- Registry version: `0.0.4`

## Responsibility

Translate Vehicle state and Water Surface queries into portable drag, current, and buoyancy responses.

## Contract

- Requires: `motion:vehicle-dynamics`, `world:water-query`
- Provides: `motion:vehicle-water-response`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Optional cross-domain integration only. Both source capabilities remain independently usable.
