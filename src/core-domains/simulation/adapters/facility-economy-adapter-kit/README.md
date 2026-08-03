# facility-economy-adapter-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `adapter-kit`
- Domain: `n:simulation:operations:facility`
- Import: `nexusengine/domains/simulation/adapters/facility-economy`
- Factory: `createFacilityEconomyAdapterKit`
- Registry version: `0.0.4`

## Responsibility

Translate Facility output and upkeep receipts into exact-once Economy transactions.

## Contract

- Requires: `economy:transaction`, `operations:facility`
- Provides: `operations:facility-economy-adapter`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Optional cross-domain integration only. Both source capabilities remain independently usable.
