# Native and hybrid host builds

The `host-native` target proves application execution on the build machine. It
extends `n:build:compile`, `n:build:toolchain`, and `n:build:target`. It is not an
Android, XR, Flatpak, or redistributable Node runtime package.

## Resolution

Use the existing Build MCP tools: `build_inspect`, `build_plan`, `build_apply`,
`build_receipt_get`, `build_job_get`, and `build_cancel`. Application runtime
compositions must not import the Build domain.

The host resolver groups cyclic imports and keeps those groups in one Node
environment. Supported stateless numeric modules compile to Rust. Automatic
selection requires numeric parameter and return contracts (TypeScript or
JSDoc), or the existing explicit `nexusBuildMode = "native"` numeric profile.
Untyped JavaScript is retained in Node: `left + right` must not silently change
from possible string concatenation to numeric addition.

The current Rust subset is exported, synchronous numeric functions with one
return expression using numeric literals, parameters, unary signs, and basic
arithmetic. The host bridge supports at most eight numeric arguments. Node
modules retain their normal shared module identity, asynchronous behavior, and
internal callbacks. Native asynchronous callbacks, object handles, events,
and arbitrary JavaScript-to-Rust translation are not implemented.

Bare third-party packages and native addons remain blocked in the host target
until their executable closure is proven. Existing web targets retain their
verified web linker. A new native provider must have an actual implementation
and contract/parity evidence; matching an API name is not substitution proof.
There is no native-provider substitution registry in this first implementation.

## Toolchain compatibility

`toolchainDiscovery.selectCpp()` syntax-checks the required interface using an
argument array and bounded input, without shell evaluation. It tries `CXX`
when configured, then `c++`. The selected compiler, version, probe hash, and
attempts are included in the plan. It does not install compilers implicitly.

Embedded Node requires a shared `libnode` and development headers from the
same installed Node build. The prefix defaults to the current Node installation;
set `NEXUS_NODE_PREFIX` if necessary. The library and header hashes are checked
again after approval. The process entry shim uses Node's public `Start`
signature without importing unused V8 C++ templates. The generated addon uses
Node-API headers. This avoids the observed Apple compiler incompatibility with
unneeded V8 templates while still probing the interface actually compiled.

Generated Rust crates include an empty `[workspace]`. Host Cargo invocations
use an explicit target directory. Parent Cargo workspaces and target-directory
settings therefore do not redirect these outputs into an application checkout.

The validated host is Apple Silicon macOS. Other hosts require their own
execution evidence. A missing or incompatible toolchain produces a blocker.
Android Node execution is not enabled by a successful Mac proof.

## Profiles and artifacts

`native-preferred` allows declared Node fallback. The generated JavaScript
facades and native bindings use the same compiler export records and numeric
ABI description. Original compiled module logic is replaced with a facade;
only fallback modules keep JavaScript execution.

`strict-native` rejects interpreted groups. A native-only host application
needs a numeric entry contract in `package.json`:

```json
{
  "type": "module",
  "module": "math.mjs",
  "nexusengineBuild": {
    "nativeEntry": {"export": "multiply", "arguments": [6, 7]}
  }
}
```

For that supported entry, the artifact contains an executable Rust program
without a Node host or JavaScript runtime. The numeric entry rejects nonfinite
results. Hybrid artifacts embed Node through its shared library and include
explicit host requirements. They are marked `redistributable: false` because
the complete Node native-library closure is not assembled.

## Recovery and validation

Reviewed plans, job status, and receipts are persisted. Reapplying after a
service restart reconstructs the plan and checks its exact hash and source
fingerprint. Restored snapshots retain the existing inspection-only semantics.
Concurrent applies within one Build service share one active execution.
Independent processes must use separate state roots; a cross-process job lease
is not implemented.

Cancellation terminates the active host process group and preserves completed
artifacts. A service restart reports unfinished jobs as interrupted. Cached
artifacts are rechecked for integrity before reuse. The receipt separates host
execution from device validation.

Run:

```sh
npm run test:build:host-native
node src/core-domains/build/tests/native-lowering.mjs
node src/core-domains/build/tests/full-build-loop.mjs
node src/core-domains/build/tests/mcp-build.mjs
node src/core-domains/build/tests/multi-target.mjs
```

The host proof covers generated Rust/Node calls, actual Node crypto and
promises, cyclic module identity, numeric argument validation, compiler
fallback, parent Cargo configuration, strict-native rejection, a Rust-only
entry, source mutation rejection, exact MCP authorization, restart recovery,
and cancellation. Host proof does not establish Vulkan/OpenXR rendering,
hand tracking, management services, or kiosk enforcement.
