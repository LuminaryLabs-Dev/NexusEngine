import { normalizeTerrainConfig } from "./contracts.js";

export function createTerrainState(config = {}) {
  return { terrainConfig: normalizeTerrainConfig(config), focus: null, cells: {} };
}
