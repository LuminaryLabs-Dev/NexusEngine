# Changelog

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

### Changed

- The package root now exposes only bootstrap/runtime contracts, Domain catalog
  records, and Composition entrypoints.
- Domain implementations use generated semantic subpaths under
  `nexusengine/domains/*` and semantic `n:*` identities.
- Host, renderer, SDK, storage, transport, model, and authored implementations
  are external leaf adapters.
- Debug behavior is owned by Diagnostics; inverse kinematics is owned by
  Simulation Motion; Object owns Shape, Fidelity, Vegetation, and Placement.

### Removed

- The transitional Core Kit source architecture and hardcoded Core catalog.
- Old root symbols, Core-prefixed Domain paths, old package subpaths, and all
  compatibility forwarding exports.
- Concrete Headless Editor, browser/native host, renderer, speech provider,
  model mock, and authored sky preset implementations from Core.
- Optional gameplay, complete-game behavior, and the active ProtoKit workflow.

See the [0.0.4 migration guide](docs/migrations/0.0.4-domain-cutover.md) and
[root-module dispositions](docs/migrations/0.0.4-root-module-dispositions.md).
