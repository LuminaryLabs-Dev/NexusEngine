# Spatial Layout

`n:spatial:layout` is one optional, independently installed DSK. It owns arrangement descriptions and membership, and returns derived placements. It never writes persistent transforms, creates content, measures text, queries a renderer, or schedules frame work.

```js
import { createEngine } from "nexusengine";
import { createSpatialKit } from "nexusengine/domains/spatial/contracts";
import { createSpatialLayoutKit, resolveSpatialLayout } from "nexusengine/domains/spatial/layout";

const cards = {
  id: "cards", space: "screen", units: "logical-pixels", mode: "row",
  anchor: [0.5, 0.5], alignment: ["center", "center"], spacing: [12, 0],
  items: ["A", "B", "C"].map(id => ({ id, contentRef: `content:${id}`, size: [68, 50] }))
};
const context = { viewport: { x: 16, y: 16, width: 480, height: 300 }, uiScale: 1 };
const direct = resolveSpatialLayout(cards, context);
const engine = createEngine({ kits: [createSpatialKit(), createSpatialLayoutKit({ layouts: [cards] })] });
const installed = engine.n.spatialLayout.resolve("cards", context); // same placements
```

## Description contract

The schema is `nexusengine.spatial-layout/1`. Descriptions contain `id`, `space`, `units`, `mode`, `axis`, `grid`, `anchor`, `alignment`, `spacing`, `offset` and `items`. Unknown fields are rejected. Helpers return normalized copies; caller-owned data is never mutated.

- `space`: `screen` or `world`.
- `units`: `logical-pixels` or `normalized` for screen, `world-units` for world.
- `mode`: `explicit`, `row`, `column`, `grid`. Default is explicit.
- `axis`: x/y/z for a row or column. Row defaults to x, column to y. Screen forbids z.
- `grid`: positive integer capacities `[x, y, z]`; x changes fastest, then y, then z. A screen grid uses `[columns, rows]`. Cells use the maximum item dimension on each axis. An over-capacity grid fails before resolution.
- `anchor`: fractions in `[0,1]` selecting a point in the supplied bounds. Default is the bounds minimum.
- `alignment`: start/center/end on each axis, selecting the arrangement's minimum/midpoint/maximum to align with the anchor. Default is start. Alignment applies to the arrangement footprint before offsets.
- `spacing`: nonnegative per-axis gaps. Two-component screen vectors imply z=0.
- `offset`: translation applied after arrangement and anchoring. Negative offsets are permitted.
- Each item requires a unique string `id`, a string `contentRef`, and nonnegative supplied `size`. Optional `offset` moves it after arrangement; `pivot` is a fraction in `[0,1]` selecting its returned position within its box. Default pivot is its minimum corner.

`contentRef` is opaque to Layout. The application owns reference lookup and supplies measured sizes. Reusing a content reference for different item IDs is allowed. Explicit mode uses each item's offset as its authored position relative to the anchored arrangement. Items may overflow bounds; the result reports this instead of silently clipping or scaling them.

## Coordinate context

For screen space, supply `{ viewport: { x, y, width, height }, uiScale }`. Viewport values are output logical coordinates: x right, y down. The application can pass Presentation's `safeRect` or visible viewport. Logical sizes, spacing and offsets are multiplied by the supplied positive UI scale once. Normalized values instead multiply by the viewport dimensions; UI scale has no additional effect. Resizing requires another explicit resolve call with the updated context.

For world space, supply `{ bounds: { min: [x,y,z], size: [w,h,d] }, frame: { origin, axes } }`. Bounds and sizes are frame-local world units; default frame is identity with x right, y up, z forward. Axes are three orthonormal basis vectors mapping local x/y/z into world coordinates; scale and shear in that basis are rejected. A grid can span all three axes or stay on a plane by using capacity 1 along one axis. Camera projection happens outside Layout.

## Result and lifecycle

Resolution returns `layoutId`, `space`, output `units`, `axes`, arrangement `extent` and ordered `placements`. A placement contains item ID, content reference, `localMin`, `localPosition` (including its pivot), world/output `position`, frame-axis `size` and `overflow`. The result owns no scene or transform state. The application explicitly applies it through its chosen scene/Spatial API. Layout introduces no renderer or additional transform registry.

`engine.n.spatialLayout` exposes `setLayout`, `removeLayout`, `getLayout`, `listLayouts`, `resolve`, `getState`, `getSnapshot`, `loadSnapshot` and `reset`. Equivalent sets/removals/restores do not change state or emit duplicate change events. Snapshots use `nexusengine.spatial-layout-state/1` and contain only normalized descriptions. Restore validates the entire snapshot before mutation. Reset restores the configured initial layouts. Returned data is detached from internal state.

Equivalent duplicate installation returns the existing Kit/API. Changed initial layouts reject duplicate installation. Without explicit installation there is no Layout API, state or scheduled layout work. Automatic text flow, collision avoidance, constraint solving and automatic scene mutation are outside this service.

## Verify

From the repository root:

```sh
node src/core-domains/spatial/tests/spatial-layout.mjs
node examples/spatial-layout/serve.mjs
# In a second terminal:
node examples/spatial-layout/prove.mjs
```

Open `http://127.0.0.1:4179/` for the interactive screen-row/world-grid demonstration. The example uses a small Canvas adapter to display the resolver's placements; it is not a NexusGL integration. Browser proof captures desktop, increased UI scale and compact viewport results under `.agent/runs/2026-10-18-spatial-layout/visual/`.
