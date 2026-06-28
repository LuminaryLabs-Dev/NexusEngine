# core-scene-kit

Purpose: what-things-exist facts: scene graph, object identity, spawn/despawn, parent-child links, layers, tags, and recipes.

Owns: scene object descriptors, scene graph metadata, lifecycle descriptors, tags, layers, recipe data.

Does not own: spatial math, renderer meshes, or game-specific authored content rules.

Public API: `createCoreSceneKit(config?)`.

Proof required: scene recipe smoke, spawn/despawn descriptor smoke, tag/layer smoke, deterministic headless smoke.
