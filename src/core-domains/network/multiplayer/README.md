# Multiplayer Domain

`n:network:multiplayer` defines portable multiplayer truth without owning a transport SDK or game rules.

Incoming provider callbacks must enqueue portable messages. The next deterministic engine tick drains that queue, validates sequences, applies game simulation through a consumer adapter, and only then emits outgoing commands.

## Boundaries

- `session` owns connection phases and peer readiness, not game rounds.
- `authority` owns host/client roles and state ownership, not damage or winners.
- `tick-sync` maps explicit timing samples to ticks and never reads a wall clock.
- `replication` owns input/snapshot envelopes, acknowledgements, and stale-packet rejection, not state decisions.
- `transport` is the provider contract. PeerJS, WebSocket, WebTransport, and service-hosted implementations live outside Core.

All state is JSON-portable and supports deterministic snapshot, reset, and replay through its atomic Domain Kit.
