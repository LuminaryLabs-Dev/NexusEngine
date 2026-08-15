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

export const RENDER_EVENT_SCHEMA = "nexusengine.render-event/1";

const FIELDS = Object.freeze([
  "schema",
  "eventId",
  "type",
  "sequence",
  "frameId",
  "providerId",
  "surfaceId",
  "resourceId",
  "passId",
  "payload",
  "metadata"
]);

function eventErrors(event) {
  const errors = [...objectRequired(event)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(event, FIELDS));
  errors.push(...exactSchema(event.schema, RENDER_EVENT_SCHEMA));
  errors.push(...requireText(event.eventId, "$.eventId"));
  errors.push(...requireText(event.type, "$.type"));
  errors.push(...nonnegativeInteger(event.sequence, "$.sequence"));
  errors.push(...optionalText(event.frameId, "$.frameId"));
  errors.push(...optionalText(event.providerId, "$.providerId"));
  errors.push(...optionalText(event.surfaceId, "$.surfaceId"));
  errors.push(...optionalText(event.resourceId, "$.resourceId"));
  errors.push(...optionalText(event.passId, "$.passId"));
  errors.push(...optionalObject(event.payload, "$.payload"));
  errors.push(...optionalObject(event.metadata, "$.metadata"));
  errors.push(...inspectPortableValue(event));
  return errors;
}

export function inspectRenderEvent(event) {
  return schemaResult(RENDER_EVENT_SCHEMA, eventErrors(event));
}

export function validateRenderEvent(event) {
  return assertSchema(inspectRenderEvent(event), "Render event");
}

export function normalizeRenderEvent(event) {
  validateRenderEvent(event);
  return canonicalizePortableValue({
    schema: RENDER_EVENT_SCHEMA,
    eventId: event.eventId.trim(),
    type: event.type.trim(),
    sequence: event.sequence,
    frameId: event.frameId?.trim() ?? null,
    providerId: event.providerId?.trim() ?? null,
    surfaceId: event.surfaceId?.trim() ?? null,
    resourceId: event.resourceId?.trim() ?? null,
    passId: event.passId?.trim() ?? null,
    payload: event.payload ?? {},
    metadata: event.metadata ?? {}
  });
}

export function getRenderEventSchema() {
  return {
    schema: RENDER_EVENT_SCHEMA,
    required: ["eventId", "type", "sequence"],
    optional: FIELDS.filter((field) => !["schema", "eventId", "type", "sequence"].includes(field)),
    orderingKey: "sequence",
    portable: true,
    unknownFields: "reject"
  };
}
