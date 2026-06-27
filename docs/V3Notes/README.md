# V3Notes

These notes describe a future authoring shape for domain-based kit ecosystems around NexusRealtime.

They are docs-only notes.

They do not require NexusRealtime runtime changes.

They are meant to help future agents and developers add, inspect, split, compose, and document larger kit ecosystems in a consistent way.

## Core idea

```txt
NexusRealtime remains the runtime foundation.

Domain-based kits can be authored around it.

Large manager/base kits are valid top-level domain kits.

Large kits may contain smaller internal kits when that makes the domain easier to reason about.

Apps and tools compose kits instead of hiding all behavior in one large source folder.
```

## What this folder is

```txt
future authoring guidance
repo shape examples
nested kit examples
kit metadata examples
agent-readable structure notes
```

## What this folder is not

```txt
not a runtime migration
not a replacement for existing NexusRealtime behavior
not a requirement that every kit must be nested
not a claim that kit.json is already required by NexusRealtime
not a request to move all domain logic into NexusRealtime core
```

## Reading order

```txt
001-domain-kit-authoring-shape.md
002-large-manager-kits-and-internal-kits.md
003-kit-json-as-authoring-metadata.md
004-example-nexus-github-manager.md
005-example-peer-mesh-kit-ecosystem.md
006-how-this-relates-to-existing-nexusrealtime.md
```
