# Changelog

## Unreleased

- Added public contribution, security, operations, and visual-identity guides.
- Added an agent-readable repository profile and reusable repository image
  pack under `docs/assets/brand/`.
- Clarified package status, publication evidence, and the current license-file
  limitation without changing runtime behavior.

## 0.0.4

### Added

- Domain manifest v2 with explicit ownership, lifecycle, dependencies,
  environments, executable sources, and proof references.
- Manifest-generated catalog, package exports, ownership ledger, API reference,
  guide indexes, MCP resources, and SHA-256 registry identity.
- Semantic Runtime, Composition, MCP, Spatial, Object, World, Simulation,
  Actor, Interaction, Presentation, and Infrastructure Domain families.
- Approval-gated transactional Composition apply with immutable source review,
  rollback, persisted exactly-once receipts, and missing-package receipts.
- Paginated MCP atom, recipe, registry-source, Domain, and guide-resource
  discovery with exactly two workflow prompts.
- Frozen ProtoKit extraction ledger with complete source-item disposition and
  reconstruction records.
- Canonical modular guide source and generated Markdown, HTML, MCP chapter
  resources, and validated PDF.
- Isolated `n:build` Domain with 15 semantic subdomains, 46 atomic Kits,
  generated package subpaths, catalogs, source records, and AI traversal data.
- `nexusengine` CLI and approval-gated Build MCP tools for project inspection,
  deterministic multi-target planning, execution, and persistent receipts.
- Read-only Web Live and Web Static targets with content integrity, isolated
  stages, browser startup proof, partial-failure caching, and project
  immutability checks.
- Deterministic Rust lowering for the supported numeric Kit IR subset and an
  actual capability-restricted QuickJS-NG whole-Kit sandbox.
- Shared OpenXR loader, session, input, haptic, frame, view, swapchain, and
  stereo-submission source generated against an exact Khronos source revision.
- Android XR APK and Windows PCVR executable package builders with external
  native stages, structural validators, immutable source receipts, and required
  hosted package-proof jobs. Hardware execution remains separate.
- Target-specific reachable module graphs declared through exact
  `nexusengineBuild.entries`, while excluded analysis files remain covered by
  the whole-project immutability fingerprint.
- Web artifact diagnostics containing the exact plan, registry, dependency
  closure, Engine source, and linker identities.
- Twenty-seven manifest-owned behavior atoms reconstructed from 26 removed
  source modules across World, Spatial, Simulation, Interaction, Runtime, and
  Presentation.
- Nine independently installable cross-Domain adapter Kits and six declarative
  recipes for the restored behavior graph.
- A machine-readable restoration ledger with exact source checksums, historical
  exports, corrected defects, semantic replacements, and proof references.
- A pinned read-only post-restoration audit of the current Kits registry and
  frozen ProtoKit inventory; no additional Core atom passed every promotion
  gate.

### Changed

- The package root now exposes only bootstrap/runtime contracts, Domain catalog
  records, and Composition entrypoints.
- Domain implementations use generated semantic subpaths under
  `nexusengine/domains/*` and semantic `n:*` identities.
- Host, renderer, SDK, storage, transport, model, and authored implementations
  are external leaf adapters.
- Debug behavior is owned by Diagnostics; inverse kinematics is owned by
  Simulation Motion; Object owns Shape, Fidelity, Vegetation, and Placement.
- `n:build` is the sole concrete-platform exception inside the package. It is
  build-time only, is absent from the package root and runtime graph, and owns
  no project-generated state.
- Hosted release workflows are read-only checks; obsolete workflows that
  generated commits directly on the default branch are removed.
- Duplicate Kit installation now compares a generated SHA-256 fingerprint, and
  Transaction replay now compares the complete request hash before returning
  an original exactly-once receipt.
- Exact npm lock records using GitHub HTTPS or npm's GitHub SSH spelling now
  resolve to one canonical HTTPS source identity; moving refs and other SSH
  sources still fail before Build mutation.
- Vegetation ecology exposes the correctly named
  `scoreVegetationSuitability` helper at the canonical Object/Vegetation
  package subpath.
- The historical overloaded World Physics behavior is split into World Contact
  and Soft Respawn. The current provider-neutral `createPhysicsKit` remains a
  separate Physics contract.

### Removed

- The transitional Core Kit source architecture and hardcoded Core catalog.
- Old root symbols, Core-prefixed Domain paths, old package subpaths, and all
  compatibility forwarding exports.
- Concrete Headless Editor, browser/native host, renderer, speech provider,
  model mock, and authored sky preset implementations from Core.
- Genre-specific gameplay, authored presets, complete-game behavior, and the
  active ProtoKit workflow. Their universal primitives may exist as explicit
  semantic atoms, but no game-shaped defaults or compatibility aliases return.

See the [0.0.4 migration guide](docs/migrations/0.0.4-domain-cutover.md) and
[restored behavior migration](docs/migrations/0.0.4-restored-behaviors.md), plus
the [Build Domain migration](docs/migrations/0.0.4-build-domain.md).
