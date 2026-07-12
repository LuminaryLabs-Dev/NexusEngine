# core-physics-kit

Purpose: backend-neutral physical body, collider, contact, constraint, articulation, joint-motor, and normalized frame contracts.

Owns: body and collider descriptors, motion requests, constraint descriptors, articulation descriptors, joint-motor requests, normalized contacts, grounding descriptors, collision queries, provider boundaries, and normalized physics frames.

Does not own: a full simulation backend, movement intent, kinematic rig pose solving, renderer physics debug UI, gameplay outcomes, GPU dispatch, or draw submission.

Public API: `createCorePhysicsKit(config?)` plus provider, body, collider, motion-request, constraint, articulation, motor-request, frame, reset, and disposal services.

Parent domain factory: `createCorePhysicsDomain(config?)`.

Subdomain: `n:core-physics:articulated-dynamics`, installed by `createArticulatedDynamicsDomain(config?)`.

Provider compatibility: `step()` and `getFrame()` remain mandatory. Articulation methods are optional, so existing providers continue to work unchanged.

Proof required: provider lifecycle smoke, old-provider compatibility, contact normalization, articulation descriptor and motor-request smoke, backend-object isolation, deterministic one-step-per-tick behavior, snapshot/reset, and serializable headless output.
