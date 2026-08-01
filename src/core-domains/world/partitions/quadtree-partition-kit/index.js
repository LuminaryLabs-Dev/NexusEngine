import { createWorldCell } from "../../kits/world-cell-kit/index.js";
import { defineWorldPartition, diffCellSelections } from "../../kits/world-partition-kit/index.js";

function intersectsCircle(bounds, x, z, radius) {
  const qx = Math.max(bounds.minX, Math.min(x, bounds.maxX));
  const qz = Math.max(bounds.minZ, Math.min(z, bounds.maxZ));
  return Math.hypot(qx - x, qz - z) <= radius;
}

export function createQuadtreePartition(options = {}) {
  const id = options.id ?? "quadtree";
  const root = { ...(options.rootBounds ?? { minX: -8192, minZ: -8192, maxX: 8192, maxZ: 8192 }) };
  const maxDepth = Number(options.maxDepth ?? 6);
  const minCellSize = Number(options.minCellSize ?? 256);
  const refineRadius = Number(options.refineRadius ?? 1400);

  function walk(worldId, worldSeed, focus, bounds, level, path, out) {
    const width = bounds.maxX - bounds.minX;
    const shouldSplit = level < maxDepth && width * 0.5 >= minCellSize && intersectsCircle(bounds, focus.x, focus.z, refineRadius / Math.max(1, level + 1));
    if (!shouldSplit) {
      out.push(createWorldCell({ worldId, worldSeed, partitionId: id, coordinates: path, level, bounds, lod: maxDepth - level, priority: level }));
      return;
    }
    const mx = (bounds.minX + bounds.maxX) * 0.5;
    const mz = (bounds.minZ + bounds.maxZ) * 0.5;
    const children = [
      { minX: bounds.minX, minZ: bounds.minZ, maxX: mx, maxZ: mz },
      { minX: mx, minZ: bounds.minZ, maxX: bounds.maxX, maxZ: mz },
      { minX: bounds.minX, minZ: mz, maxX: mx, maxZ: bounds.maxZ },
      { minX: mx, minZ: mz, maxX: bounds.maxX, maxZ: bounds.maxZ }
    ];
    children.forEach((child, index) => walk(worldId, worldSeed, focus, child, level + 1, [...path, index], out));
  }

  return defineWorldPartition({
    id,
    kind: "quadtree",
    selectCells({ worldId, worldSeed, focus = {}, previousCells = [] }) {
      const position = focus.position ?? focus;
      const next = [];
      walk(worldId, worldSeed, { x: Number(position.x ?? 0), z: Number(position.z ?? 0) }, root, 0, [], next);
      return diffCellSelections(previousCells, next);
    },
    locateCell(position = {}) {
      return { x: Number(position.x ?? 0), z: Number(position.z ?? 0) };
    },
    snapshot: () => ({ id, kind: "quadtree", rootBounds: root, maxDepth, minCellSize, refineRadius })
  });
}
