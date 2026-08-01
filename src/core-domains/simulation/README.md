# Simulation Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:simulation`
- Status: `stable-candidate`
- Registry SHA-256: `fb253d7c33d1b271857591e21f6eaca1f32e470385d6080a131813261c767cc8`
- Public entry: `nexusengine/domains/simulation`

## Responsibility

Own deterministic simulation objectives, resources, hazards, pressure, checkpoints, timers, and resolution contracts.

## Owns

- hazards
- objectives
- resolution receipts
- resources
- simulation state
- timers

## Does Not Own

- game balance presets
- input
- physical backend
- rendering

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:simulation:physics` | Own backend-neutral physical bodies, colliders, contacts, constraints, queries, and provider contracts. |
| `n:simulation:physics:articulated` | Own articulated body topology, joint dynamics inputs, and backend-neutral articulation state. |
| `n:simulation:motion` | Own intent-to-motion descriptors, movement modes, trajectories, velocity state, movement policies, and deterministic pose solving. |
| `n:simulation:motion:articulated` | Own target poses, joint limits, articulation motion plans, and drive requests. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `simulation-state-kit` | `nexusengine/domains/simulation/runtime` | Manage deterministic simulation objectives, resources, hazards, timers, and resolution receipts. |
| `physics-contract-kit` | `nexusengine/domains/simulation/physics` | Describe physical bodies, colliders, contacts, constraints, queries, and provider boundaries. |
| `articulated-physics-kit` | `nexusengine/domains/simulation/physics/articulated` | Manage backend-neutral articulated body topology and joint dynamics state. |
| `motion-contract-kit` | `nexusengine/domains/simulation/motion` | Manage intent-to-motion descriptors, trajectories, velocity state, and movement policies. |
| `two-bone-ik-kit` | `nexusengine/domains/simulation/motion/two-bone-ik` | Solve deterministic two-bone inverse-kinematics poses. |
| `articulated-motion-kit` | `nexusengine/domains/simulation/motion/articulated` | Create target poses, joint limits, articulation plans, and drive requests. |
| `articulated-motion-drive-adapter-kit` | `nexusengine/domains/simulation/adapters/articulated-drive` | Translate articulated motion plans into backend-neutral physics drive requests. |

## Lifecycle

- Duplicate install: Return the installed Simulation API without duplicate state or systems.
- Snapshot: Serialize Simulation state and descriptors.
- Reset: Restore the configured Simulation baseline.
