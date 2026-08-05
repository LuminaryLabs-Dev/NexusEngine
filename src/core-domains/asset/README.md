# Asset Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:asset`
- Status: `stable-candidate`
- Registry SHA-256: `740e0916c8017e4e2a91be79c7b02359c4fa1186d7174a52d6311ec8563cb3af`
- Public entry: `nexusengine/domains/asset`

## Responsibility

Own asset identity, manifests, bundles, content-addressed jobs, readiness, and provider contracts.

## Owns

- asset bundles
- asset dependency graphs
- asset descriptors
- asset manifests
- content-addressed receipts

## Does Not Own

- browser cache implementation
- filesystem access
- network fetching
- renderer resource creation

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `asset-registry-kit` | `nexusengine/domains/asset/registry` | Resolve asset manifests and bundles through content-addressed provider jobs. |

## Lifecycle

- Duplicate install: Return the installed Asset API without duplicate state or systems.
- Snapshot: Serialize Asset state and descriptors.
- Reset: Restore the configured Asset baseline.
