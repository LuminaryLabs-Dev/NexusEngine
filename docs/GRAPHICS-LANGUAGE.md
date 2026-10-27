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

Updates without an explicit revision automatically advance that resource's revision when data changes. Explicit Core resource revisions must advance for changed content; stale updates reject. Texture references are checked before execution. Releasing referenced textures rejects. Release removes the portable declaration; its native resource is released in the next atomic scene transaction, after obsolete instances are removed. Other meshes and textures retain their handles and immutable payloads. The last completed pixel copy survives release, invalid input and failed submissions.

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

Host `prepare(frame, tag)` may be asynchronous and must remain invisible. Host `commit(stage)` and `rollback(previous, tag)` must finish synchronously; commit returns `{presented:true}`. This is the brief presentation boundary and cannot be cancelled midway. Async presentation work belongs in prepare. The built-in provider, session and adapters retain private completed-frame leases. A bounded three-slot pool supplies destinations; leased pixels cannot be reused until presentation and rollback release them. Public captures and custom callbacks receive independent copies. Native readback writes once into the private destination; WASM reads its current heap view into that destination after rendering, including after memory growth.

A canvas already holding WebGL cannot become a 2D canvas. `surfaceOptions:{allowReplacement:true,bindSurface}` stages a cloned canvas and explicitly rebinds application input when it is committed. Dimensions, attributes and placement are preserved. The binding callback returns an unbind function. Arbitrary listeners cannot be copied automatically. Unsupported contexts/windows and XR combinations reject before switching an active session.

Render Installation contract `/2` adds generation and handover records. Old snapshots missing these fields are rejected; no implicit conversion or backend replay occurs. Current terminal lifecycle bundles round-trip. Finish/cancel executable handover work before capturing/restoring a lifecycle bundle. Restoring portable lifecycle facts alone never recreates executable providers.

## Memory and evidence

Default limits: 128 MiB renderer storage, 32 MiB portable resource data per provider, 262,144 translucent fragments, 4,194,304 output pixels and 4096 pixels per dimension. The WASM heap is bounded at renderer budget + 16 MiB and is released by dropping the disposed module; memory returns to the process allocator/OS according to GC and allocator behavior. WASM renderer budgets above 496 MiB are unsupported by this artifact.

Handover admission defaults to 768 MiB: each default selection reserves renderer budget + three resource budgets + 32 MiB overhead, then each built-in provider reserves three output slots at the larger of retained and requested extents, plus host reservations. Custom providers retain a four-frame copying fallback. This is conservative admission accounting, not a whole-process OS memory cap. Other application data, JS overhead and allocator caches remain observable process costs. Tune explicit limits for smaller devices; insufficient overlap budget rejects before candidate initialization. No Quest/XR or GPU performance claim is made.

`npm run test:graphics` checks deterministic native/WASM pixels (cross-backend tolerance 2 channel values, observed 0), clipping, transformed normals, mirrored tangents, canonical Core descriptors/revisions, material/texture updates, straight alpha, frame ordering, allocation failure retention, installed APIs, reset/snapshots, cancellation, late frames, failures and repeated handovers. Browser and native-window checks capture the displayed output. Memory evidence includes warmup-separated RSS samples, runtime heap capacity, disposed-resource counts and process high-water RSS. A real second renderer remains unverified.

Source provenance and per-file hashes live in `runtime/source/provenance.json`; executable hashes live in `runtime/artifacts/manifest.json`. Rebuild with `npm run graphics:build` on the supported native toolchain, or `node kits/render/graphics-language-kit/runtime/build.mjs --wasm` with Emscripten configured. `EMXX` and `NODE_INCLUDE` select explicit compiler/header paths. Rebuilding is separate from ordinary installation and usage.

## Resident updates and bounded work

Implementation version 2 retains the public geometry/material/frame schemas. Draws may add a nonempty `instanceId`, unique across every pass in a submitted frame. Omitted IDs use stable submission slots. Order is explicit, including blended surfaces; identity does not change blend order. Local-space indexed meshes upload once per resource revision. Missing normals and tangents are generated once at mesh upload, with the prior per-face fallback. Moving an instance transforms its cached vertices without uploading its mesh. Camera and lighting changes do not dirty geometry. CPU transformation, projection and rasterization still cost work.

