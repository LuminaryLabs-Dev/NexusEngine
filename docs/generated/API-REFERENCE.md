# Generated Core API Reference

This file is generated from Domain manifest v2 records. Do not edit it directly.

Registry SHA-256: `fb253d7c33d1b271857591e21f6eaca1f32e470385d6080a131813261c767cc8`

## Domains

| Domain | Parent | Responsibility | Status |
| --- | --- | --- | --- |
| `n:actor` | - | Own neutral embodied actor identity and shared actor references. | stable-candidate |
| `n:actor:creature` | `n:actor` | Own neutral creature embodiment definitions and references. | stable-candidate |
| `n:actor:character` | `n:actor` | Own active embodied character identity and neutral runtime bindings. | stable-candidate |
| `n:actor:player` | `n:actor` | Own neutral player identity, possession, control authority, and spawn generations. | stable-candidate |
| `n:agent` | - | Own product-neutral observation, proposal, decision-cycle, execution receipt, and replay evidence contracts. | stable-candidate |
| `n:asset` | - | Own asset identity, manifests, bundles, content-addressed jobs, readiness, and provider contracts. | stable-candidate |
| `n:composition` | - | Own deterministic Domain and Kit discovery, dependency planning, plan identity, and exactly-once apply receipts. | stable-candidate |
| `n:compute` | - | Own parallel compute descriptors, dependency graphs, dispatch plans, and provider contracts. | stable-candidate |
| `n:compute:model` | `n:compute` | Own model descriptors, registries, inference requests/results, and model provider contracts. | stable-candidate |
| `n:diagnostics` | - | Own renderer-neutral telemetry, health, determinism, performance, replay, and debug evidence descriptors. | stable-candidate |
| `n:host` | - | Own host capability descriptors and fallback contracts without platform implementation. | stable-candidate |
| `n:interaction` | - | Own targets, affordances, activation progress, semantic requirements, prompts, and completion results. | stable-candidate |
| `n:interaction:input` | `n:interaction` | Own semantic input actions, axes, contexts, bindings, dead zones, and adapter contracts. | stable-candidate |
| `n:mcp` | - | Own opt-in transport-neutral MCP contracts, provider registration, authorization, and protocol dispatch. | stable-candidate |
| `n:network` | - | Own session, peer, message, synchronization, authority, latency, reconnect, and collaboration contracts. | stable-candidate |
| `n:object` | - | Own renderer-neutral object identity, intrinsic geometry meaning, fidelity, vegetation identity, and placement. | stable-candidate |
| `n:object:shape` | `n:object` | Own source and derived geometric shapes, provider jobs, qualification, and fallback. | stable-candidate |
| `n:object:fidelity` | `n:object` | Own valid object forms, fidelity packages, readiness, and contextual adaptation. | stable-candidate |
| `n:object:vegetation` | `n:object` | Own rooted plant species, instances, lifecycle, and deterministic variation. | stable-candidate |
| `n:object:vegetation:tree` | `n:object:vegetation` | Own deterministic tree structure, canopy, growth, and fidelity descriptors. | stable-candidate |
| `n:object:vegetation:foliage` | `n:object:vegetation` | Own deterministic foliage structure and descriptors. | stable-candidate |
| `n:object:vegetation:ecology` | `n:object:vegetation` | Own deterministic vegetation suitability scoring and species selection. | stable-candidate |
| `n:object:placement` | `n:object` | Own deterministic placement transforms, grounding, alignment, fit, and validation receipts. | stable-candidate |
| `n:policy` | - | Own product-neutral permission, guard, sandbox, and runtime safety decisions. | stable-candidate |
| `n:presentation` | - | Own renderer-neutral presentation descriptors and output policy contracts. | stable-candidate |
| `n:presentation:output` | `n:presentation` | Own surface, safe-area, viewport, aspect, bar, and render-resolution policy. | stable-candidate |
| `n:presentation:graphics` | `n:presentation` | Own renderer-neutral material, lighting, VFX, reflection, quality, batch, and render graph descriptors. | stable-candidate |
| `n:presentation:camera` | `n:presentation` | Own renderer-neutral camera targets, modes, smoothing, framing, and occlusion policy. | stable-candidate |
| `n:presentation:animation` | `n:presentation` | Own animation, pose, blend, rig, and timeline descriptors. | stable-candidate |
| `n:presentation:audio` | `n:presentation` | Own audio cue, music, ambience, mix, volume, and spatial audio descriptors. | stable-candidate |
| `n:presentation:ui` | `n:presentation` | Own renderer-neutral HUD, menu, prompt, notification, focus, selection, accessibility, and scale descriptors. | stable-candidate |
| `n:presentation:speech` | `n:presentation` | Own provider-neutral speech requests, voices, utterance lifecycle, and synthesis result contracts. | stable-candidate |
| `n:presentation:capture` | `n:presentation` | Own observation requests, view sets, framing, capture jobs, progress, and result contracts. | stable-candidate |
| `n:presentation:sky` | `n:presentation` | Own generic sky, atmosphere, cloud, horizon, and celestial descriptors. | stable-candidate |
| `n:runtime` | - | Own deterministic engine lifecycle, ticks, state mutation contracts, and runtime service installation. | stable-candidate |
| `n:runtime:realtime` | `n:runtime` | Own deterministic frame context and realtime phase execution. | stable-candidate |
| `n:runtime:data` | `n:runtime` | Own schemas, snapshots, selectors, migrations, deterministic random streams, and portable data envelopes. | stable-candidate |
| `n:runtime:transaction` | `n:runtime` | Own portable repeat-safe operation and transaction receipts. | stable-candidate |
| `n:runtime:persistence` | `n:runtime` | Own save/load targets, save slots, recovery records, and adapter contracts. | stable-candidate |
| `n:runtime:sequence` | `n:runtime` | Own deterministic sequence nodes, ordered execution, and frame-driven sequence state. | stable-candidate |
| `n:runtime:startup` | `n:runtime` | Own launch truth, preparation facts, continuation choice, structured failure, and readiness receipts. | stable-candidate |
| `n:simulation` | - | Own deterministic simulation objectives, resources, hazards, pressure, checkpoints, timers, and resolution contracts. | stable-candidate |
| `n:simulation:physics` | `n:simulation` | Own backend-neutral physical bodies, colliders, contacts, constraints, queries, and provider contracts. | stable-candidate |
| `n:simulation:physics:articulated` | `n:simulation:physics` | Own articulated body topology, joint dynamics inputs, and backend-neutral articulation state. | stable-candidate |
| `n:simulation:motion` | `n:simulation` | Own intent-to-motion descriptors, movement modes, trajectories, velocity state, movement policies, and deterministic pose solving. | stable-candidate |
| `n:simulation:motion:articulated` | `n:simulation:motion` | Own target poses, joint limits, articulation motion plans, and drive requests. | stable-candidate |
| `n:spatial` | - | Own renderer-neutral transforms, coordinate spaces, bounds, zones, distance queries, and deterministic spatial math. | stable-candidate |
| `n:world` | - | Own world identity, cells, partitions, surfaces, deterministic assembly, and world state receipts. | stable-candidate |
| `n:world:scene` | `n:world` | Own host-neutral scene identity, lifecycle, transition, binding descriptors, and scene snapshots. | stable-candidate |
| `n:world:weather` | `n:world` | Own weather conditions, tendencies, regions, layers, sampling, and deterministic evolution. | stable-candidate |
| `n:world:foundation` | `n:world` | Own deterministic foundation contributions, composition, sampling, and cell resolution. | stable-candidate |
| `n:world:feature` | `n:world` | Own semantic world feature definitions, registries, lifecycle, queries, and composition. | stable-candidate |
| `n:world:feature:landform` | `n:world:feature` | Own semantic elevation and landform feature descriptors. | stable-candidate |
| `n:world:feature:hydrology` | `n:world:feature` | Own semantic watershed, water path, water body, and wetland feature descriptors. | stable-candidate |
| `n:world:feature:ecology` | `n:world:feature` | Own semantic biome, habitat, vegetation-region, and ecotone feature descriptors. | stable-candidate |
| `n:world:feature:settlement` | `n:world:feature` | Own semantic settlement, route, structure, and infrastructure feature descriptors. | stable-candidate |
| `n:world:feature:atmosphere` | `n:world:feature` | Own semantic cloud, fog, wind, thermal, precipitation, and visibility feature descriptors. | stable-candidate |

