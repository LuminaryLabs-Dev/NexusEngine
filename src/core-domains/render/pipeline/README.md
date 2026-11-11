# Render Layer Graph Kit

Renderer-agnostic Render pipeline kit for declaring pass order, dependencies, resource reads/writes, depth policy, blending policy, and the final scene-content boundary.

It does not create renderer objects or submit GPU commands. Renderer adapters consume the validated ordered graph.

## Core API

```js
import {
  createRenderPassContract,
  createRenderLayerGraph,
  validateRenderLayerGraph,
  createRenderLayerGraphKit
} from "nexusengine/domains/render/pipeline";
```

A graph is deterministic, snapshot-safe, and rejects cycles, unresolved resources, transparent depth writes, missing dependencies, and authored scene content after the declared final scene pass.

## Resource-hazard inspection

`resolveRenderLayerGraph` preserves deterministic authored pass order and now returns `dependencies`, `hazards` (RAW/WAR/WAW), logical `batches`, and `resourceLifetimes` (first/last use). Depth-test `depth.source` is considered a resource read. These are portable planning records, not GPU barriers, memory aliasing or actual async submission; providers retain that ownership. Reads without a preceding producer or declared external input remain invalid. Existing `orderedPasses` and `cycle` outputs are retained.

`createQualityProfile` rejects nonfinite `lodBias` and nonpositive or nonfinite `renderScale` before any provider allocates output surfaces.
