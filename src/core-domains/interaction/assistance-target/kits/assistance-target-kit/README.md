# assistance-target-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:interaction:assistance-target`
- Import: `nexusengine/domains/interaction/assistance-target`
- Factory: `createAssistanceTargetKit`
- Registry version: `0.0.4`

## Responsibility

Own assistance target urgency, attachment, terminal completion, loss, and deterministic selection.

## Contract

- Requires: `n:interaction`
- Provides: `interaction:assistance-target`, `n:interaction:assistance-target`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/assistance-target-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
