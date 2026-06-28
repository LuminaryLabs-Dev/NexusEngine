# core-camera-kit

Purpose: camera intent and camera-feel descriptors.

Owns: camera targets, follow modes, shake descriptors, FOV policy, camera volumes, occlusion policy, and XR/head camera boundaries.

Does not own: renderer camera object or XR session ownership.

Public API: `createCoreCameraKit(config?)`.

Proof required: follow descriptor smoke, FOV policy smoke, graphics/motion composition smoke, deterministic headless smoke.
