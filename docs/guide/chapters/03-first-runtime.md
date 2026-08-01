# Build A First Runtime

Install the package, import only the semantic surfaces you need, construct the Engine, then advance it with explicit time.

## Minimal Engine

The runnable source for this example is `examples/guide/basic-engine.mjs`.

```js
import { createEngine } from "nexusengine";

const engine = createEngine({ kits: [] });
engine.tick(1 / 60);
console.log(engine.clock.frame);
```

The root API is intentionally small. Domain factories and atoms are imported from generated semantic subpaths.

## Add Object And Placement

The runnable source is `examples/guide/object-placement.mjs`.

```js
import { createEngine } from "nexusengine";
import { createObjectRegistryKit } from "nexusengine/domains/object/registry";
import { createObjectPlacementKit } from "nexusengine/domains/object/placement";

const engine = createEngine({
  kits: [createObjectRegistryKit(), createObjectPlacementKit()]
});
```

Placement requires the Object descriptor contract. Composition can resolve that provider automatically; direct construction requires you to install both.

## Inspect Installed Surfaces

Domain Service Kits register semantic paths and named APIs. Use the engine's addressability APIs instead of reaching into private state.

```js
engine.n.path("n:object");
engine.n.path("n:object:placement");
engine.n.ownerOf("n:object");
engine.n.paths();
engine.n.apis();
```

## Keep Time Explicit

Pass elapsed time into `tick`. Do not read wall-clock time inside deterministic Core systems. A host may sample a clock, but it converts that sample into explicit runtime input before Core processes it.

## Save And Restore

Each stateful atom exposes its manifest-declared snapshot and reset behavior. Applications should persist the complete host composition receipt beside application state so the accepted runtime can be reconstructed after restart.
