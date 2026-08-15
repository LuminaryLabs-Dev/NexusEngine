# economy-account-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `domain-service-kit`
- Domain: `n:simulation:economy:accounts`
- Import: `nexusengine/domains/simulation/economy/accounts`
- Factory: `createEconomyAccountKit`
- Registry version: `0.0.4`

## Responsibility

Own finite account balances and exact-once portable economy transaction records.

## Contract

- Requires: `n:simulation`, `transaction:idempotency`
- Provides: `economy:accounts`, `economy:transaction`, `n:simulation:economy:accounts`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Restores behavior from `src/economy-kit.js` at `a9adca5b3620f996f00860358c4864dd4bdfa6d9`; see `docs/migrations/0.0.4-restored-behaviors.md`.
