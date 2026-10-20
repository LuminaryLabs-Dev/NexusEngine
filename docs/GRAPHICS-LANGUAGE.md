# Graphics Language Kit

Install one optional kit to use NexusGL through Core's Material and Render contracts. No renderer is loaded by ordinary Core imports. NexusGL is the included default provider; another application can supply a conforming provider.

## Install and run

Node 20+ is required. Browser rendering needs ES modules, WebAssembly, Web Crypto and Canvas 2D. Native artifacts target macOS 14+ arm64 with Node's N-API 8 (verified on 14.5). The shipped artifacts do not require a compiler or downloads to run. Source rebuilds require C++17, the Node headers, Apple's SDK for the window adapter, and Emscripten 6.0.12 for WASM.

```js
import { createEngine } from 'nexusengine';
import { installGraphicsLanguage } from 'nexusengine/domains/render/graphics-language';

const engine = createEngine();
const graphics = installGraphicsLanguage(engine, {
  canvas: document.querySelector('canvas'), // browser presentation
  backend: 'wasm'
});
await graphics.ready; // failure rejects and is recorded in Render startup state
```

For a macOS window, replace `canvas` with `nativeWindow: true` and use `backend: 'auto'` or `'native'`. For an application-owned adapter, supply `host`. Poll `graphics.getSurfaceState()` from your application tick to process native window events and read resize/close state even when no frame is submitted. Omitting these selects an offscreen frame host, useful for servers and numerical checks. `auto` selects the included native binary on a matching platform, otherwise WASM; artifact/load failures are reported rather than hidden.

```sh
node examples/graphics-language/server.mjs
# Open the URL printed by the server.
npm run test:graphics
npm run test:graphics:browser
node kits/render/graphics-language-kit/tests/native-window.mjs
```

The macOS check opens a real window, captures its displayed output, switches native → WASM → native, then closes it. Evidence is written under `build/graphics-evidence/`. Add `--soak` to the browser command for the 60-second check. No GitHub workflow is required or added.

One-call catalog installation is also available through `installOptionalKit(engine, 'nexus-graphics-language-kit', options)` from `nexusengine/kits`. `createGraphicsLanguageDomain(options)` supplies the same kit list for normal engine composition. Equivalent repeated installation returns the original kit/API; conflicting options reject. Disposal is terminal for that session. Use a new engine composition for a new session.

## Ownership

```text
Application
├── authoritative scene, camera, lights and gameplay
└── portable content and material choices
          ↓
Optional Graphics Language Kit
├── commands and readiness
├── NexusGL translation and actual resource storage
├── candidate execution and presentation coordination
└── offscreen / Canvas 2D / macOS image adapters
          ↓
Core Render
├── provider, frame, pass and resource schemas
├── resource identity and revision lineage
└── installation phase, generation and handover outcome
```

The bundle lives in `kits/render/graphics-language-kit`, outside `src/core-domains`. Concrete provider instances, WASM modules, buffers and window handles never enter Core state. Runtime still owns ticks. The kit installs existing contracts, resource identity and lifecycle atoms; it creates no Core renderer or competing scheduler. NexusGL's copied SceneDSK and RenderDSK retain their internal responsibilities.

## Portable baseline

Commands use resolved descriptions, not a scene graph inside the provider:

- Geometry: indexed or unindexed triangles, positions, optional normals, UV0, tangents and tangent handedness. One sRGB byte color per geometry; per-vertex colors are unsupported.
- Transforms: affine 4×4 column-major matrices multiplying column vectors. Normals use the inverse transpose; mirrored tangent handedness is corrected. Singular or nonfinite transforms reject.
- Camera: one resolved world-to-clip matrix (`view.projection`) and world-space camera position. All public matrices are column-major; translation to NexusGL's private row-major representation is internal. Clip X/Y are −1..1, depth is 0..1, smaller depth is nearer. The example uses a right-handed camera looking toward −Z.
- Directional lighting: world-space direction **toward** the light, linear RGB, intensity, fill and sky terms. Shadows use one orthographic affine world-to-shadow-clip matrix. Perspective shadow projections and zero light directions reject.
- Materials: reference, Toon, PBR or Unlit; linear RGB tint, roughness, metallic, opacity, alpha cutoff and optional base-color/normal textures. PBR roughness is floored to 0.045 during NexusGL translation. Defaults remain those of the bundled renderer.
- Surfaces: opaque, mask or blend. Opaque forces covered output opaque; mask discards below cutoff and writes depth; blend uses exact per-pixel ordering over opaque depth without transparent depth writes. Blended outlines are unsupported and reject.
- Textures: tightly packed top-to-bottom RGBA8, straight alpha, UV origin at the first row, repeat wrapping, nearest/bilinear/trilinear sampling. Base color is sRGB; normal maps are linear data and require `normalMap: true`. UV sets beyond 0, sampler overrides and material UV transforms are outside this baseline.
- Output: tightly packed top-to-bottom straight RGBA8 with sRGB RGB. Clear and geometry byte colors are sRGB; lighting and alpha composition occur in linear light. Alpha stays linear. Texture interpolation/reconstruction protect against invisible RGB fringes. Presentation must not premultiply the returned bytes again.

