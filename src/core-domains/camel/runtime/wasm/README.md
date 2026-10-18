# Browser build and continuation boundary

The language baseline remains Camel-Language `e7b770737516558652d38642583c6db184fd3fd4`, edition 0.2.0. This is a deliberate local browser port of that source, not an upstream version upgrade. `../source-provenance.json` records original Git blobs and current local hashes; `../browser-provenance.json` records the build inputs and artifact identity.

## Rebuild

Use official Rust 1.90.0 with `wasm32-unknown-unknown`, Node 18+ and npm. From this directory:

```
npm ci
npm run build
```

`rust-toolchain.toml`, Cargo.lock and package-lock.json pin toolchain/dependency resolution. The script rejects other Rust/Binaryen versions and unexpected RUSTFLAGS. It compiles the same upstream Rust frontend/evaluator with target gates, then runs Binaryen 123.0.0 Asyncify with only `camel.host_request` marked asynchronous. It strips debug metadata, remaps checkout/Cargo-registry paths. The raw module has a 128 MiB maximum linear memory, a 2 MiB Rust stack, and a separate 2 MiB Asyncify stack. Exact bytes are pinned by the integrity manifest; byte-for-byte reproducibility across different checkout paths is not claimed. Update both artifact and integrity JSON together after the full test suite passes. No build or runtime step silently fetches a different Camel version. No GitHub Actions are added.

## Host calls and safety

`camel_execute` enters the original evaluator. Its `host_request` import captures one request and starts Asyncify unwinding. After the export returns in the unwinding state, JavaScript waits for the owning-context promise, starts rewind and re-enters the same export. The import consumes the saved response once and stops rewind. Locals, nested calls, control flow, exceptions and finally blocks resume where suspended. Host effects are never replayed to reconstruct state. Imported logs and time are synchronous; no other import can suspend. Indirect calls remain conservatively instrumented.

Only one export invocation and one outstanding request are allowed per interpreter. Request/response strings are copied before crossing contexts. Reply data is copied into a Rust-owned response buffer after rewind reaches the import, without allocating or invoking other exports while suspended. Workers own their stack/memory lifetime. Completion, failure, timeout and cancellation terminate the worker, drop request IDs and unsubscribe owner-context callbacks. A late host promise cannot resume freed WASM state. If a subscribe promise resolves after disposal, its returned cleanup is immediately called.

Worker termination is a hard stop and loses the suspended session. It does not unwind Camel finally blocks and cannot roll back a host effect already accepted. Providers receive an AbortSignal; arbitrary Nexus promises may finish after cancellation. Native cancellation remains cooperative. Live stacks are not portable snapshots. The browser worker is an execution boundary, not an authority to invoke ungranted Nexus operations.

## Target gates

The existing native `lib.rs` implementation is included unchanged from `native.rs` on non-WASM targets. Browser builds exclude cpal, reqwest, tempfile and the library manager as runtime dependencies. The frontend, static checking, interpreter, limits, agent logic and portable values are shared. Browser `spawn` is rejected before thread creation; it is never reinterpreted as eager sequential execution. Browser OS services are unavailable; permitted async model and Nexus operations run in the owning context. Native source tests continue to prove threaded task behavior.

## Validation

From `../../tests`:

```
npm ci
npx playwright install webkit
npm test
npm run test:node
```

The browser runner uses real WebKit by default and also accepts CAMEL_BROWSER=firefox. CAMEL_BROWSER_EXECUTABLE can select an installed matching browser. It serves the repository snapshot locally, tests actual installed Nexus state, and exercises the shipped example's public imports, input button, keyboard input, cancellation and restart. It never starts Chrome. CAMEL_EVIDENCE_DIRECTORY saves a JSON result and screenshot. Node transport tests are separately labeled and do not substitute for browser evidence.

Native source regressions: `cargo test --locked --manifest-path ../upstream/runtime/Cargo.toml`. On a native build host, build `../bindings/Cargo.toml`, copy/rename its library to a temporary `.node`, and set CAMEL_NATIVE_ARTIFACT when running `../../tests/run-native-addon.mjs`. A task-local addon build is not a published platform artifact.

Repository AGENTS.md requests an external Editor controller and writes outside this domain. The explicit user boundary allows changes only under Camel, so those files and the other repository were left untouched. Domain-local source, test, provenance and before/after evidence document this exception. Repository-wide generated ledgers and release checks are not claimed as rerun.

## Future upstream upgrades

Read the new upstream diff first. Reapply/replace each local target gate and ABI adapter intentionally. Preserve native tests; rerun browser continuation failure/reentrancy/teardown and installed-composition checks; regenerate locks, license notices, source hashes and artifact integrity; review API and unsupported-capability changes. Do not overwrite this port with an unreviewed upstream subtree.
