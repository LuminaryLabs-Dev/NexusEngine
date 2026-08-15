# Build Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:build`
- Status: `stable-candidate`
- Registry SHA-256: `a5e0ac2156e86da208c6525d7c611d0245d7d1a57f5e5f186fbe83bac2f04e82`
- Public entry: `nexusengine/domains/build`

## Responsibility

Own isolated build-time source analysis, compilation, toolchains, targets, artifacts, receipts, and proof without entering application runtime composition.

## Owns

- artifact receipts
- build plans and approvals
- build source identities
- compiler IR
- target hosts and packaging
- toolchain stages

## Does Not Own

- application runtime state
- authored product behavior
- package postinstall downloads
- project source mutation

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:build:source` | Own read-only project source, immutable dependency identities, content caches, fingerprints, and module graphs. |
| `n:build:analysis` | Own real syntax, type, effect, and dependency analysis for build inputs. |
| `n:build:ir` | Own serializable Kit IR, Execution IR, validation, and source lineage maps. |
| `n:build:classification` | Own whole-Kit portability, capability resolution, and fallback selection. |
| `n:build:orchestration` | Own normalized requests, target sets, deterministic plans, approvals, execution, and receipts. |
| `n:build:compile` | Own deterministic Rust lowering, JavaScript fallback descriptors, runtime ABI, and native link plans. |
| `n:build:toolchain` | Own immutable toolchain sources, discovery, approved provisioning, isolated stages, and process execution. |
| `n:build:target` | Own target registration and target-specific build providers. |
| `n:build:artifact` | Own content-addressed artifact caches, manifests, integrity, and external output. |
| `n:build:proof` | Own project immutability, runtime parity, and target validation evidence. |
| `n:build:target:web-live` | Own verified live ESM loading and content-hash browser caching. |
| `n:build:target:web-static` | Own self-contained static Web artifact materialization. |
| `n:build:target:openxr` | Own shared native OpenXR session, input, frame, view, swapchain, and submission contracts. |
| `n:build:target:android-xr` | Own Android ARM64 OpenXR host generation, Gradle packaging, and APK validation. |
| `n:build:target:pcvr` | Own Windows x64 OpenXR host generation, executable packaging, and validation. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `project-source-kit` | `nexusengine/domains/build/source/project-source` | Read a deterministic project inventory without following links or mutating source. |
| `source-fingerprint-kit` | `nexusengine/domains/build/source/source-fingerprint` | Create the canonical SHA-256 project fingerprint. |
| `dependency-source-kit` | `nexusengine/domains/build/source/dependency-source` | Resolve exact dependency source identities and recursive lockfile closure. |
| `source-cache-kit` | `nexusengine/domains/build/source/source-cache` | Store and verify immutable source bytes by SHA-256. |
| `module-graph-kit` | `nexusengine/domains/build/source/module-graph` | Build a deterministic AST-derived module graph. |
| `javascript-ast-kit` | `nexusengine/domains/build/analysis/javascript-ast` | Parse JavaScript and TypeScript with a real compiler AST. |
| `type-analysis-kit` | `nexusengine/domains/build/analysis/type-analysis` | Run typed compiler diagnostics without emitting or mutating source. |
| `effect-analysis-kit` | `nexusengine/domains/build/analysis/effect-analysis` | Classify ambient capabilities and unsupported dynamic effects from AST nodes. |
| `dependency-analysis-kit` | `nexusengine/domains/build/analysis/dependency-analysis` | Prove relative and external dependency closure. |
| `kit-ir-kit` | `nexusengine/domains/build/ir/kit-ir` | Create serializable high-level Kit IR with source lineage. |
| `execution-ir-kit` | `nexusengine/domains/build/ir/execution-ir` | Create deterministic dependency-ordered Execution IR. |
| `ir-validation-kit` | `nexusengine/domains/build/ir/ir-validation` | Reject invalid, cyclic, unsupported, or incomplete IR. |
| `source-map-kit` | `nexusengine/domains/build/ir/source-map` | Map generated execution operations to source AST identities. |
| `portability-classifier-kit` | `nexusengine/domains/build/classification/portability-classifier` | Classify each whole module and composition as native, native-adapter, JavaScript, or unsupported. |
| `capability-resolution-kit` | `nexusengine/domains/build/classification/capability-resolution` | Resolve target capabilities and exact reviewed substitutions. |
| `fallback-selection-kit` | `nexusengine/domains/build/classification/fallback-selection` | Select fail-closed whole-Kit fallback per target and profile. |
| `build-request-kit` | `nexusengine/domains/build/orchestration/build-request` | Normalize one project, profile, options, and target set. |
| `target-set-kit` | `nexusengine/domains/build/orchestration/target-set` | Normalize repeated target flags into one sorted unique set. |
| `build-plan-kit` | `nexusengine/domains/build/orchestration/build-plan` | Create the immutable deterministic multi-target plan hash. |
| `build-approval-kit` | `nexusengine/domains/build/orchestration/build-approval` | Require approval for the exact unchanged plan hash. |
| `build-execution-kit` | `nexusengine/domains/build/orchestration/build-execution` | Execute shared stages once and isolated target stages with project immutability proof. |
| `build-receipt-kit` | `nexusengine/domains/build/orchestration/build-receipt` | Persist aggregate and per-target exactly-once Build receipts. |
| `rust-lowering-kit` | `nexusengine/domains/build/compile/rust-lowering` | Lower supported Execution IR into deterministic Rust source. |
| `javascript-fallback-kit` | `nexusengine/domains/build/compile/javascript-fallback` | Execute capability-restricted whole-Kit QuickJS-NG fallback. |
| `runtime-abi-kit` | `nexusengine/domains/build/compile/runtime-abi` | Define the stable native runtime handle and batch-operation ABI. |
| `native-runtime-link-kit` | `nexusengine/domains/build/compile/native-runtime-link` | Create exact generated-runtime and native-library link plans. |
| `toolchain-source-kit` | `nexusengine/domains/build/toolchain/toolchain-source` | Own immutable official toolchain and native dependency source records. |
| `toolchain-discovery-kit` | `nexusengine/domains/build/toolchain/toolchain-discovery` | Discover installed toolchains without shell evaluation. |
| `toolchain-provision-kit` | `nexusengine/domains/build/toolchain/toolchain-provision` | Provision approved exact official sources on demand after integrity and license checks. |
| `isolated-stage-kit` | `nexusengine/domains/build/toolchain/isolated-stage` | Create content-addressed build stages outside projects. |
| `process-execution-kit` | `nexusengine/domains/build/toolchain/process-execution` | Run argument-array commands inside an allowed Build stage. |
| `target-registry-kit` | `nexusengine/domains/build/target/target-registry` | Register explicit target providers and reject collisions. |
| `web-live-target-kit` | `nexusengine/domains/build/target/web-live/web-live-target` | Emit verified live ESM source, loader, service worker, and cache policy. |
| `web-static-target-kit` | `nexusengine/domains/build/target/web-static/web-static-target` | Emit a self-contained static Web directory. |
| `openxr-runtime-kit` | `nexusengine/domains/build/target/openxr/openxr-runtime` | Own OpenXR loader, session, spaces, frame timing, and lifecycle contracts. |
| `openxr-input-kit` | `nexusengine/domains/build/target/openxr/openxr-input` | Own OpenXR action sets, bindings, haptics, and input snapshots. |
| `openxr-render-kit` | `nexusengine/domains/build/target/openxr/openxr-render` | Own OpenXR views, swapchains, blend modes, and per-eye submission descriptors. |
| `android-xr-target-kit` | `nexusengine/domains/build/target/android-xr/android-xr-target` | Own Android ARM64 lifecycle, SDK/NDK, Gradle, APK, and OpenXR binding stages. |
| `pcvr-target-kit` | `nexusengine/domains/build/target/pcvr/pcvr-target` | Own Windows x64 host, OpenXR loader, executable package, and runtime validation stages. |
| `artifact-cache-kit` | `nexusengine/domains/build/artifact/artifact-cache` | Reuse successful immutable target artifacts by plan identity. |
| `artifact-manifest-kit` | `nexusengine/domains/build/artifact/artifact-manifest` | Create canonical per-target artifact manifests. |
| `artifact-integrity-kit` | `nexusengine/domains/build/artifact/artifact-integrity` | Verify every artifact file against SHA-256. |
| `artifact-output-kit` | `nexusengine/domains/build/artifact/artifact-output` | Publish immutable artifacts only outside source projects. |
| `project-immutability-kit` | `nexusengine/domains/build/proof/project-immutability` | Compare before and after project fingerprints byte-for-byte. |
| `cross-runtime-parity-kit` | `nexusengine/domains/build/proof/cross-runtime-parity` | Compare canonical replay outputs across target runtimes. |
| `target-validation-kit` | `nexusengine/domains/build/proof/target-validation` | Require target-specific executable artifact validation. |
| `web-module-linker-kit` | `nexusengine/domains/build/compile/web-module-linker` | Materialize a verified, content-addressed browser module closure from immutable project sources. |

## Lifecycle

- Duplicate install: Return the installed Build API without duplicate state or systems.
- Snapshot: Serialize Build state and descriptors.
- Reset: Restore the configured Build baseline.
