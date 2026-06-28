# core-motion-kit

Purpose: intent-to-motion and movement-state descriptors.

Owns: movement modes, velocity descriptors, acceleration/deceleration policy, jump/dash/fly/swim hooks, controller-to-motion policy.

Does not own: raw input bindings or physical contact resolution.

Public API: `createCoreMotionKit(config?)`.

Proof required: movement mode smoke, policy override smoke, spatial/physics composition smoke, deterministic headless smoke.
