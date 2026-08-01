# Compute Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:compute`
- Status: `stable-candidate`
- Registry SHA-256: `fb253d7c33d1b271857591e21f6eaca1f32e470385d6080a131813261c767cc8`
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
