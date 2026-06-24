# Categories

This describes the ideal target architecture, not a guarantee that the current NexusRealtime implementation already satisfies every rule.

Reading order: Categories -> [Domains](domains.md) -> [Kits](kits.md) -> [Services](services.md) -> [DSK](dsk.md) -> [Composition](composition.md) -> [Shared Host](shared-host.md)

## Definition

Categories are broad top-level domain containers. They give the ecosystem a stable map for where domains, subdomains, kits, services, compositions, and proofs belong before the implementation needs a physical source-folder split.

A category is not a behavior object. It is an ownership lane that can grow from a few kits into many subdomains without forcing everything into the runtime core.

Start broad. Split later only when ownership, scale, or reuse boundaries prove that a category needs smaller subdomains.

## Category Shape

Every top-level category should be able to hold the same ideal structure:

```txt
category
|-- subdomains
|-- kits
|-- services
|-- compositions
`-- proofs
```

## Top-Level Categories

- `runtime`: engine, ECS, scheduler, lifecycle, events, surfaces, snapshots, reset.
- `dsk`: DSK contract, tokens, services, metadata, validation, provider ownership.
- `composition`: graph assembly, dependency resolution, path ownership, mounted instances.
- `core-kits`: built-in infrastructure kits such as token registry, completion ledger, replay, health, load plan.
- `games`: gameplay domains, worlds, objectives, characters, vehicles, combat, traversal, survival, simulation.
- `apps`: application shells, product flows, app routing, deployment-specific behavior.
- `web-ui`: browser UI, HUDs, launchers, panels, DOM interaction, accessibility.
- `rendering`: render descriptors, visual policy, adapters, materials, lighting, LOD, performance budgets.
- `assets`: asset descriptors, loading queues, manifests, cache plans, external asset providers.
- `agentic`: agents, decisions, memory, perception, tool use, prompts, inference traces.
- `spatial`: XR, hands, transforms, scene graphs, anchors, selection, placement, world-space authoring.
- `persistence`: saves, restores, migrations, state versions, proof logs, replay archives.
- `networking`: multiplayer, sync, sessions, streaming, authority, remote services.
- `automation`: validation lanes, QA harnesses, bug reports, state packets, maintenance.
- `experiments`: playable proofs, visual targets, browser demos, test scenes, composition validation.

## Example: Games

```txt
games
|-- traversal
|   |-- climbing-kit
|   |-- flight-kit
|   |-- swimming-kit
|   `-- vehicle-control-kit
|-- combat
|   |-- damage-health-kit
|   |-- projectile-kit
|   |-- parry-window-kit
|   `-- encounter-director-kit
`-- objectives
    |-- objective-flow-kit
    |-- completion-ledger-kit
    `-- route-checkpoint-kit
```

## Example: Rendering

```txt
rendering
|-- descriptors
|-- materials
|-- lighting
|-- adapters
|-- culling
|-- lod
`-- performance
```

## Ideal Rule

Categories organize meaning at ecosystem scale. Domains and subdomains own state boundaries. Kits install reusable behavior. Services bridge controlled operations. Compositions decide how pieces mount together. Proofs validate that the category can produce working slices.
