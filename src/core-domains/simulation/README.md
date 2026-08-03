# Simulation Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:simulation`
- Status: `stable-candidate`
- Registry SHA-256: `c8a8d2391cc647772b76ca4293cf2b89f7ba3976b122bdd545c6e9143a7ecb3b`
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
| `n:simulation:motion:locomotion` | Own deterministic action-to-motion intent and locomotion frame calculation. |
| `n:simulation:motion:vehicle` | Own deterministic vehicle movement, boost, bounds, and impact frames. |
| `n:simulation:physics:world-contact` | Own portable world-contact resolution and correction records. |
| `n:simulation:recovery` | Own portable subject recovery records and deterministic recovery state. |
| `n:simulation:recovery:soft-respawn` | Own exact-once portable subject recovery records. |

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
| `action-locomotion-kit` | `nexusengine/domains/simulation/motion/locomotion` | Convert action commands into deterministic renderer-neutral Motion intents and locomotion frames. |
| `vehicle-dynamics-kit` | `nexusengine/domains/simulation/motion/vehicle` | Advance deterministic vehicle motion, boost, bounds, and impact state without owning surface policy. |
| `world-contact-kit` | `nexusengine/domains/simulation/physics/world-contact` | Resolve portable world contact, slope, impact, stability, and correction records without implementing a physics backend. |
| `soft-respawn-kit` | `nexusengine/domains/simulation/recovery/soft-respawn` | Produce exact-once coherent subject recovery records at configured portable points. |

## Lifecycle

- Duplicate install: Return the installed Simulation API without duplicate state or systems.
- Snapshot: Serialize Simulation state and descriptors.
- Reset: Restore the configured Simulation baseline.
