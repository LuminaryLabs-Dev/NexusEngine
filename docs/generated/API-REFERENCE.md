# Generated Core API Reference

This file is generated from Domain manifest v2 records. Do not edit it directly.

Registry SHA-256: `8bb0900127eded3eba62ade325c4b3f488b70b62e78c625be184fa2b2b83cbb8`

## Domains

| Domain | Parent | Responsibility | Status |
| --- | --- | --- | --- |
| `n:actor` | - | Own neutral embodied actor identity and shared actor references. | stable-candidate |
| `n:actor:creature` | `n:actor` | Own neutral creature embodiment definitions and references. | stable-candidate |
| `n:actor:character` | `n:actor` | Own active embodied character identity and neutral runtime bindings. | stable-candidate |
| `n:actor:player` | `n:actor` | Own neutral player identity, possession, control authority, and spawn generations. | stable-candidate |
| `n:agent` | - | Own product-neutral observation, proposal, decision-cycle, execution receipt, and replay evidence contracts. | stable-candidate |
| `n:asset` | - | Own asset identity, manifests, bundles, content-addressed jobs, readiness, and provider contracts. | stable-candidate |
| `n:build` | - | Own isolated build-time source analysis, compilation, toolchains, targets, artifacts, receipts, and proof without entering application runtime composition. | stable-candidate |
| `n:build:source` | `n:build` | Own read-only project source, immutable dependency identities, content caches, fingerprints, and module graphs. | stable-candidate |
| `n:build:analysis` | `n:build` | Own real syntax, type, effect, and dependency analysis for build inputs. | stable-candidate |
| `n:build:ir` | `n:build` | Own serializable Kit IR, Execution IR, validation, and source lineage maps. | stable-candidate |
| `n:build:classification` | `n:build` | Own whole-Kit portability, capability resolution, and fallback selection. | stable-candidate |
| `n:build:orchestration` | `n:build` | Own normalized requests, target sets, deterministic plans, approvals, execution, and receipts. | stable-candidate |
| `n:build:compile` | `n:build` | Own deterministic Rust lowering, JavaScript fallback descriptors, runtime ABI, and native link plans. | stable-candidate |
| `n:build:toolchain` | `n:build` | Own immutable toolchain sources, discovery, approved provisioning, isolated stages, and process execution. | stable-candidate |
| `n:build:target` | `n:build` | Own target registration and target-specific build providers. | stable-candidate |
| `n:build:artifact` | `n:build` | Own content-addressed artifact caches, manifests, integrity, and external output. | stable-candidate |
| `n:build:proof` | `n:build` | Own project immutability, runtime parity, and target validation evidence. | stable-candidate |
| `n:build:target:web-live` | `n:build:target` | Own verified live ESM loading and content-hash browser caching. | stable-candidate |
| `n:build:target:web-static` | `n:build:target` | Own self-contained static Web artifact materialization. | stable-candidate |
| `n:build:target:openxr` | `n:build:target` | Own shared native OpenXR session, input, frame, view, swapchain, and submission contracts. | stable-candidate |
| `n:build:target:android-xr` | `n:build:target` | Own Android ARM64 OpenXR host generation, Gradle packaging, and APK validation. | stable-candidate |
| `n:build:target:pcvr` | `n:build:target` | Own Windows x64 OpenXR host generation, executable packaging, and validation. | stable-candidate |
| `n:composition` | - | Own deterministic Domain and Kit discovery, dependency planning, plan identity, and exactly-once apply receipts. | stable-candidate |
| `n:compute` | - | Own parallel compute descriptors, dependency graphs, dispatch plans, and provider contracts. | stable-candidate |
| `n:compute:model` | `n:compute` | Own model descriptors, registries, inference requests/results, and model provider contracts. | stable-candidate |
| `n:diagnostics` | - | Own renderer-neutral telemetry, health, determinism, performance, replay, and debug evidence descriptors. | stable-candidate |
| `n:host` | - | Own host capability descriptors and fallback contracts without platform implementation. | stable-candidate |
| `n:interaction` | - | Own targets, affordances, activation progress, semantic requirements, prompts, and completion results. | stable-candidate |
| `n:interaction:input` | `n:interaction` | Own semantic input actions, axes, contexts, bindings, dead zones, and adapter contracts. | stable-candidate |
| `n:interaction:assistance-target` | `n:interaction` | Own assistance target urgency, attachment, completion, loss, and deterministic selection. | stable-candidate |
| `n:interaction:environmental-affordance` | `n:interaction` | Own portable affordance proximity and activation state. | stable-candidate |
| `n:interaction:request` | `n:interaction` | Own portable request queue and fulfillment boundaries. | stable-candidate |
| `n:interaction:request:queue` | `n:interaction:request` | Own queued request patience, fulfillment, expiry, and effect descriptors. | stable-candidate |
| `n:interaction:request:fulfillment` | `n:interaction:request` | Own spatial request destination, deadline, completion, expiry, and reward state. | stable-candidate |
| `n:interaction:transfer-zone` | `n:interaction` | Own portable transfer-zone acceptance, dwell, capacity, occupancy, and completion state. | stable-candidate |
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
| `n:physics` | - | Own the canonical backend-neutral Physics boundary and compose its atomic capability subdomains. | stable-candidate |
| `n:physics:contracts` | `n:physics` | Own portable Physics provider, state, command, event, and query boundary schemas. | stable-candidate |
| `n:physics:lifecycle` | `n:physics` | Own deterministic installation, startup, stepping, shutdown, reset, and snapshot orchestration contracts. | stable-candidate |
| `n:physics:material` | `n:physics` | Own portable physical material identity, coefficients, surface classification, and deterministic pair-combine policy. | stable-candidate |
| `n:physics:world` | `n:physics` | Own portable solver-facing Physics world records, physical fields, Physics time scales, and physical simulation regions. | stable-candidate |
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
| `n:presentation:camera:third-person` | `n:presentation:camera` | Own renderer-neutral third-person camera follow descriptors. | stable-candidate |
| `n:render` | - | Own the canonical backend-neutral render-execution boundary and compose its atomic capability subdomains. | stable-candidate |
| `n:render:contracts` | `n:render` | Own portable Render provider, resource, frame, resolved-pass, shader-interface, and event boundary schemas. | stable-candidate |
| `n:render:lifecycle` | `n:render` | Own provider-neutral Render composition installation, startup, shutdown, reset, snapshot, and recovery state. | stable-candidate |
| `n:render:device` | `n:render` | Own portable Render device contracts, capability negotiation, semantic accounting, lifecycle, loss, and diagnostics. | stable-candidate |
| `n:render:resource` | `n:render` | Own portable Render execution-resource identity, references, semantic residency, accounting, operation receipts, and lifecycle state. | stable-candidate |
| `n:render:buffer` | `n:render` | Own portable logical Buffer descriptors, explicit layouts, semantic typed views, and bounded provider update receipts. | stable-candidate |
| `n:render:texture` | `n:render` | Own portable logical Texture descriptors, typed views, formats, mip plans, streaming records, and proven subresource residency. | stable-candidate |
| `n:render:shader` | `n:render` | Own provider-neutral Shader source lineage, module and program composition, variants, compile state, reflection observations, and semantic cache links. | stable-candidate |
| `n:render:material` | `n:render` | Own portable backend-neutral Material execution bindings, aggregate validation, and semantic cache links. | stable-candidate |
| `n:runtime` | - | Own deterministic engine lifecycle, ticks, state mutation contracts, and runtime service installation. | stable-candidate |
| `n:runtime:realtime` | `n:runtime` | Own deterministic frame context and realtime phase execution. | stable-candidate |
| `n:runtime:data` | `n:runtime` | Own schemas, snapshots, selectors, migrations, deterministic random streams, and portable data envelopes. | stable-candidate |
| `n:runtime:transaction` | `n:runtime` | Own portable repeat-safe operation and transaction receipts. | stable-candidate |
| `n:runtime:persistence` | `n:runtime` | Own save/load targets, save slots, recovery records, and adapter contracts. | stable-candidate |
| `n:runtime:sequence` | `n:runtime` | Own deterministic sequence nodes, ordered execution, and frame-driven sequence state. | stable-candidate |
| `n:runtime:startup` | `n:runtime` | Own launch truth, preparation facts, continuation choice, structured failure, and readiness receipts. | stable-candidate |
| `n:runtime:sequence:schedule` | `n:runtime:sequence` | Own deterministic elapsed-time schedules and occurrence records. | stable-candidate |
| `n:simulation` | - | Own deterministic simulation objectives, resources, hazards, pressure, checkpoints, timers, and resolution contracts. | stable-candidate |
| `n:simulation:physics` | `n:simulation` | Own backend-neutral physical bodies, colliders, contacts, constraints, queries, and provider contracts. | stable-candidate |
| `n:simulation:physics:articulated` | `n:simulation:physics` | Own articulated body topology, joint dynamics inputs, and backend-neutral articulation state. | stable-candidate |
| `n:simulation:motion` | `n:simulation` | Own intent-to-motion descriptors, movement modes, trajectories, velocity state, movement policies, and deterministic pose solving. | stable-candidate |
| `n:simulation:motion:articulated` | `n:simulation:motion` | Own target poses, joint limits, articulation motion plans, and drive requests. | stable-candidate |
| `n:simulation:motion:locomotion` | `n:simulation:motion` | Own deterministic action-to-motion intent and locomotion frame calculation. | stable-candidate |
| `n:simulation:motion:vehicle` | `n:simulation:motion` | Own deterministic vehicle movement, boost, bounds, and impact frames. | stable-candidate |
| `n:simulation:physics:world-contact` | `n:simulation:physics` | Own portable world-contact resolution and correction records. | stable-candidate |
| `n:simulation:recovery` | `n:simulation` | Own portable subject recovery records and deterministic recovery state. | stable-candidate |
| `n:simulation:recovery:soft-respawn` | `n:simulation:recovery` | Own exact-once portable subject recovery records. | stable-candidate |
| `n:simulation:economy` | `n:simulation` | Own portable economic account and cargo state primitives. | stable-candidate |
| `n:simulation:economy:accounts` | `n:simulation:economy` | Own finite account balances and economy transaction records. | stable-candidate |
| `n:simulation:economy:cargo` | `n:simulation:economy` | Own portable cargo inventory, carrying, condition, deposits, and quota state. | stable-candidate |
| `n:simulation:operations` | `n:simulation` | Own portable facility, occupant, and transport operation primitives. | stable-candidate |
| `n:simulation:operations:facility` | `n:simulation:operations` | Own deterministic facility capacity, condition, status, cycles, and operation receipts. | stable-candidate |
| `n:simulation:operations:occupant-flow` | `n:simulation:operations` | Own deterministic occupant spawning, patience, service, and abandonment state. | stable-candidate |
| `n:simulation:operations:transport-route` | `n:simulation:operations` | Own deterministic transport stops, carriers, capacity, travel, and arrival receipts. | stable-candidate |
| `n:simulation:hazard-field` | `n:simulation` | Own deterministic bounded hazard state, spawning, motion, and collision queries. | stable-candidate |
| `n:simulation:pursuit-pressure` | `n:simulation` | Own coherent pursuit distance, warning bands, caught state, recovery, and transition history. | stable-candidate |
| `n:simulation:progression` | `n:simulation` | Own portable progression capability and lifecycle ownership boundaries. | stable-candidate |
| `n:simulation:progression:lifecycle` | `n:simulation:progression` | Own prerequisite-gated lifecycle timing, completion, and portable effect descriptors. | stable-candidate |
| `n:spatial` | - | Own renderer-neutral transforms, coordinate spaces, bounds, zones, distance queries, and deterministic spatial math. | stable-candidate |
| `n:spatial:scale` | `n:spatial` | Own subject scale, scale anchors, proximity bands, and deterministic scale queries. | stable-candidate |
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
| `n:world:navigation` | `n:world` | Own renderer-neutral navigation graphs, path queries, route fields, and landmark guidance. | stable-candidate |
| `n:world:navigation:navmesh` | `n:world:navigation` | Own deterministic 2D navigation cells, portals, and 3D waypoint graphs derived from walkability. | stable-candidate |
| `n:world:navigation:pathfinding` | `n:world:navigation` | Own deterministic path requests, A* resolution, results, and graph adapters. | stable-candidate |
| `n:world:navigation:route-field` | `n:world:navigation` | Own generic route marker and corridor descriptors plus deterministic proximity queries. | stable-candidate |
| `n:world:navigation:landmark-guidance` | `n:world:navigation` | Own reusable landmark discovery, reach, completion, priority, and proximity state. | stable-candidate |
| `n:world:generation` | `n:world` | Own deterministic generic region, connector, point, graph, and walkability generation. | stable-candidate |
| `n:world:terrain` | `n:world` | Own deterministic terrain layer evaluation, sampling, cell preparation, streaming state, and portable cell evidence. | stable-candidate |
| `n:world:water-surface` | `n:world` | Own renderer-neutral water zones, currents, drag, depth, wave phase, hazards, and spatial queries. | stable-candidate |

