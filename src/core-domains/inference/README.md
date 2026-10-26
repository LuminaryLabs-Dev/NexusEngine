# Inference Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:inference`
- Status: `stable-candidate`
- Registry SHA-256: `c31d7b0cb162415ad77c669691d5683eed98cb582aa599bf6cb1e7ba505ad185`
- Public entry: `nexusengine/domains/inference`

## Responsibility

Own model inference requests and results independently of compute resources.

## Owns

- inference model requirements
- inference requests
- inference results

## Does Not Own

- GPU scheduling
- agent decisions
- network transport

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:inference:provider` | Own provider identities, serving instances, capacity admission and selection. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `inference-contract-kit` | `nexusengine/domains/inference/contract` | Validate neutral inference request and result envelopes. |
| `inference-provider-pool-kit` | `nexusengine/domains/inference/provider` | Register inference endpoints and reserve bounded instance capacity. |

## Lifecycle

- Duplicate install: Return the installed Inference API without duplicate state or systems.
- Snapshot: Serialize Inference state and descriptors.
- Reset: Restore the configured Inference baseline.
