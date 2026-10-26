export const SPATIAL_LAYOUT_SCHEMA = "nexusengine.spatial-layout/1";
const plain = value => value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
export function object(value, label) {
  if (!plain(value)) throw new TypeError(`${label} must be a plain object.`);
  return value;
}
export function keys(value, allowed, label) {
  object(value, label);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError(`${label}: unknown field ${key}.`);
}
export function number(value, label, minimum = -Infinity) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum) throw new TypeError(`${label} must be finite and >= ${minimum}.`);
  return value;
}
export function vector(value, label, fallback, minimum = -Infinity) {
  value ??= fallback;
  if (!Array.isArray(value) || ![2, 3].includes(value.length)) throw new TypeError(`${label} requires two or three coordinates.`);
  return [0, 1, 2].map(i => number(i < value.length ? value[i] : (fallback?.[i] ?? 0), `${label}[${i}]`, minimum));
}
function text(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${label} requires a nonempty string.`);
  return value;
}
export function normalizeSpatialLayout(input) {
  keys(input, ["schema", "id", "space", "units", "mode", "axis", "grid", "anchor", "alignment", "spacing", "offset", "items"], "layout");
  if (input.schema !== undefined && input.schema !== SPATIAL_LAYOUT_SCHEMA) throw new TypeError("Unsupported layout schema.");
  const space = input.space ?? "screen";
  if (!["screen", "world"].includes(space)) throw new TypeError("layout.space must be screen or world.");
  const units = input.units ?? (space === "screen" ? "logical-pixels" : "world-units");
  if (!(space === "screen" ? ["logical-pixels", "normalized"] : ["world-units"]).includes(units)) throw new TypeError("Layout units do not match the coordinate space.");
  const mode = input.mode ?? "explicit";
  if (!["explicit", "row", "column", "grid"].includes(mode)) throw new TypeError("Unsupported layout mode.");
  const axis = input.axis ?? (mode === "column" ? "y" : "x");
  if (!["x", "y", "z"].includes(axis) || (space === "screen" && axis === "z")) throw new TypeError("Invalid layout axis.");
  const anchor = vector(input.anchor, "anchor", [0, 0, 0], 0);
  if (anchor.some(v => v > 1)) throw new TypeError("Anchor fractions must be <= 1.");
  const alignment = input.alignment ?? ["start", "start", "start"];
  if (!Array.isArray(alignment) || ![2, 3].includes(alignment.length)) throw new TypeError("alignment requires two or three values.");
  const align = [0, 1, 2].map(i => alignment[i] ?? "start");
  if (align.some(a => !["start", "center", "end"].includes(a))) throw new TypeError("Invalid alignment.");
  const grid = vector(input.grid, "grid", [1, 1, 1], 1);
  if (grid.some(v => !Number.isSafeInteger(v))) throw new TypeError("Grid dimensions must be positive safe integers.");
  if (!Array.isArray(input.items)) throw new TypeError("layout.items must be an array.");
  const ids = new Set();
  const items = input.items.map(item => {
    keys(item, ["id", "contentRef", "size", "offset", "pivot"], "item");
    const id = text(item.id, "item.id");
    if (ids.has(id)) throw new TypeError(`Duplicate layout item: ${id}.`);
    ids.add(id);
    const size = vector(item.size, "item.size", undefined, 0);
    const offset = vector(item.offset, "item.offset", [0, 0, 0]);
    const pivot = vector(item.pivot, "item.pivot", [0, 0, 0], 0);
    if (pivot.some(v => v > 1)) throw new TypeError("Pivot fractions must be <= 1.");
    if (space === "screen" && (size[2] !== 0 || offset[2] !== 0 || pivot[2] !== 0)) throw new TypeError("Screen items must be two-dimensional.");
    return { id, contentRef: text(item.contentRef, "item.contentRef"), size, offset, pivot };
  });
  if (mode === "grid" && items.length > grid[0] * grid[1] * grid[2]) throw new TypeError("Grid capacity is smaller than item membership.");
  const spacing = vector(input.spacing, "spacing", [0, 0, 0], 0);
  const offset = vector(input.offset, "offset", [0, 0, 0]);
  if (space === "screen" && (grid[2] !== 1 || anchor[2] !== 0 || offset[2] !== 0 || spacing[2] !== 0 || align[2] !== "start")) throw new TypeError("Screen layouts must be two-dimensional.");
  return { schema: SPATIAL_LAYOUT_SCHEMA, id: text(input.id, "layout.id"), space, units, mode, axis, grid, anchor, alignment: align, spacing, offset, items };
}
export function normalizeLayoutContext(layout, input) {
  const screen = layout.space === "screen";
  keys(input, screen ? ["viewport", "uiScale"] : ["bounds", "frame"], "context");
  let min, size, scale, origin = [0, 0, 0], axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (screen) {
    keys(input.viewport, ["x", "y", "width", "height"], "viewport");
    const v = input.viewport;
    min = [number(v.x ?? 0, "viewport.x"), number(v.y ?? 0, "viewport.y"), 0];
    size = [number(v.width, "viewport.width", 0), number(v.height, "viewport.height", 0), 0];
    const uiScale = number(input.uiScale ?? 1, "uiScale", Number.MIN_VALUE);
    scale = layout.units === "normalized" ? [size[0], size[1], 1] : [uiScale, uiScale, 1];
  } else {
    keys(input.bounds, ["min", "size"], "bounds");
    min = vector(input.bounds.min, "bounds.min", [0, 0, 0]);
    size = vector(input.bounds.size, "bounds.size", undefined, 0);
    scale = [1, 1, 1];
    if (input.frame !== undefined) {
      keys(input.frame, ["origin", "axes"], "frame");
      origin = vector(input.frame.origin, "frame.origin", [0, 0, 0]);
      if (input.frame.axes !== undefined) {
        if (!Array.isArray(input.frame.axes) || input.frame.axes.length !== 3) throw new TypeError("frame.axes requires three basis vectors.");
        axes = input.frame.axes.map((a, i) => vector(a, `frame.axes[${i}]`, undefined));
        for (let i = 0; i < 3; i++) for (let j = 0; j <= i; j++) {
          const dot = axes[i].reduce((v, a, k) => v + a * axes[j][k], 0);
          if (Math.abs(dot - (i === j ? 1 : 0)) > 1e-8) throw new TypeError("frame.axes must be orthonormal.");
        }
      }
    }
  }
  min.forEach((v, i) => number(v + size[i], "bounds endpoint"));
  return { min, size, scale, origin, axes };
}
