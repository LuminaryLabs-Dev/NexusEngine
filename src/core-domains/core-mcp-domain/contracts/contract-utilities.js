export const MCP_NAME_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

export const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

export function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

export function jsonClone(value, label = "value") {
  try {
    return JSON.parse(JSON.stringify(value, (_key, entry) => {
      if (typeof entry === "bigint") return entry.toString();
      if (typeof entry === "function" || typeof entry === "symbol") return undefined;
      return entry;
    }));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-serializable: ${error.message}`);
  }
}

export function stableName(value, label) {
  const name = String(value ?? "").trim();
  if (!MCP_NAME_PATTERN.test(name)) throw new TypeError(`${label} must match ${MCP_NAME_PATTERN}.`);
  return name;
}

export function stableUri(value, label, options = {}) {
  const uri = String(value ?? "").trim();
  if (!uri) throw new TypeError(`${label} requires a URI.`);
  const parsed = options.template === true ? uri.replace(/\{[A-Za-z0-9._-]+\}/g, "value") : uri;
  try {
    new URL(parsed);
  } catch {
    throw new TypeError(`${label} must be an absolute URI.`);
  }
  return uri;
}

export function normalizeSchema(input, label, options = {}) {
  const schema = input == null
    ? { type: options.defaultType ?? "object", properties: {}, additionalProperties: false }
    : jsonClone(input, label);
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    throw new TypeError(`${label} must be a JSON Schema object.`);
  }
  if (schema.$ref != null) throw new TypeError(`${label} cannot use $ref; MCP schemas must be self-contained.`);
  if (options.objectRoot !== false && schema.type !== "object") {
    throw new TypeError(`${label} must describe an object at its root.`);
  }
  return schema;
}

function valueTypeMatches(value, expected) {
  if (expected === "null") return value === null;
  if (expected === "array") return Array.isArray(value);
  if (expected === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (expected === "integer") return Number.isInteger(value);
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === expected;
}

export function validateSchemaValue(value, schema, path = "$") {
  if (schema === true) return [];
  if (schema === false) return [`${path} is rejected by schema.`];
  if (!schema || typeof schema !== "object") return [];
  const errors = [];
  if (Array.isArray(schema.allOf)) {
    for (const branch of schema.allOf) errors.push(...validateSchemaValue(value, branch, path));
  }
  if (Array.isArray(schema.anyOf) && !schema.anyOf.some((branch) => validateSchemaValue(value, branch, path).length === 0)) {
    errors.push(`${path} does not match any allowed schema.`);
  }
  if (Array.isArray(schema.oneOf)) {
    const matches = schema.oneOf.filter((branch) => validateSchemaValue(value, branch, path).length === 0).length;
    if (matches !== 1) errors.push(`${path} must match exactly one allowed schema.`);
  }
  if (Object.prototype.hasOwnProperty.call(schema, "const") && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push(`${path} must equal the declared constant.`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((entry) => JSON.stringify(entry) === JSON.stringify(value))) {
    errors.push(`${path} must be one of the declared enum values.`);
  }
  const types = asList(schema.type).filter(Boolean);
  if (types.length && !types.some((type) => valueTypeMatches(value, type))) {
    errors.push(`${path} must be ${types.join(" or ")}.`);
    return errors;
  }
  if (typeof value === "string") {
    if (Number.isInteger(schema.minLength) && value.length < schema.minLength) errors.push(`${path} is shorter than minLength.`);
    if (Number.isInteger(schema.maxLength) && value.length > schema.maxLength) errors.push(`${path} is longer than maxLength.`);
    if (schema.pattern != null) {
      let pattern;
      try {
        pattern = new RegExp(String(schema.pattern));
      } catch {
        errors.push(`${path} has an invalid schema pattern.`);
      }
      if (pattern && !pattern.test(value)) errors.push(`${path} does not match the required pattern.`);
    }
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (Number.isFinite(schema.minimum) && value < schema.minimum) errors.push(`${path} is below minimum.`);
    if (Number.isFinite(schema.maximum) && value > schema.maximum) errors.push(`${path} is above maximum.`);
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((entry, index) => errors.push(...validateSchemaValue(entry, schema.items, `${path}[${index}]`)));
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const properties = schema.properties && typeof schema.properties === "object" ? schema.properties : {};
    for (const key of asList(schema.required)) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(`${path}.${key} is required.`);
    }
    for (const [key, entry] of Object.entries(value)) {
      if (properties[key]) errors.push(...validateSchemaValue(entry, properties[key], `${path}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${path}.${key} is not allowed.`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        errors.push(...validateSchemaValue(entry, schema.additionalProperties, `${path}.${key}`));
      }
    }
  }
  return errors;
}
