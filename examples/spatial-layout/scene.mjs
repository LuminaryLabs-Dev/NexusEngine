export const content = [
  { id: "A", color: "#e7ac46" },
  { id: "B", color: "#54bfc5" },
  { id: "C", color: "#a49bd2" }
];
export const row = {
  id: "screen-row", space: "screen", units: "logical-pixels", mode: "row", spacing: [14, 0],
  anchor: [0.5, 0.5], alignment: ["center", "center"],
  items: content.map(c => ({ id: c.id, contentRef: `content:${c.id}`, size: [68, 50] }))
};
export const grid = {
  id: "world-grid", space: "world", units: "world-units", mode: "grid", grid: [2, 1, 2], spacing: [0.55, 0, 0.7],
  items: content.map(c => ({ id: c.id, contentRef: `content:${c.id}`, size: [1.2, 0.65, 0.8] }))
};
const angle = Math.PI / 8;
export const worldContext = {
  bounds: { min: [0, 0, 0], size: [5, 2, 5] },
  frame: { origin: [-1.3, 0, -0.5], axes: [[Math.cos(angle), 0, -Math.sin(angle)], [0, 1, 0], [Math.sin(angle), 0, Math.cos(angle)]] }
};
