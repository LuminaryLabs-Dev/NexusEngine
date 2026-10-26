import assert from "node:assert/strict";
import { createEngine } from "nexusengine";
import { createSpatialKit } from "nexusengine/domains/spatial/contracts";
import { createSpatialLayoutKit, normalizeSpatialLayout, resolveSpatialLayout } from "nexusengine/domains/spatial/layout";

const items = ["A", "B", "C"].map(id => ({ id, contentRef: `content:${id}`, size: [20, 10] }));
const row = { id: "cards", space: "screen", mode: "row", spacing: [5, 0], anchor: [0.5, 0.5], alignment: ["center", "center"], items };
const context = { viewport: { x: 10, y: 20, width: 200, height: 100 }, uiScale: 2 };
const result = resolveSpatialLayout(row, context);
assert.deepEqual(result.placements.map(p => p.position), [[40, 60, 0], [90, 60, 0], [140, 60, 0]]);
assert.deepEqual(result.extent, [140, 20, 0]);
assert.ok(result.placements.every(p => !p.overflow));
const resized = resolveSpatialLayout(row, { ...context, viewport: { x: 10, y: 20, width: 300, height: 100 } });
assert.equal(resized.placements[0].position[0], 90);
assert.deepEqual(resolveSpatialLayout(row, context), result);
assert.deepEqual(resolveSpatialLayout(normalizeSpatialLayout(row), context), result);
const normalized = resolveSpatialLayout({ id: "fraction", units: "normalized", items: [{ id: "a", contentRef: "A", size: [0.25, 0.5] }] }, context);
assert.deepEqual(normalized.placements[0].size, [50, 50, 0]);
const column = resolveSpatialLayout({ id: "column", mode: "column", spacing: [0, 3], items }, context);
assert.deepEqual(column.placements.map(p => p.position[1]), [20, 46, 72]);
const explicit = resolveSpatialLayout({ id: "explicit", items: [{ id: "a", contentRef: "A", size: [10, 10], offset: [-4, 5], pivot: [0.5, 0.5] }] }, context);
assert.deepEqual(explicit.placements[0].position, [12, 40, 0]);
assert.equal(explicit.placements[0].overflow, true);
const world = { id: "shelf", space: "world", mode: "grid", grid: [2, 1, 2], spacing: [1, 0, 2], items: items.map(i => ({ ...i, size: [2, 1, 3] })) };
const worldContext = { bounds: { min: [0, 0, 0], size: [10, 10, 10] }, frame: { origin: [10, 20, 30], axes: [[0, 0, -1], [0, 1, 0], [1, 0, 0]] } };
const grid = resolveSpatialLayout(world, worldContext);
assert.deepEqual(grid.placements.map(p => p.localPosition), [[0, 0, 0], [3, 0, 0], [0, 0, 5]]);
assert.deepEqual(grid.placements.map(p => p.position), [[10, 20, 30], [10, 20, 27], [15, 20, 30]]);
assert.deepEqual(grid.placements.map(p => p.contentRef), result.placements.map(p => p.contentRef));
const volume = resolveSpatialLayout({ id: "volume", space: "world", mode: "grid", grid: [2, 2, 2], spacing: [1, 1, 1], items: Array.from({ length: 8 }, (_, i) => ({ id: String(i), contentRef: "shared", size: [1, 1, 1] })) }, { bounds: { min: [0, 0, 0], size: [4, 4, 4] } });
assert.deepEqual(volume.placements[7].position, [2, 2, 2]);
const variable = resolveSpatialLayout({ id: "variable", mode: "row", anchor: [1, 1], alignment: ["end", "end"], spacing: [4, 0], items: [{ id: "a", contentRef: "A", size: [10, 5] }, { id: "b", contentRef: "B", size: [20, 15] }] }, { viewport: { width: 100, height: 100 } });
assert.deepEqual(variable.placements.map(p => p.position), [[66, 85, 0], [80, 85, 0]]);
const grid2d = resolveSpatialLayout({ id: "2d", mode: "grid", grid: [2, 2], items }, context);
assert.deepEqual(grid2d.placements.map(p => p.position), [[10, 20, 0], [50, 20, 0], [10, 40, 0]]);
assert.deepEqual(resolveSpatialLayout({ id: "empty", items: [] }, { viewport: { width: 0, height: 0 } }).placements, []);

