# hazard-field-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:simulation:hazard-field`
- Import: `nexusengine/domains/simulation/hazard-field`
- Factory: `createHazardFieldKit`
- Registry version: `0.0.4`

## Responsibility

Own deterministic bounded hazards, verified spawn identities, motion, and read-only collision queries.

## Contract

- Requires: `n:simulation`
- Provides: `n:simulation:hazard-field`, `simulation:hazard-field`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/hazard-field-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
