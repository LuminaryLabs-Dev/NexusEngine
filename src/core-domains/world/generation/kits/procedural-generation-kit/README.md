# procedural-generation-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:world:generation`
- Import: `nexusengine/domains/world/generation`
- Factory: `createProceduralGenerationKit`
- Registry version: `0.0.4`

## Responsibility

Generate deterministic generic regions, connectors, points, graphs, and walkability from complete normalized configuration.

## Contract

- Requires: `n:world`
- Provides: `n:world:generation`, `navigation:walkability-source`, `world:procedural-generation`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/procedural-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
