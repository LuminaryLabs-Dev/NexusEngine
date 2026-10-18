# Camel domain

`n:camel` executes the pinned Camel 0.2.0 Rust interpreter against the same installed public Nexus APIs. The runtime kit now supports a bundled, integrity-checked WebAssembly interpreter in browser module workers as well as the existing macOS arm64 native artifact.

- One-shot `execute` and `check` retain their receipt API.
- Browser `start`, `input`, `update`, `wait` and `stop` keep one interpreter stack alive across inputs and committed Nexus ticks.
- Binaryen Asyncify suspends the real Rust stack for asynchronous host calls. There is no JavaScript language reimplementation or whole-program replay.
- Exact `allowCalls` grants, bounded messages/queues, execution limits and subscription disposal protect the bridge. Engine objects stay in their owning JavaScript context; workers receive data and scoped reference IDs.

The domain remains experimental. WebKit 26.0 browser integration and native Rust/addon-source regressions are recorded in `validation/browser-evidence.json`. Firefox was blocked by the test environment; Safari, Chromium, Windows and the checked-in macOS addon were not rerun here. Browser OS files, microphone, blocking HTTP, installed-library imports and threaded `spawn` fail explicitly. Native concurrency semantics are unchanged.

See [USAGE.md](./USAGE.md), the [browser example](./examples/browser.html), and [build/provenance notes](./runtime/wasm/README.md).
