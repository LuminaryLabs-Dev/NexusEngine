# NexusEngine Memory

## Durable Purpose

NexusEngine is the atomic, idempotent, fully reusable Core runtime for
deterministic games and simulations. It owns universal contracts and behavior,
plus the isolated `n:build` build-time domain described below; it is not a
broad catalog of useful game features.

## Ownership

- `NexusEngine`: ECS, deterministic ticks, Runtime Kit and Domain Service Kit
  contracts, semantic Core Domains, composition, snapshot/reset/replay,
  validation, and the isolated Build Domain.
- `NexusEngine-Kits`: optional reusable behavior, concrete runtime providers,
  adapters, and policies that are niche, genre-specific, or platform-specific.
- Experiment and game repositories: complete games, authored recipes, presets,
  content, product UI, and tuning.
- `NexusEngine-Editor`: repository tooling, terminal access, guided-development
  control plane, concrete hosts, and editor integrations.
- `tests/`: isolated fixtures may use niche scenarios only to prove generic
  Core invariants; production source never imports them.

Ownership is fail-closed. A production capability enters Core only after its
atomicity, idempotence, neutrality, lifecycle, dependencies, and proof are
explicit in one Domain manifest. Migration uses a hard cutover with changelog
and import maps, never runtime forwarding exports.

## Build-Time Exception

- `n:build` is the sole platform-specific implementation exception physically
  owned by NexusEngine. It may contain compilers, target hosts, packaging code,
  and toolchain orchestration because none of it enters the application runtime
  graph.
- Runtime domains cannot import Build. Build may inspect and compile runtime
  contracts through public manifests and package surfaces.
- Build projects are read-only. Default staging, caches, source retrieval,
  toolchains, artifacts, and receipts live under `~/.nexusengine`.
- Dependencies are retrieved on demand from exact canonical upstream records,
  verified before use, and never downloaded by package postinstall hooks.
- Isolated npm stages normalize exact GitHub HTTPS and npm GitHub SSH lock
  records to canonical HTTPS, reject other SSH identities, and append rather
  than replace caller-provided Git rewrite rules.
- Repeated target flags normalize into one deterministic target set. Shared
  stages run once, target stages are isolated, and every target has its own
  receipt.
- Native success is never inferred from a plan. The `0.0.4` release gate requires
  real selected toolchains and validated Android XR and Windows PCVR packages;
  runtime and headset execution remain explicit post-release hardware proof.

## Runtime Shape

- `src/ecs.js`: deterministic ECS primitives.
- `src/engine.js`: engine construction, deterministic ticking, and runtime
  surfaces. It selects no renderer, shader compiler, material registry, host,
  storage implementation, or transport.
- `src/runtime-kit.js`: low-level installable Kit contract.
- `src/domain-service-kit.js`: addressable Domain Service Kit contract.
- `src/core-domains/`: the only production home for semantic Core behavior.
- `src/core-domains/*/domain.manifest.js`: canonical ownership, lifecycle,
  dependency, source, export, environment, and proof records.
- `src/core-domains/composition/`: catalog, planning, validation, immutable
  source review, transactional apply controller, and persistent receipts.
- `src/core-domains/mcp/`: opt-in provider registry and transport-neutral MCP
  contracts.
- `src/core-domains/build/`: build-only source analysis, IR, compilation,
  target, toolchain, artifact, receipt, and proof Kits. It is excluded from the
  runtime composition graph.

The catalog, package exports, ownership ledger, API reference, guide indexes,
MCP records, and release manifest are generated from Domain manifests. No
hardcoded Core Kit catalog or transitional source tree remains.

## Restored Behavior Decision

- The reusable semantics from 26 historical source modules are Core again as
  27 manifest-owned atoms. The historical World Physics module is split into
  World Contact and Soft Respawn.
- Nine optional adapter Kits own cross-Domain effects. Behavior atoms do not
  import private siblings or auto-install dependencies.
- Six Core recipes are composition data only. Authored presets, game rules,
  content, and tuning remain outside Core.
- Historical root exports and snapshots are not compatibility surfaces. The
  machine-readable restoration ledger owns old-to-new import, state, event, and
  configuration transformations.
