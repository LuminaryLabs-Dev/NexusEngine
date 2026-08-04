# Network Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:network`
- Status: `stable-candidate`
- Registry SHA-256: `ad617b439ff651d79352fa7d11f37bc687e36aaae1d1550bc7ffef042c0b776f`
- Public entry: `nexusengine/domains/network`

## Responsibility

Own session, peer, message, synchronization, authority, latency, reconnect, and collaboration contracts.

## Owns

- authority contracts
- message envelopes
- peer descriptors
- session descriptors
- sync contracts

## Does Not Own

- HTTP transport
- matchmaking service
- platform authentication
- socket implementation

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `network-contract-kit` | `nexusengine/domains/network/contracts` | Describe network sessions, messages, authority, and synchronization without owning transport. |

## Lifecycle

- Duplicate install: Return the installed Network API without duplicate state or systems.
- Snapshot: Serialize Network state and descriptors.
- Reset: Restore the configured Network baseline.
