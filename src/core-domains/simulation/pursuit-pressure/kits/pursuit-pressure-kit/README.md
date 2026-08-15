# pursuit-pressure-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:simulation:pursuit-pressure`
- Import: `nexusengine/domains/simulation/pursuit-pressure`
- Factory: `createPursuitPressureKit`
- Registry version: `0.0.4`

## Responsibility

Own coherent pursuit distance, warning bands, caught state, recovery, and transition history.

## Contract

- Requires: `n:simulation`
- Provides: `n:simulation:pursuit-pressure`, `simulation:pursuit-pressure`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/pursuit-pressure-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