## Atomic Kits

| Kit | Domain | Public subpath | Responsibility |
| --- | --- | --- | --- |
| `actor-registry-kit` | `n:actor` | `nexusengine/domains/actor/registry` | Own neutral actor identities and embodiment references. |
| `creature-registry-kit` | `n:actor:creature` | `nexusengine/domains/actor/creature` | Register and resolve neutral creature embodiment definitions. |
| `character-registry-kit` | `n:actor:character` | `nexusengine/domains/actor/character` | Register and resolve active embodied character descriptors. |
| `player-authority-kit` | `n:actor:player` | `nexusengine/domains/actor/player` | Track player identity, possession, control authority, and spawn generations. |
| `agent-cycle-kit` | `n:agent` | `nexusengine/domains/agent/cycle` | Record observations, action proposals, decision cycles, and execution receipts. |
| `asset-registry-kit` | `n:asset` | `nexusengine/domains/asset/registry` | Resolve asset manifests and bundles through content-addressed provider jobs. |
| `composition-registry-kit` | `n:composition` | `nexusengine/domains/composition/registry` | Maintain normalized composition metadata and produce deterministic plans and receipts. |
| `compute-graph-kit` | `n:compute` | `nexusengine/domains/compute/graph` | Validate compute descriptors and create deterministic dependency-ordered dispatch plans. |
| `model-registry-kit` | `n:compute:model` | `nexusengine/domains/compute/model` | Register model descriptors and normalize provider-neutral inference requests and results. |
| `diagnostics-kit` | `n:diagnostics` | `nexusengine/domains/diagnostics/runtime` | Collect serializable telemetry, runtime health, determinism, and performance evidence. |
| `debug-descriptor-kit` | `n:diagnostics` | `nexusengine/domains/diagnostics/debug` | Record renderer-neutral rays, markers, scalars, and capture packets for diagnostics. |
| `debug-draw-descriptor-kit` | `n:diagnostics` | `nexusengine/domains/diagnostics/debug-draw` | Create stateless renderer-neutral debug draw descriptors. |
| `host-capability-kit` | `n:host` | `nexusengine/domains/host/capabilities` | Describe available host capabilities and select declarative fallback modes. |
| `interaction-kit` | `n:interaction` | `nexusengine/domains/interaction/runtime` | Manage interaction targets, affordances, activation, and results. |
| `input-contract-kit` | `n:interaction:input` | `nexusengine/domains/interaction/input` | Normalize semantic input actions, axes, contexts, and bindings. |
| `mcp-registry-kit` | `n:mcp` | `nexusengine/domains/mcp/registry` | Register and dispatch schema-valid MCP providers through an explicit authorization boundary. |
| `network-contract-kit` | `n:network` | `nexusengine/domains/network/contracts` | Describe network sessions, messages, authority, and synchronization without owning transport. |
| `object-registry-kit` | `n:object` | `nexusengine/domains/object/registry` | Own object identity and renderer-neutral lifecycle records. |
| `object-shape-kit` | `n:object:shape` | `nexusengine/domains/object/shape` | Derive and qualify renderer-neutral geometric shape candidates. |
| `object-fidelity-kit` | `n:object:fidelity` | `nexusengine/domains/object/fidelity` | Package and select valid object fidelity forms. |
| `object-vegetation-kit` | `n:object:vegetation` | `nexusengine/domains/object/vegetation` | Own deterministic plant species, instances, and lifecycle state. |
| `object-tree-kit` | `n:object:vegetation:tree` | `nexusengine/domains/object/vegetation/tree` | Produce deterministic tree structure, canopy, growth, and fidelity descriptors. |
| `object-foliage-kit` | `n:object:vegetation:foliage` | `nexusengine/domains/object/vegetation/foliage` | Produce deterministic foliage structures and descriptors. |
| `object-vegetation-ecology-kit` | `n:object:vegetation:ecology` | `nexusengine/domains/object/vegetation/ecology` | Score vegetation suitability and select species deterministically. |
| `object-placement-kit` | `n:object:placement` | `nexusengine/domains/object/placement` | Create, validate, and replay deterministic object placement receipts. |
| `object-meshoptimizer-shape-provider-kit` | `n:object:shape` | `nexusengine/domains/object/shape/meshoptimizer-provider` | Resolve object shape jobs through an explicitly registered meshoptimizer-compatible provider. |
| `object-shape-fidelity-adapter-kit` | `n:object:fidelity` | `nexusengine/domains/object/adapters/shape-fidelity` | Translate qualified shape records into Object Fidelity form requests. |
| `object-vegetation-bridge-kit` | `n:object:vegetation` | `nexusengine/domains/object/adapters/vegetation-object` | Project vegetation identities into canonical Object descriptors without owning either state. |
| `policy-kit` | `n:policy` | `nexusengine/domains/policy/guard` | Evaluate declarative runtime safety and permission rules. |
| `presentation-registry-kit` | `n:presentation` | `nexusengine/domains/presentation/registry` | Register renderer-neutral presentation capabilities and descriptors. |
| `presentation-output-kit` | `n:presentation:output` | `nexusengine/domains/presentation/output` | Calculate renderer-neutral surfaces, safe areas, viewports, aspect policy, and render resolution. |
| `graphics-descriptor-kit` | `n:presentation:graphics` | `nexusengine/domains/presentation/graphics` | Create renderer-neutral material, lighting, VFX, quality, batch, and terrain LOD descriptors. |
| `render-layer-graph-kit` | `n:presentation:graphics` | `nexusengine/domains/presentation/graphics/render-graph` | Validate renderer-neutral render layers, dependencies, and pass ordering. |
| `reflection-descriptor-kit` | `n:presentation:graphics` | `nexusengine/domains/presentation/graphics/reflection` | Describe renderer-neutral reflection probes, plans, and update policy. |
| `camera-descriptor-kit` | `n:presentation:camera` | `nexusengine/domains/presentation/camera` | Manage camera targets, modes, smoothing, and renderer-neutral camera policy. |
| `camera-framing-kit` | `n:presentation:camera` | `nexusengine/domains/presentation/camera/framing` | Calculate perspective and orthographic subject framing for a viewport. |
| `camera-control-math-kit` | `n:presentation:camera` | `nexusengine/domains/presentation/camera/control-math` | Calculate camera-relative yaw, orbit limits, and root handoff state. |
| `animation-descriptor-kit` | `n:presentation:animation` | `nexusengine/domains/presentation/animation` | Manage animation clips, poses, blends, transitions, and timeline descriptors. |
| `rig-transform-kit` | `n:presentation:animation` | `nexusengine/domains/presentation/animation/rig` | Create neutral joint, limb, and rig transform descriptors. |
| `audio-descriptor-kit` | `n:presentation:audio` | `nexusengine/domains/presentation/audio` | Manage renderer-neutral audio cues, mix groups, volume policy, and spatial audio descriptors. |
| `ui-descriptor-kit` | `n:presentation:ui` | `nexusengine/domains/presentation/ui` | Manage renderer-neutral UI, focus, selection, prompt, notification, and accessibility descriptors. |
| `ui-scale-kit` | `n:presentation:ui` | `nexusengine/domains/presentation/ui/scale` | Calculate deterministic reference-resolution and UI scale policy. |
| `speech-contract-kit` | `n:presentation:speech` | `nexusengine/domains/presentation/speech` | Manage provider-neutral speech requests, voices, utterance lifecycle, and synthesis results. |
| `capture-contract-kit` | `n:presentation:capture` | `nexusengine/domains/presentation/capture` | Manage observation requests, view sets, framing, capture jobs, progress, and result contracts. |
| `sky-descriptor-kit` | `n:presentation:sky` | `nexusengine/domains/presentation/sky` | Create generic sky, horizon, atmosphere, cloud, and celestial descriptors. |
| `runtime-lifecycle-kit` | `n:runtime` | `nexusengine/domains/runtime/lifecycle` | Own deterministic runtime lifecycle and Kit installation receipts. |
| `realtime-runtime-kit` | `n:runtime:realtime` | `nexusengine/domains/runtime/realtime` | Create deterministic realtime frame context and phase execution. |
| `runtime-data-kit` | `n:runtime:data` | `nexusengine/domains/runtime/data` | Provide deterministic schemas, snapshots, selectors, migrations, and data envelopes. |
| `transaction-ledger-kit` | `n:runtime:transaction` | `nexusengine/domains/runtime/transaction` | Record repeat-safe operation keys and immutable transaction receipts. |
| `persistence-contract-kit` | `n:runtime:persistence` | `nexusengine/domains/runtime/persistence` | Describe save/load targets, slots, recovery records, and persistence adapter contracts. |
| `runtime-sequence-kit` | `n:runtime:sequence` | `nexusengine/domains/runtime/sequence` | Install deterministic sequence node definitions and execution state. |
| `runtime-startup-kit` | `n:runtime:startup` | `nexusengine/domains/runtime/startup` | Coordinate deterministic startup preparation and readiness receipts. |
| `simulation-state-kit` | `n:simulation` | `nexusengine/domains/simulation/runtime` | Manage deterministic simulation objectives, resources, hazards, timers, and resolution receipts. |
| `physics-contract-kit` | `n:simulation:physics` | `nexusengine/domains/simulation/physics` | Describe physical bodies, colliders, contacts, constraints, queries, and provider boundaries. |
| `articulated-physics-kit` | `n:simulation:physics:articulated` | `nexusengine/domains/simulation/physics/articulated` | Manage backend-neutral articulated body topology and joint dynamics state. |
| `motion-contract-kit` | `n:simulation:motion` | `nexusengine/domains/simulation/motion` | Manage intent-to-motion descriptors, trajectories, velocity state, and movement policies. |
| `two-bone-ik-kit` | `n:simulation:motion` | `nexusengine/domains/simulation/motion/two-bone-ik` | Solve deterministic two-bone inverse-kinematics poses. |
| `articulated-motion-kit` | `n:simulation:motion:articulated` | `nexusengine/domains/simulation/motion/articulated` | Create target poses, joint limits, articulation plans, and drive requests. |
| `articulated-motion-drive-adapter-kit` | `n:simulation:physics:articulated` | `nexusengine/domains/simulation/adapters/articulated-drive` | Translate articulated motion plans into backend-neutral physics drive requests. |
| `spatial-contract-kit` | `n:spatial` | `nexusengine/domains/spatial/contracts` | Describe transforms, bounds, zones, spaces, and spatial query requests. |
| `spatial-angle-math-kit` | `n:spatial` | `nexusengine/domains/spatial/angle-math` | Normalize, compare, and interpolate angular values. |
| `spatial-vector-math-kit` | `n:spatial` | `nexusengine/domains/spatial/vector-math` | Create and operate on renderer-neutral vector values. |
| `spatial-transform-math-kit` | `n:spatial` | `nexusengine/domains/spatial/transform-math` | Calculate deterministic transforms, bases, interpolation, and planar projections. |
| `spatial-quaternion-math-kit` | `n:spatial` | `nexusengine/domains/spatial/quaternion-math` | Create, compose, normalize, rotate, and interpolate quaternions. |
| `world-state-kit` | `n:world` | `nexusengine/domains/world/runtime` | Manage world identity, cells, partitions, surfaces, and deterministic assembly state. |
| `scene-lifecycle-kit` | `n:world:scene` | `nexusengine/domains/world/scene` | Manage host-neutral scene identity, lifecycle, transitions, bindings, and snapshots. |
| `weather-state-kit` | `n:world:weather` | `nexusengine/domains/world/weather` | Manage deterministic weather conditions, tendencies, regions, and sampling. |
| `layered-weather-kit` | `n:world:weather` | `nexusengine/domains/world/weather/layers` | Compose and evolve deterministic altitude-aware weather layers. |
| `world-foundation-kit` | `n:world:foundation` | `nexusengine/domains/world/foundation` | Compose deterministic world foundation definitions, contributions, sampling, and cell resolution. |
| `world-feature-kit` | `n:world:feature` | `nexusengine/domains/world/feature` | Manage semantic world feature definitions, registry, lifecycle, queries, and composition. |
| `semantic-world-feature-kit` | `n:world:feature` | `nexusengine/domains/world/feature/semantic` | Create one semantic world feature Domain Service Kit from a bounded feature specification. |
| `landform-feature-kit` | `n:world:feature:landform` | `nexusengine/domains/world/feature/landform` | Create semantic elevation and landform feature descriptors and lifecycle state. |
| `hydrology-feature-kit` | `n:world:feature:hydrology` | `nexusengine/domains/world/feature/hydrology` | Create semantic watershed, water path, water body, and wetland feature descriptors. |
| `ecology-feature-kit` | `n:world:feature:ecology` | `nexusengine/domains/world/feature/ecology` | Create semantic biome, habitat, vegetation-region, and ecotone feature descriptors. |
| `settlement-feature-kit` | `n:world:feature:settlement` | `nexusengine/domains/world/feature/settlement` | Create semantic settlement, route, structure, and infrastructure feature descriptors. |
| `atmosphere-feature-kit` | `n:world:feature:atmosphere` | `nexusengine/domains/world/feature/atmosphere` | Create semantic cloud, fog, wind, thermal, precipitation, and visibility feature descriptors. |
