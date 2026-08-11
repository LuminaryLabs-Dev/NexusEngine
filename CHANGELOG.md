# Changelog

## Unreleased

- Added canonical `n:render` and `n:render:contracts` ownership with atomic
  Domain, provider, resource, frame, resolved-pass, shader-interface, and event
  contract Kits.
- Added strict portable Render execution records that reject unknown fields,
  duplicate references, backend handles, cycles, non-plain objects, and
  non-finite values.
- Added canonical `n:render:lifecycle` ownership with six atomic provider
  installation, startup, shutdown, reset, snapshot, and recovery Kits.
- Added exact-once provider lifecycle receipts, coordinated rollback, portable
  composed snapshots, and explicit recovery outcomes for in-place resume or a
  required fresh startup.
- Added canonical `n:render:device` ownership with nine atomic device contract,
  feature, limit, capability, memory, queue, lifecycle, loss, and diagnostics
  Kits.
- Added strict portable device records, deterministic feature and limit
  negotiation, exact-once memory and queue accounting, explicit provider
  receipts, loss resolution, and read-only aggregate diagnostics.
- Added canonical `n:render:resource` ownership with ten atomic contract,
  identity, reference, state, lifecycle, cache, budget, upload, release, and
  integrity Kits.
- Added deterministic resource revision lineage, reference-guarded release,
  Device Memory claim mapping, queue-backed provider receipts, content
  integrity evidence, repeat-stable lifecycle state, and semantic cache
  eviction selection without provider execution.
- Added canonical `n:render:buffer` ownership with eight atomic logical Buffer,
  layout, Vertex, Index, Uniform, Storage, Instance, and Indirect Kits.
- Added exact Resource-backed Buffer revisions, explicit portable field
  layouts, bounded typed views, queue-correlated update receipts, immutable
  update rejection, and deterministic snapshot and replay behavior.
- Added canonical `n:render:texture` ownership with eleven atomic Texture
  format, resource, 2D, Cube, Array, render-target, depth, shadow, mipmap,
  stream, and subresource-residency Kits.
- Added exact Resource-backed Texture revisions, strict portable format and
  subresource views, contiguous mip plans, Buffer-bounded stream payloads,
  queue-correlated provider receipts, exact mip content identity, and
  deterministic residency admission and eviction state.
- Added canonical `n:render:shader` ownership with twelve atomic Shader
  contract, language, source, include, module, program, variant, permutation,
  error, compile, reflection, and cache Kits while reusing the existing
  canonical `shader-schema-kit` under `n:render:contracts`.
- Added immutable SHA-256 source closure, acyclic include resolution, strict
  program topology, bounded read-only permutation expansion, capability- and
  queue-validated exact-once compile receipts, normalized provider reflection,
  and resident `shader-program` Resource cache linkage without compiler or GPU
  execution in Core.
- Added canonical `n:render:material` ownership with nine atomic contract,
  binding, parameter, Texture-binding, sampler-binding, instance, variant,
  validation, and semantic-cache Kits.
- Added exact Shader-slot visibility matching, strict portable Material
  composition records, current Texture residency revalidation, deterministic
  composition hashes, and cache rejection after dependent resource eviction.
- Kept renderer-neutral visual meaning and graph planning in Presentation,
  host surfaces in Host, target packaging in Build, and concrete GPU execution
  in external providers.
- Added canonical `n:physics` and `n:physics:contracts` ownership with atomic
  Domain, provider, state, command, event, and query contract Kits.
- Added strict deterministic Physics transport schemas that reject unknown
  fields, backend handles, cycles, non-plain objects, and non-finite values.
- Moved the Physics contract implementations to their manifest-owned semantic
  folders while retaining their generated public package subpaths.
- Added canonical `n:physics:lifecycle` ownership with six atomic installation,
  startup, step, shutdown, reset, and snapshot Kits.
- Split the old installation Kit's immediate-ready lifecycle into explicit
  provider-neutral stages with exact-once receipts, strict sequencing,
  cross-Kit rollback, and portable composed snapshots.
- Removed the transitional `nexusengine/domains/physics/installation` export;
  installation now uses `nexusengine/domains/physics/lifecycle/installation`
  with no forwarding compatibility layer.
- Added canonical `n:physics:material` ownership with atomic friction,
  restitution, density, physical-surface, combine-policy, and registry Kits.
- Added immutable exact-once physical material records and symmetric pair
  resolution with explicit coefficient modes and deterministic precedence.
- Kept renderer materials, authored surface effects, colliders, contacts,
  solver impulses, and concrete provider handles outside the material domain.
- Added canonical `n:physics:world` ownership with atomic world-settings,
  gravity-field, force-field, wind-field, time-scale, simulation-region, and
  immutable Physics world registry Kits.
- Added deterministic uniform, radial, point, gust, and corridor sampling with
  strict portable records, exact-once definitions, stable region precedence,
  world bounds policy, and read-only aggregate Physics world samples.
- Kept authored weather, semantic World regions, Runtime clocks, body response,
  solver execution, visual wind, game routes, and native provider state outside
  the Physics World subdomain.
- Added public contribution, security, operations, and visual-identity guides.
- Added an agent-readable repository profile and reusable repository image
  pack under `docs/assets/brand/`.
- Made hosted release proof provision Poppler explicitly and resolve Android
  `sdkmanager` from the configured SDK root rather than assuming it is on
  `PATH`.
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
