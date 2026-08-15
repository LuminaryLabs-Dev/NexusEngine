import { cloneSerializableState } from "../../../../../foundation/serializable-state.js";
import { bakeTerrainCell, sampleTerrain } from "./contracts.js";

function cellCoordinates(config, point = {}) {
  return { x: Math.floor((Number(point.x ?? 0) - config.origin.x) / config.chunkSize), z: Math.floor((Number(point.z ?? point.y ?? 0) - config.origin.z) / config.chunkSize) };
}

export function createTerrainServices(baseApi) {
  const currentConfig = () => baseApi.getState().terrainConfig;
  const prepare = (state, x, z, resolution) => {
    const cell = bakeTerrainCell(state.terrainConfig, { x, z, resolution });
    return { ...state.cells, [cell.id]: { ...cell, active: true } };
  };
  return {
    sample(point = {}) {
      return sampleTerrain(currentConfig(), point);
    },
    prepareCell(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const x = Math.floor(Number(request.x));
        const z = Math.floor(Number(request.z ?? request.y));
        if (!Number.isFinite(x) || !Number.isFinite(z)) throw new TypeError("Terrain cell coordinates must be finite.");
        const cells = prepare(state, x, z, request.resolution);
        return { patch: { cells }, result: cells[`${x},${z}`], events: [{ name: "terrainCellPrepared", payload: { cellId: `${x},${z}` } }] };
      });
    },
    updateCell(command = {}) {
      return this.prepareCell(command);
    },
    releaseCell(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const cellId = String(request.cellId ?? `${Math.floor(Number(request.x))},${Math.floor(Number(request.z ?? request.y))}`);
        if (!state.cells[cellId]) return { patch: {}, result: { cellId, released: false } };
        const cells = { ...state.cells };
        delete cells[cellId];
        return { patch: { cells }, result: { cellId, released: true }, events: [{ name: "terrainCellReleased", payload: { cellId } }] };
      });
    },
    updateFocus(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const focus = { x: Number(request.x ?? request.point?.x ?? 0), z: Number(request.z ?? request.y ?? request.point?.z ?? request.point?.y ?? 0) };
        if (!Number.isFinite(focus.x) || !Number.isFinite(focus.z)) throw new TypeError("Terrain focus must be finite.");
        const center = cellCoordinates(state.terrainConfig, focus);
        let cells = { ...state.cells };
        for (let dz = -state.terrainConfig.preloadRadius; dz <= state.terrainConfig.preloadRadius; dz += 1) {
          for (let dx = -state.terrainConfig.preloadRadius; dx <= state.terrainConfig.preloadRadius; dx += 1) {
            const x = center.x + dx;
            const z = center.z + dz;
            const id = `${x},${z}`;
            if (!cells[id]) cells = prepare({ ...state, cells }, x, z);
            cells[id] = { ...cells[id], active: Math.max(Math.abs(dx), Math.abs(dz)) <= state.terrainConfig.activeRadius };
          }
        }
        for (const [id, cell] of Object.entries(cells)) {
          if (Math.max(Math.abs(cell.x - center.x), Math.abs(cell.z - center.z)) > state.terrainConfig.unloadRadius) delete cells[id];
        }
        return { patch: { focus, cells }, result: { focus, activeCells: Object.values(cells).filter((cell) => cell.active).length, retainedCells: Object.keys(cells).length } };
      });
    },
    getCell(cellId) {
      return cloneSerializableState(baseApi.getState().cells[String(cellId)] ?? null);
    },
    listCells() {
      return Object.values(baseApi.getState().cells).sort((left, right) => left.id.localeCompare(right.id));
    }
  };
}

export function createTerrainQuery(api) {
  if (!api || typeof api.sample !== "function") throw new TypeError("Terrain query requires a Terrain API.");
  return Object.freeze({ sample: (point) => api.sample(point), cell: (id) => api.getCell(id), cells: () => api.listCells() });
}
