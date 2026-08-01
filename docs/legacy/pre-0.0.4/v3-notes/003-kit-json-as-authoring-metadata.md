# 003: kit.json As Authoring Metadata

`kit.json` is proposed as future authoring metadata for domain-based kit ecosystems.

It is not currently required by NexusEngine runtime behavior.

It is not a replacement for package exports, existing kit factory functions, or current docs.

## Purpose

`kit.json` should help tools and agents inspect:

```txt
kit identity
kit purpose
kit kind
entrypoint
exports
dependencies
internal kits
parent kit
used-by relationships
lifecycle state
```

## Source contract versus release manifest

Recommended split:

```txt
kit.json:
  simple source-level authoring metadata

kit.manifest.json:
  generated or release-facing manifest for lifecycle, registry, checks, and promotion
```

## Composite kit example

```json
{
  "id": "connected-card-graph",
  "kind": "composite-kit",
  "title": "Connected Card Graph",
  "purpose": "Composable graph model for cards, links, selection, layout, validation, snapshots, and events.",
  "entry": "index.ts",
  "internalKits": [
    "graph-model",
    "graph-registry",
    "graph-selection",
    "graph-layout",
    "graph-validation",
    "graph-snapshot",
    "graph-events"
  ],
  "exports": [
    "createConnectedCardGraphKit"
  ]
}
```

## Internal kit example

```json
{
  "id": "graph-selection",
  "kind": "internal-kit",
  "parent": "connected-card-graph",
  "purpose": "Selection state and selection events for graph nodes and edges.",
  "entry": "index.ts",
  "dependsOn": [
    "graph-model",
    "graph-events"
  ],
  "exports": [
    "createGraphSelectionKit"
  ]
}
```

## Compatibility rule

Existing NexusEngine kit patterns remain valid.

`kit.json` should be treated as an authoring aid for future KitBuilder-style tools and larger domain-kit repos.

A future tool can read `kit.json` and generate:

```txt
kit.manifest.json
README sections
registry entries
project board entries
promotion notes
```
