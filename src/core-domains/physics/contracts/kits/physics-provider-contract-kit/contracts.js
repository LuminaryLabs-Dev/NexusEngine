import {
  canonicalizePortableValue,
  inspectPortableValue,
  optionalText,
  requireText,
  schemaResult,
  validationIssue
} from "../../portable-value.js";

export const PHYSICS_PROVIDER_CONTRACT_SCHEMA = "nexusengine.physics-provider-contract/1";

export const PHYSICS_PROVIDER_REQUIRED_METHODS = Object.freeze([
  "initialize",
  "syncBodies",
  "syncColliders",
  "submitMotionRequests",
  "step",
  "getFrame",
  "reset",
  "dispose"
]);

export const PHYSICS_PROVIDER_OPTIONAL_METHODS = Object.freeze([
  "getSnapshot",
  "loadSnapshot",
  "query",
  "submitJointMotorRequests",
  "syncArticulations",
  "syncConstraints"
]);

function providerErrors(provider) {
  if (!provider || typeof provider !== "object" || Array.isArray(provider)) {
    return [{ path: "$", code: "object-required", message: "Physics provider must be an object." }];
  }
  const errors = [...requireText(provider.id, "$.id")];
  errors.push(...optionalText(provider.version, "$.version"));
  if (provider.deterministic !== undefined && typeof provider.deterministic !== "boolean") {
    errors.push(validationIssue("$.deterministic", "boolean-required", "Provider deterministic must be boolean."));
  }
  for (const method of PHYSICS_PROVIDER_REQUIRED_METHODS) {
    if (typeof provider[method] !== "function") {
      errors.push({ path: `$.${method}`, code: "method-required", message: `Provider must implement ${method}().` });
    }
  }
  for (const method of PHYSICS_PROVIDER_OPTIONAL_METHODS) {
    if (provider[method] !== undefined && typeof provider[method] !== "function") {
      errors.push({ path: `$.${method}`, code: "method-required", message: `Optional provider member ${method} must be a function when present.` });
    }
  }
  if (provider.capabilities !== undefined) errors.push(...inspectPortableValue(provider.capabilities, "$.capabilities"));
  return errors;
}

export function inspectPhysicsProvider(provider) {
  const errors = providerErrors(provider);
  const methods = provider && typeof provider === "object" ? provider : {};
  const capabilityErrors = methods.capabilities === undefined
    ? []
    : inspectPortableValue(methods.capabilities, "$.capabilities");
  const missingMethods = PHYSICS_PROVIDER_REQUIRED_METHODS.filter((name) => typeof methods[name] !== "function");
  const optionalMethods = PHYSICS_PROVIDER_OPTIONAL_METHODS.filter((name) => typeof methods[name] === "function");
  return Object.freeze({
    schema: PHYSICS_PROVIDER_CONTRACT_SCHEMA,
    id: typeof methods.id === "string" ? methods.id.trim() : "",
    version: typeof methods.version === "string" ? methods.version.trim() : null,
    deterministic: methods.deterministic === true,
    capabilities: methods.capabilities === undefined || capabilityErrors.length
      ? {}
      : canonicalizePortableValue(methods.capabilities, "$.capabilities"),
    requiredMethods: Object.freeze([...PHYSICS_PROVIDER_REQUIRED_METHODS]),
    implementedOptionalMethods: Object.freeze(optionalMethods),
    missingMethods: Object.freeze(missingMethods),
    valid: errors.length === 0,
    errors: Object.freeze(errors.map((entry) => Object.freeze({ ...entry })))
  });
}

export function validatePhysicsProvider(provider) {
  const inspection = inspectPhysicsProvider(provider);
  if (!inspection.valid) {
    const failure = new TypeError(`Invalid Physics provider ${inspection.id || "<unknown>"}: ${inspection.errors.map((entry) => `${entry.path}:${entry.code}`).join(", ")}.`);
    failure.issues = inspection.errors;
    throw failure;
  }
  return inspection;
}

export function getPhysicsProviderContract() {
  return {
    schema: PHYSICS_PROVIDER_CONTRACT_SCHEMA,
    requiredMethods: [...PHYSICS_PROVIDER_REQUIRED_METHODS],
    optionalMethods: [...PHYSICS_PROVIDER_OPTIONAL_METHODS],
    providerLifecycle: ["initialize", "step", "reset", "dispose"],
    normalizedOutputs: ["frame", "contacts", "queries"],
    capabilitiesMustBePortable: true
  };
}

export function inspectPhysicsProviderContract(provider) {
  const inspection = inspectPhysicsProvider(provider);
  return schemaResult(PHYSICS_PROVIDER_CONTRACT_SCHEMA, inspection.errors);
}
