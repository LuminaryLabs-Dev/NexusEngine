# NexusEngine Documentation

This page is the active documentation router.

## Learn NexusEngine

1. [NexusEngine Guide](NexusEngine-Guide.md): canonical combined book.
2. [NexusEngine Guide PDF](NexusEngine-Guide.pdf): generated human reading copy.
3. [Current Architecture](CURRENT-ARCHITECTURE.md): package and ownership shape.
4. [Kit Ownership](KIT-OWNERSHIP.md): Core admission and repository boundary.

The modular source for the guide is `guide/book.json` plus
`guide/chapters/*.md`. Generated guide files are not edited directly.

## Contracts

- [Domain Addressability](DOMAIN-ADDRESSABILITY.md)
- [Kit Metadata Contract](KIT-METADATA-CONTRACT.md)
- [Generated Core API Reference](generated/API-REFERENCE.md)
- [Generated Domain Catalog](generated/CORE-CATALOG.json)
- [Build Domain](guide/building/README.md)
- [Generated Build API](generated/BUILD-API.md)
- [Generated Build Targets](generated/BUILD-TARGETS.md)
- [Experiment Workflow](how-to-experiment.md)
- [Visual Target Review](visual-target-review.md)

## Migration

- [0.0.4 Semantic Domain Cutover](migrations/0.0.4-domain-cutover.md)
- [0.0.4 Build Domain Cutover](migrations/0.0.4-build-domain.md)
- [0.0.4 Root Module Dispositions](migrations/0.0.4-root-module-dispositions.md)
- [Frozen ProtoKit Extraction](protokit-extraction/README.md)
- [Retired ProtoKit Workflow](how-to-protokit.md)
- [Historical Documentation](legacy/README.md)

## Generated Truth

The catalog, package export map, ownership ledger, API reference, guide
appendices, MCP chapter resources, and release manifest are generated. Run
their check modes rather than editing generated files.

Suggestion inventories such as `described_examples.md`, `domain_ideas.md`, and
`kits_ideas.md` do not establish ownership or authorize implementation.
