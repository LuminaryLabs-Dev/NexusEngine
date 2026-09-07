import { sha256Integrity } from "nexusengine/foundation";

export function authoringError(code, message, details = {}) {
  return Object.assign(new Error(message), { code, details });
}
export function requireText(value, label) {
  if (typeof value !== "string" || !value.trim() || value !== value.trim())
    throw authoringError(
      "AUTHORING_INVALID_INPUT",
      `${label} must be a nonempty, trimmed string.`,
    );
  return value;
}
export function requireNumber(
  value,
  label,
  minimum = -Infinity,
  maximum = Infinity,
) {
  if (!Number.isFinite(value) || value < minimum || value > maximum)
    throw authoringError(
      "AUTHORING_INVALID_INPUT",
      `${label} must be finite and within [${minimum}, ${maximum}].`,
    );
  return Object.is(value, -0) ? 0 : value;
}
export function requireInteger(
  value,
  label,
  minimum = 0,
  maximum = Number.MAX_SAFE_INTEGER,
) {
  requireNumber(value, label, minimum, maximum);
  if (!Number.isSafeInteger(value))
    throw authoringError(
      "AUTHORING_INVALID_INPUT",
      `${label} must be a safe integer.`,
    );
  return value;
}
export function requireFields(value, fields, label) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw authoringError(
      "AUTHORING_INVALID_INPUT",
      `${label} must be an object.`,
    );
  const extra = Object.keys(value).filter((key) => !fields.includes(key));
  if (extra.length)
    throw authoringError(
      "AUTHORING_INVALID_INPUT",
      `${label} contains unsupported fields: ${extra.join(", ")}.`,
    );
  return value;
}
const sharedValues = new WeakSet();
export const sharedCanonical = (value) => canonical(value, new WeakSet(), true);
export function canonical(value, active = new WeakSet(), share = false) {
  if (share && value && typeof value === "object" && sharedValues.has(value))
    return value;
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return value;
  if (typeof value === "number") return requireNumber(value, "value");
  if (!value || typeof value !== "object" || active.has(value))
    throw authoringError(
      "AUTHORING_INVALID_INPUT",
      "Values must be acyclic portable data.",
    );
  if (
    !Array.isArray(value) &&
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  )
    throw authoringError(
      "AUTHORING_INVALID_INPUT",
      "Values must contain plain objects.",
    );
  if (Object.getOwnPropertySymbols(value).length)
    throw authoringError(
      "AUTHORING_INVALID_INPUT",
      "Symbol properties are unsupported.",
    );
  active.add(value);
  let result;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++)
      if (!Object.hasOwn(value, i))
        throw authoringError(
          "AUTHORING_INVALID_INPUT",
          "Sparse arrays are unsupported.",
        );
    if (Object.keys(value).length !== value.length)
      throw authoringError(
        "AUTHORING_INVALID_INPUT",
        "Array properties are unsupported.",
      );
    result = Array.from({ length: value.length }, (_, index) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!Object.hasOwn(descriptor, "value"))
        throw authoringError(
          "AUTHORING_INVALID_INPUT",
          "Accessors are unsupported.",
        );
      return canonical(descriptor.value, active, share);
    });
  } else {
    result = Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => {
          const descriptor = Object.getOwnPropertyDescriptor(value, key);
          if (!Object.hasOwn(descriptor, "value"))
            throw authoringError(
              "AUTHORING_INVALID_INPUT",
              "Accessors are unsupported.",
            );
          return [key, canonical(descriptor.value, active, share)];
        }),
    );
  }
  active.delete(value);
  return result;
}
export function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value))
    return value;
  const keys = Object.keys(value),
    array = Array.isArray(value),
    portablePrimitive = (v) =>
      v === null ||
      typeof v === "string" ||
      typeof v === "boolean" ||
      (typeof v === "number" && Number.isFinite(v) && !Object.is(v, -0));
  let portable =
    Object.getOwnPropertySymbols(value).length === 0 &&
    (array
      ? keys.length === value.length &&
        keys.every((key, i) => key === String(i))
      : [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
        keys.every((key, i) => i === 0 || keys[i - 1] <= key));
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!Object.hasOwn(descriptor, "value")) {
      portable = false;
      continue;
    }
    const child = descriptor.value;
    freeze(child);
    if (
      !(
        portablePrimitive(child) ||
        (child && typeof child === "object" && sharedValues.has(child))
      )
    )
      portable = false;
  }
  Object.freeze(value);
  if (portable) sharedValues.add(value);
  return value;
}
export const hash = (value) =>
  sha256Integrity(JSON.stringify(sharedCanonical(value)));
export const owns = (value, key) => Object.hasOwn(value, key);
export const rawMutation = () => {
  throw authoringError(
    "AUTHORING_RAW_MUTATION",
    "Use typed Authoring commands.",
  );
};
export function vector(value, size = 3, label = "vector") {
  if (!Array.isArray(value) || value.length !== size)
    throw authoringError(
      "AUTHORING_INVALID_INPUT",
      `${label} needs ${size} components.`,
    );
  return Array.from(value, (entry, index) =>
    requireNumber(entry, `${label}[${index}]`),
  );
}
