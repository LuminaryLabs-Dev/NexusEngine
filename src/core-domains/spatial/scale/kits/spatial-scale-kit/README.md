# spatial-scale-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:spatial:scale`
- Import: `nexusengine/domains/spatial/scale`
- Factory: `createSpatialScaleKit`
- Registry version: `0.0.4`

## Responsibility

Manage deterministic subject scale, scale anchors, proximity bands, and scale transitions.

## Contract

- Requires: `n:spatial`
- Provides: `n:spatial:scale`, `spatial:scale-anchor`, `spatial:scale-band`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/spatial-scale-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