- The current provider-neutral `createPhysicsKit` is not the historical World
  Physics behavior.
- The `0.0.5` architecture gives canonical Physics identity to `n:physics` and
  portable provider/state/command/event/query boundaries to
  `n:physics:contracts`. The root contract does not impersonate a provider or
  claim solver behavior. `n:simulation:physics` remains until a later proven
  consumer cutover removes duplicate ownership without forwarding aliases.
- `n:physics:lifecycle` owns six independent lifecycle atoms. Installation is
  the sole aggregate phase owner; Startup, Step, Shutdown, Reset, and Snapshot
  own separate state and coordinate only through declared public capability
  tokens. Concrete provider execution remains external. Coordinated reset and
  restore operations must roll every touched API back on failure.
- `n:physics:material` owns physical material records, friction, restitution,
  positive SI density, physical surface classification, and symmetric pair
  policy. Only the registry mutates records; specialist normalization and pair
  resolution are read-only. Visual materials, authored surface effects,
  colliders, contacts, solver impulses, and native provider handles remain
  outside this subdomain.
- `n:physics:world` owns immutable Physics world records, coordinate and bounds
  settings, gravity, generic force, physical wind, Physics-only time scales,
  and physical simulation regions. Sampling is deterministic and read-only;
  mutation uses exact-once receipts. Authored weather and semantic regions
  remain under `n:world`, Runtime owns clocks and scheduling, and bodies,
  contacts, solving, visual wind, game routes, and provider handles remain with
  their actual owners.
- `n:render` is the canonical backend-neutral Render execution identity.
  `n:render:contracts` owns portable provider obligations and resource, frame,
  resolved-pass, shader-interface, and event schemas. Presentation continues
  to own visual meaning and semantic render graphs; Host owns platform surface
  capabilities; Build owns target packaging; concrete renderers and GPU
  handles remain external. The contract package validates records but performs
  no allocation, shader compilation, pass execution, or frame submission.
- `n:render:lifecycle` owns selected-provider installation identity, startup,
  shutdown, reset, portable snapshot, and recovery receipts. It does not invoke
  provider code or replace Runtime lifecycle. Recovery resumes `ready` only
  from a ready provider receipt; otherwise it returns to `installed` for a new
  startup, and coordinated failures roll back every affected atom.
- `n:render:device` owns portable device identity, feature declarations,
  numeric limits, capability profiles, semantic memory reservations, logical
  queue receipts, device lifecycle, loss records, and read-only diagnostics.
  These atoms accept explicit provider receipts but never retain handles,
  allocate GPU memory, encode or execute commands, or repair a provider.
  Render Lifecycle remains the selected-provider composition owner; Device
  Lifecycle owns only the returned device's portable acquisition state.
- `n:render:resource` owns exact execution-resource identities and revisions,
  dependency lineage, portable references, lifecycle state, semantic cache
  indexing, claims over existing Device Memory reservations, external
  integrity evidence, and explicit upload/release receipts. Asset continues to
  own source identity, decoded content, and content caches. Concrete providers
  continue to own backend handles, allocation, command execution, upload,
  release, repair, and eviction.
- `n:render:buffer` owns portable logical Buffer descriptors, explicit field
  layouts, typed Vertex, Index, Uniform, Storage, Instance, and Indirect views,
  bounded update intent, and portable provider receipts. It depends on exact
  Resource identity and Device queue state but owns no source bytes, GPU
  handles, allocation, mapping, transfer, submission, or provider repair.
- `n:render:texture` owns portable Texture formats, exact logical Texture
  records, 2D/Cube/Array and attachment views, contiguous mip plans,
  Buffer-backed stream requests, and proven subresource residency. Asset owns
  source content and decoding; Resource owns exact identity and whole-resource
  lifecycle; Buffer owns staging bytes; Presentation owns visual and authored
  shadow meaning; Pipeline and Frame own attachment execution; providers own
  GPU handles, allocation, upload, mip generation, eviction, repair, and
  backend format mapping.
