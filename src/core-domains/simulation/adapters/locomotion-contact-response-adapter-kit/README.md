# locomotion-contact-response-adapter-kit

This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.

- Kind: `adapter-kit`
- Domain: `n:simulation:motion:locomotion`
- Import: `nexusengine/domains/simulation/adapters/locomotion-contact-response`
- Factory: `createLocomotionContactResponseAdapterKit`
- Registry version: `0.0.4`

## Responsibility

Translate Locomotion frames and World Contact results into corrected Motion frames without owning either state.

## Contract

- Requires: `motion:locomotion-intent`, `physics:world-contact`
- Provides: `motion:contact-response`
- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.
- State: JSON-portable snapshot/load/reset contract.

## Restoration

Optional cross-domain integration only. Both source capabilities remain independently usable.
