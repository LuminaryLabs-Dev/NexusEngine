import { createDomainKit } from "../../../../../domain-kit.js";
import {
  getPhysicsQuerySchemas,
  inspectPhysicsQuery,
  inspectPhysicsQueryResult,
  normalizePhysicsQuery,
  normalizePhysicsQueryResult,
  validatePhysicsQuery,
  validatePhysicsQueryResult
} from "./contracts.js";

export {
  PHYSICS_QUERY_RESULT_SCHEMA,
  PHYSICS_QUERY_SCHEMA,
  getPhysicsQuerySchemas,
  inspectPhysicsQuery,
  inspectPhysicsQueryResult,
  normalizePhysicsQuery,
  normalizePhysicsQueryResult,
  validatePhysicsQuery,
  validatePhysicsQueryResult
} from "./contracts.js";

export function createPhysicsQuerySchemaKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-query-schema-kit",
    id: config.id ?? "physics-query-schema-kit",
    domain: "physics-query-schema",
    domainPath: "n:physics:contracts",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsQuerySchema",
    requires: ["n:physics"],
    provides: ["physics:query-schema"],
    purpose: "Define read-only portable Physics query request and result envelopes.",
    owns: ["physics query request schema", "physics query result schema", "query portability validation"],
    doesNotOwn: ["query execution", "broad phase state", "provider selection"],
    initialState: { schemaRevision: 1 },
    services: ["query-schema"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getSchemas: getPhysicsQuerySchemas,
        inspectQuery: inspectPhysicsQuery,
        validateQuery: validatePhysicsQuery,
        normalizeQuery: normalizePhysicsQuery,
        inspectResult: inspectPhysicsQueryResult,
        validateResult: validatePhysicsQueryResult,
        normalizeResult: normalizePhysicsQueryResult
      };
    },
    metadata: { readOnly: true, jsonPortable: true }
  });
}

export default createPhysicsQuerySchemaKit;
