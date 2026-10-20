# Graphics Language Kit and controlled renderer handover

## Result

Implemented and verified inside NexusEngine. One optional installation provides the command API, default NexusGL native/WASM runtime and selected presentation adapter. The application retains scene/gameplay state; Core Render retains authoritative installation, resource revision and handover facts. A real different renderer and Quest/XR remain unverified.

The existing approved Material/Lighting/Camera ownership migration is included because the public integration imports depend on it. The separate Spatial Layout and external build-provider work are excluded from publication. Their 33 preserved source/record files remain byte-identical; see `preservation-result.json`.

```text
nexusengine/domains/render/graphics-language
├── one installation, readiness and failure reporting
├── resolved Material / Resource / Frame / Pass translation
├── NexusGL [default]
│   ├── native macOS arm64, N-API 8
│   └── WASM, same C++ SceneDSK / RenderDSK rendering
├── offscreen, Canvas 2D and macOS bitmap presentation
└── bounded handover to a selected compatible provider
    └── Core Render installation owns status, revision and generation
```

## Changes

- Added the optional manifest, public package export, lazy optional-kit catalog and dependency composition. Ordinary Core imports do not initialize NexusGL.
- Documented the shared baseline, coordinates, texture color space, straight alpha, material mapping, unsupported operations and caller-selected fallbacks in `docs/GRAPHICS-LANGUAGE.md`.
- Accepted existing Core Resource and Frame descriptors through namespaced graphics data; used existing Render pass records. Kept resource revision/digest lineage in Core's existing Resource Identity service.
- Corrected Core Frame optional timing validation so normalized frames round-trip. Extended the existing Render Installation contract to `/2` with active/candidate identity, operation, captured resource revision, generation and outcome. Old snapshots are rejected explicitly, without implicit conversion.
- Implemented updates, release, transformed normals, mirrored tangents, declared pass ordering and completed-pixel ownership. Failed submissions retain independently owned last successful pixels. NexusGL's copied source remains unchanged and passes its provenance hashes.
- Added capability/overlap-budget checks, one candidate, cancellation/deadline, a final submission barrier, latest resource transfer, successful candidate-frame preparation, synchronous presentation/commit, rollback and old-provider draining/disposal. Late results cannot replace the active generation. Failed post-commit cleanup is accounted for and blocks another overlap.
- Added native window and Canvas adapters, explicit incompatible-canvas replacement/input rebinding, and native window polling independent of frame submission.
- Regenerated the publishable catalogs, package exports, ownership ledger, DSK manifest, guide and PDF from an isolated staged tree. The published Core inventory has 25 domains, 197 domain records and 385 atomic Core kits, plus the optional Graphics Language Kit.

## Validation

| Check | Observed result |
| --- | --- |
| One-call, catalog and direct composition; duplicate/conflicting installation | PASS |
| Native/WASM known pixels, deterministic replay, clipping, degenerates, alpha | PASS; known straight-alpha pixel `[188,0,0,128]` |
| Cross-backend fixture | PASS; maximum channel difference 0, permitted tolerance 2 |
| Normals, nonuniform transforms, mirrored tangents and column-major camera projection | PASS |
| Resource updates/revisions/release; reset and resource/lifecycle snapshots | PASS |
| Frame order, incomplete declared passes and unsupported operations | PASS |
| Actual renderer allocation-budget rejection and subsequent valid frame | PASS; last successful pixels retained |
| Capability, overlap-budget, startup, upload, candidate render, preparation, presentation and Core-commit faults | PASS |
| Cancellation, conflicting operations, late frames, updates/camera movement during preparation | PASS |
| Old-provider cleanup failure and disposal recovery | PASS |
| Repeated native/WASM handovers in the memory series | PASS; 17 successful swaps |
| Real macOS native → WASM → native presentation | PASS; displayed OS screenshots inspected |
| Native launch/close | PASS; five cycles |
| Browser move/material change/swap/failure/resize/quality/keyboard/canvas replacement | PASS; screenshots inspected, no page errors |
| Browser soak | PASS; 1,092 frames over 60.02 seconds, with repeated instance replacement |
| Existing focused regressions | PASS; 18 checks |
| Isolated publishable-tree matrix | 30 PASS; 4 existing broad-check failures below |
| Packed consumer, folder containing spaces | PASS; native/default + WASM handover; outside dependency resolution blocked |
| Generated ownership | PASS; zero unreviewed modules or ownership violations |
| Warning-enabled native/WASM rebuild | PASS; C++17, `-Wall -Wextra -Wpedantic` |

