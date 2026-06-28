# core-animation-kit

Purpose: animation descriptors and animation state contracts.

Owns: clip descriptors, blend descriptors, pose descriptors, transition rules, procedural hooks, and timeline events.

Does not own: renderer animation mixers or asset loading.

Public API: `createCoreAnimationKit(config?)`.

Proof required: clip descriptor smoke, blend descriptor smoke, adapter boundary smoke, deterministic headless smoke.
