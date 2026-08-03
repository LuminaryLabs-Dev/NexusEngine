# occupant-request-adapter-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `adapter-kit`
- Domain: `n:interaction:request:queue`
- Import: `nexusengine/domains/interaction/adapters/occupant-request`
- Factory: `createOccupantRequestAdapterKit`
- Registry version: `0.0.4`

## Responsibility

Translate Occupant Flow need records into exact-once Request Queue entries.

## Contract

- Requires: `interaction:request-queue`, `operations:occupant-flow`
- Provides: `interaction:occupant-request-adapter`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Optional cross-domain integration only. Both source capabilities remain independently usable.
