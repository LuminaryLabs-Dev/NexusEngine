export function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function asArray(value) {
  return value === undefined || value === null ? [] : Array.isArray(value) ? value.slice() : [value];
}

export function unique(values) {
  return Array.from(new Set(asArray(values).filter((value) => value !== undefined && value !== null).map(String)));
}

export function requireSceneId(value, label = "scene id") {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Core Scene Kit requires a non-empty ${label}.`);
  }
  return value.trim();
}

export function optionalSceneId(value, label = "scene id") {
  return value === undefined || value === null || value === "" ? null : requireSceneId(value, label);
}
