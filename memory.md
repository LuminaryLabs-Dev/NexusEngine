# NexusRealtime memory

Long-term repo shape: NexusRealtime is a single ESM realtime ECS engine package. `src/ecs.js` owns the deterministic ECS core, `src/engine.js` owns ticking and subscribable surfaces, `src/runtime-kit.js` owns installable and composable data-driven kits, `src/renderers.js` owns render adapter selection and scene modes, `src/shaders.js` owns shader/material registries, `src/sequences.js` owns event-driven sequence control, `src/terrain-kit.js` owns reusable chunked/layered terrain, `src/realism-kit.js` owns reusable PBR/water/atmosphere/scatter/performance realism state, `src/ar-kit.js` / `src/ar-session.js` / `src/ar-renderer.js` / `src/ar-experience-kit.js` own reusable browser AR ECS/session/rendering/multi-step flow, and kit files such as `src/fishing-kit.js` own reusable domain systems.

Reply and intent preferences: keep replies small, direct, action-oriented, and token-optimized; when chats are small, infer from this repo memory but ask first if acting would be risky.

Architecture preference: keep simulation systems deterministic and render-agnostic. Engine features should be additive modules that install into `createEngine()` through kits, adapters, registries, or sequence runtime hooks instead of replacing the ECS core.

Generic kit pattern: NexusRealtime must not contain product-specific copy, routes, assets, level names, or app lore. Product apps pass authored datasets into generic kits; NexusRealtime interprets room, placement, objective, interaction, collectible, sorting, platformer, reveal-light, symbol-alignment, socket-lock, and render-descriptor data.

AR kit pattern: `createARKit()` owns AR ECS components/resources/events and placement state, `ar-session.js` owns WebXR support/session/hit-test helpers with deterministic unsupported results, `createARRenderer()` owns browser-safe overlay/fallback rendering, and generic objective/interaction kits own reusable intro/surface/place/interact/complete/reset flow. Product apps should import these APIs as a local package now and later as a GitHub/CDN package, while keeping product copy/routes/assets outside NexusRealtime.

Device-specific AR pattern: `ar-device.js` classifies secure mobile/desktop capability, `ar-launcher.js` chooses a mode from page-marker, webxr-plane, camera-overlay, and fallback-preview, and `src/ar-modes/*` owns mode startup/stop behavior. Product apps should not duplicate WebXR, camera, or mode fallback policy.

Rendering preference: support `headless`, `canvas2d`, and first-party `custom-webgl` renderer types through the same renderer adapter shape. NexusRealtime should not depend on third-party rendering libraries; compatibility calls to `createRenderer("three")` should route to the custom WebGL renderer while older hosts migrate.

Sequence preference: sequence definitions start as JS objects. Event definitions stay authoritative in code, subscriptions wire discovered events to sequence starts/invokes, and sequence behavior advances only during engine ticks.

Fishing kit pattern: `createFishingKit()` owns fishing ECS definitions, systems, sequence reactions, and render snapshots. NexusArcade games should only pass content/config/input and should not duplicate fishing systems.

Terrain kit pattern: `createTerrainKit()` owns chunk grids, additive terrain layers, carving, erosion, material/wetness fields, dirty chunk/version tracking, LOD snapshots, and terrain query APIs. Games should pass `terrainLayers.*` settings and kit bindings instead of writing terrain algorithms.

Realism kit pattern: `createRealismKit()` owns visual quality profiles, PBR lighting, atmospheric state, water realism settings, terrain material descriptors, scatter budgets, wildlife visual descriptors, and adaptive render snapshots. Renderers consume realism snapshots; ECS gameplay systems stay deterministic and render-agnostic.

Cozy Fishing pattern: `cozy-fishing` replaces `tideglass-angler` as the Arcade-facing fishing playable. NexusRealtime owns `beach-side` scene rendering, transparent water, TerrainKit terrain/shoreline, sky/clouds, camera rig, screen-to-water aim, and the fishing sequences; NexusArcade only provides build folder, config, UI, and input forwarding.
Character-stack pattern: reusable arcade characters should be built from small kits for movement, camera follow, interaction prompts, and ragdoll/recovery instead of one monolithic player kit. `Riftwarden Wilds` is the current reference slice for that boundary.
Terrain streaming note: `createTerrainKit()` now treats chunk focus plus `streaming.activeRadius` as the default infinite-world policy. Keep seam continuity, LOD, and erosion tuning in terrain config rather than baking finite maps.
Riftwarden forest expansion pattern: `createForestPlacementKit()` owns render-agnostic chunk/route prop descriptors and `createCameraOcclusionKit()` owns reusable third-person camera safety. Arcade games should render those descriptors locally and keep game-specific forests, routes, and objectives outside NexusRealtime.
Tree runner pattern: `createTreeRunnerKit()` owns reusable infinite-runner branch generation, sky-fall starts, branch catch cones, vine swing arcs, jump chaining, fall lose-state, and telemetry. Arcade games render the specific canopy/art/camera locally while keeping runner mechanics in NexusRealtime.

# SELF REMINDERS

1. Preserve the deterministic ECS core while adding engine features through composable kits, renderers, registries, and sequence runtime hooks.
2. Keep TerrainKit state-driven and performant: unchanged chunks reuse cached outputs, carve/erosion/material/realism mask layers remain additive, and render LOD stays separate from gameplay queries.
3. Keep Cozy Fishing reusable in NexusRealtime so NexusArcade remains a thin config/input host, including hyper-real visuals through renderer defaults and optional RealismKit bindings.
Next sub-goal: continue tuning Cozy Fishing realism from NexusRealtime systems only, especially water depth readability, scatter density, and fish/lure/line presentation.
