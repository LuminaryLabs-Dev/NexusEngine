# Network Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:network`
- Status: `stable-candidate`
- Registry SHA-256: `d2b8af8d1d542bdb125d33b8a4ff5a32de1cf73da399e57e9a29b5ae35d4a8f5`
- Public entry: `nexusengine/domains/network`

## Responsibility

Own portable transport, session, authority, synchronization, and replication contracts.

## Owns

- authority contracts
- replication envelopes
- session descriptors
- tick synchronization
- transport contracts

## Does Not Own

- matchmaking service
- platform authentication
- socket implementation
- vendor SDK

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:network:transport` | Own provider-neutral transport capabilities and portable message channels. |
| `n:network:multiplayer` | Own the portable multiplayer protocol boundary and deterministic inbound queue contract. |
| `n:network:multiplayer:session` | Own match identity, peer readiness, and connection phases. |
| `n:network:multiplayer:authority` | Own host and client roles plus state ownership declarations. |
| `n:network:multiplayer:tick-sync` | Own deterministic RTT, clock-offset, drift, and remote-tick mapping records. |
| `n:network:multiplayer:replication` | Own sequence numbers, acknowledgements, input frames, and snapshot envelopes. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `network-contract-kit` | `nexusengine/domains/network/contracts` | Describe portable network messages and synchronization without implementing transport. |
| `network-transport-contract-kit` | `nexusengine/domains/network/transport` | Validate provider-neutral transport capabilities and portable channel messages. |
| `multiplayer-contract-kit` | `nexusengine/domains/network/multiplayer` | Own the protocol version and deterministic inbound queue contract. |
| `multiplayer-session-kit` | `nexusengine/domains/network/multiplayer/session` | Manage portable session phases, peer readiness, and disconnect state. |
| `multiplayer-authority-kit` | `nexusengine/domains/network/multiplayer/authority` | Enforce one authoritative host and portable state ownership declarations. |
| `multiplayer-tick-sync-kit` | `nexusengine/domains/network/multiplayer/tick-sync` | Map explicit remote timing samples onto deterministic local ticks. |
| `multiplayer-replication-kit` | `nexusengine/domains/network/multiplayer/replication` | Create sequence-numbered input and snapshot envelopes and reject stale packets. |

## Lifecycle

- Duplicate install: Return the installed Network API without duplicate state or systems.
- Snapshot: Serialize Network state and descriptors.
- Reset: Restore the configured Network baseline.
