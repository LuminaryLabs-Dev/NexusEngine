export { assertSerializableState, cloneSerializableState, createSerializableState } from "../../foundation/serializable-state.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function pathText(path) {
  return path.length ? path.join(".") : "value";
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateRule(rule = {}, value, path, options) {
  if (value === undefined) return;
  const acceptedTypes = Array.isArray(rule.type) ? rule.type : rule.type == null ? [] : [rule.type];
  if (acceptedTypes.length) {
    const actual = valueType(value);
    const valid = acceptedTypes.includes(actual) || (actual === "integer" && acceptedTypes.includes("number"));
    if (!valid) throw new TypeError(`${pathText(path)} must be ${acceptedTypes.join(" or ")}; received ${actual}.`);
  }
  if (Object.prototype.hasOwnProperty.call(rule, "const") && !deepEqual(value, rule.const)) {
    throw new TypeError(`${pathText(path)} must equal the schema constant.`);
  }
  if (Array.isArray(rule.enum) && !rule.enum.some((entry) => deepEqual(entry, value))) {
    throw new TypeError(`${pathText(path)} must match one of the schema enum values.`);
  }
  if (typeof value === "number") {
    if (rule.minimum != null && value < Number(rule.minimum)) throw new RangeError(`${pathText(path)} must be >= ${rule.minimum}.`);
    if (rule.maximum != null && value > Number(rule.maximum)) throw new RangeError(`${pathText(path)} must be <= ${rule.maximum}.`);
  }
  if (typeof value === "string" || Array.isArray(value)) {
    if (rule.minLength != null && value.length < Number(rule.minLength)) throw new RangeError(`${pathText(path)} must contain at least ${rule.minLength} entries.`);
    if (rule.maxLength != null && value.length > Number(rule.maxLength)) throw new RangeError(`${pathText(path)} must contain at most ${rule.maxLength} entries.`);
  }
  if (Array.isArray(value) && rule.items) {
    value.forEach((entry, index) => validateRule(rule.items, entry, [...path, String(index)], options));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const properties = rule.properties ?? {};
    const required = rule.required ?? [];
    for (const field of required) {
      if (!Object.prototype.hasOwnProperty.call(value, field)) throw new TypeError(`Missing required data field: ${pathText([...path, field])}`);
    }
    for (const [field, fieldRule] of Object.entries(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, field)) validateRule(fieldRule, value[field], [...path, field], options);
    }
    if (rule.additionalProperties === false) {
      for (const field of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, field)) throw new TypeError(`Unexpected data field: ${pathText([...path, field])}`);
      }
    }
  }
  if (rule.validator != null) {
    const validator = options.validators?.[String(rule.validator)];
    if (typeof validator !== "function") throw new TypeError(`Unknown portable schema validator: ${rule.validator}.`);
    const result = validator(value, { path: [...path], rule: clone(rule) });
    if (result === false) throw new TypeError(`${pathText(path)} failed validator ${rule.validator}.`);
  }
}

export function createDataSchema(config = {}) {
  const id = String(config.id ?? "data-schema").trim();
  if (!id) throw new TypeError("Data schema requires a non-empty id.");
  return Object.freeze({
    id,
    version: String(config.version ?? "0.0.3"),
    fields: Object.freeze(clone(config.fields ?? {})),
    required: Object.freeze([...(config.required ?? [])].map(String)),
    additionalProperties: config.additionalProperties !== false,
    metadata: Object.freeze(clone(config.metadata ?? {}))
  });
}

export function validateDataSchema(schema = {}, value = {}, options = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Data schema values must be objects.");
  for (const field of schema.required ?? []) {
    if (!Object.prototype.hasOwnProperty.call(value, field)) throw new TypeError(`Missing required data field: ${field}`);
  }
  for (const [field, rule] of Object.entries(schema.fields ?? {})) {
    if (Object.prototype.hasOwnProperty.call(value, field)) validateRule(rule, value[field], [field], options);
  }
  if (schema.additionalProperties === false) {
    for (const field of Object.keys(value)) {
      if (!Object.prototype.hasOwnProperty.call(schema.fields ?? {}, field)) throw new TypeError(`Unexpected data field: ${field}`);
    }
  }
  return value;
}
