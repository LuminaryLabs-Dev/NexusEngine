# core-motion-kit

Purpose: authoritative root-motion intent, movement modes, trajectories, root-motion requests, and serializable motion frames.

Owns: movement modes, motion intent, desired velocity and facing, acceleration/deceleration policy, trajectories, root-motion requests, and jump/dash/fly/swim descriptors.

Does not own: raw input bindings, physical contact resolution, articulated rig solving, authored animation clips, or renderer transforms.

Public API: `createCoreMotionKit(config?)`.

Parent domain factory: `createCoreMotionDomain(config?)`.

Subdomain: `n:core-motion:articulation`, installed by `createArticulatedMotionDomain(config?)`.

Proof required: movement mode and intent smoke, deterministic motion-frame smoke, snapshot/load/reset smoke, articulated-rig validation, IK pose-resolution smoke, and physics-independent headless operation.
