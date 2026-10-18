# Bundled Camel: browser WASM and native

The language interpreter is pinned to Camel 0.2.0, upstream commit `e7b770737516558652d38642583c6db184fd3fd4`. Install Camel explicitly. Browser execution uses the checked-in Rust WebAssembly artifact in a module worker; native execution retains the checked-in **macOS arm64** addon. Other native targets still return `CAMEL_TARGET_UNAVAILABLE` even if you build a temporary addon for testing.

```js
import {createEngine} from 'nexusengine/engine';
import {createCamelDomain} from 'nexusengine/domains/camel';

const engine = createEngine({kits: createCamelDomain()});
const receipt = await engine.n.camel.execute(
  'workflow int Main() { return 6 * 7; }'
);
console.log(receipt.result.value); // 42
```

The target is selected automatically: Node uses the native loader, a browser uses the WASM loader. `runtime: 'browser'` explicitly selects the browser target when needed. There are no eager Node-only imports on the browser path. Serve modules, the worker, integrity JSON and `.wasm` from the installed package, preserving their relative URLs; the [source example](./examples/browser.html) supplies an import map for its documented public package imports. Use HTTP on localhost or HTTPS. Web Crypto, module workers and WebAssembly are required. Each initial artifact fetch is bounded to 30 seconds; cancelling an invocation while the shared loader is pending drains that invocation immediately without cancelling another job’s shared download. CSP must permit the package worker and WebAssembly compilation. Runtime loading does not install a compiler, download a replacement runtime or contact a model service.

## Call the installed Nexus API

```js
import {createEngine} from 'nexusengine/engine';
import {createDataKit} from 'nexusengine/domains/runtime/data';
import {createCamelDomain} from 'nexusengine/domains/camel';

const engine = createEngine({kits: [
  createDataKit(),
  ...createCamelDomain({allowCalls: ['data.completion.createLedger:call']})
]});
await engine.n.camel.execute(`
  tool any Call(string api, string[] path, any[] args) {
    handler = "nexus.call";
  }
  workflow any Main() {
    return Call("data", ["completion", "createLedger"], ["example"]);
  }
`);
console.log(engine.n.data.completion.listLedgers()); // includes "example"
```

The generic bridge resolves the installed public API registry for each call and invokes the original method with its original receiver. The engine remains in its owning context; workers receive bounded serializable data or scoped opaque reference IDs. Internal, unavailable and ungranted API operations fail before invocation. New public registrations are visible without reinstalling Camel.

Grant exact operations as `api.member.path:call`, `:get` or `:subscribe`. A four-argument tool declaration can pass the operation string. `nexus.discover` lists public API metadata and does not grant permission. `nexus.call` retains the upstream Shell capability classification, so agents must also explicitly allow the tool and Shell capability in their Camel policy. Top-level workflows remain trusted code. Nested Camel lifecycle calls through this bridge are rejected.

Host promises suspend and resume the real Rust interpreter stack, preserving locals, loops, nested calls, exceptions and finally blocks without replaying side effects. A given interpreter never has concurrent export execution or more than one pending host request.

## Persistent browser sessions

```js
const camel = engine.n.camel;
const {id} = camel.start(`
  tool object Input() { handler = "nexus.input"; }
  tool object Update() { handler = "nexus.update"; }
  workflow int Main() {
    int total = 0;
    for (int i = 0; i < 3; i += 1) {
      object input = Input();
      object frame = Update();
      total += input.amount;
      log("total " + string(total) + " at frame " + string(frame.frame));
    }
    return total;
  }
`);
const completion = camel.wait(id);
camel.input(id, {amount: 2});
// Continue the application's existing engine.tick(delta) loop.
// Provide two more inputs, then await completion for the finished receipt.
// Or stop early:
camel.stop(id);
await completion.catch(error => console.log(error.message));
```

`start()` returns an ID immediately; `wait(id)` observes completion or failure. A session owns one Rust execution until return, failure, timeout or stop. `nexus.input` waits for a FIFO input item. `nexus.update` waits for a frame record. By default the existing engine lifecycle surface supplies committed tick-end records; Camel does not start a second scheduler. Frame updates coalesce to the latest available record. Browser sessions run asynchronously relative to engine ticks and are not a deterministic in-tick transaction.

Use `schedule: false` to supply your own `update(id, serializableRecord)` instead. Input queues default to 64 items and reject overflow; frame backlog never exceeds one item. `status().sessions` exposes waiting state and queue sizes. Restarting means calling `start()` again; hard stopping discards the old stack. Session control is currently browser-only. The example demonstrates actual Nexus ledger mutation, persistent counter state, button/keyboard input, cancellation and restart.

