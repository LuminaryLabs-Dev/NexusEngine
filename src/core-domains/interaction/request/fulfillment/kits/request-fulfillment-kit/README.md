# request-fulfillment-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:interaction:request:fulfillment`
- Import: `nexusengine/domains/interaction/request/fulfillment`
- Factory: `createRequestFulfillmentKit`
- Registry version: `0.0.4`

## Responsibility

Own spatial request destinations, deadlines, completion, expiry, and reward totals.

## Contract

- Requires: `n:interaction`
- Provides: `interaction:request-fulfillment`, `n:interaction:request:fulfillment`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/request-fulfillment-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
