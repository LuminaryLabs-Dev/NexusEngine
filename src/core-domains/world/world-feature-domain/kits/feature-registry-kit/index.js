import { WORLD_FEATURE_KIT_METHODS } from "../semantic-feature-kit/index.js";

export function createFeatureTypeDescriptor(type, handler = {}) {
  const id = String(type ?? handler.type ?? "").trim();
  if (!id) throw new TypeError("Feature type requires a stable id.");
  return Object.freeze({
    id,
    family: String(handler.family ?? "semantic"),
    version: String(handler.version ?? "0.1.0"),
    implemented: handler.implemented !== false,
    services: Object.freeze([...(handler.services ?? WORLD_FEATURE_KIT_METHODS)].map(String))
  });
}
