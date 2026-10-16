# Host Native Target Kit

The kit owns local host packaging, generated Node-API facades for the numeric
Rust ABI, embedded Node startup, and executable host validation. Its required
compiler, process, and ABI services come from the existing Build kits.

- Pure native entry: Rust executable; no Node runtime.
- Hybrid entry: compiled numeric Rust functions plus supported Node modules.
- Toolchain: required-interface C++ probe, exact Node library/header hashes,
  standalone Cargo workspace and explicit output directory.
- Evidence: `src/core-domains/build/tests/host-native.mjs`.
- Scope: local development proof; other targets and redistribution remain gated.