`materialResource(createMaterialDescriptor(...), options)` translates the existing Material appearance descriptor. `standard` maps to PBR, `basic` to Unlit, and `toon`/`reference` retain their meaning. Linear RGB arrays and sRGB hex colors are accepted. `transparent` selects blend; use `{alphaMode:'mask', alphaCutoff:.5}` for cutouts. Texture asset IDs must already resolve to uploaded texture resource IDs; the adapter does no asset loading.

Transmission, clearcoat, reflection providers, custom shaders, multiple lights/views, XR, compute, arbitrary attachments and shader pipelines are unsupported here. They reject rather than silently degrade. An application may deliberately choose a simpler material or a compatible provider. Another provider must interpret this baseline itself; matching descriptors do not promise identical pixels.

## Resource and frame commands

```js
await graphics.createResource({id:'mesh', kind:'geometry', data:{
  positions:[-.5,-.5,.5, .5,-.5,.5, 0,.5,.5], castsShadow:false
}});
await graphics.createResource({id:'red', kind:'material', data:{
  shading:'unlit', tint:[1,0,0], alphaMode:'opaque'
}});
await graphics.render({
  frame:{frameId:'first',width:640,height:360,quality:'native'},
  draws:[{geometryId:'mesh',materialId:'red'}]
});
const completed = graphics.capture(); // independent owned pixels
```

Quality names are `native`, `gaussian-half` and `guided-half`; their existing rendering algorithms are retained. GaussianHalf softens the full image. Frame/quality limits and memory admission can still reject a frame.

The provider also accepts the existing `nexusengine.render-resource/1` and `nexusengine.render-frame/1` records. `graphicsResourceDescriptor(resource)` and `graphicsFrameDescriptor(frame, sequence)` create them. Graphics data occupies `resource.descriptor.graphicsLanguage` and `frame.metadata.graphicsLanguage`. Resource IDs, kinds and explicit revisions remain Core fields. This path accepts resolved persistent data; resolve generic dependency, integrity and lifetime requirements through their owners before submission. Frames target the selected `surfaceId` (default `graphics-language:surface`) and may name one resolved view. `graphics.render` resolves one scene pass; the lower provider API enforces declared pass order and completion.

Draws travel in the existing Render pass's `metadata.graphicsLanguage.draws`. The direct NexusGL provider also accepts `executePass(pass, draws)` as a convenience. Unsupported pass operations reject. Resource create/update/release and frame begin/execute/submit remain the existing Render provider methods.

Updates without an explicit revision automatically advance that resource's revision when data changes. Explicit Core resource revisions must advance for changed content; stale updates reject. Texture references are checked before execution. Releasing referenced textures rejects. Release removes declarations and frees the resident NexusGL scene; remaining declarations rebuild on the next frame. The last completed pixel copy survives release, invalid input and failed submissions.

Core's existing Resource Identity service records a revision and digest of the complete portable declaration set. Large geometry/texture payloads are held only by the application and execution kit, not copied into historical Core records. A handover captures that Core revision and checks it again before presentation. Core operation/identity history remains metadata and grows with operations; it is not a bounded application event log.

`getSnapshot()` captures portable resource declarations only; `loadSnapshot()` validates then restores them atomically for NexusGL. A caller-supplied provider must implement `replaceResources` to support atomic restoration, otherwise restoration rejects. Scene, animation, camera and gameplay restoration stay with the application. Reset clears rendering resources and preserves the host's last presented frame until a new successful render.

