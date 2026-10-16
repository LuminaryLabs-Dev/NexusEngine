# Native host target

`n:build:target:host-native` builds and executes local Rust or Rust/Node contract
proofs. It is build-time only. It does not produce Android, XR, Flatpak, or a
redistributable Node runtime package.

Use `nexusengine/domains/build/target/host-native` through the existing Build
domain and MCP provider. See [the host build guide](https://github.com/LuminaryLabs-Dev/NexusEngine/blob/main/docs/BUILD-NATIVE-HOST.md)
for contracts, toolchain preflight, profiles, recovery, and limitations.
