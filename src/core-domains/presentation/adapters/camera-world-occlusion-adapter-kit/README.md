# camera-world-occlusion-adapter-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `adapter-kit`
- Domain: `n:presentation:camera:third-person`
- Import: `nexusengine/domains/presentation/adapters/camera-world-occlusion`
- Factory: `createCameraWorldOcclusionAdapterKit`
- Registry version: `0.0.4`

## Responsibility

Constrain Third-Person Camera descriptors with public terrain and physics query results without owning camera or world state.

## Contract

- Requires: `camera:third-person-descriptor`, `physics:query`, `world:terrain-sampling`
- Provides: `camera:world-occlusion-response`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Optional cross-domain integration only. Both source capabilities remain independently usable.
