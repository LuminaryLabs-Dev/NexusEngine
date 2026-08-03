# third-person-camera-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:presentation:camera:third-person`
- Import: `nexusengine/domains/presentation/camera/third-person`
- Factory: `createThirdPersonCameraKit`
- Registry version: `0.0.4`

## Responsibility

Produce deterministic renderer-neutral third-person camera descriptors from public Character and Motion bindings.

## Contract

- Requires: `character:resolution`, `motion:velocity`, `n:presentation:camera`
- Provides: `camera:third-person-descriptor`, `n:presentation:camera:third-person`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/character-camera-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
