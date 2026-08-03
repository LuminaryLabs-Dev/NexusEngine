# Host Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:host`
- Status: `stable-candidate`
- Registry SHA-256: `c8a8d2391cc647772b76ca4293cf2b89f7ba3976b122bdd545c6e9143a7ecb3b`
- Public entry: `nexusengine/domains/host`

## Responsibility

Own host capability descriptors and fallback contracts without platform implementation.

## Owns

- fallback selection contracts
- host capability descriptors
- host requirement contracts

## Does Not Own

- Node process lifecycle
- browser implementation
- native host implementation
- renderer implementation
- storage implementation

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `host-capability-kit` | `nexusengine/domains/host/capabilities` | Describe available host capabilities and select declarative fallback modes. |

## Lifecycle

- Duplicate install: Return the installed Host API without duplicate state or systems.
- Snapshot: Serialize Host state and descriptors.
- Reset: Restore the configured Host baseline.
