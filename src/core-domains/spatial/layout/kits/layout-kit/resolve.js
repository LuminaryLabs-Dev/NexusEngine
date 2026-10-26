import { normalizeSpatialLayout, normalizeLayoutContext } from "./contracts.js";

// Item order is authored order. Grid traversal is X, then Y, then Z.
export function resolveSpatialLayout(description, context) {
  const layout = normalizeSpatialLayout(description);
  const frame = normalizeLayoutContext(layout, context);
  const { min, size: available, scale, origin, axes } = frame;
  const spacing = layout.spacing.map((v, i) => v * scale[i]);
  const sizes = layout.items.map(item => item.size.map((v, i) => v * scale[i]));
  const cell = [0, 1, 2].map(a => sizes.reduce((max, s) => Math.max(max, s[a]), 0));
  const axis = ["x", "y", "z"].indexOf(layout.axis);
  let cursor = 0;
  const raw = layout.items.map((item, i) => {
    const start = [0, 0, 0];
    if (layout.mode === "row" || layout.mode === "column") {
      start[axis] = cursor;
      cursor += sizes[i][axis] + spacing[axis];
    } else if (layout.mode === "grid") {
      const [x, y] = layout.grid;
      const indices = [i % x, Math.floor(i / x) % y, Math.floor(i / (x * y))];
      for (let a = 0; a < 3; a++) start[a] = indices[a] * (cell[a] + spacing[a]);
    }
    return start;
  });
  // Align the arrangement footprint; offsets are applied afterward.
  const low = [0, 1, 2].map(a => raw.reduce((v, p) => Math.min(v, p[a]), 0));
  const high = [0, 1, 2].map(a => raw.reduce((v, p, i) => Math.max(v, p[a] + sizes[i][a]), 0));
  const extent = high.map((v, a) => v - low[a]);
  const pivot = { start: 0, center: 0.5, end: 1 };
  const shift = min.map((v, a) => v + layout.anchor[a] * available[a] - pivot[layout.alignment[a]] * extent[a] + layout.offset[a] * scale[a]);
  const placements = layout.items.map((item, i) => {
    const localMin = raw[i].map((v, a) => v + shift[a] + item.offset[a] * scale[a]);
    const localPosition = localMin.map((v, a) => v + item.pivot[a] * sizes[i][a]);
    const position = origin.map((v, a) => v + axes.reduce((sum, basis, j) => sum + basis[a] * localPosition[j], 0));
    const overflow = localMin.some((v, a) => v < min[a] || v + sizes[i][a] > min[a] + available[a]);
    return { id: item.id, contentRef: item.contentRef, localMin, localPosition, position, size: sizes[i], overflow };
  });
  const result = { layoutId: layout.id, space: layout.space, units: layout.space === "screen" ? "output-logical-pixels" : "world-units", axes, extent, placements };
  const assertFinite = value => {
    if (typeof value === "number" && !Number.isFinite(value)) throw new RangeError("Layout arithmetic exceeds finite coordinate range.");
    if (value && typeof value === "object") for (const child of Object.values(value)) assertFinite(child);
  };
  assertFinite(result);
  return result;
}
