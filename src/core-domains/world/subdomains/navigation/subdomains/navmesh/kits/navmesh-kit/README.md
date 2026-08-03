# navmesh-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:world:navigation:navmesh`
- Import: `nexusengine/domains/world/navigation/navmesh`
- Factory: `createNavMeshKit`
- Registry version: `0.0.4`

## Responsibility

Build deterministic 2D navigation meshes and portable 3D waypoint graphs from walkability.

## Contract

- Requires: `navigation:walkability-source`
- Provides: `n:world:navigation:navmesh`, `navigation:graph`, `navigation:navmesh`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/navmesh-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
