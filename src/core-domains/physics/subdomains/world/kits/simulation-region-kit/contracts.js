import {
  SIMULATION_REGION_SCHEMA,
  normalizeDefinitionCommand,
  normalizeRemovalCommand,
  normalizeSimulationRegion,
  simulationRegionContains
} from "../../world-contracts.js";

export { normalizeSimulationRegion, simulationRegionContains };

export function normalizeSimulationRegionDefinitionCommand(input) {
  return normalizeDefinitionCommand(input, "region", normalizeSimulationRegion, "simulation-region definition");
}

export function normalizeSimulationRegionRemovalCommand(input) {
  return normalizeRemovalCommand(input, "regionId", "simulation region");
}

export function simulationRegionContract() {
  return Object.freeze({
    schema: SIMULATION_REGION_SCHEMA,
    shapes: Object.freeze(["aabb", "sphere"]),
    behaviors: Object.freeze(["simulate", "sleep", "disable"]),
    resolution: "highest-priority-then-lexicographic-id",
    semanticWorldRegionsOwnedExternally: true
  });
}
