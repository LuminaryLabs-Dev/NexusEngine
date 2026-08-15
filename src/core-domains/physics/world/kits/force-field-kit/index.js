import { createDomainKit } from "../../../../domain-kit.js";
import { createWorldRecordRegistry } from "../../record-registry.js";
import {
  FORCE_FIELD_SCHEMA,
  normalizeRegistrySnapshot,
  requireWorldText,
  sumWorldVectors
} from "../../world-contracts.js";
import {
  forceFieldContract,
  normalizeForceDefinitionCommand,
  normalizeForceField,
  normalizeForceRemovalCommand,
  sampleForceField
} from "./contracts.js";

function normalizeIds(value) {
  if (!Array.isArray(value)) throw new TypeError("force field IDs must be an array.");
  return [...new Set(value.map((entry, index) => requireWorldText(entry, `force field IDs[${index}]`)))].sort();
}

export function createForceFieldKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "force-field-kit",
    id: config.id ?? "force-field-kit",
    domain: "physics-force-field",
    domainPath: "n:physics:world",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsForceField",
    requires: ["n:physics", "physics:state-schema", "physics:command-schema", "physics:event-schema"],
    provides: ["n:physics:world", "physics:force-field"],
    purpose: "Own portable deterministic non-gravity force and acceleration fields.",
    owns: ["force field identity", "force and acceleration descriptors", "force field sampling"],
    doesNotOwn: ["gravity", "body response", "integration", "solver execution"],
    initialState: { fields: {}, order: [], fieldRevision: 0 },
    createApi({ baseApi }) {
      const registry = createWorldRecordRegistry({
        baseApi,
        collectionName: "fields",
        revisionName: "fieldRevision",
        recordName: "field",
        idName: "fieldId",
        normalizeDefinition: normalizeForceDefinitionCommand,
        normalizeRemoval: normalizeForceRemovalCommand
      });
      const getRequired = (id) => {
        const field = registry.getRecord(id);
        if (!field) throw new TypeError(`Unknown force field ${id}.`);
        return field;
      };
      return {
        ...baseApi,
        getContract: forceFieldContract,
        normalize: normalizeForceField,
        defineField: registry.defineRecord,
        removeField: registry.removeRecord,
        hasField: registry.hasRecord,
        getField: registry.getRecord,
        listFields: registry.listRecords,
        sample(fieldId, point = [0, 0, 0]) {
          return sampleForceField(getRequired(fieldId), point);
        },
        sampleMany(fieldIds = [], point = [0, 0, 0]) {
          const samples = normalizeIds(fieldIds).map((id) => sampleForceField(getRequired(id), point));
          return {
            samples,
            force: sumWorldVectors(samples.map((sample) => sample.force)),
            acceleration: sumWorldVectors(samples.map((sample) => sample.acceleration))
          };
        },
        inspect(input) {
          try {
            normalizeForceField(input);
            return { schema: FORCE_FIELD_SCHEMA, valid: true, errors: [] };
          } catch (error) {
            return { schema: FORCE_FIELD_SCHEMA, valid: false, errors: [{ code: "invalid-force-field", message: error.message }] };
          }
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeRegistrySnapshot(snapshot, {
            domain: "physics-force-field",
            collectionName: "fields",
            revisionName: "fieldRevision",
            normalizeRecord: normalizeForceField
          }));
        }
      };
    }
  });
}

export default createForceFieldKit;
