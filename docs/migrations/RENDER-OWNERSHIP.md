# Rendering ownership migration

This migration reorganizes existing Core behavior. Rendering algorithms, backend providers, application pipelines, and NexusGL are unchanged.

## Owners and public entry points

| Former owner / entry | Current owner / entry | Preserved behavior |
| --- | --- | --- |
| Presentation Graphics material helpers | `n:material`, `nexusengine/domains/material` | Appearance, texture parameters, procedural definitions and assignments |
| Render Material | `n:material`, `nexusengine/domains/material/*` | Binding, parameters, textures, samplers, instances, variants, validation, cache lineage |
| Presentation Graphics lighting and reflections | `n:lighting`, `nexusengine/domains/lighting`, `/reflection`, `/adapter` | Light descriptions, probe relationships, negotiation, revisions, update costs and receipts |
| Presentation Camera | `n:camera`, `nexusengine/domains/camera`, `/control`, `/framing`, `/control-math`, `/third-person` | Targets, smoothing, framing, orbit and follow state |
| Render Camera | `n:camera`, `nexusengine/domains/camera/execution/*` | Views, projection, stereo, multiview, jitter, reprojection and viewport records |
| Camera-world adapter | `nexusengine/domains/camera/adapters/camera-world-occlusion` | Public terrain/physics query translation without owning their state |
| Graphics layer graph | `n:render:pipeline`, `nexusengine/domains/render/pipeline` | Pass ordering, dependencies, reads/writes, depth/blend validation and final-scene boundary |
| Graphics render and instance descriptions | `nexusengine/domains/render/pipeline/descriptors` | Portable rendering descriptions |
| Graphics instance batches | `n:render:batch`, `nexusengine/domains/render/batch` | Membership, cells, capacity, ranges, deterministic flushes and snapshots |
| Graphics quality profiles | `nexusengine/domains/render/pipeline/quality` | Existing profile fields and defaults; applications select presets |
| Graphics visual contributions | `nexusengine/domains/render/contribution` | Portable validation, ordering, duplicate rejection and digest |
| Graphics terrain LOD | `nexusengine/domains/world/terrain/lod` | LOD selection and material-policy descriptions; no new geometry algorithm |
| Graphics VFX requests | `nexusengine/domains/presentation/requests` | Existing portable request records; no effects execution system |

Material descriptions and bindings remain separate atomic kits under one owner. Lighting descriptions and reflection policy likewise keep separate state. Camera control and portable execution records stay separate kits. Runtime scheduling, Composition installation, Host capabilities and Compute ownership are unchanged.

Render's Pipeline entry is the relocated existing layer graph. This migration adds no executable Frame scheduler or GPU submission logic. Providers still own allocations, backend handles and rendering execution.

## Consumer migration

Use the new package entries; retired Presentation Graphics, Presentation Camera, Render Material and Render Camera paths are removed without forwarding aliases. `createRenderBatchKit` replaces the broad `createGraphicsKit`, with `engine.n.renderBatch` for batch operations. `createMaterialDomain` and `createCameraExecutionDomain` replace the former Render-prefixed aggregate factories.

`createPresentationDomain` now composes Presentation, Output and UI only. Applications that need framing explicitly install `createCameraFramingKit`. Material descriptions use `createMaterialDescriptorKit` / `engine.n.materialDescriptions`; lighting descriptions use `createLightingDescriptorKit` / `engine.n.lightingDescriptions`. Existing binding APIs such as `engine.n.renderMaterialBindings` and camera APIs such as `engine.n.renderCameraView` retain their names and implementations.

Production Authoring publishing imports the new public semantic entries. Repository tests, generated package exports, the Core catalog, ownership ledger and documentation reflect the new owners. Sibling repositories were not edited: external consumers must migrate their imports and compositions before consuming this checkout.

## Serialized records

Existing leaf record schema identifiers, payload fields, events and algorithms are retained, including historical `render-material`, `render-camera` and `core-graphics.instance-batches/1` identifiers. Such strings identify a data format, not the active semantic owner. Domain-address metadata and graph capability tokens now identify the new owners.

An old full engine installation or broad Graphics snapshot is not implicitly converted. Applications must explicitly repartition their Graphics descriptor collections into the semantic services they use and rebuild the installation graph. The batch snapshot loader remains unchanged; material/camera registry snapshots keep their existing validators. There is no second registry behind an old public alias.

## Scope and evidence

The run record is `.agent/runs/2026-10-18-render-ownership-migration/`. It contains the original focused baseline, path mapping, preservation hashes and current validation results. The shared `.agent/target.md` and tracker remain assigned to the separate build-provider work. The required guided-development controller was unavailable in the local Editor checkout; these are direct execution records, not controller receipts.

Core generation uses `--allow-pending` because the existing Authoring manifest includes pending proof. This does not promote that proof. The full suite and broad boundary gates remain subject to the unrelated failures recorded in the validation report. Native/browser rendering and performance were not exercised: no renderer or host implementation changed.

## Next step

Review this ownership migration and migrate external application imports. Then separately map NexusGL to the Render provider contract and build one application composition as the integration proof. Any missing Frame execution coordination should be justified by that mapping before adding new Core services. No provider implementation, new graphics feature, workflow, release or publication is included here.