- `n:render:shader` owns portable language capability records, immutable
  source/include revisions, acyclic include closure, single-stage modules,
  linked program topology, deterministic variants, bounded read-only
  permutations, exact-once logical compile state, normalized provider
  reflection, and semantic cache links to resident `shader-program` Resources.
  It consumes the existing `shader-schema-kit` under `n:render:contracts` as
  the sole Shader interface schema owner. Providers own preprocessing,
  parsing, compilation, linking, binary artifacts, GPU programs, backend
  reflection execution, and repair; Material, Pipeline, and Presentation keep
  their existing semantic ownership.
- `n:render:material` owns exact portable Shader-slot association, parameter
  values, Texture and sampler bindings, instances, variants, current validation,
  and semantic cache lineage. Slot visibility exactly matches the Shader
  binding, and every current resolution rechecks required Texture resource and
  subresource residency so eviction invalidates dependent validation and cache
  use without mutating Material state. GPU binding objects and execution remain
  provider-owned; authored visual meaning remains Presentation-owned.
- `shader-schema-kit` has one canonical identity under `n:render:contracts`.
  The duplicate planned Shader capability row is dispositioned as reuse, not a
  second implementation.
- The `0.0.5` release flow freezes approved commit `A` as immutable
  `origin/0.0.5` after `A` is proven on `main`; `origin/0.0.4` remains
  unchanged and `main` remains the mutable line for progress toward `0.0.6`.
  The frozen branch must remain consumable through fresh Git HTTPS and
  jsDelivr `@0.0.5` imports.
  The Open Above tracks Engine HTTPS `#main`, but each lockfile and validation
  receipt must record the exact resolved SHA and pass the repeatable clean-build
  loop.
- The 2026-08-03 read-only follow-up audit found no additional proven Core atom
  in NexusEngine-Kits or the frozen ProtoKit inventory. Renderer-neutral
  instanced batching is the strongest future candidate but remains gated by a
  second consumer, multi-renderer proof, and existing Graphics parity.

## Composition Contract

Composition metadata never executes code. A host resolves exact approved
package/version/subpath/export/commit/SHA-256 records. Missing packages produce
an install receipt instead of being installed at runtime. Apply is approval
gated, transactional, exactly-once by plan identity, persisted across restart,
and independent of MCP after success.

## ProtoKit Decision

ProtoKits is retired as an implementation destination. The frozen source at
`0d102649267737230d618b30fe6f9465b198d234` is evidence only. Every frozen
source item has one disposition and reconstruction record. New reusable
non-Core work targets NexusEngine-Kits or another trusted registry; complete
behavior targets a game or experiment repository.

## Documentation

Modular Markdown under `docs/guide/` is canonical. The combined Markdown, HTML,
MCP chapter resources, and `docs/NexusEngine-Guide.pdf` are generated from
`docs/guide/book.json`. A Google Doc may be a review mirror after separate
approval, but accepted edits return to Markdown and the complete Doc is never
blindly reverse-imported.

## Agent Conventions

- Read `AGENTS.md`, `.agent/target.md`, and `.agent/tracker.md`.
- Version-cycle planning is repository-owned under `.agent/versions/<version>/`.
  Plans, matrices, checklists, readiness, delivery queues, and evidence indexes
  use repository-relative paths or stable `repo://<name>` references. Never
  commit a user name, home-directory path, temporary path, or sibling checkout
  location as planning authority.
- Use the NexusEngine-Editor guided-development harness and inspect its evidence.
- Consult `docs/KIT-OWNERSHIP.md` before production changes.
- Preserve other worktrees and generated evidence; never stash, reset, or absorb
  unrelated work.
- Do not push, publish, archive, mutate Drive, release, or create a numeric
  version branch without its explicit approval.

## Branch Policy

- `origin/0.0.4` is the frozen released snapshot and must not move.
- `main` is the mutable default development line for the `0.0.5` candidate.
- After the exact approved release commit passes every Engine, provider,
  consumer, documentation, and hosted gate on `main`, create immutable numeric
  branch `origin/0.0.5` at the same SHA after separate exact-SHA approval.
- After that freeze, `main` remains available for progress toward `0.0.6` and
  The Open Above continuously validates its exact lock-resolved SHA.
- Historical numeric branches are immutable. No force update, repair merge,
  deletion, or automatic publication is allowed.
