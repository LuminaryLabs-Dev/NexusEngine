# Agent Memory

Repo: `NexusEngine`

## Purpose

NexusEngine is the reusable realtime ECS/runtime package. It should stay generic, deterministic, and product-agnostic.

## Architecture Rules

- Keep simulation logic in ECS systems, runtime kits, sequence nodes, adapters, registries, or reusable domain modules.
- Keep renderers presentation-only; hosts should render snapshots and forward input instead of duplicating simulation logic.
- Do not add product-specific copy, routes, assets, app lore, or retained game folder contracts to NexusEngine.
- Keep only atomic, idempotent, fully reusable behavior in NexusEngine Core.
- Route reusable optional, niche, genre, or platform behavior to
  NexusEngine-Kits or another trusted registry.
- Route complete games, presets, authored content, and product behavior to
  experiment or game repositories.
- Do not create or update ProtoKits; that workflow is retired.
- Product apps should pass authored config/data into public Core or trusted kits.
- Prefer additive kits over ECS core rewrites.

## Agent Workflow

- Start from `.agent/start-here.md` for automation work.
- Check `memory.md` before non-trivial repo work.
- Check `docs/KIT-OWNERSHIP.md` before changing production behavior.
- Run `npm run automation:preflight` before writing automation lane packets.
- Record agent-visible repo changes in `.agent/CHANGE_LOG.md`.
- Update this file when a durable repo convention or agent workflow rule changes.
- Leave unrelated dirty files alone.
- Run the closest existing validation command before claiming work is complete.

## Current Notes

- `.agent/` was introduced on 2026-06-17 as the local agent tracking surface.
- Automation work now uses `state/automation/` lane prompts and a branch/public-link preflight.
- Existing untracked files outside `.agent/` should be treated as user or prior-work changes unless explicitly assigned.
