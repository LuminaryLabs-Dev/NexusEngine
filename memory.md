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
- `src/core-kits/` and `src/core-domains/`: intentional Core capabilities.
- `src/renderers.js`: generic headless adapter only; presentation adapters are
  resolved outside Core.
- `src/shaders.js`: generic shader and material registries only.
- `src/sequences.js`: generic deterministic orchestration with host-supplied
  controllers.

Simulation stays deterministic and presentation-agnostic. Stateful Core
behavior has stable defaults and explicit snapshot/reset expectations.

## Current Migrations

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
