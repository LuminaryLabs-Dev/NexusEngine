# Simulation Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:simulation`
- Status: `stable-candidate`
- Registry SHA-256: `61c125b08dd3dd69fff9eb077a33da2c46c2045603309ed98c931c2457894f9e`
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
| `n:simulation:economy` | Own portable economic account and cargo state primitives. |
| `n:simulation:economy:accounts` | Own finite account balances and economy transaction records. |
| `n:simulation:economy:cargo` | Own portable cargo inventory, carrying, condition, deposits, and quota state. |
| `n:simulation:operations` | Own portable facility, occupant, and transport operation primitives. |
| `n:simulation:operations:facility` | Own deterministic facility capacity, condition, status, cycles, and operation receipts. |
| `n:simulation:operations:occupant-flow` | Own deterministic occupant spawning, patience, service, and abandonment state. |
| `n:simulation:operations:transport-route` | Own deterministic transport stops, carriers, capacity, travel, and arrival receipts. |
| `n:simulation:hazard-field` | Own deterministic bounded hazard state, spawning, motion, and collision queries. |
| `n:simulation:pursuit-pressure` | Own coherent pursuit distance, warning bands, caught state, recovery, and transition history. |
| `n:simulation:progression` | Own portable progression capability and lifecycle ownership boundaries. |
| `n:simulation:progression:lifecycle` | Own prerequisite-gated lifecycle timing, completion, and portable effect descriptors. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `simulation-state-kit` | `nexusengine/domains/simulation/runtime` | Manage deterministic simulation objectives, resources, hazards, timers, and resolution receipts. |
| `simulation-physics-contract-kit` | `nexusengine/domains/simulation/physics` | Describe physical bodies, colliders, contacts, constraints, queries, and provider boundaries. |
| `articulated-physics-kit` | `nexusengine/domains/simulation/physics/articulated` | Manage backend-neutral articulated body topology and joint dynamics state. |
| `motion-contract-kit` | `nexusengine/domains/simulation/motion` | Manage intent-to-motion descriptors, trajectories, velocity state, and movement policies. |
| `two-bone-ik-kit` | `nexusengine/domains/simulation/motion/two-bone-ik` | Solve deterministic two-bone inverse-kinematics poses. |
| `articulated-motion-kit` | `nexusengine/domains/simulation/motion/articulated` | Create target poses, joint limits, articulation plans, and drive requests. |
| `articulated-motion-drive-adapter-kit` | `nexusengine/domains/simulation/adapters/articulated-drive` | Translate articulated motion plans into backend-neutral physics drive requests. |
| `action-locomotion-kit` | `nexusengine/domains/simulation/motion/locomotion` | Convert action commands into deterministic renderer-neutral Motion intents and locomotion frames. |
| `vehicle-dynamics-kit` | `nexusengine/domains/simulation/motion/vehicle` | Advance deterministic vehicle motion, boost, bounds, and impact state without owning surface policy. |
| `world-contact-kit` | `nexusengine/domains/simulation/physics/world-contact` | Resolve portable world contact, slope, impact, stability, and correction records without implementing a physics backend. |
| `soft-respawn-kit` | `nexusengine/domains/simulation/recovery/soft-respawn` | Produce exact-once coherent subject recovery records at configured portable points. |
| `economy-account-kit` | `nexusengine/domains/simulation/economy/accounts` | Own finite account balances and exact-once portable economy transaction records. |
| `cargo-manifest-kit` | `nexusengine/domains/simulation/economy/cargo` | Own portable cargo inventory, capacity, condition, pickup, deposit, and quota state. |
| `facility-operations-kit` | `nexusengine/domains/simulation/operations/facility` | Own deterministic facility capacity, condition, status, cycle, and portable output receipts. |
| `occupant-flow-kit` | `nexusengine/domains/simulation/operations/occupant-flow` | Own deterministic occupant spawning, patience, service, and abandonment state. |
| `transport-route-kit` | `nexusengine/domains/simulation/operations/transport-route` | Own deterministic stops, carriers, capacity, calls, travel progress, and arrival receipts. |
| `hazard-field-kit` | `nexusengine/domains/simulation/hazard-field` | Own deterministic bounded hazards, verified spawn identities, motion, and read-only collision queries. |
| `pursuit-pressure-kit` | `nexusengine/domains/simulation/pursuit-pressure` | Own coherent pursuit distance, warning bands, caught state, recovery, and transition history. |
| `lifecycle-progression-kit` | `nexusengine/domains/simulation/progression/lifecycle` | Own prerequisite-gated lifecycle start, timing, completion, and portable effect descriptors. |
| `locomotion-contact-response-adapter-kit` | `nexusengine/domains/simulation/adapters/locomotion-contact-response` | Translate Locomotion frames and World Contact results into corrected Motion frames without owning either state. |
| `vehicle-water-response-adapter-kit` | `nexusengine/domains/simulation/adapters/vehicle-water-response` | Translate Vehicle state and Water Surface queries into portable drag, current, and buoyancy responses. |
| `lifecycle-economy-adapter-kit` | `nexusengine/domains/simulation/adapters/lifecycle-economy` | Translate accepted Lifecycle costs and Economy effects into exact-once Economy transactions. |
| `lifecycle-facility-adapter-kit` | `nexusengine/domains/simulation/adapters/lifecycle-facility` | Translate accepted Lifecycle facility effects into exact-once Facility Operations commands. |
| `facility-economy-adapter-kit` | `nexusengine/domains/simulation/adapters/facility-economy` | Translate Facility output and upkeep receipts into exact-once Economy transactions. |

## Lifecycle

- Duplicate install: Return the installed Simulation API without duplicate state or systems.
- Snapshot: Serialize Simulation state and descriptors.
- Reset: Restore the configured Simulation baseline.
