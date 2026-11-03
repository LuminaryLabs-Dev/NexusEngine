# NexusEngine Documentation

This page is the active documentation router.

## Learn NexusEngine

1. [NexusEngine Guide](NexusEngine-Guide.md): canonical combined book.
2. [NexusEngine Guide PDF](NexusEngine-Guide.pdf): generated reading copy.
3. [Current Architecture](CURRENT-ARCHITECTURE.md): live package and ownership shape.
4. [Kit Ownership](KIT-OWNERSHIP.md): Core admission and repository boundary.
5. [Build Domain](guide/building/README.md): project-immutable multi-target builds.
6. [Operations](OPERATIONS.md): validation, packaging, and release evidence.
7. [Contributing](../CONTRIBUTING.md): change and evidence workflow.
8. [Security](../SECURITY.md): trust boundaries and reporting limits.
9. [Visual Identity](VISUAL-IDENTITY.md): reusable repository assets.

The modular source for the guide is `guide/book.json` plus
`guide/chapters/*.md`. Generated guide files are not edited directly.

## Build a Game with NexusEngine

For a practical, human-readable journey from a game idea to a playable build, follow the new game-building chapters in order. They share one fictional dungeon project so each explanation builds on the previous one:

1. [From Game Idea to Development Plan](guide/chapters/game-01-idea-to-plan.md)
2. [Setting Up a Project and Choosing Capabilities](guide/chapters/game-02-project-and-capabilities.md)
3. [Creating Game Assets](guide/chapters/game-03-creating-assets.md)
4. [Building Scenes and Environments](guide/chapters/game-04-scenes-and-environments.md)
5. [Connecting Gameplay Systems](guide/chapters/game-05-gameplay-systems.md)
6. [Using the Four Authoring Harnesses](guide/chapters/game-06-creative-authoring.md)
7. [Playtesting, Reviewing, and Improving](guide/chapters/game-07-testing-and-refinement.md)
8. [Building, Packaging, and Publishing](guide/chapters/game-08-building-and-publishing.md)

These chapters explain the practical workflow. The existing technical chapters and generated appendices remain the detailed reference for real operations and current limitations. The dungeon is an instructional example, not an asserted production-ready game.

## Contracts

- [Domain Addressability](DOMAIN-ADDRESSABILITY.md)
- [Kit Metadata Contract](KIT-METADATA-CONTRACT.md)
- [Generated Core API Reference](generated/API-REFERENCE.md)
- [Generated Domain Catalog](generated/CORE-CATALOG.json)
- [Generated Build API](generated/BUILD-API.md)
- [Generated Build Targets](generated/BUILD-TARGETS.md)
- [Experiment Workflow](how-to-experiment.md)
- [Visual Target Review](visual-target-review.md)
- [Authoring Harnesses](authoring-harnesses.md): Design, Art, Interaction, Craft and Agent Loop steps.

## Migration

- [0.0.5 Render Contract Foundation](migrations/0.0.5-render-contracts.md)
- [0.0.5 Render Lifecycle](migrations/0.0.5-render-lifecycle.md)
- [0.0.5 Render Device](migrations/0.0.5-render-device.md)
- [0.0.5 Render Resource](migrations/0.0.5-render-resource.md)
- [0.0.5 Render Buffer](migrations/0.0.5-render-buffer.md)
- [0.0.5 Render Texture](migrations/0.0.5-render-texture.md)
- [0.0.5 Render Shader](migrations/0.0.5-render-shader.md)
- [0.0.5 Render Material](migrations/0.0.5-render-material.md)
- [0.0.5 Physics Contract Foundation](migrations/0.0.5-physics-contracts.md)
- [0.0.5 Physics Lifecycle Cutover](migrations/0.0.5-physics-lifecycle.md)
- [0.0.5 Physics Material Domain](migrations/0.0.5-physics-material.md)
- [0.0.5 Physics World Domain](migrations/0.0.5-physics-world.md)
- [0.0.4 Semantic Domain Cutover](migrations/0.0.4-domain-cutover.md)
- [0.0.4 Restored Behaviors](migrations/0.0.4-restored-behaviors.md)
- [0.0.4 Build Domain Cutover](migrations/0.0.4-build-domain.md)
- [0.0.4 Root Module Dispositions](migrations/0.0.4-root-module-dispositions.md)
- [0.0.4 Post-Restoration Core Candidate Audit](audits/0.0.4-post-restoration-core-candidate-audit.md)
- [Frozen ProtoKit Extraction](protokit-extraction/README.md)
- [Retired ProtoKit Workflow](how-to-protokit.md)
- [Historical Documentation](legacy/README.md)

## Generated Truth

The catalog, package export map, ownership ledger, API reference, guide
appendices, MCP chapter resources, and release manifest are generated. Run
their check modes rather than editing generated files.

Suggestion inventories and historical evidence do not establish ownership or
override current source, manifests, tests, and this router.
