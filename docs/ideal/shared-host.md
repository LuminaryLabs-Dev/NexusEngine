# Shared Host

This describes the ideal target architecture, not a guarantee that the current NexusRealtime implementation already satisfies every rule.

Reading order: [Categories](categories.md) -> [Domains](domains.md) -> [Kits](kits.md) -> [Services](services.md) -> [DSK](dsk.md) -> [Composition](composition.md) -> Shared Host

## Definition

A shared host is the ideal runtime or supervisor that can run many composed game slices from the same ecosystem.

The host does not make every game the same. It provides the isolation and orchestration layer that lets many games, many domains, and many kits run through reusable contracts.

## Responsibilities

An ideal shared host owns:

- Instance isolation.
- Loading the core runtime.
- Loading ProtoKits.
- Mounting experiments or game slices.
- Routing inputs.
- Collecting snapshots.
- Managing saves.
- Managing proof output.
- Tracking lifecycle and health.

The host should know which composition is mounted, which kits are installed, which services are exposed, and which instance owns each state path.

## What The Host Must Not Own

The shared host should not own reusable gameplay behavior.

It should not become:

- A terrain algorithm.
- A fish simulation.
- A quest system.
- A route planner.
- A product-specific renderer.
- A game-specific story controller.

Those belong in domains, kits, services, DSKs, and compositions. The host orchestrates them.

## Future-Scale Intent

The ideal direction is:

```txt
many games
many domains
many kits
isolated instances
reusable contracts
shared host orchestration
```

This is how the ecosystem can grow without every new game becoming a fork of the runtime. Each game slice composes the pieces it needs, and the host runs those slices with clear ownership, reset, snapshot, input, save, and proof boundaries.

## Ideal Rule

The shared host runs compositions. It should make large-scale reuse possible without hiding ownership, merging unrelated state, or turning host orchestration into gameplay logic.
