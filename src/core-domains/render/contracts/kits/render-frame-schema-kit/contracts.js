import {
  assertSchema,
  canonicalizePortableValue,
  exactSchema,
  inspectPortableValue,
  nonnegativeFinite,
  nonnegativeInteger,
  normalizeTextArray,
  objectRequired,
  optionalObject,
  optionalText,
  rejectUnknownKeys,
  requireText,
  schemaResult,
  stringArray
} from "../../portable-value.js";

export const RENDER_FRAME_SCHEMA = "nexusengine.render-frame/1";

const FIELDS = Object.freeze([
  "schema",
  "frameId",
  "sequence",
  "surfaceId",
  "presentationTimeMs",
  "deltaSeconds",
  "viewIds",
  "passIds",
  "resourceIds",
  "metadata"
]);

function frameErrors(frame) {
  const errors = [...objectRequired(frame)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(frame, FIELDS));
  errors.push(...exactSchema(frame.schema, RENDER_FRAME_SCHEMA));
  errors.push(...requireText(frame.frameId, "$.frameId"));
  errors.push(...nonnegativeInteger(frame.sequence, "$.sequence"));
  errors.push(...optionalText(frame.surfaceId, "$.surfaceId"));
  errors.push(...nonnegativeFinite(frame.presentationTimeMs, "$.presentationTimeMs", { optional: true }));
  errors.push(...nonnegativeFinite(frame.deltaSeconds, "$.deltaSeconds", { optional: true }));
  errors.push(...stringArray(frame.viewIds, "$.viewIds", { optional: true }));
  errors.push(...stringArray(frame.passIds, "$.passIds", { optional: true }));
  errors.push(...stringArray(frame.resourceIds, "$.resourceIds", { optional: true }));
  errors.push(...optionalObject(frame.metadata, "$.metadata"));
  errors.push(...inspectPortableValue(frame));
  return errors;
}

export function inspectRenderFrame(frame) {
  return schemaResult(RENDER_FRAME_SCHEMA, frameErrors(frame));
}

export function validateRenderFrame(frame) {
  return assertSchema(inspectRenderFrame(frame), "Render frame");
}

export function normalizeRenderFrame(frame) {
  validateRenderFrame(frame);
  return canonicalizePortableValue({
    schema: RENDER_FRAME_SCHEMA,
    frameId: frame.frameId.trim(),
    sequence: frame.sequence,
    surfaceId: frame.surfaceId?.trim() ?? null,
    presentationTimeMs: frame.presentationTimeMs ?? null,
    deltaSeconds: frame.deltaSeconds ?? null,
    viewIds: normalizeTextArray(frame.viewIds),
    passIds: normalizeTextArray(frame.passIds),
    resourceIds: normalizeTextArray(frame.resourceIds, { sort: true }),
    metadata: frame.metadata ?? {}
  });
}

export function getRenderFrameSchema() {
  return {
    schema: RENDER_FRAME_SCHEMA,
    required: ["frameId", "sequence"],
    optional: FIELDS.filter((field) => !["schema", "frameId", "sequence"].includes(field)),
    orderedCollections: ["viewIds", "passIds"],
    portable: true,
    unknownFields: "reject"
  };
}
