# Build Projects And Targets

`n:build` is NexusEngine's isolated build-time Domain. It is physically shipped
with the Engine so projects do not own compiler, toolchain, platform host,
packaging, artifact, or receipt logic. It is not installed by `createEngine()`
and cannot be imported by runtime Domains.

## Boundary

```txt
project (read only)              ~/.nexusengine (Build owned)
├── src                          ├── sources/<sha256>
├── content                      ├── toolchains/<identity>
├── assets                       ├── builds/<plan-hash>/<target>
├── tests                        ├── artifacts/<project>/<plan-hash>
└── package.json                 └── receipts/<plan-hash>.json
```

Build fingerprints every project file before planning and immediately before
execution. It fingerprints the project again after every aggregate run. Any
changed, added, or removed source path fails project immutability proof.

## Commands

```bash
nexusengine inspect ./project

nexusengine plan ./project \
  --profile native-preferred \
  --target web-live \
  --target web-static \
  --target android-xr \
  --target pcvr

nexusengine build ./project \
  --profile native-preferred \
  --out /absolute/artifact/root \
  --approve-plan sha256:<exact-plan-hash> \
  --target web-static
```

At least one repeated `--target` is required. Order and duplicates normalize to
one sorted target set, so they do not change the plan hash. An interactive
terminal may confirm the displayed exact plan. Noninteractive execution always
requires `--approve-plan`.

## Pipeline

```txt
read-only project inventory
-> SHA-256 source fingerprint
-> TypeScript compiler AST and typed diagnostics
-> AST-derived module, effect, and dependency analysis
-> Kit IR
-> deterministic Execution IR
-> whole-Kit portability classification
-> target capability and fallback selection
-> exact plan approval
-> isolated target stages
-> artifact integrity and project immutability proof
-> persistent receipt
```

The four whole-Kit execution modes are `native`, `native-adapter`,
`javascript`, and `unsupported`. JavaScript is not silently translated into
native behavior. A module must explicitly declare portable-native intent and
pass semantic parity before native lowering can be accepted.

## Targets

- `web-live` copies the local immutable module closure and generates a service
  worker that verifies every SHA-256 before populating a content cache.
- `web-static` emits a self-contained local directory and rejects unresolved
  external browser packages.
- `android-xr` shares OpenXR runtime, action, view, and submission contracts,
  then creates an external Android ARM64 Gradle/NDK stage and validates the APK
  closure without installing it on a device.
- `pcvr` shares the same OpenXR contracts, then adds Windows x64 host,
  generated-runtime linking, PE packaging, and no-runtime validation.

Native planning is not native proof. Supported numeric Kit IR lowers into
deterministic Rust; other whole Kits may use the QuickJS-NG sandbox only when
their requested capabilities are supported. OpenXR and QuickJS-NG source comes
from exact commits with verified archive SHA-256 values. A native target is
`package-proven` only after its target compiler and package validator succeed.
The release requires Linux Android XR and Windows PCVR package jobs; runtime and
headset execution remain separate `hardware: false` evidence for `0.0.4`.

## Source Security

Build accepts npm registry integrity, crates.io checksums, exact Git commits,
versioned vendor installers, and immutable HTTPS ESM URLs. Metadata discovery
does not execute source. Moving references, absent licenses, integrity
mismatches, path escapes, incomplete dependency closure, and duplicate source
identities fail before target execution.

The base npm install performs no Build downloads. Network provisioning is a
separate approved operation and caches verified bytes by content hash.

## MCP

The opt-in Build provider exposes:

```txt
build_targets_list
build_inspect
build_plan
build_apply
build_receipt_get
```

`build_apply` requires MCP authorization and the exact reviewed plan hash.
Repeated successful apply returns the existing receipt without rebuilding.
During a partial failure, successful target stages remain cached while blocked
or failed targets remain visible in the aggregate failed receipt.
