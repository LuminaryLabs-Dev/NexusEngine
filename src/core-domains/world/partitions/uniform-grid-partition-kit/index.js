import { createWorldCell } from "../../kits/world-cell-kit/index.js";
import { defineWorldPartition, diffCellSelections } from "../../kits/world-partition-kit/index.js";

export function createUniformGridPartition(options = {}) {
  const id = options.id ?? "uniform-grid";
  const cellSize = Number(options.cellSize ?? 256);
  const radius = Number(options.radius ?? 2);
  return defineWorldPartition({
    id,
    kind: "uniform-grid",
    selectCells({ worldId, worldSeed, focus = {}, previousCells = [] }) {
      const cx = Math.floor(Number(focus.position?.x ?? focus.x ?? 0) / cellSize);
      const cz = Math.floor(Number(focus.position?.z ?? focus.z ?? 0) / cellSize);
      const next = [];
      for (let dz = -radius; dz <= radius; dz += 1) for (let dx = -radius; dx <= radius; dx += 1) {
        const x = cx + dx;
        const z = cz + dz;
        next.push(createWorldCell({
          worldId,
          worldSeed,
          partitionId: id,
          coordinates: [x, z],
          bounds: { minX: x * cellSize, minZ: z * cellSize, maxX: (x + 1) * cellSize, maxZ: (z + 1) * cellSize },
          lod: Math.max(Math.abs(dx), Math.abs(dz)),
          priority: radius - Math.max(Math.abs(dx), Math.abs(dz))
        }));
      }
      return diffCellSelections(previousCells, next);
    },
    locateCell(position = {}) {
      return [Math.floor(Number(position.x ?? 0) / cellSize), Math.floor(Number(position.z ?? 0) / cellSize)];
    },
    snapshot: () => ({ id, kind: "uniform-grid", cellSize, radius })
  });
}
