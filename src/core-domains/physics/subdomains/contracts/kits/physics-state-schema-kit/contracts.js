import {
  arrayRequired,
  assertSchema,
  canonicalizePortableValue,
  exactSchema,
  inspectPortableValue,
  nonnegativeInteger,
  objectRequired,
  optionalObject,
  rejectUnknownKeys,
  schemaResult
} from "../../portable-value.js";

export const PHYSICS_STATE_SCHEMA = "nexusengine.physics-state/1";

const FIELDS = Object.freeze([
  "schema",
  "revision",
  "stepId",
  "tickId",
  "world",
  "bodies",
  "colliders",
  "constraints",
  "contacts",
  "queries",
  "frame",
  "provider",
  "extensions"
]);

const ARRAY_FIELDS = Object.freeze(["bodies", "colliders", "constraints", "contacts", "queries"]);

function stateErrors(snapshot) {
  const errors = [...objectRequired(snapshot)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(snapshot, FIELDS));
  errors.push(...exactSchema(snapshot.schema, PHYSICS_STATE_SCHEMA));
  errors.push(...nonnegativeInteger(snapshot.revision, "$.revision", { optional: true }));
  errors.push(...nonnegativeInteger(snapshot.stepId, "$.stepId", { optional: true }));
  errors.push(...nonnegativeInteger(snapshot.tickId, "$.tickId", { optional: true }));
  for (const field of ARRAY_FIELDS) errors.push(...arrayRequired(snapshot[field], `$.${field}`, { optional: true }));
  errors.push(...optionalObject(snapshot.world, "$.world"));
  errors.push(...optionalObject(snapshot.frame, "$.frame"));
  errors.push(...optionalObject(snapshot.provider, "$.provider"));
  errors.push(...optionalObject(snapshot.extensions, "$.extensions"));
  errors.push(...inspectPortableValue(snapshot));
  return errors;
}

export function inspectPhysicsState(snapshot) {
  return schemaResult(PHYSICS_STATE_SCHEMA, stateErrors(snapshot));
}

export function validatePhysicsState(snapshot) {
  return assertSchema(inspectPhysicsState(snapshot), "Physics state");
}

export function normalizePhysicsState(snapshot) {
  validatePhysicsState(snapshot);
  return canonicalizePortableValue({
    schema: PHYSICS_STATE_SCHEMA,
    revision: snapshot.revision ?? 0,
    stepId: snapshot.stepId ?? 0,
    tickId: snapshot.tickId ?? 0,
    world: snapshot.world ?? {},
    bodies: snapshot.bodies ?? [],
    colliders: snapshot.colliders ?? [],
    constraints: snapshot.constraints ?? [],
    contacts: snapshot.contacts ?? [],
    queries: snapshot.queries ?? [],
    frame: snapshot.frame ?? null,
    provider: snapshot.provider ?? null,
    extensions: snapshot.extensions ?? {}
  });
}

export function getPhysicsStateSchema() {
  return {
    schema: PHYSICS_STATE_SCHEMA,
    required: [],
    optional: FIELDS.filter((field) => field !== "schema"),
    collections: [...ARRAY_FIELDS],
    portable: true,
    unknownFields: "reject"
  };
}
