export function createFeatureTypeDescriptor(type, handler = {}) {
  const id = String(type ?? handler.type ?? "").trim();
  if (!id) throw new TypeError("Feature type requires a stable id.");
  return Object.freeze({
    id,
    version: String(handler.version ?? "0.1.0"),
    implemented: handler.implemented !== false,
    services: Object.freeze([...(handler.services ?? ["normalize", "compile", "sample"])].map(String))
  });
}
