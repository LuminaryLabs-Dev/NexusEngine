import {
  assertSchema,
  canonicalizePortableValue,
  exactSchema,
  inspectPortableValue,
  nonnegativeInteger,
  normalizeTextArray,
  objectArray,
  objectRequired,
  oneOf,
  optionalObject,
  optionalText,
  rejectUnknownKeys,
  requireText,
  schemaResult,
  stringArray,
  validationIssue
} from "../../portable-value.js";

export const RENDER_SHADER_SCHEMA = "nexusengine.render-shader/1";

const STAGES = Object.freeze([
  "any-hit",
  "callable",
  "closest-hit",
  "vertex",
  "fragment",
  "compute",
  "geometry",
  "intersection",
  "miss",
  "ray-generation",
  "tessellation-control",
  "tessellation-evaluation",
  "mesh",
  "task"
]);

const FIELDS = Object.freeze([
  "schema",
  "shaderId",
  "revision",
  "language",
  "sourceId",
  "sourceIntegrity",
  "stages",
  "entryPoints",
  "bindings",
  "attributes",
  "outputs",
  "defines",
  "metadata"
]);

function entryPointErrors(entryPoints, stages) {
  const errors = [...objectRequired(entryPoints, "$.entryPoints")];
  if (errors.length) return errors;
  const selected = new Set(stages ?? []);
  for (const [stage, entryPoint] of Object.entries(entryPoints)) {
    errors.push(...oneOf(stage, STAGES, `$.entryPoints.${stage}`));
    errors.push(...requireText(entryPoint, `$.entryPoints.${stage}`));
    if (!selected.has(stage)) {
      errors.push(validationIssue(`$.entryPoints.${stage}`, "stage-not-declared", "Entry point stage must appear in stages."));
    }
  }
  for (const stage of selected) {
    if (!(stage in entryPoints)) {
      errors.push(validationIssue(`$.entryPoints.${stage}`, "entry-point-required", "Every declared stage requires an entry point."));
    }
  }
  return errors;
}

function shaderErrors(shader) {
  const errors = [...objectRequired(shader)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(shader, FIELDS));
  errors.push(...exactSchema(shader.schema, RENDER_SHADER_SCHEMA));
  errors.push(...requireText(shader.shaderId, "$.shaderId"));
  errors.push(...nonnegativeInteger(shader.revision, "$.revision", { optional: true }));
  errors.push(...requireText(shader.language, "$.language"));
  errors.push(...requireText(shader.sourceId, "$.sourceId"));
  errors.push(...optionalText(shader.sourceIntegrity, "$.sourceIntegrity"));
  errors.push(...stringArray(shader.stages, "$.stages", { minimum: 1 }));
  for (const [index, stage] of (Array.isArray(shader.stages) ? shader.stages : []).entries()) {
    errors.push(...oneOf(stage, STAGES, `$.stages[${index}]`));
  }
  errors.push(...entryPointErrors(shader.entryPoints, shader.stages));
  errors.push(...objectArray(shader.bindings, "$.bindings", { optional: true }));
  errors.push(...objectArray(shader.attributes, "$.attributes", { optional: true }));
  errors.push(...objectArray(shader.outputs, "$.outputs", { optional: true }));
  errors.push(...optionalObject(shader.defines, "$.defines"));
  errors.push(...optionalObject(shader.metadata, "$.metadata"));
  errors.push(...inspectPortableValue(shader));
  return errors;
}

export function inspectRenderShader(shader) {
  return schemaResult(RENDER_SHADER_SCHEMA, shaderErrors(shader));
}

export function validateRenderShader(shader) {
  return assertSchema(inspectRenderShader(shader), "Render shader");
}

export function normalizeRenderShader(shader) {
  validateRenderShader(shader);
  return canonicalizePortableValue({
    schema: RENDER_SHADER_SCHEMA,
    shaderId: shader.shaderId.trim(),
    revision: shader.revision ?? 0,
    language: shader.language.trim(),
    sourceId: shader.sourceId.trim(),
    sourceIntegrity: shader.sourceIntegrity?.trim() ?? null,
    stages: normalizeTextArray(shader.stages, { sort: true }),
    entryPoints: shader.entryPoints,
    bindings: shader.bindings ?? [],
    attributes: shader.attributes ?? [],
    outputs: shader.outputs ?? [],
    defines: shader.defines ?? {},
    metadata: shader.metadata ?? {}
  });
}

export function getRenderShaderSchema() {
  return {
    schema: RENDER_SHADER_SCHEMA,
    required: ["shaderId", "language", "sourceId", "stages", "entryPoints"],
    optional: FIELDS.filter((field) => !["schema", "shaderId", "language", "sourceId", "stages", "entryPoints"].includes(field)),
    stages: [...STAGES],
    sourceExecution: false,
    compilationOwnership: "provider",
    portable: true,
    unknownFields: "reject"
  };
}
