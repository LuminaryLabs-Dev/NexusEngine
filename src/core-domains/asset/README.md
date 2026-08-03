# Asset Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:asset`
- Status: `stable-candidate`
- Registry SHA-256: `c8a8d2391cc647772b76ca4293cf2b89f7ba3976b122bdd545c6e9143a7ecb3b`
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
