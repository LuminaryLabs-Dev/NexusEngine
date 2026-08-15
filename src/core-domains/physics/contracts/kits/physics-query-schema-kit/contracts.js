import {
  arrayRequired,
  assertSchema,
  canonicalizePortableValue,
  exactSchema,
  inspectPortableValue,
  nonnegativeInteger,
  objectRequired,
  optionalObject,
  optionalText,
  rejectUnknownKeys,
  requireText,
  schemaResult
} from "../../portable-value.js";

export const PHYSICS_QUERY_SCHEMA = "nexusengine.physics-query/1";
export const PHYSICS_QUERY_RESULT_SCHEMA = "nexusengine.physics-query-result/1";

const QUERY_FIELDS = Object.freeze([
  "schema",
  "queryId",
  "type",
  "tickId",
  "worldId",
  "parameters",
  "options"
]);

const RESULT_FIELDS = Object.freeze([
  "schema",
  "queryId",
  "providerId",
  "tickId",
  "status",
  "hits",
  "metadata"
]);

function queryErrors(query) {
  const errors = [...objectRequired(query)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(query, QUERY_FIELDS));
  errors.push(...exactSchema(query.schema, PHYSICS_QUERY_SCHEMA));
  errors.push(...requireText(query.queryId, "$.queryId"));
  errors.push(...requireText(query.type, "$.type"));
  errors.push(...nonnegativeInteger(query.tickId, "$.tickId", { optional: true }));
  errors.push(...optionalText(query.worldId, "$.worldId"));
  errors.push(...optionalObject(query.parameters, "$.parameters"));
  errors.push(...optionalObject(query.options, "$.options"));
  errors.push(...inspectPortableValue(query));
  return errors;
}

function resultErrors(result) {
  const errors = [...objectRequired(result)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(result, RESULT_FIELDS));
  errors.push(...exactSchema(result.schema, PHYSICS_QUERY_RESULT_SCHEMA));
  errors.push(...requireText(result.queryId, "$.queryId"));
  errors.push(...optionalText(result.providerId, "$.providerId"));
  errors.push(...nonnegativeInteger(result.tickId, "$.tickId", { optional: true }));
  errors.push(...optionalText(result.status, "$.status"));
  errors.push(...arrayRequired(result.hits, "$.hits", { optional: true }));
  errors.push(...optionalObject(result.metadata, "$.metadata"));
  errors.push(...inspectPortableValue(result));
  return errors;
}

export function inspectPhysicsQuery(query) {
  return schemaResult(PHYSICS_QUERY_SCHEMA, queryErrors(query));
}

export function validatePhysicsQuery(query) {
  return assertSchema(inspectPhysicsQuery(query), "Physics query");
}

export function normalizePhysicsQuery(query) {
  validatePhysicsQuery(query);
  return canonicalizePortableValue({
    schema: PHYSICS_QUERY_SCHEMA,
    queryId: query.queryId.trim(),
    type: query.type.trim(),
    tickId: query.tickId ?? null,
    worldId: query.worldId?.trim() ?? null,
    parameters: query.parameters ?? {},
    options: query.options ?? {}
  });
}

export function inspectPhysicsQueryResult(result) {
  return schemaResult(PHYSICS_QUERY_RESULT_SCHEMA, resultErrors(result));
}

export function validatePhysicsQueryResult(result) {
  return assertSchema(inspectPhysicsQueryResult(result), "Physics query result");
}

export function normalizePhysicsQueryResult(result) {
  validatePhysicsQueryResult(result);
  return canonicalizePortableValue({
    schema: PHYSICS_QUERY_RESULT_SCHEMA,
    queryId: result.queryId.trim(),
    providerId: result.providerId?.trim() ?? null,
    tickId: result.tickId ?? null,
    status: result.status?.trim() ?? "complete",
    hits: result.hits ?? [],
    metadata: result.metadata ?? {}
  });
}

export function getPhysicsQuerySchemas() {
  return {
    request: {
      schema: PHYSICS_QUERY_SCHEMA,
      required: ["queryId", "type"],
      optional: QUERY_FIELDS.filter((field) => !["schema", "queryId", "type"].includes(field))
    },
    result: {
      schema: PHYSICS_QUERY_RESULT_SCHEMA,
      required: ["queryId"],
      optional: RESULT_FIELDS.filter((field) => !["schema", "queryId"].includes(field))
    },
    portable: true,
    mutation: "forbidden",
    unknownFields: "reject"
  };
}
