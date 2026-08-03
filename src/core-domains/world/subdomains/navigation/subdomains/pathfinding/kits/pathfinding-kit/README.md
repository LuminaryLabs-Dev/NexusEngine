# pathfinding-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:world:navigation:pathfinding`
- Import: `nexusengine/domains/world/navigation/pathfinding`
- Factory: `createPathfindingKit`
- Registry version: `0.0.4`

## Responsibility

Resolve deterministic A* path requests over portable grid and navigation graph adapters.

## Contract

- Requires: `navigation:navmesh`
- Provides: `n:world:navigation:pathfinding`, `navigation:astar`, `navigation:pathfinding`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/pathfinding-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
