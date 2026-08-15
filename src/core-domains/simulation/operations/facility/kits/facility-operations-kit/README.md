# facility-operations-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:simulation:operations:facility`
- Import: `nexusengine/domains/simulation/operations/facility`
- Factory: `createFacilityOperationsKit`
- Registry version: `0.0.4`

## Responsibility

Own deterministic facility capacity, condition, status, cycle, and portable output receipts.

## Contract

- Requires: `n:simulation`
- Provides: `n:simulation:operations:facility`, `operations:facility`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/facility-operations-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
