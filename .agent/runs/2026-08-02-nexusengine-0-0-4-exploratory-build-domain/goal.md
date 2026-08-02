# Development Target

## Goal

Implement the NexusEngine `0.0.4` exploratory Build Domain as a manifest-driven,
atomic, project-immutable build system under `n:build`.

## Mode

Implementation

## Source Baseline

- NexusEngine implementation worktree: current branch and committed Core
  consolidation at `a68544434424438491be1398e3f3d5aced5bc5ee`.
- Legacy native evidence may be read from NexusEngine-Rust and historical
  Builder repositories, but those repositories remain unchanged.
- Existing Engine, Kits, Editor, Simulator, Experiments, The Open Above, and
  KitUniverse worktrees remain independent. Never absorb their dirty work.

## Architecture Contract

- `n:build` physically owns build-time source analysis, dependency resolution,
  IR, compilation, toolchain orchestration, target implementations, artifacts,
  receipts, and proof.
- `n:build` is the sole intentional platform-specific implementation exception
  inside NexusEngine. Runtime domains remain platform-neutral and cannot import
  Build; Build never enters an application runtime composition graph.
- Every behavior belongs to one semantic Build subdomain and one atomic Kit.
  The root Build entry only composes those Kits.
- Projects are read-only. All staging, caches, toolchains, receipts, and default
  artifacts live outside project roots under `~/.nexusengine`.
- Dependencies come from canonical immutable upstream records only when a
  selected target needs them. The package has no download postinstall hook and
  hosts no prebuilt dependency bundles.

## Required Interfaces

- Generate public subpaths for Build and each semantic Build subdomain without
  exposing Build from the package root.
- Add a `nexusengine` CLI with `inspect`, `plan`, and approval-gated `build`.
- Normalize repeated trailing `--target` flags into one sorted unique target
  set; at least one target is required.
- Expose `listTargets`, `inspect`, `plan`, `apply`, `getReceipt`, `snapshot`,
  and `reset` from the Build service.
- Add MCP tools `build_targets_list`, `build_inspect`, `build_plan`,
  `build_apply`, and `build_receipt_get`; apply requires the exact plan hash.

## Required Build Flow

```txt
project source
-> immutable source fingerprint and module graph
-> JavaScript/TypeScript AST and effect/type analysis
-> Kit IR and Execution IR
-> whole-Kit portability classification
-> shared deterministic plan
-> approved target fan-out
-> isolated target artifacts and receipts
```

Supported execution classifications for `0.0.4` are `native`,
`native-adapter`, `javascript`, and `unsupported`. Function-level hybrid
fallback is deferred.

## Required Targets

- `web-live`: immutable source/import manifest and verified runtime cache policy.
- `web-static`: a self-contained static artifact with no runtime remote closure.
- `openxr`: shared native runtime, input, and render contracts.
- `android-xr`: Android ARM64 host/package plan over shared OpenXR behavior.
- `pcvr`: Windows x64 host/package plan over shared OpenXR behavior.

Targets must fail closed with structured requirements when required external
toolchains, licenses, credentials, operating systems, runtimes, or hardware are
not available. A descriptor or plan is not a claim that a native binary ran.

## Completion Criteria

- The Build Domain tree, subdomain manifests, atomic Kit manifests, generated
  indexes, package exports, Build catalog, source registry, API reference, and
  target reference are internally consistent and drift checked.
- Planning, approval, receipt reuse, reset, snapshot/load, deterministic hashes,
  target normalization, partial failure, and project immutability are proven.
- JavaScript/TypeScript analysis uses a real parser rather than regex source
  inference, and unsupported effects fail closed before execution.
- Web-live and web-static complete through fresh fixtures without mutating the
  project. Native targets produce truthful validated plans and only report
  success when their selected toolchains and target validators actually run.
- Runtime-to-Build imports, output inside source projects, moving references,
  integrity mismatches, path escapes, unapproved apply, and changed-content
  replay are rejected.
- Existing Engine release gates remain green and Build evidence is recorded in
  the guided-development run.

## External Gates

- Do not push, publish, release, deploy, mutate Google Drive, archive a source
  repository, install to hardware, or create `origin/0.0.4` without separate
  explicit approval.
- Hardware proof requires one Android OpenXR headset and one Windows PCVR
  OpenXR runtime/headset. Record absence as an external blocker, never as pass.
- The Open Above showcase and consumer SHA propagation occur only after the
  Engine Build surface is committed and locally proven.
