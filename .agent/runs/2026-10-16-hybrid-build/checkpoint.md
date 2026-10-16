# Native/hybrid host checkpoint

Status: PARTIAL for the full requested plan. The supported Mac host checkpoint is verified. No APK, new Flatpak, Vulkan/OpenXR presentation, physical controller/hand evidence, management integration, or kiosk enforcement is claimed.

## Goal and ownership

Extend existing n:build compile/toolchain/target/orchestration kits and its MCP provider. Preserve the previous Interaction/UI work and Agora paths. Active run: 2026-10-16-hybrid-build. The persistent Editor controller is unavailable; the finite Editor adapter owns the scoped verification report and the generated global tracker was preserved.

## Route and results

Read -> capture-before -> plan -> validate -> submit -> observe -> verify -> capture-after -> observed-differences. `verification/attempt-result.json` reports verified. Fourteen command fixtures passed, including 382 installed Core Kit contracts, pending-aware catalog and ownership consistency, public root freeze, active docs, Interaction/Presentation, build domain tree, numeric Rust parity, native/Node execution, Rust-only execution, full atomic composition, multi-target isolation, MCP authorization, and compiled QuickJS sandbox regression.

Compiler preflight tries configured CXX then c++, records the required-interface probe, and blocks if neither can compile it. The validated Node shim uses the public process entry and Node-API; no V8 templates are required. Generated Cargo workspaces and output directories remain isolated from the parent application.

Automatic numeric lowering requires a numeric contract; untyped coercive JavaScript remains interpreted. Cyclic Node module identity, numeric ABI errors, source mutation rejection, exact plan approval, artifact-tamper rejection, durable reconstruction, and process cancellation were exercised. Host artifacts explicitly state their platform and external Node library requirements.

## Existing failures

The untouched 3efccc20 revision also fails the default catalog/public-entry gates at unproven n:authoring:create manifest evidence and the boundary gate at authoring/persistence/providers/indexeddb/index.js. The ownership ledger was regenerated for the new host target. Pending-aware catalog and ownership checks pass. The default release-wide gates remain failing; this is not a release-complete engine claim.

## Remaining work

Verified native substitutions, broader typed lowering and native domain implementations, native asynchronous/object bindings, third-party Node package/addon closure, redistributable runtime closure, Android Node validation, real Vulkan/OpenXR rendering, Linux target integration, device delivery and hardware evidence, and the separate management/kiosk product gates remain incomplete. These are not marked as completed or simulated successes.

Confidence: high for the tested Mac host subset; overall completion cannot be claimed. User authorizes pushing this verified checkpoint to main. Agora consumes a permanent exact engine commit after publication; its frozen source locks remain unchanged.

## Concurrent main integration

Remote main advanced to 109f5c53 (experimental Camel). Preserved its source, native artifact and generator policy; regenerated combined catalogs for 22 roots, 196 records and 383 atoms. No Camel implementation was changed. A native arithmetic smoke returned 42. Combined verification is recorded separately in integration-verification, preserving the earlier attempt.
