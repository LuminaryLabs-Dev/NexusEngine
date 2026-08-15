# Compute Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:compute`
- Status: `stable-candidate`
- Registry SHA-256: `a5e0ac2156e86da208c6525d7c611d0245d7d1a57f5e5f186fbe83bac2f04e82`
- Public entry: `nexusengine/domains/compute`

## Responsibility

Own parallel compute descriptors, dependency graphs, dispatch plans, and provider contracts.

## Owns

- compute descriptors
- compute graphs
- dispatch plans
- provider contracts

## Does Not Own

- GPU implementation
- model runtime
- renderer passes
- worker pool implementation

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:compute:model` | Own model descriptors, registries, inference requests/results, and model provider contracts. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `compute-graph-kit` | `nexusengine/domains/compute/graph` | Validate compute descriptors and create deterministic dependency-ordered dispatch plans. |
| `model-registry-kit` | `nexusengine/domains/compute/model` | Register model descriptors and normalize provider-neutral inference requests and results. |

## Lifecycle

- Duplicate install: Return the installed Compute API without duplicate state or systems.
- Snapshot: Serialize Compute state and descriptors.
- Reset: Restore the configured Compute baseline.
