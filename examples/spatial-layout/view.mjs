import { createEngine } from "nexusengine";
import { createSpatialKit } from "nexusengine/domains/spatial/contracts";
import { createSpatialLayoutKit } from "nexusengine/domains/spatial/layout";
import { createPresentationKit } from "nexusengine/domains/presentation/registry";
import { createPresentationOutputKit } from "nexusengine/domains/presentation/output";
import { content, row, grid, worldContext } from "./scene.mjs";

const engine = createEngine({ kits: [createSpatialKit(), createSpatialLayoutKit({ layouts: [row, grid] }), createPresentationKit(), createPresentationOutputKit()] });
let uiScale = 1;
const colors = Object.fromEntries(content.map(c => [c.id, c.color]));
function surface(id) {
  const canvas = document.getElementById(id);
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.round(width * devicePixelRatio);
  canvas.height = Math.round(height * devicePixelRatio);
  const ctx = canvas.getContext("2d"); ctx.scale(devicePixelRatio, devicePixelRatio);
  return { ctx, width, height };
}
function values(id, result) {
  document.getElementById(id).textContent = result.placements.map(p => `${p.contentRef}   (${p.position.map(v => v.toFixed(2)).join(", ")})`).join("\n");
}
function render() {
  const screen = surface("screen"), world = surface("world");
  const output = engine.n.presentationOutput.setSurface({ cssWidth: screen.width, cssHeight: screen.height, safeInsets: { top: 16, bottom: 16, left: 16, right: 16 } });
  // Safe bounds are output coordinates; sizes and gaps are scaled exactly once.
  const safe = output.safeRect;
  const viewport = safe ?? { x: 16, y: 16, width: screen.width - 32, height: screen.height - 32 };
  const screenResult = engine.n.spatialLayout.resolve("screen-row", { viewport, uiScale });
  const c = screen.ctx;
  c.setLineDash([5, 5]); c.strokeStyle = "#87939e"; c.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height); c.setLineDash([]);
  for (const p of screenResult.placements) {
    c.fillStyle = colors[p.id]; c.fillRect(p.localMin[0], p.localMin[1], p.size[0], p.size[1]);
    c.strokeStyle = "#35434d"; c.strokeRect(p.localMin[0], p.localMin[1], p.size[0], p.size[1]);
    c.fillStyle = "#1f2931"; c.font = "bold 18px system-ui"; c.textAlign = "center"; c.fillText(p.id, p.position[0] + p.size[0] / 2, p.position[1] + p.size[1] / 2 + 6);
  }
  const worldResult = engine.n.spatialLayout.resolve("world-grid", worldContext);
  const w = world.ctx, unit = Math.min(world.width / 7, world.height / 5);
  const project = ([x, y, z]) => [world.width * 0.48 + (x - z * 0.7) * unit, world.height * 0.67 + (x * 0.25 + z * 0.45 - y) * unit];
  const point = (p, [x, y, z]) => p.position.map((v, a) => v + worldResult.axes[0][a] * x + worldResult.axes[1][a] * y + worldResult.axes[2][a] * z);
  const polygon = (points, fill) => { w.beginPath(); points.map(project).forEach((p, i) => i ? w.lineTo(...p) : w.moveTo(...p)); w.closePath(); if (fill) { w.fillStyle = fill; w.fill(); } w.strokeStyle = "#53616c"; w.stroke(); };
  for (let i = -3; i <= 4; i++) {
    w.beginPath(); w.moveTo(...project([i, 0, -2])); w.lineTo(...project([i, 0, 4])); w.strokeStyle = "#dce2e5"; w.stroke();
    w.beginPath(); w.moveTo(...project([-3, 0, i])); w.lineTo(...project([4, 0, i])); w.stroke();
  }
  // Face ordering belongs to this demonstration adapter, never Layout.
  const faces = [];
  const shade = (hex, factor) => "#" + hex.slice(1).match(/../g).map(v => Math.round(parseInt(v, 16) * factor).toString(16).padStart(2, "0")).join("");
  for (const p of worldResult.placements) {
    const [x, y, z] = p.size;
    const localFaces = [
      [[0, 0, 0], [x, 0, 0], [x, y, 0], [0, y, 0]],
      [[0, 0, z], [x, 0, z], [x, y, z], [0, y, z]],
      [[0, 0, 0], [0, 0, z], [0, y, z], [0, y, 0]],
      [[x, 0, 0], [x, 0, z], [x, y, z], [x, y, 0]],
      [[0, 0, 0], [x, 0, 0], [x, 0, z], [0, 0, z]],
      [[0, y, 0], [x, y, 0], [x, y, z], [0, y, z]]
    ];
    localFaces.forEach((vertices, index) => {
      const points = vertices.map(v => point(p, v));
      const depth = points.reduce((d, [x, y, z]) => d + x * 0.7 + y * 0.625 + z, 0) / 4;
      faces.push({ points, depth, color: shade(colors[p.id], index === 5 ? 1 : index < 2 ? 0.9 : 0.78) });
    });
  }
  faces.sort((a, b) => a.depth - b.depth).forEach(face => polygon(face.points, face.color));
  for (const p of worldResult.placements) {
    const [x, y, z] = p.size;
    const label = project(point(p, [x / 2, y + 0.12, z / 2]));
    w.fillStyle = "#1f2931"; w.font = "bold 17px system-ui"; w.textAlign = "center"; w.fillText(p.id, ...label);
  }
  values("screen-values", screenResult); values("world-values", worldResult);
  document.getElementById("status").textContent = "3 shared references · layouts resolved";
  window.layoutExample = { screen: screenResult, world: worldResult, uiScale, snapshot: engine.n.spatialLayout.getSnapshot(), viewport };
}
document.getElementById("scale").onclick = event => { uiScale = uiScale === 1 ? 1.25 : 1; event.target.textContent = `UI scale: ${uiScale}×`; render(); };
document.getElementById("reset").onclick = () => { engine.n.spatialLayout.reset(); uiScale = 1; document.getElementById("scale").textContent = "UI scale: 1×"; render(); };
new ResizeObserver(render).observe(document.querySelector(".panes"));
render();