## Atomic Kits

| Kit | Domain | Public subpath | Responsibility |
| --- | --- | --- | --- |
| `actor-registry-kit` | `n:actor` | `nexusengine/domains/actor/registry` | Own neutral actor identities and embodiment references. |
| `creature-registry-kit` | `n:actor:creature` | `nexusengine/domains/actor/creature` | Register and resolve neutral creature embodiment definitions. |
| `character-registry-kit` | `n:actor:character` | `nexusengine/domains/actor/character` | Register and resolve active embodied character descriptors. |
| `player-authority-kit` | `n:actor:player` | `nexusengine/domains/actor/player` | Track player identity, possession, control authority, and spawn generations. |
| `agent-cycle-kit` | `n:agent` | `nexusengine/domains/agent/cycle` | Record observations, action proposals, decision cycles, and execution receipts. |
| `asset-registry-kit` | `n:asset` | `nexusengine/domains/asset/registry` | Resolve asset manifests and bundles through content-addressed provider jobs. |
| `project-source-kit` | `n:build:source` | `nexusengine/domains/build/source/project-source` | Read a deterministic project inventory without following links or mutating source. |
| `source-fingerprint-kit` | `n:build:source` | `nexusengine/domains/build/source/source-fingerprint` | Create the canonical SHA-256 project fingerprint. |
| `dependency-source-kit` | `n:build:source` | `nexusengine/domains/build/source/dependency-source` | Resolve exact dependency source identities and recursive lockfile closure. |
| `source-cache-kit` | `n:build:source` | `nexusengine/domains/build/source/source-cache` | Store and verify immutable source bytes by SHA-256. |
| `module-graph-kit` | `n:build:source` | `nexusengine/domains/build/source/module-graph` | Build a deterministic AST-derived module graph. |
| `javascript-ast-kit` | `n:build:analysis` | `nexusengine/domains/build/analysis/javascript-ast` | Parse JavaScript and TypeScript with a real compiler AST. |
| `type-analysis-kit` | `n:build:analysis` | `nexusengine/domains/build/analysis/type-analysis` | Run typed compiler diagnostics without emitting or mutating source. |
| `effect-analysis-kit` | `n:build:analysis` | `nexusengine/domains/build/analysis/effect-analysis` | Classify ambient capabilities and unsupported dynamic effects from AST nodes. |
| `dependency-analysis-kit` | `n:build:analysis` | `nexusengine/domains/build/analysis/dependency-analysis` | Prove relative and external dependency closure. |
| `kit-ir-kit` | `n:build:ir` | `nexusengine/domains/build/ir/kit-ir` | Create serializable high-level Kit IR with source lineage. |
| `execution-ir-kit` | `n:build:ir` | `nexusengine/domains/build/ir/execution-ir` | Create deterministic dependency-ordered Execution IR. |
| `ir-validation-kit` | `n:build:ir` | `nexusengine/domains/build/ir/ir-validation` | Reject invalid, cyclic, unsupported, or incomplete IR. |
| `source-map-kit` | `n:build:ir` | `nexusengine/domains/build/ir/source-map` | Map generated execution operations to source AST identities. |
| `portability-classifier-kit` | `n:build:classification` | `nexusengine/domains/build/classification/portability-classifier` | Classify each whole module and composition as native, native-adapter, JavaScript, or unsupported. |
| `capability-resolution-kit` | `n:build:classification` | `nexusengine/domains/build/classification/capability-resolution` | Resolve target capabilities and exact reviewed substitutions. |
| `fallback-selection-kit` | `n:build:classification` | `nexusengine/domains/build/classification/fallback-selection` | Select fail-closed whole-Kit fallback per target and profile. |
| `build-request-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-request` | Normalize one project, profile, options, and target set. |
| `target-set-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/target-set` | Normalize repeated target flags into one sorted unique set. |
| `build-plan-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-plan` | Create the immutable deterministic multi-target plan hash. |
| `build-approval-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-approval` | Require approval for the exact unchanged plan hash. |
| `build-execution-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-execution` | Execute shared stages once and isolated target stages with project immutability proof. |
| `build-receipt-kit` | `n:build:orchestration` | `nexusengine/domains/build/orchestration/build-receipt` | Persist aggregate and per-target exactly-once Build receipts. |
| `rust-lowering-kit` | `n:build:compile` | `nexusengine/domains/build/compile/rust-lowering` | Lower supported Execution IR into deterministic Rust source. |
| `javascript-fallback-kit` | `n:build:compile` | `nexusengine/domains/build/compile/javascript-fallback` | Execute capability-restricted whole-Kit QuickJS-NG fallback. |
| `runtime-abi-kit` | `n:build:compile` | `nexusengine/domains/build/compile/runtime-abi` | Define the stable native runtime handle and batch-operation ABI. |
| `native-runtime-link-kit` | `n:build:compile` | `nexusengine/domains/build/compile/native-runtime-link` | Create exact generated-runtime and native-library link plans. |
| `toolchain-source-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/toolchain-source` | Own immutable official toolchain and native dependency source records. |
| `toolchain-discovery-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/toolchain-discovery` | Discover installed toolchains without shell evaluation. |
| `toolchain-provision-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/toolchain-provision` | Provision approved exact official sources on demand after integrity and license checks. |
| `isolated-stage-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/isolated-stage` | Create content-addressed build stages outside projects. |
| `process-execution-kit` | `n:build:toolchain` | `nexusengine/domains/build/toolchain/process-execution` | Run argument-array commands inside an allowed Build stage. |
| `target-registry-kit` | `n:build:target` | `nexusengine/domains/build/target/target-registry` | Register explicit target providers and reject collisions. |
| `web-live-target-kit` | `n:build:target:web-live` | `nexusengine/domains/build/target/web-live/web-live-target` | Emit verified live ESM source, loader, service worker, and cache policy. |
| `web-static-target-kit` | `n:build:target:web-static` | `nexusengine/domains/build/target/web-static/web-static-target` | Emit a self-contained static Web directory. |
| `openxr-runtime-kit` | `n:build:target:openxr` | `nexusengine/domains/build/target/openxr/openxr-runtime` | Own OpenXR loader, session, spaces, frame timing, and lifecycle contracts. |
| `openxr-input-kit` | `n:build:target:openxr` | `nexusengine/domains/build/target/openxr/openxr-input` | Own OpenXR action sets, bindings, haptics, and input snapshots. |
| `openxr-render-kit` | `n:build:target:openxr` | `nexusengine/domains/build/target/openxr/openxr-render` | Own OpenXR views, swapchains, blend modes, and per-eye submission descriptors. |
| `android-xr-target-kit` | `n:build:target:android-xr` | `nexusengine/domains/build/target/android-xr/android-xr-target` | Own Android ARM64 lifecycle, SDK/NDK, Gradle, APK, and OpenXR binding stages. |
| `pcvr-target-kit` | `n:build:target:pcvr` | `nexusengine/domains/build/target/pcvr/pcvr-target` | Own Windows x64 host, OpenXR loader, executable package, and runtime validation stages. |
| `artifact-cache-kit` | `n:build:artifact` | `nexusengine/domains/build/artifact/artifact-cache` | Reuse successful immutable target artifacts by plan identity. |
| `artifact-manifest-kit` | `n:build:artifact` | `nexusengine/domains/build/artifact/artifact-manifest` | Create canonical per-target artifact manifests. |
| `artifact-integrity-kit` | `n:build:artifact` | `nexusengine/domains/build/artifact/artifact-integrity` | Verify every artifact file against SHA-256. |
| `artifact-output-kit` | `n:build:artifact` | `nexusengine/domains/build/artifact/artifact-output` | Publish immutable artifacts only outside source projects. |
| `project-immutability-kit` | `n:build:proof` | `nexusengine/domains/build/proof/project-immutability` | Compare before and after project fingerprints byte-for-byte. |
| `cross-runtime-parity-kit` | `n:build:proof` | `nexusengine/domains/build/proof/cross-runtime-parity` | Compare canonical replay outputs across target runtimes. |
| `target-validation-kit` | `n:build:proof` | `nexusengine/domains/build/proof/target-validation` | Require target-specific executable artifact validation. |
| `web-module-linker-kit` | `n:build:compile` | `nexusengine/domains/build/compile/web-module-linker` | Materialize a verified, content-addressed browser module closure from immutable project sources. |
| `composition-registry-kit` | `n:composition` | `nexusengine/domains/composition/registry` | Maintain normalized composition metadata and produce deterministic plans and receipts. |
| `compute-graph-kit` | `n:compute` | `nexusengine/domains/compute/graph` | Validate compute descriptors and create deterministic dependency-ordered dispatch plans. |
| `model-registry-kit` | `n:compute:model` | `nexusengine/domains/compute/model` | Register model descriptors and normalize provider-neutral inference requests and results. |
| `diagnostics-kit` | `n:diagnostics` | `nexusengine/domains/diagnostics/runtime` | Collect serializable telemetry, runtime health, determinism, and performance evidence. |
| `debug-descriptor-kit` | `n:diagnostics` | `nexusengine/domains/diagnostics/debug` | Record renderer-neutral rays, markers, scalars, and capture packets for diagnostics. |
| `debug-draw-descriptor-kit` | `n:diagnostics` | `nexusengine/domains/diagnostics/debug-draw` | Create stateless renderer-neutral debug draw descriptors. |
| `host-capability-kit` | `n:host` | `nexusengine/domains/host/capabilities` | Describe available host capabilities and select declarative fallback modes. |
| `interaction-kit` | `n:interaction` | `nexusengine/domains/interaction/runtime` | Manage interaction targets, affordances, activation, and results. |
| `input-contract-kit` | `n:interaction:input` | `nexusengine/domains/interaction/input` | Normalize semantic input actions, axes, contexts, and bindings. |
| `assistance-target-kit` | `n:interaction:assistance-target` | `nexusengine/domains/interaction/assistance-target` | Own assistance target urgency, attachment, terminal completion, loss, and deterministic selection. |
| `environmental-affordance-kit` | `n:interaction:environmental-affordance` | `nexusengine/domains/interaction/environmental-affordance` | Own read-only affordance proximity queries and exact-once activation progress. |
| `request-queue-kit` | `n:interaction:request:queue` | `nexusengine/domains/interaction/request/queue` | Own deterministic queued requests, patience, fulfillment, expiry, and portable effect descriptors. |
| `request-fulfillment-kit` | `n:interaction:request:fulfillment` | `nexusengine/domains/interaction/request/fulfillment` | Own spatial request destinations, deadlines, completion, expiry, and reward totals. |
| `transfer-zone-kit` | `n:interaction:transfer-zone` | `nexusengine/domains/interaction/transfer-zone` | Own accepted types, dwell, capacity, occupancy, and exact-once transfer completions. |
| `occupant-request-adapter-kit` | `n:interaction:request:queue` | `nexusengine/domains/interaction/adapters/occupant-request` | Translate Occupant Flow need records into exact-once Request Queue entries. |
| `transport-request-adapter-kit` | `n:interaction:request:queue` | `nexusengine/domains/interaction/adapters/transport-request` | Translate Transport Route arrivals into exact-once Request Queue fulfillment commands. |
| `request-economy-adapter-kit` | `n:interaction:request:queue` | `nexusengine/domains/interaction/adapters/request-economy` | Translate fulfilled or expired Request Queue outcomes into exact-once Economy transactions. |
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
| `physics-domain-contract-kit` | `n:physics` | `nexusengine/domains/physics/contract` | Expose the canonical backend-neutral Physics ownership and contract boundary. |
| `physics-provider-contract-kit` | `n:physics:contracts` | `nexusengine/domains/physics/provider-contract` | Describe and validate backend Physics providers without owning a concrete solver. |
| `physics-state-schema-kit` | `n:physics:contracts` | `nexusengine/domains/physics/state-schema` | Validate and normalize portable Physics snapshots for deterministic replay. |
| `physics-command-schema-kit` | `n:physics:contracts` | `nexusengine/domains/physics/command-schema` | Define deterministic, exact-once Physics command envelopes. |
| `physics-event-schema-kit` | `n:physics:contracts` | `nexusengine/domains/physics/event-schema` | Define ordered, portable Physics event envelopes. |
| `physics-query-schema-kit` | `n:physics:contracts` | `nexusengine/domains/physics/query-schema` | Define read-only portable Physics query request and result envelopes. |
| `physics-installation-kit` | `n:physics:lifecycle` | `nexusengine/domains/physics/lifecycle/installation` | Own the aggregate phase and provider identity for one installed Physics composition. |
| `physics-startup-kit` | `n:physics:lifecycle` | `nexusengine/domains/physics/lifecycle/startup` | Own deterministic startup requests and provider-readiness receipts. |
| `physics-step-kit` | `n:physics:lifecycle` | `nexusengine/domains/physics/lifecycle/step` | Own deterministic Physics step requests, completion ordering, and provider-neutral frame receipts. |
| `physics-shutdown-kit` | `n:physics:lifecycle` | `nexusengine/domains/physics/lifecycle/shutdown` | Own deterministic provider shutdown requests and completion receipts. |
| `physics-reset-kit` | `n:physics:lifecycle` | `nexusengine/domains/physics/lifecycle/reset` | Reset composed Physics lifecycle state atomically through public capability APIs. |
| `physics-snapshot-kit` | `n:physics:lifecycle` | `nexusengine/domains/physics/lifecycle/snapshot` | Capture and atomically restore portable snapshots of composed Physics lifecycle state. |
| `friction-material-kit` | `n:physics:material` | `nexusengine/domains/physics/material/friction` | Normalize portable isotropic and anisotropic physical friction descriptors. |
| `restitution-material-kit` | `n:physics:material` | `nexusengine/domains/physics/material/restitution` | Normalize physical restitution coefficient and activation-threshold descriptors. |
| `density-material-kit` | `n:physics:material` | `nexusengine/domains/physics/material/density` | Normalize positive SI physical mass-density descriptors. |
| `surface-material-kit` | `n:physics:material` | `nexusengine/domains/physics/material/surface` | Normalize renderer-neutral physical surface classification and tags. |
| `material-combine-policy-kit` | `n:physics:material` | `nexusengine/domains/physics/material/combine-policy` | Resolve physical material pairs with deterministic symmetric coefficient-combine policy. |
| `physics-material-kit` | `n:physics:material` | `nexusengine/domains/physics/material/registry` | Own immutable portable physical material records and exact-once registry mutations. |
| `physics-world-settings-kit` | `n:physics:world` | `nexusengine/domains/physics/world/settings` | Normalize portable Physics coordinate, unit, bounds, and out-of-bounds settings. |
| `gravity-field-kit` | `n:physics:world` | `nexusengine/domains/physics/world/gravity-field` | Own portable deterministic uniform and point-gravity field records and sampling. |
| `force-field-kit` | `n:physics:world` | `nexusengine/domains/physics/world/force-field` | Own portable deterministic non-gravity force and acceleration field records and sampling. |
| `wind-field-kit` | `n:physics:world` | `nexusengine/domains/physics/world/wind-field` | Own portable deterministic physical flow-velocity field records and sampling. |
| `time-scale-kit` | `n:physics:world` | `nexusengine/domains/physics/world/time-scale` | Own portable deterministic Physics-only time-scale records and delta resolution. |
| `simulation-region-kit` | `n:physics:world` | `nexusengine/domains/physics/world/simulation-region` | Own portable physical simulation activation regions and deterministic point resolution. |
| `physics-world-kit` | `n:physics:world` | `nexusengine/domains/physics/world/registry` | Own immutable Physics world records and compose public field, scale, and region capabilities into read-only samples. |
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
| `third-person-camera-kit` | `n:presentation:camera:third-person` | `nexusengine/domains/presentation/camera/third-person` | Produce deterministic renderer-neutral third-person camera descriptors from public Character and Motion bindings. |
| `camera-world-occlusion-adapter-kit` | `n:presentation:camera:third-person` | `nexusengine/domains/presentation/adapters/camera-world-occlusion` | Constrain Third-Person Camera descriptors with public terrain and physics query results without owning camera or world state. |
| `render-domain-contract-kit` | `n:render` | `nexusengine/domains/render/contract` | Expose the canonical backend-neutral Render ownership and execution-contract boundary. |
| `render-provider-contract-kit` | `n:render:contracts` | `nexusengine/domains/render/provider-contract` | Validate concrete Render providers without executing or retaining provider code or handles. |
| `render-resource-schema-kit` | `n:render:contracts` | `nexusengine/domains/render/resource-schema` | Validate and normalize portable Render resource records without exposing backend handles. |
| `render-frame-schema-kit` | `n:render:contracts` | `nexusengine/domains/render/frame-schema` | Validate and normalize portable Render frame execution records. |
| `render-pass-schema-kit` | `n:render:contracts` | `nexusengine/domains/render/pass-schema` | Validate and normalize resolved provider-facing Render pass records without owning Presentation graph planning. |
| `shader-schema-kit` | `n:render:contracts` | `nexusengine/domains/render/shader-schema` | Validate and normalize portable shader-interface records shared by Render providers. |
| `render-event-schema-kit` | `n:render:contracts` | `nexusengine/domains/render/event-schema` | Validate and normalize ordered portable Render lifecycle and execution events. |
| `render-installation-kit` | `n:render:lifecycle` | `nexusengine/domains/render/lifecycle/installation` | Own the aggregate phase and provider identity for one installed Render composition. |
| `render-startup-kit` | `n:render:lifecycle` | `nexusengine/domains/render/lifecycle/startup` | Own deterministic startup requests and provider-readiness receipts. |
| `render-shutdown-kit` | `n:render:lifecycle` | `nexusengine/domains/render/lifecycle/shutdown` | Own deterministic provider shutdown requests and completion receipts. |
| `render-recovery-kit` | `n:render:lifecycle` | `nexusengine/domains/render/lifecycle/recovery` | Coordinate deterministic recovery from a failed Render provider lifecycle without owning provider repair execution. |
| `render-reset-kit` | `n:render:lifecycle` | `nexusengine/domains/render/lifecycle/reset` | Reset composed Render lifecycle state atomically through public capability APIs. |
| `render-snapshot-kit` | `n:render:lifecycle` | `nexusengine/domains/render/lifecycle/snapshot` | Capture and atomically restore portable snapshots of composed Render lifecycle state. |
| `render-device-contract-kit` | `n:render:device` | `nexusengine/domains/render/device/contract` | Define the portable identity and ownership boundary for one Render device. |
| `device-feature-kit` | `n:render:device` | `nexusengine/domains/render/device/feature` | Own canonical Render device feature declarations and deterministic requirement negotiation. |
| `device-limit-kit` | `n:render:device` | `nexusengine/domains/render/device/limit` | Own portable Render device limit profiles and deterministic requirement checks. |
| `device-capability-kit` | `n:render:device` | `nexusengine/domains/render/device/capability` | Compose a portable Render device identity, feature set, and limit profile into one capability record. |
| `device-memory-kit` | `n:render:device` | `nexusengine/domains/render/device/memory` | Own portable memory budgets, semantic reservations, and exact-once accounting receipts. |
| `device-queue-kit` | `n:render:device` | `nexusengine/domains/render/device/queue` | Own logical Render queue descriptors and exact-once submission and completion receipts. |
| `device-lifecycle-kit` | `n:render:device` | `nexusengine/domains/render/device/lifecycle` | Own portable acquisition, readiness, loss, failure, recovery, and release state for one selected Render device. |
| `device-loss-kit` | `n:render:device` | `nexusengine/domains/render/device/loss` | Own exact-once Render device loss incidents and externally proven resolution records. |
| `device-diagnostics-kit` | `n:render:device` | `nexusengine/domains/render/device/diagnostics` | Project deterministic read-only diagnostics from public Render device capabilities. |
| `render-resource-contract-kit` | `n:render:resource` | `nexusengine/domains/render/resource/contract` | Define portable Render execution-resource identity, lifecycle, operation, and provider receipt contracts. |
| `resource-identity-kit` | `n:render:resource` | `nexusengine/domains/render/resource/identity` | Own deterministic Render execution-resource identities, revisions, and dependency lineage. |
| `resource-state-kit` | `n:render:resource` | `nexusengine/domains/render/resource/state` | Define portable Render resource phases and legal lifecycle transitions. |
| `resource-reference-kit` | `n:render:resource` | `nexusengine/domains/render/resource/reference` | Own exact, portable references to Render execution-resource identities. |
| `resource-integrity-kit` | `n:render:resource` | `nexusengine/domains/render/resource/integrity` | Record portable integrity comparisons for exact Render resource identities. |
| `resource-cache-kit` | `n:render:resource` | `nexusengine/domains/render/resource/cache` | Index reusable provider resources by exact portable content identity and deterministic access order. |
| `resource-budget-kit` | `n:render:resource` | `nexusengine/domains/render/resource/budget` | Map exact Render resource identities to existing Device Memory reservations without duplicating capacity authority. |
| `resource-upload-kit` | `n:render:resource` | `nexusengine/domains/render/resource/upload` | Record exact Render resource upload requests, provider receipts, and failures against completed Device Queue submissions. |
| `resource-release-kit` | `n:render:resource` | `nexusengine/domains/render/resource/release` | Record exact Render resource release requests, provider receipts, and failures after reference safety checks. |
| `resource-lifecycle-kit` | `n:render:resource` | `nexusengine/domains/render/resource/lifecycle` | Own the portable lifecycle state of exact Render resource identities using explicit upload and release receipts. |
| `buffer-resource-kit` | `n:render:buffer` | `nexusengine/domains/render/buffer/resource` | Own portable logical Buffer records, exact content revisions, and bounded provider update receipts. |
| `buffer-layout-kit` | `n:render:buffer` | `nexusengine/domains/render/buffer/layout` | Own explicit portable Buffer field formats, member offsets, alignments, and stride. |
| `vertex-buffer-kit` | `n:render:buffer` | `nexusengine/domains/render/buffer/vertex` | Own logical Vertex Buffer views with exact resource, layout, count, and range validation. |
| `index-buffer-kit` | `n:render:buffer` | `nexusengine/domains/render/buffer/index` | Own logical Index Buffer views with exact resource, format, count, alignment, and range validation. |
| `uniform-buffer-kit` | `n:render:buffer` | `nexusengine/domains/render/buffer/uniform` | Own logical Uniform Buffer ranges with exact layout, size, and explicit dynamic-alignment validation. |
| `storage-buffer-kit` | `n:render:buffer` | `nexusengine/domains/render/buffer/storage` | Own logical Storage Buffer ranges with explicit access, layout, element-count, and range validation. |
| `instance-buffer-kit` | `n:render:buffer` | `nexusengine/domains/render/buffer/instance` | Own logical Instance Buffer views with exact resource, layout, count, and range validation. |
| `indirect-buffer-kit` | `n:render:buffer` | `nexusengine/domains/render/buffer/indirect` | Own logical Indirect Buffer command ranges with exact type, count, stride, alignment, and range validation. |
| `texture-format-kit` | `n:render:texture` | `nexusengine/domains/render/texture/format` | Own portable Texture format aspects, block layout, and provider-neutral capability declarations. |
| `texture-resource-kit` | `n:render:texture` | `nexusengine/domains/render/texture/resource` | Own exact logical Texture records derived from canonical Render Resource identities and portable formats. |
| `texture-2d-kit` | `n:render:texture` | `nexusengine/domains/render/texture/2d` | Own logical 2D Texture views with exact identity and mip-range validation. |
| `texture-cube-kit` | `n:render:texture` | `nexusengine/domains/render/texture/cube` | Own logical Cube Texture views with exact identity, six-face, and mip-range validation. |
| `texture-array-kit` | `n:render:texture` | `nexusengine/domains/render/texture/array` | Own logical 2D Texture Array views with exact identity, layer-range, and mip-range validation. |
| `render-target-texture-kit` | `n:render:texture` | `nexusengine/domains/render/texture/render-target` | Own logical color attachment Texture views with exact format and subresource qualification. |
| `depth-texture-kit` | `n:render:texture` | `nexusengine/domains/render/texture/depth` | Own logical depth-stencil Texture views with exact aspect, format, and subresource qualification. |
| `shadow-texture-kit` | `n:render:texture` | `nexusengine/domains/render/texture/shadow` | Own provider-neutral shadow-readable depth views without owning authored shadow policy or execution. |
| `mipmap-kit` | `n:render:texture` | `nexusengine/domains/render/texture/mipmap` | Own explicit portable Texture mip-chain plans with exact contiguous levels and source identities. |
| `texture-stream-kit` | `n:render:texture` | `nexusengine/domains/render/texture/stream` | Own exact Texture subresource stream requests and portable provider completion or failure receipts. |
| `texture-residency-kit` | `n:render:texture` | `nexusengine/domains/render/texture/residency` | Own desired and proven resident Texture subresources derived from completed stream receipts. |
| `shader-contract-kit` | `n:render:shader` | `nexusengine/domains/render/shader/contract` | Define the canonical provider-neutral Shader execution boundary and stage topology. |
| `shader-language-kit` | `n:render:shader` | `nexusengine/domains/render/shader/language` | Own portable Shader language capabilities, source kinds, stages, and feature requirements. |
| `shader-source-kit` | `n:render:shader` | `nexusengine/domains/render/shader/source` | Own immutable text or binary Shader source revisions and exact integrity. |
| `shader-include-kit` | `n:render:shader` | `nexusengine/domains/render/shader/include` | Own immutable Shader include records and a deterministic acyclic dependency graph. |
| `shader-module-kit` | `n:render:shader` | `nexusengine/domains/render/shader/module` | Own one portable Shader stage module, entry point, and exact source closure. |
| `shader-program-kit` | `n:render:shader` | `nexusengine/domains/render/shader/program` | Own linked portable Shader program topology and its canonical interface. |
| `shader-variant-kit` | `n:render:shader` | `nexusengine/domains/render/shader/variant` | Own exact Shader define and specialization selections with deterministic identity. |
| `shader-permutation-kit` | `n:render:shader` | `nexusengine/domains/render/shader/permutation` | Own bounded deterministic Shader permutation axes and read-only expansion. |
| `shader-error-kit` | `n:render:shader` | `nexusengine/domains/render/shader/error` | Normalize portable Shader diagnostics without owning compiler execution or repair. |
| `shader-compile-kit` | `n:render:shader` | `nexusengine/domains/render/shader/compile` | Own exact-once logical Shader compile requests and provider completion or failure receipts. |
| `shader-reflection-kit` | `n:render:shader` | `nexusengine/domains/render/shader/reflection` | Validate normalized provider reflection against the completed compile and program interface. |
| `shader-cache-kit` | `n:render:shader` | `nexusengine/domains/render/shader/cache` | Link completed Shader compiles to resident shader-program Render Resources and select deterministic eviction candidates. |
| `material-contract-kit` | `n:render:material` | `nexusengine/domains/render/material/contract` | Define the canonical backend-neutral Render Material execution boundary. |
| `material-binding-kit` | `n:render:material` | `nexusengine/domains/render/material/binding` | Map portable Material slots to one exact Shader program interface. |
| `material-parameter-kit` | `n:render:material` | `nexusengine/domains/render/material/parameter` | Own typed portable values for exact Material parameter slots. |
| `texture-binding-kit` | `n:render:material` | `nexusengine/domains/render/material/texture-binding` | Bind exact resident Texture views and subresources to Material slots. |
| `sampler-binding-kit` | `n:render:material` | `nexusengine/domains/render/material/sampler-binding` | Own portable sampler state for exact Material sampler slots. |
| `material-instance-kit` | `n:render:material` | `nexusengine/domains/render/material/instance` | Compose one complete portable Material execution instance from exact bindings. |
| `material-variant-kit` | `n:render:material` | `nexusengine/domains/render/material/variant` | Resolve an exact Shader variant and complete Material binding override set. |
| `material-validation-kit` | `n:render:material` | `nexusengine/domains/render/material/validation` | Prove one Material target against exact completed Shader compile and reflection records. |
| `material-cache-kit` | `n:render:material` | `nexusengine/domains/render/material/cache` | Link current Material validation to an exact resident material Render Resource. |
| `runtime-lifecycle-kit` | `n:runtime` | `nexusengine/domains/runtime/lifecycle` | Own deterministic runtime lifecycle and Kit installation receipts. |
| `realtime-runtime-kit` | `n:runtime:realtime` | `nexusengine/domains/runtime/realtime` | Create deterministic realtime frame context and phase execution. |
| `runtime-data-kit` | `n:runtime:data` | `nexusengine/domains/runtime/data` | Provide deterministic schemas, snapshots, selectors, migrations, and data envelopes. |
| `transaction-ledger-kit` | `n:runtime:transaction` | `nexusengine/domains/runtime/transaction` | Record repeat-safe operation keys and immutable transaction receipts. |
| `persistence-contract-kit` | `n:runtime:persistence` | `nexusengine/domains/runtime/persistence` | Describe save/load targets, slots, recovery records, and persistence adapter contracts. |
| `runtime-sequence-kit` | `n:runtime:sequence` | `nexusengine/domains/runtime/sequence` | Install deterministic sequence node definitions and execution state. |
| `runtime-startup-kit` | `n:runtime:startup` | `nexusengine/domains/runtime/startup` | Coordinate deterministic startup preparation and readiness receipts. |
| `schedule-kit` | `n:runtime:sequence:schedule` | `nexusengine/domains/runtime/sequence/schedule` | Advance deterministic repeatable and one-shot elapsed-time schedules without losing residual time. |
| `simulation-state-kit` | `n:simulation` | `nexusengine/domains/simulation/runtime` | Manage deterministic simulation objectives, resources, hazards, timers, and resolution receipts. |
| `simulation-physics-contract-kit` | `n:simulation:physics` | `nexusengine/domains/simulation/physics` | Describe physical bodies, colliders, contacts, constraints, queries, and provider boundaries. |
| `articulated-physics-kit` | `n:simulation:physics:articulated` | `nexusengine/domains/simulation/physics/articulated` | Manage backend-neutral articulated body topology and joint dynamics state. |
| `motion-contract-kit` | `n:simulation:motion` | `nexusengine/domains/simulation/motion` | Manage intent-to-motion descriptors, trajectories, velocity state, and movement policies. |
| `two-bone-ik-kit` | `n:simulation:motion` | `nexusengine/domains/simulation/motion/two-bone-ik` | Solve deterministic two-bone inverse-kinematics poses. |
| `articulated-motion-kit` | `n:simulation:motion:articulated` | `nexusengine/domains/simulation/motion/articulated` | Create target poses, joint limits, articulation plans, and drive requests. |
| `articulated-motion-drive-adapter-kit` | `n:simulation:physics:articulated` | `nexusengine/domains/simulation/adapters/articulated-drive` | Translate articulated motion plans into backend-neutral physics drive requests. |
| `action-locomotion-kit` | `n:simulation:motion:locomotion` | `nexusengine/domains/simulation/motion/locomotion` | Convert action commands into deterministic renderer-neutral Motion intents and locomotion frames. |
| `vehicle-dynamics-kit` | `n:simulation:motion:vehicle` | `nexusengine/domains/simulation/motion/vehicle` | Advance deterministic vehicle motion, boost, bounds, and impact state without owning surface policy. |
| `world-contact-kit` | `n:simulation:physics:world-contact` | `nexusengine/domains/simulation/physics/world-contact` | Resolve portable world contact, slope, impact, stability, and correction records without implementing a physics backend. |
| `soft-respawn-kit` | `n:simulation:recovery:soft-respawn` | `nexusengine/domains/simulation/recovery/soft-respawn` | Produce exact-once coherent subject recovery records at configured portable points. |
| `economy-account-kit` | `n:simulation:economy:accounts` | `nexusengine/domains/simulation/economy/accounts` | Own finite account balances and exact-once portable economy transaction records. |
| `cargo-manifest-kit` | `n:simulation:economy:cargo` | `nexusengine/domains/simulation/economy/cargo` | Own portable cargo inventory, capacity, condition, pickup, deposit, and quota state. |
| `facility-operations-kit` | `n:simulation:operations:facility` | `nexusengine/domains/simulation/operations/facility` | Own deterministic facility capacity, condition, status, cycle, and portable output receipts. |
| `occupant-flow-kit` | `n:simulation:operations:occupant-flow` | `nexusengine/domains/simulation/operations/occupant-flow` | Own deterministic occupant spawning, patience, service, and abandonment state. |
| `transport-route-kit` | `n:simulation:operations:transport-route` | `nexusengine/domains/simulation/operations/transport-route` | Own deterministic stops, carriers, capacity, calls, travel progress, and arrival receipts. |
| `hazard-field-kit` | `n:simulation:hazard-field` | `nexusengine/domains/simulation/hazard-field` | Own deterministic bounded hazards, verified spawn identities, motion, and read-only collision queries. |
| `pursuit-pressure-kit` | `n:simulation:pursuit-pressure` | `nexusengine/domains/simulation/pursuit-pressure` | Own coherent pursuit distance, warning bands, caught state, recovery, and transition history. |
| `lifecycle-progression-kit` | `n:simulation:progression:lifecycle` | `nexusengine/domains/simulation/progression/lifecycle` | Own prerequisite-gated lifecycle start, timing, completion, and portable effect descriptors. |
| `locomotion-contact-response-adapter-kit` | `n:simulation:motion:locomotion` | `nexusengine/domains/simulation/adapters/locomotion-contact-response` | Translate Locomotion frames and World Contact results into corrected Motion frames without owning either state. |
| `vehicle-water-response-adapter-kit` | `n:simulation:motion:vehicle` | `nexusengine/domains/simulation/adapters/vehicle-water-response` | Translate Vehicle state and Water Surface queries into portable drag, current, and buoyancy responses. |
| `lifecycle-economy-adapter-kit` | `n:simulation:progression:lifecycle` | `nexusengine/domains/simulation/adapters/lifecycle-economy` | Translate accepted Lifecycle costs and Economy effects into exact-once Economy transactions. |
| `lifecycle-facility-adapter-kit` | `n:simulation:progression:lifecycle` | `nexusengine/domains/simulation/adapters/lifecycle-facility` | Translate accepted Lifecycle facility effects into exact-once Facility Operations commands. |
| `facility-economy-adapter-kit` | `n:simulation:operations:facility` | `nexusengine/domains/simulation/adapters/facility-economy` | Translate Facility output and upkeep receipts into exact-once Economy transactions. |
| `spatial-contract-kit` | `n:spatial` | `nexusengine/domains/spatial/contracts` | Describe transforms, bounds, zones, spaces, and spatial query requests. |
| `spatial-angle-math-kit` | `n:spatial` | `nexusengine/domains/spatial/angle-math` | Normalize, compare, and interpolate angular values. |
| `spatial-vector-math-kit` | `n:spatial` | `nexusengine/domains/spatial/vector-math` | Create and operate on renderer-neutral vector values. |
| `spatial-transform-math-kit` | `n:spatial` | `nexusengine/domains/spatial/transform-math` | Calculate deterministic transforms, bases, interpolation, and planar projections. |
| `spatial-quaternion-math-kit` | `n:spatial` | `nexusengine/domains/spatial/quaternion-math` | Create, compose, normalize, rotate, and interpolate quaternions. |
| `spatial-scale-kit` | `n:spatial:scale` | `nexusengine/domains/spatial/scale` | Manage deterministic subject scale, scale anchors, proximity bands, and scale transitions. |
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
| `navmesh-kit` | `n:world:navigation:navmesh` | `nexusengine/domains/world/navigation/navmesh` | Build deterministic 2D navigation meshes and portable 3D waypoint graphs from walkability. |
| `pathfinding-kit` | `n:world:navigation:pathfinding` | `nexusengine/domains/world/navigation/pathfinding` | Resolve deterministic A* path requests over portable grid and navigation graph adapters. |
| `route-field-kit` | `n:world:navigation:route-field` | `nexusengine/domains/world/navigation/route-field` | Manage reusable route marker and corridor descriptors plus pure proximity queries. |
| `landmark-guidance-kit` | `n:world:navigation:landmark-guidance` | `nexusengine/domains/world/navigation/landmark-guidance` | Manage deterministic landmark discovery, reach, completion, priority, and proximity state. |
| `procedural-generation-kit` | `n:world:generation` | `nexusengine/domains/world/generation` | Generate deterministic generic regions, connectors, points, graphs, and walkability from complete normalized configuration. |
| `terrain-kit` | `n:world:terrain` | `nexusengine/domains/world/terrain` | Evaluate deterministic terrain layers and manage portable sampled terrain cells without rendering ownership. |
| `water-surface-kit` | `n:world:water-surface` | `nexusengine/domains/world/water-surface` | Manage renderer-neutral water zones, currents, drag, wave phase, hazards, and pure queries. |