The bundled C ABI keeps every ABI 1 declaration and adds negotiated ABI 2 transactions, resident meshes and instances, resource update/release, ordering and size-tagged diagnostics. Begin stages a revision-checked update; one commit validates and publishes all resources and instances. A failed stage poisons that transaction until abort. Invalid later chunks, stale handles and admission failures preserve the committed scene. Providers publish their native handle tables only after commit. Native matrices use row-major storage internally; the bridge converts the public column-major instance matrix once.

Prepared scene tokens are minted by SceneDSK's resident store. Only those immutable tokens reuse mesh validation; caller-created raw scene descriptors still receive complete validation. Portable JS snapshots remain resource declarations. Internal resident snapshots use explicit process-local version 2 shared ownership and are not a cross-renderer interchange format.

`shadowCacheBytes` is an explicit maximum inside the renderer budget (default min(16 MiB, one quarter of the configured renderer budget), zero disables reuse). Cache admission accounts for the depth map and exact key; there is no 2048-triangle cutoff. Mesh/instance coverage, masked texture/material coverage, light direction/projection, resolution and shadow policy invalidate depth. Camera/exposure changes preserve it. Uncacheable scenes render shadows normally. Reset, trim and scene identity prevent reuse across incompatible state.

Framebuffer and Gaussian scratch retain checked capacity; transparency fragments grow in bounded steps rather than reserving the full fragment maximum initially. Allocation failures remain errors. Retained resource/staging accounting is conservative and includes shared payload reservations; it does not claim exact process RSS. The frame pool is separately admitted by the session.

## Optional host pacing

`createFramePacer({targetFps:30, now:()=>performance.now()})` is exported only through the optional kit entry. The host calls `pacer.request(()=>graphics.render(latestScene))`; a busy or early request returns a non-submitted result. It creates no interval, simulation tick or queued catch-up work. Use `pause`, `resume`, `setTargetFps` and `dispose` with host visibility/lifecycle events. Direct `graphics.render` always submits its requested frame. The browser example defaults to on-demand and exposes opt-in animation and target FPS. Native and WASM are CPU execution choices; `native` quality is not a GPU mode.

## Measurements and artifact checks

Diagnostics expose cumulative `meshUploads`, `uploadedBytes`, `validatedVertices`, `transformedVertices`, `copiedBytes`, committed/aborted transactions, resident/staging byte reservations, render allocation counters and shadow hit/miss/bypass counts. `framePool` reports retained slots, capacities and allocations; host/session diagnostics add copy bytes and recent render/presentation durations. Timings are bounded latest observations, without per-frame histories. Provider upload/update and render durations are distinct from OS presentation and process CPU measurements.

```sh
npm run graphics:check
npm run test:graphics:source
node kits/render/graphics-language-kit/tests/native/run.mjs --sanitize
npm run benchmark:graphics -- --backend all --samples 30 --warmup 10
# Optional bounded sustained engineering qualification:
npm run benchmark:graphics -- --backend all --samples 120 --warmup 20 --duration 60 --workload static
```

Keep before/after hardware, resolution, quality, source revision and artifact hashes identical except for the measured implementation. Sustained duration applies per workload and backend, with at most 120 retained observations. `--instances` selects the shared-mesh workload size. The benchmark separates cold resource upload, warmed static rendering, one moving instance, camera/light updates, resize and quality changes. Report upload/copy/allocation work and sampled heap/RSS together with median/p95/max time. Uncapped renderer cost and savings from a lower host FPS are different measurements. The synthetic fixture is engineering evidence; representative-game qualification still requires an explicitly selected replay, target hardware and performance envelope. Browser and native-window display proofs remain separate gates.

The source provenance preserves the original local snapshot and its attribution to upstream revision `49c6a7c`, which was not resolvable in the inspected standalone repository. Engine owns the documented patches; no equivalence to standalone NexusGL main is asserted. Rebuild matching native/WASM outputs with `node kits/render/graphics-language-kit/runtime/build.mjs --update-provenance --native --wasm --check`. The schema 2 manifest fingerprints every bundled source/header, bridge, build script/options and toolchain metadata. Each artifact attests its own target source closure; a WASM-only build cannot certify an old native binary. The loader rejects mixed/stale ABI identities and hash failures. The independent window host has its own closure. Generated binaries and glue must never be patched by hand.
