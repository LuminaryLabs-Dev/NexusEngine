# Spatial Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:spatial`
- Status: `stable-candidate`
- Registry SHA-256: `a5e0ac2156e86da208c6525d7c611d0245d7d1a57f5e5f186fbe83bac2f04e82`
- Public entry: `nexusengine/domains/spatial`

## Responsibility

Own renderer-neutral transforms, coordinate spaces, bounds, zones, distance queries, and deterministic spatial math.

## Owns

- bounds
- coordinate spaces
- distance queries
- spatial math
- transforms
- zones

## Does Not Own

- camera policy
- physics resolution
- renderer coordinates
- world generation

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:spatial:scale` | Own subject scale, scale anchors, proximity bands, and deterministic scale queries. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `spatial-contract-kit` | `nexusengine/domains/spatial/contracts` | Describe transforms, bounds, zones, spaces, and spatial query requests. |
| `spatial-angle-math-kit` | `nexusengine/domains/spatial/angle-math` | Normalize, compare, and interpolate angular values. |
| `spatial-vector-math-kit` | `nexusengine/domains/spatial/vector-math` | Create and operate on renderer-neutral vector values. |
| `spatial-transform-math-kit` | `nexusengine/domains/spatial/transform-math` | Calculate deterministic transforms, bases, interpolation, and planar projections. |
| `spatial-quaternion-math-kit` | `nexusengine/domains/spatial/quaternion-math` | Create, compose, normalize, rotate, and interpolate quaternions. |
| `spatial-scale-kit` | `nexusengine/domains/spatial/scale` | Manage deterministic subject scale, scale anchors, proximity bands, and scale transitions. |

## Lifecycle

- Duplicate install: Return the installed Spatial API without duplicate state or systems.
- Snapshot: Serialize Spatial state and descriptors.
- Reset: Restore the configured Spatial baseline.
