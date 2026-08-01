import { defineWorldSurface } from "../../kits/world-surface-kit/index.js";

const smoothstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / Math.max(1e-9, b - a))); return t * t * (3 - 2 * t); };

export function createCurvedHorizonSurface(options = {}) {
  const origin = { x: Number(options.origin?.x ?? 0), z: Number(options.origin?.z ?? 0) };
  const curveStart = Number(options.curveStart ?? 500);
  const curveEnd = Number(options.curveEnd ?? 1600);
  const visualRadius = Number(options.visualRadius ?? 24000);
  const strength = Number(options.strength ?? 1);
  const dropAt = (u, v) => {
    const d = Math.hypot(u - origin.x, v - origin.z);
    return (d * d / (2 * visualRadius)) * smoothstep(curveStart, curveEnd, d) * strength;
  };
  return defineWorldSurface({
    id: options.id ?? "curved-horizon-surface",
    kind: "curved-horizon",
    toWorld({ u = 0, v = 0 } = {}, elevation = 0) { return { x: u, y: elevation - dropAt(u, v), z: v }; },
    fromWorld({ x = 0, y = 0, z = 0 } = {}) { return { surfacePosition: { u: x, v: z }, elevation: y + dropAt(x, z) }; },
    sampleFrame({ u = 0, v = 0 } = {}) {
      const e = 1;
      const dx = dropAt(u + e, v) - dropAt(u - e, v);
      const dz = dropAt(u, v + e) - dropAt(u, v - e);
      const len = Math.hypot(dx, 2, dz) || 1;
      const normal = { x: dx / len, y: 2 / len, z: dz / len };
      return { position: { x: u, y: -dropAt(u, v), z: v }, normal, tangent: { x: 1, y: -dx * 0.5, z: 0 }, bitangent: { x: 0, y: -dz * 0.5, z: 1 } };
    }
  });
}
