# request-economy-adapter-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `adapter-kit`
- Domain: `n:interaction:request:queue`
- Import: `nexusengine/domains/interaction/adapters/request-economy`
- Factory: `createRequestEconomyAdapterKit`
- Registry version: `0.0.4`

## Responsibility

Translate fulfilled or expired Request Queue outcomes into exact-once Economy transactions.

## Contract

- Requires: `economy:transaction`, `interaction:request-queue`
- Provides: `interaction:request-economy-adapter`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Optional cross-domain integration only. Both source capabilities remain independently usable.
