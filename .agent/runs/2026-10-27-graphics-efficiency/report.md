# Graphics CPU efficiency and stability

Run: 2026-10-27-graphics-efficiency. Baseline: 71d4872. Owner: optional n:render Graphics Language Kit; SceneDSK owns immutable resources/updates and RenderDSK owns rendering. Route: inspect → preserve unrelated work → baseline → native residency → frame ownership → artifact integrity → validate → main publication. This isolated latest-main checkout preserves the original checkout’s unrelated authoring edits.

## Implemented

Scene uploads now stage/commit/abort atomically, including legacy 64-triangle bridge chunks. Indexed meshes remain resident by resource revision; instance transforms, appearance and order update independently. Immutable payload ownership is enforced even against mutable C++ aliases. Shadow dependencies are revision driven with explicit byte admission; texture/material slot churn and retained snapshot accounting stay bounded. Framebuffer/Gaussian/fragment allocations reuse checked capacity. Public captures remain copies; built-in presentation uses bounded private leases with rollback retention. Optional host pacing owns no timer, simulation tick or backlog. Direct render still submits each request.

ABI 1 declarations remain compatible, including its capabilities envelope; additive ABI 2 negotiation and size-tagged statistics expose new behavior. Both artifacts were rebuilt from one source closure. Manifests fingerprint headers, bridge, build script/options and toolchains per artifact; stale partial builds reject. Original upstream 49c6a7c ancestry and its unresolved standalone-remote limitation are preserved. No standalone NexusGL, inference, game rules, Core domain behavior, package dependencies or release version changed.

## Verification

All seven short Graphics suites pass. All five native source fixtures passed ASan/UBSan; later ownership/cache/resize repairs passed the affected sanitizers. Native/WASM contract comparison and 18 old-provider/new-provider image comparisons have zero changed channels across all three quality modes and three angles. Captured browser and actual macOS-window images were inspected: opaque checker, green cutout and blue blended panel remain readable and correctly composed. Browser interactions/pacing/cancellation/canvas replacement, native→WASM→native presentation, 9 quality/extent combinations and 5 launch-and-close cycles pass. Core boundaries/catalog, generated ownership and 500-module package-surface checks pass. Derived guide, PDF and MCP guide resources were regenerated through the existing tools; documentation checks pass. Exact artifact identity and evidence hashes are in validation.json.

Native and WASM static 60-second runs completed 3,108 and 2,181 frames respectively: no warmed mesh uploads, transforms, render allocations or pool capacity growth; each retained 460,800 output bytes. Browser completed 675 responsive frames in 60 seconds with no page errors.

## Performance evidence and limits

Apple M2, 8 GB RAM, macOS 14.5, Node 25.8.1; deterministic 320×180 fixture, shadow 64. With 256 instances and one moving instance (5 measured frames after 2 warm-up frames), median frame time was native 13.20→5.46 ms and WASM 17.85→12.66 ms. Each measured update transformed 4 vertices and uploaded 0 meshes. These are small synthetic samples, not a general speed guarantee.

The 24-instance sequential wall-time sample regressed under host contention (native static 8.02→13.21 ms, WASM 13.25→18.88 ms). An alternating same-process native CPU check generally measured roughly 4.4–4.8 ms for both paths, with outliers retained in paired-cpu.json. Small scenes remain rasterization dominated; no uniform speedup is claimed. Long renderer/browser runs overlapped as a stability stress; their cadence is not controlled-hardware performance qualification.

Representative-game replay and target performance envelope remain NOT RUN until selected. Physical CPU fault diagnosis and Quest/GPU readiness are not established. Document visibility simulation is labeled synthetic in browser evidence.

## Reproduce and delivery

Run npm run test:graphics; npm run test:graphics:source (or node kits/render/graphics-language-kit/tests/native/run.mjs --sanitize); npm run test:graphics:browser; node kits/render/graphics-language-kit/tests/native-window.mjs --require-native; npm run graphics:check. Benchmark commands and limits are documented in docs/GRAPHICS-LANGUAGE.md. Large logs/captures stay under ignored build/ with recorded SHA256 hashes.

The temporary official Emscripten 6.0.12 subset used 425,660,416 allocated bytes, below the approved 500,000,000-byte limit, and was removed after compilation. Toolchain evidence is in toolchain.json. GitHub Actions was explicitly disabled before publication. Publish only this verified candidate to main with no force push; the final remote SHA/readback is recorded by the Engine task session and delivery response.