for (const patch of [
  { space: "bad" }, { units: "world-units" }, { mode: "bad" }, { axis: "z" },
  { spacing: [NaN, 0] }, { anchor: [2, 0] }, { alignment: ["invalid", "start"] },
  { grid: [0, 1] }, { mode: "grid", grid: [1, 1] }, { backend: {} },
  { items: [...items, items[0]] }, { items: [{ id: "a", contentRef: "A" }] },
  { items: [{ id: "a", contentRef: "A", size: [-1, 1] }] },
  { items: [{ id: "a", contentRef: "A", size: [1, 1, 1] }] },
  { items: [{ id: "a", contentRef: () => {}, size: [1, 1] }] }
]) assert.throws(() => resolveSpatialLayout({ ...row, ...patch }, context), TypeError);
assert.throws(() => resolveSpatialLayout(row, { ...context, uiScale: 0 }), TypeError);
assert.throws(() => resolveSpatialLayout(row, { viewport: { width: -1, height: 0 } }), TypeError);
assert.throws(() => resolveSpatialLayout(world, { ...worldContext, frame: { axes: [[2, 0, 0], [0, 1, 0], [0, 0, 1]] } }), TypeError);
assert.throws(() => resolveSpatialLayout({ ...row, items: [{ id: "a", contentRef: "A", size: [Number.MAX_VALUE, 1] }] }, context), RangeError);
const original = structuredClone({ row, context });
resolveSpatialLayout(row, context);
assert.deepEqual({ row, context }, original);

const plain = createEngine({ kits: [createSpatialKit()] });
assert.equal(plain.n.spatialLayout, undefined, "layout is optional");
const engine = createEngine({ kits: [createSpatialKit(), createSpatialLayoutKit({ layouts: [row] })] });
const api = engine.n.spatialLayout;
const persistentBefore = engine.n.spatial.getSnapshot();
assert.deepEqual(api.resolve("cards", context), result);
const kitsBefore = engine.kits.length;
const installed = engine.installKit(createSpatialLayoutKit({ layouts: [row] }));
assert.equal(engine.kits.length, kitsBefore);
assert.equal(engine.n.spatialLayout, api);
assert.equal(engine.installKit(createSpatialLayoutKit({ layouts: [row] })), installed);
assert.throws(() => engine.installKit(createSpatialLayoutKit({ layouts: [world] })), /different content/);
api.setLayout(world);
const saved = api.getSnapshot();
assert.deepEqual(api.setLayout(world), normalizeSpatialLayout(world));
assert.deepEqual(api.getSnapshot(), saved, "repeated set is idempotent");
assert.equal(api.removeLayout("shelf"), true);
assert.equal(api.removeLayout("shelf"), false);
assert.throws(() => api.resolve("shelf", worldContext), /Unknown layout/);
api.loadSnapshot(JSON.parse(JSON.stringify(saved)));
assert.deepEqual(api.resolve("shelf", worldContext), grid);
const corrupted = structuredClone(saved);
corrupted.layouts[0].items[0].size[0] = -1;
assert.throws(() => api.loadSnapshot(corrupted), TypeError);
assert.deepEqual(api.getSnapshot(), saved, "invalid restore is atomic");
assert.throws(() => api.loadSnapshot({ ...saved, schema: "unknown" }), TypeError);
assert.throws(() => api.loadSnapshot({ ...saved, layouts: [saved.layouts[0], saved.layouts[0]] }), TypeError);
assert.deepEqual(api.getSnapshot(), saved);
assert.throws(() => api.setLayout({ ...world, units: "normalized" }), TypeError);
assert.deepEqual(api.getSnapshot(), saved);
const detached = api.getLayout("shelf"); detached.items.length = 0;
assert.equal(api.getLayout("shelf").items.length, 3);
api.reset();
assert.deepEqual(api.listLayouts(), [normalizeSpatialLayout(row)]);
assert.deepEqual(engine.n.spatial.getSnapshot(), persistentBefore, "layout never mutates persistent transforms");
console.log("spatial layout: exact placements, resize, frame rotation, validation, installed parity and lifecycle PASS");
