# Spatial Layout implementation

Goal: add one optional Layout DSK under n:spatial:layout, resolving existing content in screen and world spaces without owning or mutating persistent transforms.

Run: 2026-10-18-spatial-layout.

Route used: inspect -> define contract -> implement optional kit -> numerical/lifecycle checks -> browser proof -> visual review and repair -> ownership generation -> regression checks -> preservation comparison. These are direct execution records. The nexus-editor controller is unavailable; the shared target/tracker were preserved rather than replaced with manually authored controller state.

## Implemented

- Domain: n:spatial:layout. Kit: spatial-layout-kit. Installed API: engine.n.spatialLayout.
- Public entry: nexusengine/domains/spatial/layout.
- Description, context validation and deterministic explicit/row/column/3D-grid resolver.
- Anchors, alignment, spacing, offsets, pivots, opaque content references and supplied dimensions.
- Screen logical or normalized units, Presentation safe bounds, explicit UI scale and rotated orthonormal world frames.
- Detached results and snapshots; atomic invalid-input/restore rejection; idempotent installation and mutations; configured reset.
- No scheduled layout systems. Existing Spatial transforms remain untouched.
- Registered manifest, package exports, generated ownership/catalog/guide records and main test-runner entry.

New implementation: src/core-domains/spatial/layout/. Existing integration points changed: Spatial domain.manifest.js and index.js, AGENTS.md, tests/run-all.mjs and generated catalog/export/ownership/documentation artifacts.

Numerical/lifecycle fixture: src/core-domains/spatial/tests/spatial-layout.mjs.

Visible example and reproducible browser proof: examples/spatial-layout/. Run node examples/spatial-layout/serve.mjs, open http://127.0.0.1:4179/, then run node examples/spatial-layout/prove.mjs.

## Observed evidence

- 18 selected checks PASS. Two broader repository gates still fail on previously recorded Authoring issues: the IndexedDB runtime boundary and pending Authoring create-service proof. No affected boundary/import failure is attributed to Layout.
- Manifest execution parity passes for 386 atomic kits; ownership ledger has zero unreviewed modules and zero violations.
- Exact screen positions, viewport resize, UI scale, normalized units, variable sizes, end/center anchors, all three grid axes, rotated frame coordinates and overflow reporting pass.
- Invalid dimensions, bad references/types, unknown fields, malformed grids/frames, invalid snapshots, duplicate configuration and numerical overflow are rejected.
- Optional installation, direct/installed parity, repeated set/removal, reset, snapshot restoration, detached return values and persistent-transform isolation pass.
- Playwright PASS at 1200x800 and 520x1000, including scale toggle and reset. Browser errors: none.
- Visual review: desktop.png and compact.png show aligned labeled A/B/C cards in the safe rectangle and three solid boxes at distinct world placements. scaled.png records increased card size without a world-layout change. An incomplete face-drawing issue in the example adapter was repaired before the final captures.
- Protected build-provider source files, shared target and tracker match their pre-change hashes. The rendering ownership source migration remains intact. No workflows changed or publication performed.
- git diff --check passes.

## Boundaries and confidence

Feature acceptance is supported by numerical, installed-runtime and browser evidence. Full repository acceptance remains partial because of the existing Authoring gates. Core generation used --allow-pending without changing proof status. Controller receipts and native/NexusGL rendering are unverified: this example displays placements through its Canvas adapter.

Next use: compose this public Layout API in an application and explicitly apply its placements through that application's scene/Spatial APIs. NexusGL provider integration remains a separate task.

## Executed checks

| Command | Result |
| --- | --- |
| `node src/core-domains/spatial/tests/spatial-layout.mjs` | PASS |
| `node src/core-domains/spatial/tests/spatial-scale-restoration.mjs` | PASS |
| `node tests/core-kits/core-utility-articulation-smoke.mjs` | PASS |
| `node tests/core-domain-kits-smoke.mjs` | PASS |
| `node tests/core-domains/core-graphics-domain-smoke.mjs` | PASS |
| `node tests/core-kits/core-presentation-domain-smoke.mjs` | PASS |
| `node tests/core-domains/core-visual-contribution-smoke.mjs` | PASS |
| `node tests/core-domains/core-domain-import-smoke.mjs` | PASS |
| `node tests/runtime-kit-idempotency-smoke.mjs` | PASS |
| `node src/core-domains/tests/domain-manifest-contract.mjs` | PASS |
| `node scripts/check-manifest-execution-parity.mjs` | PASS |
| `node scripts/generate-core-catalog.mjs --check --allow-pending` | PASS |
| `node scripts/generate-kit-ownership-ledger.mjs --check` | PASS |
| `node scripts/generate-public-test-surface.mjs --check` | PASS |
| `node scripts/generate-guide.mjs --check` | PASS |
| `node scripts/generate-dsk-manifest.mjs --check` | PASS |
| `node scripts/check-active-docs.mjs` | PASS |
| `node scripts/check-core-boundaries.mjs` | FAIL: existing Authoring gate |
| `node tests/public-entrypoint-relative-targets-smoke.mjs` | FAIL: existing Authoring gate |
| `node examples/spatial-layout/prove.mjs` | PASS |
