# Render Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:render`
- Status: `stable-candidate`
- Registry SHA-256: `a5e0ac2156e86da208c6525d7c611d0245d7d1a57f5e5f186fbe83bac2f04e82`
- Public entry: `nexusengine/domains/render`

## Responsibility

Own the canonical backend-neutral render-execution boundary and compose its atomic capability subdomains.

## Owns

- Render domain identity
- Render execution capability catalog
- provider-neutral Render contracts, lifecycle, portable device state, Surface state, resource state, Buffer state, Texture state, Shader state, and Material execution state

## Does Not Own

- Presentation descriptor ownership
- authored visual content
- concrete GPU or renderer implementation
- host surface implementation
- target packaging

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:render:contracts` | Own portable Render provider, resource, frame, resolved-pass, shader-interface, and event boundary schemas. |
| `n:render:lifecycle` | Own provider-neutral Render composition installation, startup, shutdown, reset, snapshot, and recovery state. |
| `n:render:device` | Own portable Render device contracts, capability negotiation, semantic accounting, lifecycle, loss, and diagnostics. |
| `n:render:surface` | Own portable output-surface descriptors, logical regions, format choices, and deterministic transition intents. |
| `n:render:resource` | Own portable Render execution-resource identity, references, semantic residency, accounting, operation receipts, and lifecycle state. |
| `n:render:buffer` | Own portable logical Buffer descriptors, explicit layouts, semantic typed views, and bounded provider update receipts. |
| `n:render:texture` | Own portable logical Texture descriptors, typed views, formats, mip plans, streaming records, and proven subresource residency. |
| `n:render:shader` | Own provider-neutral Shader source lineage, module and program composition, variants, compile state, reflection observations, and semantic cache links. |
| `n:render:material` | Own portable backend-neutral Material execution bindings, aggregate validation, and semantic cache links. |
| `n:render:camera` | Own portable camera binding, view, projection, viewport, stereo, multiview, jitter, and reprojection semantics. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `render-domain-contract-kit` | `nexusengine/domains/render/contract` | Expose the canonical backend-neutral Render ownership and execution-contract boundary. |
| `render-provider-contract-kit` | `nexusengine/domains/render/provider-contract` | Validate concrete Render providers without executing or retaining provider code or handles. |
| `render-resource-schema-kit` | `nexusengine/domains/render/resource-schema` | Validate and normalize portable Render resource records without exposing backend handles. |
| `render-frame-schema-kit` | `nexusengine/domains/render/frame-schema` | Validate and normalize portable Render frame execution records. |
| `render-pass-schema-kit` | `nexusengine/domains/render/pass-schema` | Validate and normalize resolved provider-facing Render pass records without owning Presentation graph planning. |
| `shader-schema-kit` | `nexusengine/domains/render/shader-schema` | Validate and normalize portable shader-interface records shared by Render providers. |
| `render-event-schema-kit` | `nexusengine/domains/render/event-schema` | Validate and normalize ordered portable Render lifecycle and execution events. |
| `render-installation-kit` | `nexusengine/domains/render/lifecycle/installation` | Own the aggregate phase and provider identity for one installed Render composition. |
| `render-startup-kit` | `nexusengine/domains/render/lifecycle/startup` | Own deterministic startup requests and provider-readiness receipts. |
| `render-shutdown-kit` | `nexusengine/domains/render/lifecycle/shutdown` | Own deterministic provider shutdown requests and completion receipts. |
| `render-recovery-kit` | `nexusengine/domains/render/lifecycle/recovery` | Coordinate deterministic recovery from a failed Render provider lifecycle without owning provider repair execution. |
| `render-reset-kit` | `nexusengine/domains/render/lifecycle/reset` | Reset composed Render lifecycle state atomically through public capability APIs. |
| `render-snapshot-kit` | `nexusengine/domains/render/lifecycle/snapshot` | Capture and atomically restore portable snapshots of composed Render lifecycle state. |
| `render-device-contract-kit` | `nexusengine/domains/render/device/contract` | Define the portable identity and ownership boundary for one Render device. |
| `device-feature-kit` | `nexusengine/domains/render/device/feature` | Own canonical Render device feature declarations and deterministic requirement negotiation. |
| `device-limit-kit` | `nexusengine/domains/render/device/limit` | Own portable Render device limit profiles and deterministic requirement checks. |
| `device-capability-kit` | `nexusengine/domains/render/device/capability` | Compose a portable Render device identity, feature set, and limit profile into one capability record. |
| `device-memory-kit` | `nexusengine/domains/render/device/memory` | Own portable memory budgets, semantic reservations, and exact-once accounting receipts. |
| `device-queue-kit` | `nexusengine/domains/render/device/queue` | Own logical Render queue descriptors and exact-once submission and completion receipts. |
| `device-lifecycle-kit` | `nexusengine/domains/render/device/lifecycle` | Own portable acquisition, readiness, loss, failure, recovery, and release state for one selected Render device. |
| `device-loss-kit` | `nexusengine/domains/render/device/loss` | Own exact-once Render device loss incidents and externally proven resolution records. |
| `device-diagnostics-kit` | `nexusengine/domains/render/device/diagnostics` | Project deterministic read-only diagnostics from public Render device capabilities. |
| `render-surface-kit` | `nexusengine/domains/render/surface/render-surface` | Own portable base Render surface descriptors and exact-once lifecycle records. |
| `surface-format-kit` | `nexusengine/domains/render/surface/format` | Own portable color, depth, alpha, sample, and HDR surface format selections. |
| `window-surface-kit` | `nexusengine/domains/render/surface/window` | Own portable window-surface descriptors without host window handles or platform transitions. |
| `offscreen-surface-kit` | `nexusengine/domains/render/surface/offscreen` | Own portable offscreen layer, sample, and usage policy while base Surface owns dimensions. |
| `swapchain-surface-kit` | `nexusengine/domains/render/surface/swapchain` | Own portable swapchain requests without creating GPU swapchains or provider handles. |
| `viewport-kit` | `nexusengine/domains/render/surface/viewport` | Own bounded portable viewport regions and depth ranges. |
| `scissor-kit` | `nexusengine/domains/render/surface/scissor` | Own bounded portable scissor regions without issuing provider commands. |
| `resize-kit` | `nexusengine/domains/render/surface/resize` | Own portable resize intents without mutating host or provider surfaces. |
| `fullscreen-kit` | `nexusengine/domains/render/surface/fullscreen` | Own portable fullscreen enter and exit intents without platform execution. |
| `render-resource-contract-kit` | `nexusengine/domains/render/resource/contract` | Define portable Render execution-resource identity, lifecycle, operation, and provider receipt contracts. |
| `resource-identity-kit` | `nexusengine/domains/render/resource/identity` | Own deterministic Render execution-resource identities, revisions, and dependency lineage. |
| `resource-state-kit` | `nexusengine/domains/render/resource/state` | Define portable Render resource phases and legal lifecycle transitions. |
| `resource-reference-kit` | `nexusengine/domains/render/resource/reference` | Own exact, portable references to Render execution-resource identities. |
| `resource-integrity-kit` | `nexusengine/domains/render/resource/integrity` | Record portable integrity comparisons for exact Render resource identities. |
| `resource-cache-kit` | `nexusengine/domains/render/resource/cache` | Index reusable provider resources by exact portable content identity and deterministic access order. |
| `resource-budget-kit` | `nexusengine/domains/render/resource/budget` | Map exact Render resource identities to existing Device Memory reservations without duplicating capacity authority. |
| `resource-upload-kit` | `nexusengine/domains/render/resource/upload` | Record exact Render resource upload requests, provider receipts, and failures against completed Device Queue submissions. |
| `resource-release-kit` | `nexusengine/domains/render/resource/release` | Record exact Render resource release requests, provider receipts, and failures after reference safety checks. |
| `resource-lifecycle-kit` | `nexusengine/domains/render/resource/lifecycle` | Own the portable lifecycle state of exact Render resource identities using explicit upload and release receipts. |
| `buffer-resource-kit` | `nexusengine/domains/render/buffer/resource` | Own portable logical Buffer records, exact content revisions, and bounded provider update receipts. |
| `buffer-layout-kit` | `nexusengine/domains/render/buffer/layout` | Own explicit portable Buffer field formats, member offsets, alignments, and stride. |
| `vertex-buffer-kit` | `nexusengine/domains/render/buffer/vertex` | Own logical Vertex Buffer views with exact resource, layout, count, and range validation. |
| `index-buffer-kit` | `nexusengine/domains/render/buffer/index` | Own logical Index Buffer views with exact resource, format, count, alignment, and range validation. |
| `uniform-buffer-kit` | `nexusengine/domains/render/buffer/uniform` | Own logical Uniform Buffer ranges with exact layout, size, and explicit dynamic-alignment validation. |
| `storage-buffer-kit` | `nexusengine/domains/render/buffer/storage` | Own logical Storage Buffer ranges with explicit access, layout, element-count, and range validation. |
| `instance-buffer-kit` | `nexusengine/domains/render/buffer/instance` | Own logical Instance Buffer views with exact resource, layout, count, and range validation. |
| `indirect-buffer-kit` | `nexusengine/domains/render/buffer/indirect` | Own logical Indirect Buffer command ranges with exact type, count, stride, alignment, and range validation. |
| `texture-format-kit` | `nexusengine/domains/render/texture/format` | Own portable Texture format aspects, block layout, and provider-neutral capability declarations. |
| `texture-resource-kit` | `nexusengine/domains/render/texture/resource` | Own exact logical Texture records derived from canonical Render Resource identities and portable formats. |
| `texture-2d-kit` | `nexusengine/domains/render/texture/2d` | Own logical 2D Texture views with exact identity and mip-range validation. |
| `texture-cube-kit` | `nexusengine/domains/render/texture/cube` | Own logical Cube Texture views with exact identity, six-face, and mip-range validation. |
| `texture-array-kit` | `nexusengine/domains/render/texture/array` | Own logical 2D Texture Array views with exact identity, layer-range, and mip-range validation. |
| `render-target-texture-kit` | `nexusengine/domains/render/texture/render-target` | Own logical color attachment Texture views with exact format and subresource qualification. |
| `depth-texture-kit` | `nexusengine/domains/render/texture/depth` | Own logical depth-stencil Texture views with exact aspect, format, and subresource qualification. |
| `shadow-texture-kit` | `nexusengine/domains/render/texture/shadow` | Own provider-neutral shadow-readable depth views without owning authored shadow policy or execution. |
| `mipmap-kit` | `nexusengine/domains/render/texture/mipmap` | Own explicit portable Texture mip-chain plans with exact contiguous levels and source identities. |
| `texture-stream-kit` | `nexusengine/domains/render/texture/stream` | Own exact Texture subresource stream requests and portable provider completion or failure receipts. |
| `texture-residency-kit` | `nexusengine/domains/render/texture/residency` | Own desired and proven resident Texture subresources derived from completed stream receipts. |
| `shader-contract-kit` | `nexusengine/domains/render/shader/contract` | Define the canonical provider-neutral Shader execution boundary and stage topology. |
| `shader-language-kit` | `nexusengine/domains/render/shader/language` | Own portable Shader language capabilities, source kinds, stages, and feature requirements. |
| `shader-source-kit` | `nexusengine/domains/render/shader/source` | Own immutable text or binary Shader source revisions and exact integrity. |
| `shader-include-kit` | `nexusengine/domains/render/shader/include` | Own immutable Shader include records and a deterministic acyclic dependency graph. |
| `shader-module-kit` | `nexusengine/domains/render/shader/module` | Own one portable Shader stage module, entry point, and exact source closure. |
| `shader-program-kit` | `nexusengine/domains/render/shader/program` | Own linked portable Shader program topology and its canonical interface. |
| `shader-variant-kit` | `nexusengine/domains/render/shader/variant` | Own exact Shader define and specialization selections with deterministic identity. |
| `shader-permutation-kit` | `nexusengine/domains/render/shader/permutation` | Own bounded deterministic Shader permutation axes and read-only expansion. |
| `shader-error-kit` | `nexusengine/domains/render/shader/error` | Normalize portable Shader diagnostics without owning compiler execution or repair. |
| `shader-compile-kit` | `nexusengine/domains/render/shader/compile` | Own exact-once logical Shader compile requests and provider completion or failure receipts. |
| `shader-reflection-kit` | `nexusengine/domains/render/shader/reflection` | Validate normalized provider reflection against the completed compile and program interface. |
| `shader-cache-kit` | `nexusengine/domains/render/shader/cache` | Link completed Shader compiles to resident shader-program Render Resources and select deterministic eviction candidates. |
| `material-contract-kit` | `nexusengine/domains/render/material/contract` | Define the canonical backend-neutral Render Material execution boundary. |
| `material-binding-kit` | `nexusengine/domains/render/material/binding` | Map portable Material slots to one exact Shader program interface. |
| `material-parameter-kit` | `nexusengine/domains/render/material/parameter` | Own typed portable values for exact Material parameter slots. |
| `texture-binding-kit` | `nexusengine/domains/render/material/texture-binding` | Bind exact resident Texture views and subresources to Material slots. |
| `sampler-binding-kit` | `nexusengine/domains/render/material/sampler-binding` | Own portable sampler state for exact Material sampler slots. |
| `material-instance-kit` | `nexusengine/domains/render/material/instance` | Compose one complete portable Material execution instance from exact bindings. |
| `material-variant-kit` | `nexusengine/domains/render/material/variant` | Resolve an exact Shader variant and complete Material binding override set. |
| `material-validation-kit` | `nexusengine/domains/render/material/validation` | Prove one Material target against exact completed Shader compile and reflection records. |
| `material-cache-kit` | `nexusengine/domains/render/material/cache` | Link current Material validation to an exact resident material Render Resource. |
| `camera-binding-kit` | `nexusengine/domains/render/camera/camera-binding` | Own portable camera binding semantics and deterministic state. |
| `camera-jitter-kit` | `nexusengine/domains/render/camera/camera-jitter` | Own portable camera jitter semantics and deterministic state. |
| `camera-projection-kit` | `nexusengine/domains/render/camera/camera-projection` | Own portable camera projection semantics and deterministic state. |
| `camera-reprojection-kit` | `nexusengine/domains/render/camera/camera-reprojection` | Own portable camera reprojection semantics and deterministic state. |
| `camera-view-kit` | `nexusengine/domains/render/camera/camera-view` | Own portable camera view semantics and deterministic state. |
| `camera-viewport-kit` | `nexusengine/domains/render/camera/camera-viewport` | Own portable camera viewport semantics and deterministic state. |
| `multiview-camera-kit` | `nexusengine/domains/render/camera/multiview-camera` | Own portable multiview camera semantics and deterministic state. |
| `stereo-camera-kit` | `nexusengine/domains/render/camera/stereo-camera` | Own portable stereo camera semantics and deterministic state. |

## Lifecycle

- Duplicate install: Return the installed Render API without duplicate state or systems.
- Snapshot: Serialize Render state and descriptors.
- Reset: Restore the configured Render baseline.
