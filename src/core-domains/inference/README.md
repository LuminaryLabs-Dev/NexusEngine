# Inference Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:inference`
- Status: `stable-candidate`
- Registry SHA-256: `a49b310d0bf31ffb0a1b52b532ed92490e94a7ada5a2110453d21cb8eb529c6f`
- Public entry: `nexusengine/domains/inference`

## Responsibility

Own canonical inference requests, execution, results and usage receipts.

## Owns

- inference execution
- inference requests
- inference results
- inference usage receipts

## Does Not Own

- GPU scheduling
- agent decisions
- network transport

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:inference:provider` | Own provider identities, deployments, instance admission, selection and failover. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `inference-contract-kit` | `nexusengine/domains/inference/contract` | Validate neutral inference request and result envelopes. |
| `inference-provider-pool-kit` | `nexusengine/domains/inference/provider` | Register inference endpoints and reserve bounded instance capacity. |

## Lifecycle

- Duplicate install: Return the installed Inference API without duplicate state or systems.
- Snapshot: Serialize Inference state and descriptors.
- Reset: Restore the configured Inference baseline.
