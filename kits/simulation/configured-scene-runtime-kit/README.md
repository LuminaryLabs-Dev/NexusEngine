# Configured Scene Runtime Kit

An optional NexusEngine simulation composition for portable authored scenes. This Kit owns configurable scene play, reversible platforms and grounded carry, buffered jumping, checkpoint recovery, collection, completion, pause, reset and snapshot replay. It composes existing Actor/Player, World/Scene, Motion/Action Locomotion, Physics/World Contact, Input/Interaction, Camera and Lifecycle Progression services. It is not a new Core Domain or a complete game preset.

```js
import {SceneProject} from 'nexusengine/kits/simulation/configured-scene-runtime/project';
import {createSceneRuntime} from 'nexusengine/kits/simulation/configured-scene-runtime';
const project = new SceneProject();
project.load(portableProject);
const runtime = createSceneRuntime(project.gameData(), geometryDescriptors, sampleSurface, syncPlatformPoses);
runtime.step(1 / 60, {x: 0, y: -1, jump: true});
const checkpoint = runtime.getSnapshot();
runtime.loadSnapshot(checkpoint);
runtime.reset();
```

`engine.n.sceneRuntime` exposes the same controller. `installConfiguredSceneRuntime(engine, options)` installs onto an existing Engine, and `installOptionalKit(engine, 'configured-scene-runtime-kit', options)` routes through the optional Kit catalog. Repeated equivalent installation returns the existing controller. Different scene/geometry configuration is rejected. The scene owns its own configuration hash, gameplay state and control buffers; snapshots include mutable composed services and the Engine tick clock. Host callbacks and GPU/audio/input objects never enter snapshots.

The project API uses Engine Project transactions and validation for meshes, materials, assemblies, shared assets, composition and project metadata. Existing `nexusengine.studio-project/2` files retain their compatibility schema marker. The old `engineCommit` marker identifies that document compatibility baseline, not the executing distribution; release manifests separately record the actual Engine revision. When the registry changes, derived compositions are rebuilt from trusted factories via an atomic Engine transaction. Original input is cloned, IDs/assets/content are preserved, and old registry-bound history is not replayed. Save migrated copies; keep originals for older Studio versions.

## Optional browser host

`nexusengine/kits/simulation/configured-scene-runtime/browser` exports `boot`, `mountGame` and `gameMessage`. It adapts Three.js rendering, pointer/keyboard controls, authored triangle surface samples, rolling/follow-camera presentation and feedback to the Engine runtime. Three.js is an optional peer, required only for this host. No editor, native bridge, editing controls or Studio source imports enter browser games. DOM/GPU/Web Audio code remains outside Core.

`nexusengine/kits/simulation/configured-scene-runtime/export` exports `exportGameHTML(data, bundledRuntime)`. Bundle the browser entry as IIFE global `NexusSceneGame`, then pass the text to the exporter. The generated standalone file embeds scene data, Engine/runtime code and dependencies and does not need Studio, a server-side Engine process, a CDN or accounts to play. Keep dependency licenses with published files.

Content, balance and scene references belong in game repositories. Studio is an authoring/export consumer of these public APIs. Native Studio can host the browser adapter; this does not provide a native game executable, general rigid-body solver, signing or physical mobile acceptance. Platforms are root leaf meshes; checkpoint/finish markers remain static.

Validation and provenance: `.agent/runs/2026-10-24-drift-runtime/`. Source was extracted from Studio 0.6.0 commit `1a3bf8a77afa312537c5ff1b5c48ff2ecf22db1f` with owner authorization, then migrated to public Engine APIs, independent browser hosting and serializable runtime coordination. Scene rendering excludes editor Orbit/Transform controls.
