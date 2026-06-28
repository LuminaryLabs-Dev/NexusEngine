# core-physics-kit

Purpose: physical contact and constraint contracts without owning a full physics engine.

Owns: collider descriptors, contact events, grounding descriptors, constraint descriptors, collision query descriptors, physics adapter boundaries.

Does not own: full simulation backend, renderer physics debug UI, or movement intent.

Public API: `createCorePhysicsKit(config?)`.

Proof required: collider descriptor smoke, contact event smoke, adapter boundary smoke, deterministic headless smoke.
