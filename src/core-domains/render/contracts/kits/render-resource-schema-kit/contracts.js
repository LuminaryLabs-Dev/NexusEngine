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

export const RENDER_RESOURCE_SCHEMA = "nexusengine.render-resource/1";

const LIFETIMES = Object.freeze(["persistent", "frame", "pass", "external"]);
const FIELDS = Object.freeze([
  "schema",
  "resourceId",
  "kind",
  "revision",
  "lifetime",
  "usage",
  "dependencies",
  "descriptor",
  "source",
  "integrity",
  "metadata"
]);

function resourceErrors(resource) {
  const errors = [...objectRequired(resource)];
  if (errors.length) return errors;
  errors.push(...rejectUnknownKeys(resource, FIELDS));
  errors.push(...exactSchema(resource.schema, RENDER_RESOURCE_SCHEMA));
  errors.push(...requireText(resource.resourceId, "$.resourceId"));
  errors.push(...requireText(resource.kind, "$.kind"));
  errors.push(...nonnegativeInteger(resource.revision, "$.revision", { optional: true }));
  errors.push(...oneOf(resource.lifetime, LIFETIMES, "$.lifetime", { optional: true }));
  errors.push(...stringArray(resource.usage, "$.usage", { optional: true }));
  errors.push(...stringArray(resource.dependencies, "$.dependencies", { optional: true }));
  errors.push(...optionalObject(resource.descriptor, "$.descriptor"));
  errors.push(...optionalObject(resource.source, "$.source"));
  errors.push(...optionalText(resource.integrity, "$.integrity"));
  errors.push(...optionalObject(resource.metadata, "$.metadata"));
  errors.push(...inspectPortableValue(resource));
  return errors;
}

export function inspectRenderResource(resource) {
  return schemaResult(RENDER_RESOURCE_SCHEMA, resourceErrors(resource));
}

export function validateRenderResource(resource) {
  return assertSchema(inspectRenderResource(resource), "Render resource");
}

export function normalizeRenderResource(resource) {
  validateRenderResource(resource);
  return canonicalizePortableValue({
    schema: RENDER_RESOURCE_SCHEMA,
    resourceId: resource.resourceId.trim(),
    kind: resource.kind.trim(),
    revision: resource.revision ?? 0,
    lifetime: resource.lifetime ?? "persistent",
    usage: normalizeTextArray(resource.usage, { sort: true }),
    dependencies: normalizeTextArray(resource.dependencies, { sort: true }),
    descriptor: resource.descriptor ?? {},
    source: resource.source ?? null,
    integrity: resource.integrity?.trim() ?? null,
    metadata: resource.metadata ?? {}
  });
}

export function getRenderResourceSchema() {
  return {
    schema: RENDER_RESOURCE_SCHEMA,
    required: ["resourceId", "kind"],
    optional: FIELDS.filter((field) => !["schema", "resourceId", "kind"].includes(field)),
    lifetimes: [...LIFETIMES],
    portable: true,
    backendHandlesAllowed: false,
    unknownFields: "reject"
  };
}
