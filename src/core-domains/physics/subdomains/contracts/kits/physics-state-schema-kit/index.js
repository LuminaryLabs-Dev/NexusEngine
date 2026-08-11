import { createDomainKit } from "../../../../../domain-kit.js";
import { getPhysicsStateSchema, inspectPhysicsState, normalizePhysicsState, validatePhysicsState } from "./contracts.js";

export {
  PHYSICS_STATE_SCHEMA,
  getPhysicsStateSchema,
  inspectPhysicsState,
  normalizePhysicsState,
  validatePhysicsState
} from "./contracts.js";

export function createPhysicsStateSchemaKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-state-schema-kit",
    id: config.id ?? "physics-state-schema-kit",
    domain: "physics-state-schema",
    domainPath: "n:physics:contracts",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsStateSchema",
    requires: ["n:physics"],
    provides: ["physics:state-schema"],
    purpose: "Validate and normalize portable Physics snapshots for deterministic replay.",
    owns: ["physics snapshot schema", "portable state validation", "canonical state normalization"],
    doesNotOwn: ["solver state mutation", "backend handles", "body simulation"],
    initialState: { schemaRevision: 1 },
    services: ["state-schema"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getSchema: getPhysicsStateSchema,
        inspectState: inspectPhysicsState,
        validateState: validatePhysicsState,
        normalizeState: normalizePhysicsState
      };
    },
    metadata: { jsonPortable: true, providerNeutral: true }
  });
}

export default createPhysicsStateSchemaKit;
