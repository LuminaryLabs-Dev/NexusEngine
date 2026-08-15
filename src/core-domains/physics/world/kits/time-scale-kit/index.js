import { createDomainKit } from "../../../../domain-kit.js";
import { createWorldRecordRegistry } from "../../record-registry.js";
import {
  TIME_SCALE_SCHEMA,
  normalizeRegistrySnapshot,
  requireWorldNumber,
  requireWorldText
} from "../../world-contracts.js";
import {
  normalizeTimeScale,
  normalizeTimeScaleDefinitionCommand,
  normalizeTimeScaleRemovalCommand,
  timeScaleContract
} from "./contracts.js";

function normalizeIds(value) {
  if (!Array.isArray(value)) throw new TypeError("Physics time-scale IDs must be an array.");
  return [...new Set(value.map((entry, index) => requireWorldText(entry, `Physics time-scale IDs[${index}]`)))].sort();
}

export function createTimeScaleKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "time-scale-kit",
    id: config.id ?? "time-scale-kit",
    domain: "physics-time-scale",
    domainPath: "n:physics:world",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsTimeScale",
    requires: ["n:physics", "physics:state-schema", "physics:command-schema", "physics:event-schema"],
    provides: ["n:physics:world", "physics:time-scale"],
    purpose: "Own portable deterministic Physics-only time-scale records and delta resolution.",
    owns: ["Physics time-scale identity", "Physics delta scaling", "deterministic scale composition"],
    doesNotOwn: ["Runtime clocks", "scheduling", "fixed-step accumulation", "provider stepping"],
    initialState: { scales: {}, order: [], scaleRevision: 0 },
    createApi({ baseApi }) {
      const registry = createWorldRecordRegistry({
        baseApi,
        collectionName: "scales",
        revisionName: "scaleRevision",
        recordName: "scale",
        idName: "scaleId",
        normalizeDefinition: normalizeTimeScaleDefinitionCommand,
        normalizeRemoval: normalizeTimeScaleRemovalCommand
      });
      return {
        ...baseApi,
        getContract: timeScaleContract,
        normalize: normalizeTimeScale,
        defineScale: registry.defineRecord,
        removeScale: registry.removeRecord,
        hasScale: registry.hasRecord,
        getScale: registry.getRecord,
        listScales: registry.listRecords,
        resolve(scaleIds = [], deltaSeconds = 0) {
          const ids = normalizeIds(scaleIds);
          const scales = ids.map((id) => {
            const scale = registry.getRecord(id);
            if (!scale) throw new TypeError(`Unknown Physics time scale ${id}.`);
            return scale;
          }).sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id));
          const factor = scales.filter((scale) => scale.enabled).reduce((value, scale) => value * scale.factor, 1);
          if (!Number.isFinite(factor)) throw new TypeError("Resolved Physics time-scale factor must be finite.");
          const delta = requireWorldNumber(deltaSeconds, "Physics time-scale deltaSeconds", { minimum: 0 });
          const scaledDeltaSeconds = delta * factor;
          if (!Number.isFinite(scaledDeltaSeconds)) throw new TypeError("Resolved Physics scaled delta must be finite.");
          return {
            schema: "nexusengine.physics-time-scale-resolution/1",
            scaleIds: scales.map((scale) => scale.id),
            factor,
            deltaSeconds: delta,
            scaledDeltaSeconds
          };
        },
        inspect(input) {
          try {
            normalizeTimeScale(input);
            return { schema: TIME_SCALE_SCHEMA, valid: true, errors: [] };
          } catch (error) {
            return { schema: TIME_SCALE_SCHEMA, valid: false, errors: [{ code: "invalid-physics-time-scale", message: error.message }] };
          }
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeRegistrySnapshot(snapshot, {
            domain: "physics-time-scale",
            collectionName: "scales",
            revisionName: "scaleRevision",
            normalizeRecord: normalizeTimeScale
          }));
        }
      };
    }
  });
}

export default createTimeScaleKit;
