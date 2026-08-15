import { createDomainKit } from "../../../../domain-kit.js";
import { createWorldRecordRegistry } from "../../record-registry.js";
import {
  SIMULATION_REGION_SCHEMA,
  normalizeRegistrySnapshot,
  requireWorldText
} from "../../world-contracts.js";
import {
  normalizeSimulationRegion,
  normalizeSimulationRegionDefinitionCommand,
  normalizeSimulationRegionRemovalCommand,
  simulationRegionContains,
  simulationRegionContract
} from "./contracts.js";

function normalizeIds(value) {
  if (!Array.isArray(value)) throw new TypeError("simulation-region IDs must be an array.");
  return [...new Set(value.map((entry, index) => requireWorldText(entry, `simulation-region IDs[${index}]`)))].sort();
}

export function createSimulationRegionKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "simulation-region-kit",
    id: config.id ?? "simulation-region-kit",
    domain: "physics-simulation-region",
    domainPath: "n:physics:world",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsSimulationRegion",
    requires: ["n:physics", "physics:state-schema", "physics:command-schema", "physics:event-schema"],
    provides: ["n:physics:world", "physics:simulation-region"],
    purpose: "Own portable physical simulation activation regions and deterministic point resolution.",
    owns: ["physical simulation region identity", "simulation behavior selection", "region containment queries"],
    doesNotOwn: ["semantic World regions", "weather regions", "authored game zones", "body sleeping implementation"],
    initialState: { regions: {}, order: [], regionRevision: 0 },
    createApi({ baseApi }) {
      const registry = createWorldRecordRegistry({
        baseApi,
        collectionName: "regions",
        revisionName: "regionRevision",
        recordName: "region",
        idName: "regionId",
        normalizeDefinition: normalizeSimulationRegionDefinitionCommand,
        normalizeRemoval: normalizeSimulationRegionRemovalCommand
      });
      const selected = (regionIds, point) => normalizeIds(regionIds)
        .map((id) => {
          const region = registry.getRecord(id);
          if (!region) throw new TypeError(`Unknown simulation region ${id}.`);
          return region;
        })
        .filter((region) => simulationRegionContains(region, point))
        .sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id));
      return {
        ...baseApi,
        getContract: simulationRegionContract,
        normalize: normalizeSimulationRegion,
        defineRegion: registry.defineRecord,
        removeRegion: registry.removeRecord,
        hasRegion: registry.hasRecord,
        getRegion: registry.getRecord,
        listRegions: registry.listRecords,
        contains(regionId, point = [0, 0, 0]) {
          const region = registry.getRecord(regionId);
          if (!region) throw new TypeError(`Unknown simulation region ${regionId}.`);
          return simulationRegionContains(region, point);
        },
        matching(regionIds = [], point = [0, 0, 0]) {
          return selected(regionIds, point);
        },
        resolve(regionIds = [], point = [0, 0, 0]) {
          const matches = selected(regionIds, point);
          return {
            schema: "nexusengine.physics-simulation-region-resolution/1",
            regionIds: matches.map((region) => region.id),
            behavior: matches[0]?.behavior ?? "simulate",
            dominantRegionId: matches[0]?.id ?? null
          };
        },
        inspect(input) {
          try {
            normalizeSimulationRegion(input);
            return { schema: SIMULATION_REGION_SCHEMA, valid: true, errors: [] };
          } catch (error) {
            return { schema: SIMULATION_REGION_SCHEMA, valid: false, errors: [{ code: "invalid-simulation-region", message: error.message }] };
          }
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeRegistrySnapshot(snapshot, {
            domain: "physics-simulation-region",
            collectionName: "regions",
            revisionName: "regionRevision",
            normalizeRecord: normalizeSimulationRegion
          }));
        }
      };
    }
  });
}

export default createSimulationRegionKit;
