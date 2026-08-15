export function validationIssue(path, code, message) {
  return Object.freeze({ path, code, message });
}

function visit(value, path, active, errors) {
  if (value === null || typeof value === "boolean" || typeof value === "string") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) errors.push(validationIssue(path, "non-finite-number", "Value must be finite."));
    return;
  }
  if (typeof value === "undefined") {
    errors.push(validationIssue(path, "undefined", "Value must be JSON-portable."));
    return;
  }
  if (["bigint", "function", "symbol"].includes(typeof value)) {
    errors.push(validationIssue(path, typeof value, `Value cannot contain ${typeof value}.`));
    return;
  }
  if (active.has(value)) {
    errors.push(validationIssue(path, "cycle", "Value cannot contain cycles."));
    return;
  }
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    errors.push(validationIssue(path, "non-plain-object", "Value must contain only arrays and plain objects."));
    return;
  }
  active.add(value);
  if (Array.isArray(value)) {
    value.forEach((entry, index) => visit(entry, `${path}[${index}]`, active, errors));
  } else {
    for (const key of Object.keys(value).sort()) visit(value[key], `${path}.${key}`, active, errors);
  }
  active.delete(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

export function inspectPortableValue(value, path = "$") {
  const errors = [];
  visit(value, path, new WeakSet(), errors);
  return errors;
}

export function canonicalizePortableValue(value, path = "$") {
  const errors = inspectPortableValue(value, path);
  if (errors.length) {
    const failure = new TypeError(`Invalid portable value: ${errors.map((entry) => `${entry.path}:${entry.code}`).join(", ")}.`);
    failure.issues = errors;
    throw failure;
  }
  return canonicalize(value);
}

export function objectRequired(value, path = "$") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [validationIssue(path, "object-required", "Value must be an object.")];
  }
  return [];
}

export function rejectUnknownKeys(value, allowed, path = "$") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const known = new Set(allowed);
  return Object.keys(value)
    .filter((key) => !known.has(key))
    .sort()
    .map((key) => validationIssue(`${path}.${key}`, "unknown-field", "Field is not part of this schema revision."));
}

export function requireText(value, path) {
  return typeof value === "string" && value.trim()
    ? []
    : [validationIssue(path, "non-empty-string-required", "Value must be a non-empty string.")];
}

export function optionalText(value, path) {
  return value === undefined || value === null ? [] : requireText(value, path);
}

export function nonnegativeInteger(value, path, { optional = false } = {}) {
  if (optional && value === undefined) return [];
  return Number.isInteger(value) && value >= 0
    ? []
    : [validationIssue(path, "nonnegative-integer-required", "Value must be a nonnegative integer.")];
}

export function arrayRequired(value, path, { optional = false } = {}) {
  if (optional && value === undefined) return [];
  return Array.isArray(value)
    ? []
    : [validationIssue(path, "array-required", "Value must be an array.")];
}

export function optionalObject(value, path) {
  return value === undefined || value === null ? [] : objectRequired(value, path);
}

export function exactSchema(value, schema, path = "$.schema", { optional = true } = {}) {
  if (optional && value === undefined) return [];
  return value === schema
    ? []
    : [validationIssue(path, "unsupported-schema", `Value must equal ${schema}.`)];
}

export function schemaResult(schema, errors) {
  return Object.freeze({
    schema,
    valid: errors.length === 0,
    errors: Object.freeze(errors.map((entry) => Object.freeze({ ...entry })))
  });
}

export function assertSchema(result, label) {
  if (result.valid) return result;
  const failure = new TypeError(`Invalid ${label}: ${result.errors.map((entry) => `${entry.path}:${entry.code}`).join(", ")}.`);
  failure.issues = result.errors;
  throw failure;
}
