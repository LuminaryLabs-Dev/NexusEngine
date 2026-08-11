import {
  canonicalizePortableValue,
  inspectPortableValue,
  optionalBoolean,
  optionalText,
  requireText,
  schemaResult
} from "../../portable-value.js";

export const RENDER_PROVIDER_CONTRACT_SCHEMA = "nexusengine.render-provider-contract/1";

export const RENDER_PROVIDER_REQUIRED_METHODS = Object.freeze([
  "initialize",
  "createResource",
  "updateResource",
  "releaseResource",
  "beginFrame",
  "executePass",
  "submitFrame",
  "reset",
  "dispose"
]);

export const RENDER_PROVIDER_OPTIONAL_METHODS = Object.freeze([
  "getSnapshot",
  "loadSnapshot",
  "recover",
  "resizeSurface",
  "capture",
  "waitIdle"
]);

function providerErrors(provider) {
  if (!provider || typeof provider !== "object" || Array.isArray(provider)) {
    return [{ path: "$", code: "object-required", message: "Render provider must be an object." }];
  }
  const errors = [...requireText(provider.id, "$.id")];
  errors.push(...optionalText(provider.version, "$.version"));
  errors.push(...optionalBoolean(provider.replayStable, "$.replayStable"));
  for (const method of RENDER_PROVIDER_REQUIRED_METHODS) {
    if (typeof provider[method] !== "function") {
      errors.push({ path: `$.${method}`, code: "method-required", message: `Provider must implement ${method}().` });
    }
  }
  for (const method of RENDER_PROVIDER_OPTIONAL_METHODS) {
    if (provider[method] !== undefined && typeof provider[method] !== "function") {
      errors.push({ path: `$.${method}`, code: "method-required", message: `Optional provider member ${method} must be a function when present.` });
    }
  }
  if (provider.capabilities !== undefined) errors.push(...inspectPortableValue(provider.capabilities, "$.capabilities"));
  return errors;
}

export function inspectRenderProvider(provider) {
  const errors = providerErrors(provider);
  const methods = provider && typeof provider === "object" ? provider : {};
  const capabilityErrors = methods.capabilities === undefined
    ? []
    : inspectPortableValue(methods.capabilities, "$.capabilities");
  const missingMethods = RENDER_PROVIDER_REQUIRED_METHODS.filter((name) => typeof methods[name] !== "function");
  const optionalMethods = RENDER_PROVIDER_OPTIONAL_METHODS.filter((name) => typeof methods[name] === "function");
  return Object.freeze({
    schema: RENDER_PROVIDER_CONTRACT_SCHEMA,
    id: typeof methods.id === "string" ? methods.id.trim() : "",
    version: typeof methods.version === "string" ? methods.version.trim() : null,
    replayStable: methods.replayStable === true,
    capabilities: methods.capabilities === undefined || capabilityErrors.length
      ? {}
      : canonicalizePortableValue(methods.capabilities, "$.capabilities"),
    requiredMethods: Object.freeze([...RENDER_PROVIDER_REQUIRED_METHODS]),
    implementedOptionalMethods: Object.freeze(optionalMethods),
    missingMethods: Object.freeze(missingMethods),
    valid: errors.length === 0,
    errors: Object.freeze(errors.map((entry) => Object.freeze({ ...entry })))
  });
}

export function validateRenderProvider(provider) {
  const inspection = inspectRenderProvider(provider);
  if (!inspection.valid) {
    const failure = new TypeError(`Invalid Render provider ${inspection.id || "<unknown>"}: ${inspection.errors.map((entry) => `${entry.path}:${entry.code}`).join(", ")}.`);
    failure.issues = inspection.errors;
    throw failure;
  }
  return inspection;
}

export function getRenderProviderContract() {
  return {
    schema: RENDER_PROVIDER_CONTRACT_SCHEMA,
    requiredMethods: [...RENDER_PROVIDER_REQUIRED_METHODS],
    optionalMethods: [...RENDER_PROVIDER_OPTIONAL_METHODS],
    providerLifecycle: ["initialize", "beginFrame", "submitFrame", "reset", "dispose"],
    normalizedInputs: ["resource", "frame", "pass", "shader"],
    normalizedOutputs: ["receipt", "event"],
    capabilitiesMustBePortable: true,
    backendHandlesMustRemainPrivate: true
  };
}

export function inspectRenderProviderContract(provider) {
  const inspection = inspectRenderProvider(provider);
  return schemaResult(RENDER_PROVIDER_CONTRACT_SCHEMA, inspection.errors);
}
