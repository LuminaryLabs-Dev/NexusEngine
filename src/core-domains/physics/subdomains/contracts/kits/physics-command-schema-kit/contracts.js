import {
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

export const PHYSICS_COMMAND_SCHEMA = "nexusengine.physics-command/1";

const FIELDS = Object.freeze([
  "schema",
  "operationId",
  "type",
  "tickId",
  "expectedRevision",
  "targetId",
  "payload",
  "metadata"
]);

function commandErrors(command) {
  const errors = [...objectRequired(command)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(command, FIELDS));
  errors.push(...exactSchema(command.schema, PHYSICS_COMMAND_SCHEMA));
  errors.push(...requireText(command.operationId, "$.operationId"));
  errors.push(...requireText(command.type, "$.type"));
  errors.push(...nonnegativeInteger(command.tickId, "$.tickId", { optional: true }));
  errors.push(...nonnegativeInteger(command.expectedRevision, "$.expectedRevision", { optional: true }));
  errors.push(...optionalText(command.targetId, "$.targetId"));
  errors.push(...optionalObject(command.payload, "$.payload"));
  errors.push(...optionalObject(command.metadata, "$.metadata"));
  errors.push(...inspectPortableValue(command));
  return errors;
}

export function inspectPhysicsCommand(command) {
  return schemaResult(PHYSICS_COMMAND_SCHEMA, commandErrors(command));
}

export function validatePhysicsCommand(command) {
  return assertSchema(inspectPhysicsCommand(command), "Physics command");
}

export function normalizePhysicsCommand(command) {
  validatePhysicsCommand(command);
  return canonicalizePortableValue({
    schema: PHYSICS_COMMAND_SCHEMA,
    operationId: command.operationId.trim(),
    type: command.type.trim(),
    tickId: command.tickId ?? null,
    expectedRevision: command.expectedRevision ?? null,
    targetId: command.targetId?.trim() ?? null,
    payload: command.payload ?? {},
    metadata: command.metadata ?? {}
  });
}

export function getPhysicsCommandSchema() {
  return {
    schema: PHYSICS_COMMAND_SCHEMA,
    required: ["operationId", "type"],
    optional: FIELDS.filter((field) => !["schema", "operationId", "type"].includes(field)),
    portable: true,
    exactOnceKey: "operationId",
    unknownFields: "reject"
  };
}