## Permissions, values and subscriptions

- `allowCalls`: exact Nexus operation grants; empty by default. The binding snapshots the grant list at creation.
- `hostCapabilities`: native-only `fileRead`, `fileWrite`, `network` and `audio` grants. Browser OS file access, microphone capture, blocking HTTP, filesystem/library imports and threaded `spawn` are unavailable and fail explicitly. They are never silently mapped to browser privileges or sequential tasks.
- `modelProvider(request, {signal, executionId})`: an asynchronous OpenAI-compatible completion handler in the owning context. The optional second argument supports browser/native cancellation notification. No endpoint, credential or model weights are bundled.
- `filename`: trusted native source filename for relative imports. Browser source-only execution rejects filesystem resolution. Native source loading is not an OS sandbox.

Queued subscriptions use an explicit `:subscribe` grant and callback data shaped as `{ "$camel": "callback", "id": "name" }`. In Camel, construct tagged data with `json.parse()` or pass it as an argument. The method must return an unsubscribe function or an object with `unsubscribe()`. `nexus.poll` retrieves queued callback records. Subscription arguments are validated before the external method runs. Completion, cancellation and disposal clean up subscriptions; a delayed subscribe result is also cleaned up if the execution was already stopped. Unsupported callback data or event overflow fails explicitly.

Exact signed i64 values outside JavaScript's safe range use `{ "$camel": "bigint", "value": "..." }`. Undefined uses `{ "$camel": "undefined" }`; opaque references use `{ "$camel": "reference", "id": "..." }` and expire with their invocation. Plain data crosses by value. Functions, class instances and other opaque JavaScript objects stay in the owning context. Malformed tags, cycles, accessors in plain data, symbols, unsafe numbers and prototype-related keys are rejected. This is not a binding for every possible JavaScript API shape.

## Budgets and lifecycle

- `steps`, `tasks`, `callDepth`: defaults 100000, 64 and 128. Browser `spawn` is unsupported; the tasks limit remains relevant to native execution.
- `sessionSteps`: cumulative browser-session fuel; defaults to `steps`. Increase explicitly for longer interactive sessions. State is retained between frames, and fuel is not replenished by whole-program restarts.
- `timeoutMs`: browser wall-clock limit, 30000 ms for one-shot calls and 1800000 ms for sessions by default, configurable up to one day. An execution option can override configuration. It includes waiting on host promises. Native blocking I/O still follows native behavior.
- `maxActive`, `maxReceipts`, `maxInputs`, `maxEvents`, `maxReferences`: defaults 8, 128, 64, 1024 and 1024. Old finished receipts are evicted at the configured count. Messages are bounded to 1 MiB, depth 64 and 100000 nodes. Browser logs are bounded to 256 entries, 64 KiB each and 1 MiB total. WASM linear memory is capped at 128 MiB per worker.
- `cancel(id)`/`stop(id)`: native cancellation is cooperative; browser cancellation terminates the worker and loses the suspended stack. Hard termination does not execute Camel finally blocks or reverse already accepted host effects. A provider receives an AbortSignal; arbitrary host promises may still finish. Late results cannot revive a terminated worker.
- `getSnapshot()`/`loadSnapshot()` preserve finished receipts only. Live executions cannot be snapshotted; engine state and suspended stacks are not included. Restore validates all receipts before changing stored state.
- `reset()` requires all execution promises to drain. `dispose()` is idempotent, cancels active work and removes tick subscriptions; await pending promises before releasing the engine.

## Evidence and rebuilding

This remains an experimental implementation, not complete cross-platform or Camel/Nexus feature parity. `validation/browser-evidence.json` distinguishes real WebKit 26.0 checks, Node transport checks, native Rust-source tests and a temporary Linux N-API build. It does not claim Safari/Chromium/Firefox/Windows acceptance or a fresh run of the checked-in macOS addon. The existing macOS artifact and integrity record are unchanged.

See `runtime/wasm/README.md` for pinned browser builds, continuation design, reproduction commands and deliberate future-upgrade steps. Native rebuilding remains `cargo build --locked --release --manifest-path src/core-domains/camel/runtime/bindings/Cargo.toml` on a matching host; update a published native artifact and its integrity record only after target-specific embedding tests pass. Apache-2.0 upstream and third-party notices remain under `runtime/upstream/LICENSE` and `runtime/licenses/`.
