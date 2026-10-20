# Migration validation

Status: semantic migration implemented locally; broader repository acceptance remains partial. No commit or publication was performed.

- Selected checks: 35 passed; 3 failed.
- All ten pre-migration baseline checks pass after migration.
- Manifest execution parity: 385 kits. Ownership ledger: zero unreviewed modules or violations.
- Public module import smoke and generated Core catalog check pass (catalog uses --allow-pending).
- Existing target, tracker and three dirty build-provider source files are byte-identical to the pre-migration hashes.
- git diff --check passes. No GitHub workflow files changed.

## Remaining failures outside migration scope

- core-authoring-public: expected authoring-import-validation-kit, received authoring-import-registry-kit. Reproduced in an isolated archive of the original HEAD.
- public-entrypoint-relative-targets: Authoring create-service manifest proof is pending. Reproduced in the original HEAD archive.
- check-core-boundaries: existing Authoring IndexedDB provider violates the runtime platform boundary. Its source is byte-identical to HEAD; the migration introduces no private sibling-domain import violations. The baseline archive could not run this Git-dependent checker (EPIPE), so no passing baseline is claimed.
- Full tests/run-all stops at the existing strict Authoring proof gate; it was not changed or bypassed in that runner.
- Historical restored-behavior checksum verification cannot find src/action-movement-kit.js at its recorded historical revision. The migration documentation was generated in a source-only copy through the existing generator; historical verification remains unverified.
- Guided-development controller was unavailable. The separate run folder is a direct execution record, not a controller-generated session.
- Native/browser rendering, GPU execution, and performance are unverified here because no renderer/provider code was changed.

## Checks

| Command | Result |
| --- | --- |
| `node tests/core-domains/core-graphics-domain-smoke.mjs` | PASS |
| `node tests/core-kits/core-graphics-kit-smoke.mjs` | PASS |
| `node tests/core-kits/core-graphics-procedural-material-smoke.mjs` | PASS |
| `node tests/core-kits/core-graphics-reflection-kit-smoke.mjs` | PASS |
| `node tests/core-kits/core-graphics-render-layer-graph-contract.mjs` | PASS |
| `node tests/core-kits/core-graphics-render-layer-graph-smoke.mjs` | PASS |
| `node tests/core-domains/core-visual-contribution-smoke.mjs` | PASS |
| `node tests/core-domains/core-render-surface-smoke.mjs` | PASS |
| `node tests/core-kits/core-presentation-domain-smoke.mjs` | PASS |
| `node tests/core-kits/core-utility-articulation-smoke.mjs` | PASS |
| `node tests/core-domains/core-domain-import-smoke.mjs` | PASS |
| `node tests/public-api-freeze.mjs` | PASS |
| `node tests/runtime-kit-idempotency-smoke.mjs` | PASS |
| `node tests/core-domain-kits-smoke.mjs` | PASS |
| `node src/core-domains/tests/domain-manifest-contract.mjs` | PASS |
| `node src/core-domains/presentation/tests/third-person-camera-restoration.mjs` | PASS |
| `node tests/core-kits/core-child-capabilities-smoke.mjs` | PASS |
| `node examples/authoring/first-edit.mjs` | PASS |
| `node tests/core-domains/core-authoring-foundation.mjs` | PASS |
| `node tests/core-domains/core-authoring-public.mjs` | FAIL — see validation.json |
| `node tests/core-domains/core-authoring-geometry.mjs` | PASS |
| `node tests/core-domains/core-authoring-surfaces-rig.mjs` | PASS |
| `node tests/core-domains/core-authoring-integration.mjs` | PASS |
| `node tests/core-domains/core-authoring-modeling.mjs` | PASS |
| `node tests/core-domains/core-gpu-host-smoke.mjs` | PASS |
| `node tests/core-domains/core-gpu-shared-resource-smoke.mjs` | PASS |
| `node tests/core-domains/core-capture-shape-visual-smoke.mjs` | PASS |
| `node scripts/generate-core-catalog.mjs --check --allow-pending` | PASS |
| `node scripts/check-manifest-execution-parity.mjs` | PASS |
| `node scripts/check-core-boundaries.mjs` | FAIL — see validation.json |
| `node scripts/check-active-docs.mjs` | PASS |
| `node scripts/generate-kit-ownership-ledger.mjs --check` | PASS |
| `node scripts/generate-public-test-surface.mjs --check` | PASS |
| `node scripts/generate-guide.mjs --check` | PASS |
| `node scripts/generate-dsk-manifest.mjs --check` | PASS |
| `node scripts/generate-root-module-dispositions.mjs --check` | PASS |
| `node scripts/generate-protokit-extraction.mjs --check` | PASS |
| `node tests/public-entrypoint-relative-targets-smoke.mjs` | FAIL — see validation.json |
