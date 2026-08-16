const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function portableClone(value, label = "compute value") {
  try {
    return clone(value);
  } catch (error) {
    throw new TypeError(`${label} must be structured-clone portable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function portableRecord(value, label = "compute record") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  const result = portableClone(value, label);
  return Object.freeze(result);
}

export function nonEmptyText(value, label) {
  const result = String(value ?? "").trim();
  if (!result) throw new TypeError(`${label} requires a non-empty value.`);
  return result;
}

export function nonNegativeInteger(value, fallback, label) {
  const result = Number(value ?? fallback);
  if (!Number.isInteger(result) || result < 0) throw new TypeError(`${label} must be a non-negative integer.`);
  return result;
}

export function positiveInteger(value, fallback, label) {
  const result = Number(value ?? fallback);
  if (!Number.isInteger(result) || result < 1) throw new TypeError(`${label} must be a positive integer.`);
  return result;
}

export function stringSet(value = [], label = "compute values") {
  const source = value == null ? [] : Array.isArray(value) ? value : [value];
  return Object.freeze(Array.from(new Set(source.map((entry) => nonEmptyText(entry, label)))).sort());
}
