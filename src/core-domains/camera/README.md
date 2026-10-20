# Camera Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:camera`
- Status: `stable-candidate`
- Registry SHA-256: `d915cfbca15391703b688464816228a0cefe36ec9281c550c80d0ccaa5a90e47`
- Public entry: `nexusengine/domains/camera`

## Responsibility

Own camera targets, smoothing, framing, views, projections and portable camera execution records.

## Owns

- Own camera targets, smoothing, framing, views, projections and portable camera execution records.

## Does Not Own

- application presets
- provider handles
- renderer execution

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:camera:third-person` | Own renderer-neutral third-person camera follow descriptors. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `camera-descriptor-kit` | `nexusengine/domains/camera/control` | Manage camera targets, modes, smoothing, and renderer-neutral camera policy. |
| `camera-framing-kit` | `nexusengine/domains/camera/framing` | Calculate perspective and orthographic subject framing for a viewport. |
| `camera-control-math-kit` | `nexusengine/domains/camera/control-math` | Calculate camera-relative yaw, orbit limits, and root handoff state. |
| `third-person-camera-kit` | `nexusengine/domains/camera/third-person` | Produce deterministic renderer-neutral third-person camera descriptors from public Character and Motion bindings. |
| `camera-world-occlusion-adapter-kit` | `nexusengine/domains/camera/adapters/camera-world-occlusion` | Constrain Third-Person Camera descriptors with public terrain and physics query results without owning camera or world state. |
| `camera-binding-kit` | `nexusengine/domains/camera/execution/camera-binding` | Own portable camera binding semantics and deterministic state. |
| `camera-jitter-kit` | `nexusengine/domains/camera/execution/camera-jitter` | Own portable camera jitter semantics and deterministic state. |
| `camera-projection-kit` | `nexusengine/domains/camera/execution/camera-projection` | Own portable camera projection semantics and deterministic state. |
| `camera-reprojection-kit` | `nexusengine/domains/camera/execution/camera-reprojection` | Own portable camera reprojection semantics and deterministic state. |
| `camera-view-kit` | `nexusengine/domains/camera/execution/camera-view` | Own portable camera view semantics and deterministic state. |
| `camera-viewport-kit` | `nexusengine/domains/camera/execution/camera-viewport` | Own portable camera viewport semantics and deterministic state. |
| `multiview-camera-kit` | `nexusengine/domains/camera/execution/multiview-camera` | Own portable multiview camera semantics and deterministic state. |
| `stereo-camera-kit` | `nexusengine/domains/camera/execution/stereo-camera` | Own portable stereo camera semantics and deterministic state. |

## Lifecycle

- Duplicate install: Return the installed Camera API without duplicate state or systems.
- Snapshot: Serialize Camera state and descriptors.
- Reset: Restore the configured Camera baseline.
