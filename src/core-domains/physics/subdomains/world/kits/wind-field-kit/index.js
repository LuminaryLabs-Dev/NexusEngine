import { createDomainKit } from "../../../../../domain-kit.js";
import { createWorldRecordRegistry } from "../../record-registry.js";
import {
  WIND_FIELD_SCHEMA,
  normalizeRegistrySnapshot,
  requireWorldText,
  sumWorldVectors
} from "../../world-contracts.js";
import {
  normalizeWindDefinitionCommand,
  normalizeWindField,
  normalizeWindRemovalCommand,
  sampleWindField,
  windFieldContract
} from "./contracts.js";

function normalizeIds(value) {
  if (!Array.isArray(value)) throw new TypeError("wind field IDs must be an array.");
  return [...new Set(value.map((entry, index) => requireWorldText(entry, `wind field IDs[${index}]`)))].sort();
}

export function createWindFieldKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "wind-field-kit",
    id: config.id ?? "wind-field-kit",
    domain: "physics-wind-field",
    domainPath: "n:physics:world",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsWindField",
    requires: ["n:physics", "physics:state-schema", "physics:command-schema", "physics:event-schema"],
    provides: ["n:physics:world", "physics:wind-field"],
    purpose: "Own portable deterministic physical flow-velocity field records and sampling.",
    owns: ["physical wind field identity", "flow velocity descriptors", "deterministic wind sampling"],
    doesNotOwn: ["weather", "visual particles", "shaders", "aerodynamic body response", "authored routes"],
    initialState: { fields: {}, order: [], fieldRevision: 0 },
    createApi({ baseApi }) {
      const registry = createWorldRecordRegistry({
        baseApi,
        collectionName: "fields",
        revisionName: "fieldRevision",
        recordName: "field",
        idName: "fieldId",
        normalizeDefinition: normalizeWindDefinitionCommand,
        normalizeRemoval: normalizeWindRemovalCommand
      });
      const getRequired = (id) => {
        const field = registry.getRecord(id);
        if (!field) throw new TypeError(`Unknown wind field ${id}.`);
        return field;
      };
      return {
        ...baseApi,
        getContract: windFieldContract,
        normalize: normalizeWindField,
        defineField: registry.defineRecord,
        removeField: registry.removeRecord,
        hasField: registry.hasRecord,
        getField: registry.getRecord,
        listFields: registry.listRecords,
        sample(fieldId, point = [0, 0, 0], timeSeconds = 0) {
          return sampleWindField(getRequired(fieldId), point, timeSeconds);
        },
        sampleMany(fieldIds = [], point = [0, 0, 0], timeSeconds = 0) {
          const samples = normalizeIds(fieldIds).map((id) => sampleWindField(getRequired(id), point, timeSeconds));
          return {
            samples,
            velocity: sumWorldVectors(samples.map((sample) => sample.velocity.map((entry) => entry * sample.influence)))
          };
        },
        inspect(input) {
          try {
            normalizeWindField(input);
            return { schema: WIND_FIELD_SCHEMA, valid: true, errors: [] };
          } catch (error) {
            return { schema: WIND_FIELD_SCHEMA, valid: false, errors: [{ code: "invalid-wind-field", message: error.message }] };
          }
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeRegistrySnapshot(snapshot, {
            domain: "physics-wind-field",
            collectionName: "fields",
            revisionName: "fieldRevision",
            normalizeRecord: normalizeWindField
          }));
        }
      };
    }
  });
}

export default createWindFieldKit;
