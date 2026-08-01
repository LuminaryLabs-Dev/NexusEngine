export function createStateSelector(selector = {}) {
  const path = Array.isArray(selector.path)
    ? selector.path
    : String(selector.path ?? selector.id ?? "").split(".").filter(Boolean);
  return Object.freeze({
    id: selector.id ?? path.join(".") ?? "selector",
    resource: selector.resource ?? null,
    path: Object.freeze(path),
    read(source = {}) {
      return path.reduce((current, part) => current?.[part], source);
    }
  });
}

export function readStatePath(source = {}, path = "") {
  return String(path).split(".").filter(Boolean).reduce((current, part) => current?.[part], source);
}
