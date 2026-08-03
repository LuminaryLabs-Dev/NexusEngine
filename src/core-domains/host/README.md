# Host Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:host`
- Status: `stable-candidate`
- Registry SHA-256: `267ff7b50e8011b2f1f21f506e20a10f5d5a68a1bd8c63c51cf1221b9432a807`
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
