import {
  assertSchema,
  canonicalizePortableValue,
  exactSchema,
  inspectPortableValue,
  nonnegativeInteger,
  normalizeTextArray,
  objectRequired,
  oneOf,
  optionalObject,
  optionalText,
  rejectUnknownKeys,
  requireText,
  schemaResult,
  stringArray
} from "../../portable-value.js";

export const RENDER_PASS_SCHEMA = "nexusengine.render-pass/1";

const PASS_KINDS = Object.freeze(["render", "compute", "copy", "resolve", "present"]);
const FIELDS = Object.freeze([
  "schema",
  "passId",
  "frameId",
  "sequence",
  "kind",
  "pipelineId",
  "attachmentIds",
  "readResourceIds",
  "writeResourceIds",
  "commandIds",
  "viewport",
  "scissor",
  "metadata"
]);

function passErrors(pass) {
  const errors = [...objectRequired(pass)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(pass, FIELDS));
  errors.push(...exactSchema(pass.schema, RENDER_PASS_SCHEMA));
  errors.push(...requireText(pass.passId, "$.passId"));
  errors.push(...requireText(pass.frameId, "$.frameId"));
  errors.push(...nonnegativeInteger(pass.sequence, "$.sequence"));
  errors.push(...oneOf(pass.kind, PASS_KINDS, "$.kind"));
  errors.push(...optionalText(pass.pipelineId, "$.pipelineId"));
  errors.push(...stringArray(pass.attachmentIds, "$.attachmentIds", { optional: true }));
  errors.push(...stringArray(pass.readResourceIds, "$.readResourceIds", { optional: true }));
  errors.push(...stringArray(pass.writeResourceIds, "$.writeResourceIds", { optional: true }));
  errors.push(...stringArray(pass.commandIds, "$.commandIds", { optional: true }));
  errors.push(...optionalObject(pass.viewport, "$.viewport"));
  errors.push(...optionalObject(pass.scissor, "$.scissor"));
  errors.push(...optionalObject(pass.metadata, "$.metadata"));
  errors.push(...inspectPortableValue(pass));
  return errors;
}

export function inspectRenderPass(pass) {
  return schemaResult(RENDER_PASS_SCHEMA, passErrors(pass));
}

export function validateRenderPass(pass) {
  return assertSchema(inspectRenderPass(pass), "Render pass");
}

export function normalizeRenderPass(pass) {
  validateRenderPass(pass);
  return canonicalizePortableValue({
    schema: RENDER_PASS_SCHEMA,
    passId: pass.passId.trim(),
    frameId: pass.frameId.trim(),
    sequence: pass.sequence,
    kind: pass.kind,
    pipelineId: pass.pipelineId?.trim() ?? null,
    attachmentIds: normalizeTextArray(pass.attachmentIds),
    readResourceIds: normalizeTextArray(pass.readResourceIds, { sort: true }),
    writeResourceIds: normalizeTextArray(pass.writeResourceIds, { sort: true }),
    commandIds: normalizeTextArray(pass.commandIds),
    viewport: pass.viewport ?? null,
    scissor: pass.scissor ?? null,
    metadata: pass.metadata ?? {}
  });
}

export function getRenderPassSchema() {
  return {
    schema: RENDER_PASS_SCHEMA,
    required: ["passId", "frameId", "sequence", "kind"],
    optional: FIELDS.filter((field) => !["schema", "passId", "frameId", "sequence", "kind"].includes(field)),
    kinds: [...PASS_KINDS],
    graphOwnership: "n:presentation:graphics",
    inputState: "resolved",
    portable: true,
    unknownFields: "reject"
  };
}
