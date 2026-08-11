import { createDomainKit } from "../../../../../domain-kit.js";
import { createWorldRecordRegistry } from "../../record-registry.js";
import {
  GRAVITY_FIELD_SCHEMA,
  normalizeRegistrySnapshot,
  requireWorldText,
  sumWorldVectors
} from "../../world-contracts.js";
import {
  gravityFieldContract,
  normalizeGravityDefinitionCommand,
  normalizeGravityField,
  normalizeGravityRemovalCommand,
  sampleGravityField
} from "./contracts.js";

function normalizeIds(value) {
  if (!Array.isArray(value)) throw new TypeError("gravity field IDs must be an array.");
  return [...new Set(value.map((entry, index) => requireWorldText(entry, `gravity field IDs[${index}]`)))].sort();
}

export function createGravityFieldKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "gravity-field-kit",
    id: config.id ?? "gravity-field-kit",
    domain: "physics-gravity-field",
    domainPath: "n:physics:world",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsGravityField",
    requires: ["n:physics", "physics:state-schema", "physics:command-schema", "physics:event-schema"],
    provides: ["n:physics:world", "physics:gravity-field"],
    purpose: "Own portable deterministic uniform and point-gravity field records and sampling.",
    owns: ["gravity field identity", "gravity acceleration descriptors", "gravity field sampling"],
    doesNotOwn: ["body mass", "body integration", "solver execution", "semantic World regions"],
    initialState: { fields: {}, order: [], fieldRevision: 0 },
    createApi({ baseApi }) {
      const registry = createWorldRecordRegistry({
        baseApi,
        collectionName: "fields",
        revisionName: "fieldRevision",
        recordName: "field",
        idName: "fieldId",
        normalizeDefinition: normalizeGravityDefinitionCommand,
        normalizeRemoval: normalizeGravityRemovalCommand
      });
      const getRequired = (id) => {
        const field = registry.getRecord(id);
        if (!field) throw new TypeError(`Unknown gravity field ${id}.`);
        return field;
      };
      return {
        ...baseApi,
        getContract: gravityFieldContract,
        normalize: normalizeGravityField,
        defineField: registry.defineRecord,
        removeField: registry.removeRecord,
        hasField: registry.hasRecord,
        getField: registry.getRecord,
        listFields: registry.listRecords,
        sample(fieldId, point = [0, 0, 0]) {
          return sampleGravityField(getRequired(fieldId), point);
        },
        sampleMany(fieldIds = [], point = [0, 0, 0]) {
          const samples = normalizeIds(fieldIds).map((id) => sampleGravityField(getRequired(id), point));
          return { samples, acceleration: sumWorldVectors(samples.map((sample) => sample.acceleration)) };
        },
        inspect(input) {
          try {
            normalizeGravityField(input);
            return { schema: GRAVITY_FIELD_SCHEMA, valid: true, errors: [] };
          } catch (error) {
            return { schema: GRAVITY_FIELD_SCHEMA, valid: false, errors: [{ code: "invalid-gravity-field", message: error.message }] };
          }
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeRegistrySnapshot(snapshot, {
            domain: "physics-gravity-field",
            collectionName: "fields",
            revisionName: "fieldRevision",
            normalizeRecord: normalizeGravityField
          }));
        }
      };
    }
  });
}

export default createGravityFieldKit;
