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
