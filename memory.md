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
- Isolated npm stages preserve canonical `git+https` transport for exact Git
  records and append, rather than replace, caller-provided Git rewrite rules.
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
- Use the NexusEngine-Editor guided-development harness and inspect its evidence.
- Consult `docs/KIT-OWNERSHIP.md` before production changes.
- Preserve other worktrees and generated evidence; never stash, reset, or absorb
  unrelated work.
- Do not push, publish, archive, mutate Drive, release, or create a numeric
  version branch without its explicit approval.

## Branch Policy

- The remote default branch is the `0.0.4` integration line.
- After the exact remote default-branch SHA passes every release gate and a
  human approves that exact tuple, create immutable numeric branch `0.0.4` at
  the same SHA.
- Historical numeric branches are immutable. No force update, repair merge,
  deletion, or automatic publication is allowed.
