# NexusEngine Memory

## Durable Purpose

NexusEngine is the atomic, idempotent, fully reusable Core runtime for
deterministic games and simulations. It owns contracts and universal behavior,
not a broad catalog of useful gameplay features.

## Ownership

- `NexusEngine`: Core ECS, scheduling, events, resources, queries, surfaces,
  runtime-kit and DSK contracts, universal Core domains, composition,
  snapshot/reset/replay, and validation.
- `NexusEngine-Kits`: trusted reusable behavior that is optional, niche,
  genre-specific, or platform-specific.
- Experiment and game repositories: complete games, presets, authored content,
  routes, UI, product behavior, and product tuning.
- `tests/`: isolated fixtures may use niche scenarios only to prove generic
  Core invariants. They are never exported or imported by production source.

Ownership is fail-closed. A production feature remains in Core only after every
Core requirement is proved. No compatibility forwarding export keeps migrated
behavior in the Core API.

## Runtime Shape

- `src/ecs.js`: deterministic ECS primitives.
- `src/engine.js`: engine construction, ticking, and surfaces.
- `src/runtime-kit.js`: installable and composable runtime kits.
- `src/domain-service-kit.js`: addressable DSK contracts.
- `src/game-kit-composer.js`: additive dependency-ordered composition.
- `src/core-domains/`: semantic owners of Core capabilities. Each migrated
  domain owns its contracts, state, Kits, providers, adapters, and manifest.
- `src/core-kits/`: transitional home for unmigrated Core capabilities and the
  shared `core-capability-kit.js` helper. Delete it only after domain-by-domain
  parity and zero-import gates pass.
- `src/renderers.js`: generic headless adapter only; presentation adapters are
  resolved outside Core.
- `src/shaders.js`: generic shader and material registries only.
- `src/sequences.js`: generic deterministic orchestration with host-supplied
  controllers.

Simulation stays deterministic and presentation-agnostic. Stateful Core
behavior has stable defaults and explicit snapshot/reset expectations.

## Current Migrations

- Core Composition reads explicit domain manifests without filesystem scanning.
  It owns stable plans and exactly-once apply receipts; the application host
  owns trusted factory resolution, approval, mutation, and runtime lifecycle.
  `core-composition-domain`, `core-mcp-domain`, and the complete Object family
  are the first domain-owned implementations.
- Core MCP is opt-in. Applications install `mcp-registry-kit`, register their
  own providers, and explicitly connect a transport.
- `n:object` owns Object, Shape, Fidelity, Vegetation, and Placement. Placement
  derives intrinsic bounds, pivot, and ground anchor from registered Objects.

- Fishing behavior, its renderers, shaders, realism profile, and terrain binding
  live in `@luminarylabs/nexusengine-kits/fishing-kit`.
- Optional AR, interaction, combat, companion, camera, ragdoll, placement,
  objective, spatial, collectible, sorting, reveal, target, lock, and render
  descriptor factories live in `@luminarylabs/nexusengine-kits`.
- Reef Rescue lives in its own game repository.
- Shrine Puzzle, Corruption World, Tree Runner, and Micro Platformer live in a
  dedicated legacy game-presets repository.

## Retired Workflow

The ProtoKit authoring workflow is retired. Its original guides are preserved
under `docs/legacy/protokits/` for history and migration context. New reusable
non-Core work targets NexusEngine-Kits or another trusted registry package.
Automations may record suggestions, but may not implement retired ProtoKits or
add niche production behavior to Core.

## Agent Conventions

- Read `AGENTS.md`, `.agent/target.md`, and `.agent/tracker.md`.
- Run the Headless Editor loop and inspect its evidence.
- Consult `docs/KIT-OWNERSHIP.md` before production changes.
- Preserve generated evidence as history; it is not current architecture.
- Do not push, release, deploy, or destructively clean without explicit
  approval.

## Branch Policy

- Integrate validated `0.0.4` work into `main`; no dedicated `0.0.4` branch is
  required.
- Keep preservation and feature branches until explicit deletion approval.
- Summarize historical preservation material without publishing raw run state,
  machine paths, prompts, logs, environment details, or secret-bearing data.
