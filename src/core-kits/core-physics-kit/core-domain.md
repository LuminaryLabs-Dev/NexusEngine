# core-physics-kit

Purpose: physical contact and constraint contracts without owning a full physics engine.

Owns: collider descriptors, body descriptors, motion requests, normalized physics frames, contact events, grounding descriptors, constraint descriptors, collision query descriptors, and physics provider boundaries.

Does not own: full simulation backend, renderer physics debug UI, movement intent, gameplay outcome meaning, GPU dispatch, or draw submission.

Public API: `createCorePhysicsKit(config?)` plus backend-neutral provider, body, collider, motion-request, frame, reset, and disposal services.

Proof required: provider lifecycle smoke, collider descriptor smoke, contact normalization smoke, backend-object isolation, deterministic one-step-per-tick smoke, reset smoke, and serializable headless output.