## Controlled handover

```js
await graphics.switchRenderer({ operationId:'switch-001', backend:'wasm' });
// Or supply {selection:{provider, reservationBytes}} instead of backend.
```

```text
validate target and overlap budget
→ initialize candidate while the active renderer continues
→ short submission barrier
→ copy current portable resource declarations, with their revisions
→ render and prepare a complete candidate frame
→ synchronous host presentation and Core lifecycle commit
→ drain and dispose old provider
```

Only one candidate is admitted. Conflicting requests and reused operation IDs reject. Use an AbortSignal or `cancelHandover(operationId)` before commit. A deadline bounds candidate preparation. Updates and old rendering are allowed during initialization; the barrier rejects new submissions while the latest resource set and frame are prepared. Applications retry those submissions after the operation settles; gameplay state remains theirs throughout.

Every presentation is tagged by operation and provider generation. Late results are discarded and disposed. Before-commit failure leaves the active provider and independently owned displayed frame intact. Presentation failure rolls back. If old-provider cleanup fails **after** a successful commit, the new provider stays active, `cleanupError` reports it, and the retained provider blocks another handover until disposal. Candidate-provider implementations must honor disposal, including initialization/upload that resolves after cancellation.

Host `prepare(frame, tag)` may be asynchronous and must remain invisible. Host `commit(stage)` and `rollback(previous, tag)` must finish synchronously; commit returns `{presented:true}`. This is the brief presentation boundary and cannot be cancelled midway. Async presentation work belongs in prepare. The built-in adapters copy completed pixels before use and never display a worker-owned mutable buffer.

A canvas already holding WebGL cannot become a 2D canvas. `surfaceOptions:{allowReplacement:true,bindSurface}` stages a cloned canvas and explicitly rebinds application input when it is committed. Dimensions, attributes and placement are preserved. The binding callback returns an unbind function. Arbitrary listeners cannot be copied automatically. Unsupported contexts/windows and XR combinations reject before switching an active session.

Render Installation contract `/2` adds generation and handover records. Old snapshots missing these fields are rejected; no implicit conversion or backend replay occurs. Current terminal lifecycle bundles round-trip. Finish/cancel executable handover work before capturing/restoring a lifecycle bundle. Restoring portable lifecycle facts alone never recreates executable providers.

## Memory and evidence

Default limits: 128 MiB renderer storage, 32 MiB portable resource data per provider, 262,144 translucent fragments, 4,194,304 output pixels and 4096 pixels per dimension. The WASM heap is bounded at renderer budget + 16 MiB and is released by dropping the disposed module; memory returns to the process allocator/OS according to GC and allocator behavior. WASM renderer budgets above 496 MiB are unsupported by this artifact.

Handover admission defaults to 768 MiB: each default selection reserves renderer budget + three resource budgets + 32 MiB overhead, then four output RGBA copies and host reservations are added. This is conservative admission accounting, not a whole-process OS memory cap. Other application data, JS overhead and allocator caches remain observable process costs. Tune explicit limits for smaller devices; insufficient overlap budget rejects before candidate initialization. No Quest/XR or GPU performance claim is made.

`npm run test:graphics` checks deterministic native/WASM pixels (cross-backend tolerance 2 channel values, observed 0), clipping, transformed normals, mirrored tangents, canonical Core descriptors/revisions, material/texture updates, straight alpha, frame ordering, allocation failure retention, installed APIs, reset/snapshots, cancellation, late frames, failures and repeated handovers. Browser and native-window checks capture the displayed output. Memory evidence includes warmup-separated RSS samples, runtime heap capacity, disposed-resource counts and process high-water RSS. A real second renderer remains unverified.

Source provenance and per-file hashes live in `runtime/source/provenance.json`; executable hashes live in `runtime/artifacts/manifest.json`. Rebuild with `npm run graphics:build` on the supported native toolchain, or `node kits/render/graphics-language-kit/runtime/build.mjs --wasm` with Emscripten configured. `EMXX` and `NODE_INCLUDE` select explicit compiler/header paths. Rebuilding is separate from ordinary installation and usage.
