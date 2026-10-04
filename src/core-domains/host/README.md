# Host Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:host`
- Status: `stable-candidate`
- Registry SHA-256: `538fdb5fada709cbf7f305e58401c6fd260738cc2642704352fa180021ce2738`
- Public entry: `nexusengine/domains/host`

## Responsibility

Own host capability descriptors, fallback contracts, and shared physical execution-environment ownership while keeping backend handles provider-private.

## Owns

- fallback selection contracts
- host capability descriptors
- host requirement contracts
- shared execution-environment identity

## Does Not Own

- application process lifecycle
- compute algorithms
- raw platform handles in portable state
- renderer implementation
- storage implementation

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:host:gpu` | Own the shared GPU environment, portable physical-resource identity, device lifecycle, cross-consumer readiness, and recovery used by Compute and Render. |
| `n:host:gpu:capability` | Own backend-neutral GPU features, limits, profiles, and compatibility requirements. |
| `n:host:gpu:device` | Own portable logical GPU device identity and the device lifecycle shared by GPU consumers. |
| `n:host:gpu:device:adapter` | Own portable adapter discovery and selection semantics. |
| `n:host:gpu:device:logical-device` | Own logical-device acquisition, identity, generation, and state. |
| `n:host:gpu:device:queue` | Own portable shared-queue submission ordering and completion receipts. |
| `n:host:gpu:device:lifecycle` | Own readiness, loss, release, and generation transitions for the shared logical GPU device. |
| `n:host:gpu:resource` | Own portable shared GPU-resource identity, usage, revision, residency, references, and lifetime. |
| `n:host:gpu:synchronization` | Own engine-level cross-consumer ownership, readiness, transitions, and completion state for shared GPU resources. |
| `n:host:gpu:recovery` | Own shared device-loss records, resource invalidation, and restoration coordination. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `host-capability-kit` | `nexusengine/domains/host/capabilities` | Describe available host capabilities and select declarative fallback modes. |

## Lifecycle

- Duplicate install: Return the installed Host API without duplicate state or systems.
- Snapshot: Serialize Host state and descriptors.
- Reset: Restore the configured Host baseline.
