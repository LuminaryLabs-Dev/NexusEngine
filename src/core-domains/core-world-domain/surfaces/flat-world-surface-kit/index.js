import { defineWorldSurface } from "../../kits/world-surface-kit/index.js";

export function createFlatWorldSurface(options = {}) {
  return defineWorldSurface({
    id: options.id ?? "flat-world-surface",
    kind: "flat",
    toWorld({ u = 0, v = 0 } = {}, elevation = 0) { return { x: u, y: elevation, z: v }; },
    fromWorld({ x = 0, y = 0, z = 0 } = {}) { return { surfacePosition: { u: x, v: z }, elevation: y }; },
    sampleFrame({ u = 0, v = 0 } = {}) {
      return { position: { x: u, y: 0, z: v }, normal: { x: 0, y: 1, z: 0 }, tangent: { x: 1, y: 0, z: 0 }, bitangent: { x: 0, y: 0, z: 1 } };
    }
  });
}
