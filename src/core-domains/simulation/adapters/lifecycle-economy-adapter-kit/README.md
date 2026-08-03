# lifecycle-economy-adapter-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `adapter-kit`
- Domain: `n:simulation:progression:lifecycle`
- Import: `nexusengine/domains/simulation/adapters/lifecycle-economy`
- Factory: `createLifecycleEconomyAdapterKit`
- Registry version: `0.0.4`

## Responsibility

Translate accepted Lifecycle costs and Economy effects into exact-once Economy transactions.

## Contract

- Requires: `economy:transaction`, `progression:lifecycle`
- Provides: `progression:lifecycle-economy-adapter`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Optional cross-domain integration only. Both source capabilities remain independently usable.
