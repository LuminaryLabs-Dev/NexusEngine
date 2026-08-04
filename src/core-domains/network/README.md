# Network Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:network`
- Status: `stable-candidate`
- Registry SHA-256: `0fe0ffcc730675224e5a487231520ffec4f07153e8665fe18ccef21743adb9aa`
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
