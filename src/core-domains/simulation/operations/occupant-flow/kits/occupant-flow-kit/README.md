# occupant-flow-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:simulation:operations:occupant-flow`
- Import: `nexusengine/domains/simulation/operations/occupant-flow`
- Factory: `createOccupantFlowKit`
- Registry version: `0.0.4`

## Responsibility

Own deterministic occupant spawning, patience, service, and abandonment state.

## Contract

- Requires: `n:simulation`
- Provides: `n:simulation:operations:occupant-flow`, `operations:occupant-flow`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/occupant-flow-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
