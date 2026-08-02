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

## Contracts

- [Domain Addressability](DOMAIN-ADDRESSABILITY.md)
- [Kit Metadata Contract](KIT-METADATA-CONTRACT.md)
- [Generated Core API Reference](generated/API-REFERENCE.md)
- [Generated Domain Catalog](generated/CORE-CATALOG.json)
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

Suggestion inventories and historical evidence do not establish ownership or
override current source, manifests, tests, and this router.
