# 005: Example, Peer Mesh Kit Ecosystem

This is an example of how peer, routing, ONNX, live-server, and tunnel-related work could be described as a future domain-kit ecosystem.

It is not a request to change NexusRealtime runtime behavior.

It is an authoring and organization example.

## Example repo shape

```txt
NexusPeerMeshManager/
├── PeerMeshManager-NextApp/
├── PeerMeshManager-Core/
│
├── kits/
│   ├── peer-fabric/
│   │   └── kits/
│   │       ├── room-model/
│   │       ├── presence-lease/
│   │       ├── packet-envelope/
│   │       ├── host-election/
│   │       └── room-ledger/
│   │
│   ├── hostlayer-routing/
│   │   └── kits/
│   │       ├── route-table/
│   │       ├── route-validator/
│   │       ├── direct-link-negotiator/
│   │       └── fallback-ladder/
│   │
│   ├── secure-onnx-agent/
│   │   └── kits/
│   │       ├── model-manifest/
│   │       ├── startup-model-loader/
│   │       ├── job-queue/
│   │       ├── result-validator/
│   │       └── fake-runtime/
│   │
│   ├── live-mesh-server/
│   └── cloudflare-tunnel-runner/
```

## Public domain kits

```txt
peer-fabric:
  room membership, presence leases, packet envelopes, host election, room ledgers

hostlayer-routing:
  room-to-room route summaries, route tables, direct-link negotiation, fallback ladders

secure-onnx-agent:
  model manifests, startup model loading, job queues, result validation, fake runtimes for tests

live-mesh-server:
  local HTTP/WebSocket mirror and catch-up layer

cloudflare-tunnel-runner:
  infrastructure runner that exposes a local live server through a tunnel when needed
```

## Boundary rule

Infrastructure orchestration should stay separate from domain logic.

For example:

```txt
secure-onnx-agent should not spawn tunnels.
peer-fabric should not own cloudflared.
live-mesh-server should not own model validation.
cloudflare-tunnel-runner should only manage tunnel exposure and runtime URL publishing.
```

## Why this matters

This keeps each domain understandable.

It also lets another ingress method replace Cloudflare later without touching the ONNX, peer, or routing kits.
