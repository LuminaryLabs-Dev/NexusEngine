# lifecycle-progression-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:simulation:progression:lifecycle`
- Import: `nexusengine/domains/simulation/progression/lifecycle`
- Factory: `createLifecycleProgressionKit`
- Registry version: `0.0.4`

## Responsibility

Own prerequisite-gated lifecycle start, timing, completion, and portable effect descriptors.

## Contract

- Requires: `n:simulation`
- Provides: `n:simulation:progression:lifecycle`, `progression:lifecycle`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/lifecycle-progression-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
