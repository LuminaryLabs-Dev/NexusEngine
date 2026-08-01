# Hosts, Providers, And Adapters

Core owns semantic contracts. Concrete platform work belongs at a leaf boundary.

## Host

The host owns application lifecycle, package availability, executable resolution, runtime construction, persistence, and rollback. Core retains only portable host capability contracts under `n:host`.

Browser, Node, native, editor, terminal, repository, filesystem, storage, transport, and vendor SDK implementations are outside Core.

## Provider

A provider implements one Domain contract. Examples include physics solving, model inference, speech synthesis, asset retrieval, or capture rendering. Core can own request and result schemas while the provider owns vendor handles, caches, and external effects.

## Adapter

An adapter translates two public contracts without becoming the state owner of either. Its manifest names both requirements and the capability it provides. Adapters import public semantic subpaths, never private sibling files.

## Presentation Boundary

Presentation Core contains renderer-neutral descriptors and policies. Three.js objects, WebGL resources, browser audio, native widgets, and authored presets belong in renderer, host, Kit, or product repositories.

## Example Ownership Decisions

- Generic sky descriptors: `n:presentation:sky`.
- Authored sunset preset: recipe or product data.
- Speech request lifecycle: `n:presentation:speech`.
- PocketTTS implementation: external provider Kit.
- Motion trajectory: `n:simulation:motion`.
- Animation clip descriptor: `n:presentation:animation`.
- Two-bone pose solving: `n:simulation:motion`.
