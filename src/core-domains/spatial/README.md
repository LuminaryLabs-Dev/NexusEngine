# Spatial Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:spatial`
- Status: `stable-candidate`
- Registry SHA-256: `8d65c7d6589811bdb9a56b80021095b16c1b8ce91bac4b488698132179c7f359`
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

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `spatial-contract-kit` | `nexusengine/domains/spatial/contracts` | Describe transforms, bounds, zones, spaces, and spatial query requests. |
| `spatial-angle-math-kit` | `nexusengine/domains/spatial/angle-math` | Normalize, compare, and interpolate angular values. |
| `spatial-vector-math-kit` | `nexusengine/domains/spatial/vector-math` | Create and operate on renderer-neutral vector values. |
| `spatial-transform-math-kit` | `nexusengine/domains/spatial/transform-math` | Calculate deterministic transforms, bases, interpolation, and planar projections. |
| `spatial-quaternion-math-kit` | `nexusengine/domains/spatial/quaternion-math` | Create, compose, normalize, rotate, and interpolate quaternions. |

## Lifecycle

- Duplicate install: Return the installed Spatial API without duplicate state or systems.
- Snapshot: Serialize Spatial state and descriptors.
- Reset: Restore the configured Spatial baseline.
