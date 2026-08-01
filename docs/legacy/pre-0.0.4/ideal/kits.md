# Kits

This describes the ideal target architecture, not a guarantee that the current NexusEngine implementation already satisfies every rule.

Reading order: [Categories](categories.md) -> [Domains](domains.md) -> Kits -> [Services](services.md) -> [DSK](dsk.md) -> [Composition](composition.md) -> [Shared Host](shared-host.md)

## Definition

A kit is an atomic, idempotent, reusable behavior module.

Kits install behavior into a runtime without becoming the whole game. A kit should be small enough to reason about, reusable enough to compose, and explicit enough that another kit can depend on it through declared contracts.

## Responsibilities

An ideal kit can own:

- Resources.
- Events.
- Systems.
- Lifecycle hooks.
- Declared `provides` and `requires`.
- Snapshot and reset support.
- Service installation for the domain it controls.

A kit should be idempotent: installing or restoring it should not duplicate global listeners, duplicate entities, corrupt state, or silently overwrite another kit.

## What Kits Must Not Own

A reusable kit should not own:

- Product copy.
- One-off scene logic.
- Browser DOM loops.
- Game-specific art direction.
- Route-specific UI.
- Hardcoded story or level identity.

If a behavior is reusable, it belongs in a kit. If it is authored presentation, browser proof, or a specific game slice, it belongs in an experiment or host composition.

## Object And Entity Kit Examples

```txt
tree-kit
fish-kit
terrain-rendering-kit
inspection-object-kit
path-boundary-kit
```

These kits can be composed into many domains. A tree kit might serve a forest, a terrarium, a miniature model, or a background ecosystem. The kit should stay reusable while the composition decides where it appears and what it means.

## Ideal Rule

Kits install behavior. They do not own the entire domain vocabulary, and they do not bypass services to mutate unrelated state.
