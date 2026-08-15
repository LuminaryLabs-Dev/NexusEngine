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

export const PHYSICS_EVENT_SCHEMA = "nexusengine.physics-event/1";

const FIELDS = Object.freeze([
  "schema",
  "eventId",
  "type",
  "sequence",
  "tickId",
  "frameId",
  "sourceId",
  "payload",
  "metadata"
]);

function eventErrors(event) {
  const errors = [...objectRequired(event)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(event, FIELDS));
  errors.push(...exactSchema(event.schema, PHYSICS_EVENT_SCHEMA));
  errors.push(...requireText(event.eventId, "$.eventId"));
  errors.push(...requireText(event.type, "$.type"));
  errors.push(...nonnegativeInteger(event.sequence, "$.sequence"));
  errors.push(...nonnegativeInteger(event.tickId, "$.tickId", { optional: true }));
  errors.push(...nonnegativeInteger(event.frameId, "$.frameId", { optional: true }));
  errors.push(...optionalText(event.sourceId, "$.sourceId"));
  errors.push(...optionalObject(event.payload, "$.payload"));
  errors.push(...optionalObject(event.metadata, "$.metadata"));
  errors.push(...inspectPortableValue(event));
  return errors;
}

export function inspectPhysicsEvent(event) {
  return schemaResult(PHYSICS_EVENT_SCHEMA, eventErrors(event));
}

export function validatePhysicsEvent(event) {
  return assertSchema(inspectPhysicsEvent(event), "Physics event");
}

export function normalizePhysicsEvent(event) {
  validatePhysicsEvent(event);
  return canonicalizePortableValue({
    schema: PHYSICS_EVENT_SCHEMA,
    eventId: event.eventId.trim(),
    type: event.type.trim(),
    sequence: event.sequence,
    tickId: event.tickId ?? null,
    frameId: event.frameId ?? null,
    sourceId: event.sourceId?.trim() ?? null,
    payload: event.payload ?? {},
    metadata: event.metadata ?? {}
  });
}

export function getPhysicsEventSchema() {
  return {
    schema: PHYSICS_EVENT_SCHEMA,
    required: ["eventId", "type", "sequence"],
    optional: FIELDS.filter((field) => !["schema", "eventId", "type", "sequence"].includes(field)),
    portable: true,
    orderingKey: "sequence",
    unknownFields: "reject"
  };
}
