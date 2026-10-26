# Engine / Studio main reconciliation — 2026-10-26

## Goal and route

Preserve and reconcile existing local work with current GitHub main, validate, commit and push Engine and Studio. No publication or deployment YAML changes. Route: github-it / nexus-studio-it maintain / Nexus Engine Kit context / isolated candidate / existing validation / authorized normal pushes. Owning areas: Spatial Layout, Build target services, Authoring project/persistence and optional configured-scene Kit; Harness routing and Inference manifest/installation adapters.

Run: `2026-10-26-main-reconciliation`. Workflow task/session IDs and local Engine host workspace are in run.json. Agent progress state is not acceptance evidence; actual command results and logs establish the checked scope.

## Preservation and source integration

Original Engine main was 5a4da3eba6ac95d2d8c74a008bb12caff0d6b0e8; reconciled upstream base was d8cc700e47e9a4951fd95d15bf71a350727e76f2. Both working trees were backed up with binary patches, original indexes, refs, changed/untracked file contents and SHA-256 readback manifests under `/Users/crimsonwheeler/Documents/GitHub/.reconciliation-backups/2026-10-26-182122/` before source integration.

32 conflict files were reviewed: retain newer upstream conflict content and regenerate derived records; keep cleanly merged distinct local Layout and Build-provider additions. Preserve upstream Agent/inference authorization and recovery controls, configured scene runtime, code/toolchains and streaming save behavior. See merge-resolutions.json. Runtime object stores, receipts and rollback source copies remain recoverable separately; see preserved-local-only-paths.json.

Repairs: remove the duplicate targetSet declaration introduced by combining the newer Build constructor with local dynamic target providers; classify optional Agent Loop and configured-scene source under their real owners; regenerate catalogs, ownership, Authoring capabilities, migration/source evidence, public export fixture, guide and PDF.

The upstream Harness/Inference manifest named three ordinary helper APIs as installable Kit factories. Add proper createDecisionRoutingKit/createInferenceContractKit/createInferenceProviderPoolKit entrypoints and point manifests at them; preserve existing createDecisionRouter/createInferenceRequest/createInferenceProviderPool helpers and their behavior. The installed provider pool uses Engine resource state for reset/snapshot recovery. Routing supplies its neutral root capability instead of depending on an unavailable provider for its own parent. Extend the existing inference/routing test for installed/direct compatibility; no new tracked test file was created.

## Actual results

- `npm test`: PASS, all 129 existing smoke scripts, including installed 394-Kit composition, public imports, boundaries, Authoring, Spatial/Layout, Build multi-target/approval/immutability, web target startup and native lowering.
- Authoring consolidation/roundtrip/I/O safety: PASS, 23 tests.
- Seven existing Agent Loop smoke scripts: PASS. No live or paid inference calls were required.
- Inference/routing direct helpers and installed Kit APIs: PASS, snapshot recovery/reset, invalid-mutation preservation and installed routing.
- Core generation/parity/ownership, migration/source evidence, package/test exports, active docs, guide and PDF: PASS. Current catalog is 208 Domains / 394 Kits; no unreviewed ownership modules or ownership violations.
- Reconciled optional Engine Kit loads and validates a browser-authored Studio project with one scene and three objects; its compatibility loader migrates in memory.
- Studio keeps the original e3b9b589c9eaad144ef815ec9fa5ab20f0806424 pin, 199 Domains / 390 Kits. Its recorded coverage remains 0 Unprocessed / 389 Integrated, not verified / 1 Verified. See Studio validation/main-reconciliation-2026-10-26/REPORT.md for actual browser/packaged-native regression results and docs/AUTHORING-OWNERSHIP-REVIEW.md for the requested boundary review.

## Limits and delivery

The initial attempts found a merge-induced duplicate, upstream manifest factory/dependency defects, missing optional Three.js in the test environment and generated drift after source repairs. All affected checks were rerun; original intermediate logs remain in local preservation. Test dependencies reuse installed packages in an isolated candidate; no Studio pin upgrade or uncommitted Engine distribution substitution occurred.

These checks do not establish every Kit feature, approved native Build execution/provisioning, Windows/Linux/headset/hardware readiness, performance acceptance or publication. Required scoped reconciliation checks pass; confidence is high for the documented integration and regression scope. Remaining feature acceptance stays explicit in Studio's existing ledger. Deployment YAML and Website source are unchanged. Commit and remote identity are verified separately by Git readback.