Evidence is in `evidence/`. Reproduce with `npm run test:graphics`, `npm run test:graphics:browser`, and `npm run test:graphics:native`. Add `--soak` to the direct browser test for the 60-second run. Detailed commands and outputs are in `publish-validation.json`, `regressions.json` and the evidence JSON files.

### Memory observations

The 160×96 repeated-swap fixture used 16 MiB renderer limits, 1 MiB portable-resource limits, 8,192 fragments, explicit 64 MiB provider reservations and a 160 MiB overlap budget. After four warmup swaps, last-minus-first warm RSS was **3.00 MiB**; process high-water RSS was **275.25 MiB**. Median handover time in that small fixture was **14.83 ms**, maximum **20.57 ms**. These are observed desktop measurements, not a game-frame or headset performance target.

Disposed provider checks report zero owned resources and zero retained runtime-heap references. The browser's active WASM heap remained 16 MiB in the soak samples. JS/Core operation history and allocator caches can retain memory; admission budgets are not an OS process cap. Full raw samples, heap observations and timings are retained in `evidence/handover-memory.json` and `evidence/browser-soak.json`.

### Package proof

The complete existing Engine package plus this kit packed to 7,970,992 bytes, 24,384,085 bytes unpacked. All NexusGL artifacts and the complete source snapshot are included. The consumer ran from a path containing spaces with an ESM resolution guard rejecting dependencies outside the extracted package and Node builtins. It rendered a known pixel and handed native/default rendering to WASM without downloading a runtime or invoking a compiler. See `package-result.json`.

## Existing repository failures and limits

These were not repaired or marked passing:

- `check-core-boundaries`: the unchanged Authoring IndexedDB provider and the newer unchanged Camel browser test are classified as concrete runtime-platform ownership. Their files match the fetched `main` baseline.
- `public-entrypoint-relative-targets`: existing Authoring create-service proof remains `pending`.
- `core-authoring-public`: existing import-registry versus import-validation kit expectation mismatch.
- `tests/run-all`: stops at the existing strict Authoring proof gate. Catalog regeneration used its documented `--allow-pending` mode and did not promote that proof.
- Historical restoration verification still lacks its recorded legacy source at the historical revision; earlier migration evidence documents this. No historical proof is invented.
- `nexus-editor` was unavailable. This run uses direct records; the separate `.agent/target.md` and generated tracker were preserved rather than substituted.
- Different renderer compatibility, GPU submission, other native OS/architectures and Quest/XR are unverified. The supported baseline is the documented CPU renderer, not a full AAA/XR engine.

The first regression attempt also caught the expected contract-version assertion after the intentional Installation `/2` change; it was updated to assert the new schema and initial generation/handover fields, then rerun. An obsolete absent GPU fixture name was replaced with the existing Compute fixture. The first package-extraction driver used an unsupported Python 3.9 argument; the same proof completed with the already available Python 3.12. See `regressions-initial.json` for the initial regression trail.

## Visual evidence

- [Browser initial](evidence/browser-initial.png), [camera movement](evidence/browser-moved.png), [successful swap](evidence/browser-swapped.png), [failed candidate retained](evidence/browser-failed-candidate.png).
- [Native window](evidence/native-window-displayed.png), [WASM in the same native window](evidence/wasm-window-displayed.png).
- [Native framebuffer](evidence/native-window-framebuffer.png), [WASM framebuffer](evidence/wasm-window-framebuffer.png).

The final package retry encountered actual disk exhaustion. The task-created Emscripten/compiler cache under ignored `build/graphics-runtime` was removed only after artifact/hash verification, recovering about 1.8 GiB. Project source, shipped binaries and system toolchains were preserved. The package consumer passed again after cleanup; rebuilds require configuring Emscripten as documented. See `temporary-cleanup.json`.

The repository publication scanner found no credentials. Five incoming historical validation logs contained machine-specific paths; their published copies now use portable placeholders, with raw originals retained under ignored `build/graphics-raw-evidence`. No incoming text location findings remain. Two older hybrid-build logs already on the fetched main baseline still contain temporary paths; they were preserved as unrelated historical evidence. The whole-tree scanner therefore is not reported as passing. See `publication-scan.json`.

## Delivery

Only NexusEngine is changed. Publication targets its actual default `main` branch, with `[skip ci]` on the commit. No workflow is added, enabled or dispatched. The final remote commit and no-trigger check are reported in the delivery response. No NPM release, deployment, PR, other-repository change or unrelated cleanup is included.

The next integration milestone is a real second renderer implementing the same documented contract and passing these same handover checks.
