# Bundled Camel — experimental native slice

Install this NexusEngine revision, then explicitly install Camel. No global Camel CLI is needed. The checked-in artifact supports **macOS arm64 only**. Browser, Linux and Windows execution are unavailable; loading on those targets returns `CAMEL_TARGET_UNAVAILABLE`.

```js
import { createEngine } from 'nexusengine';
import { createCamelDomain } from 'nexusengine/domains/camel';

const engine = createEngine({ kits: createCamelDomain() });
const receipt = await engine.n.camel.execute(
  'workflow int Main() { return 6 * 7; }'
);
console.log(receipt.result.value); // 42
```

## Call the same installed Nexus domain from Camel

```js
import { createEngine } from 'nexusengine';
import { createDataKit } from 'nexusengine/domains/runtime/data';
import { createCamelDomain } from 'nexusengine/domains/camel';

const engine = createEngine({ kits: [
  createDataKit(),
  ...createCamelDomain({
    allowCalls: ['data.completion.createLedger:call']
  })
] });
await engine.n.camel.execute(`
  tool any NexusCall(string api, string[] path, any[] args) {
    handler = "nexus.call";
  }
  workflow any Main() {
    return NexusCall("data", ["completion", "createLedger"], ["example"]);
  }
`);
console.log(engine.n.data.completion.listLedgers()); // includes "example"
```

This single generic call tool resolves the installed public API registry on each call. It invokes the original method with its original receiver; there is no per-domain Camel wrapper or copied engine state. Internal and unavailable APIs are rejected. Grant exact calls with `api.member.path:call` or reads with `api.member.path:get`. A four-argument `nexus.call` declaration accepts an operation string. Do not grant calls that the program does not need. `nexus.discover` lists public APIs; it does not grant invocation permission. New public registrations are visible without reinstalling Camel.

`nexus.call` is classified as Shell for the upstream agent policy boundary because it can mutate arbitrary granted host state. Agents must explicitly allow their declared tool and its Shell capability as well as satisfy `allowCalls`. Trusted top-level workflows remain trusted Camel code. The native interpreter and source imports are not an OS sandbox.

## Configuration and lifecycle

- `allowCalls`: exact granted Nexus API/member/operation identities; default empty.
- `hostCapabilities`: explicitly enable upstream `fileRead`, `fileWrite`, `network` or `audio`; default empty. Source checking and trusted import loading are distinct from tool permissions.
- `modelProvider(request)`: supply an asynchronous OpenAI-compatible completion handler. No model endpoint or credential is bundled, and no live provider is contacted automatically.
- `filename`: trusted absolute source filename used for relative imports; omit it for source-only execution. Upstream imports can traverse parent directories. Only run trusted source.
- `steps`, `tasks`, `callDepth`: upstream execution budgets; defaults 100000, 64 and 128.
- `execute(source, { entry, args })`, `check(source)`, `discover()` and `status()` expose execution and observations. `check` returns a receipt and declaration metadata or throws a source-located compilation error.
- `cancel(id)` cooperatively stops interpreter work. Blocking native I/O can finish before cancellation takes effect. Cancellation does not undo external effects already accepted.
- `getSnapshot()` and `loadSnapshot()` preserve finished invocation receipts only. Active executions cannot be snapshotted. They do not snapshot the host engine or suspended interpreter stacks.
- `reset()` requires idle execution. `dispose()` requests cancellation; await outstanding execution promises before releasing the engine.

Queued subscriptions use an explicit `subscribe` call grant and callback descriptors shaped as `{ "$camel": "callback", "id": "name" }`. The public method must return an unsubscribe function or an object with `unsubscribe()`. Declare `nexus.poll` to retrieve queued events. Completion disposes subscriptions. Unsupported subscription shapes fail explicitly. Nested calls into the same Camel `execute`/`check` API are rejected.

Exact i64 results outside JavaScript's safe integer range use `{ "$camel": "bigint", "value": "..." }`; unsupported numbers and cycles are rejected. Opaque references are scoped to one execution and expire afterward. This is not a complete binding for every possible JavaScript API shape.

## Status and evidence

This is the tested native checkpoint, not complete Camel/Nexus feature parity. Browser execution, complete library-management and diagnostic APIs, full orchestration, live-stack resume and several resource/host integration cases remain incomplete. See `validation/native-evidence.json`, `runtime/source-provenance.json` and the pinned upstream specification. Do not treat compilation or receipt storage as proof of game acceptance.

The runtime source is pinned to Camel-Language `e7b770737516558652d38642583c6db184fd3fd4`. Local changes add cooperative cancellation and host-tool capability restrictions; see `runtime/source-provenance.json`. Preserve Apache-2.0 notices under `runtime/upstream/LICENSE` and third-party notices under `runtime/licenses/`.

To rebuild the native artifact on macOS arm64, install Rust 1.88+ and the platform C toolchain, run `cargo build --locked --release --manifest-path src/core-domains/camel/runtime/bindings/Cargo.toml`, copy the resulting `libnexus_camel_native.dylib` to `runtime/artifacts/darwin-arm64.node`, and update its SHA-256 in `runtime/artifacts/integrity.json`. Build other targets only after their embedding and runtime checks pass. Runtime loading never downloads a replacement binary.
