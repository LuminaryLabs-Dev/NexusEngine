const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function validateObjectShapeProvider(provider) {
  if (!provider || typeof provider !== "object") throw new TypeError("Object Shape provider must be an object.");
  if (typeof provider.id !== "string" || !provider.id.trim()) throw new TypeError("Object Shape provider requires a stable id.");
  if (typeof provider.derive !== "function") throw new TypeError("Object Shape provider requires derive(request, context).");
  return provider;
}

export function createShapeDerivationRequest(input = {}) {
  const request = {
    jobId: String(input.jobId),
    objectId: String(input.objectId),
    objectContentHash: String(input.objectContentHash),
    source: clone(input.source),
    profile: clone(input.profile),
    target: clone(input.target),
    options: clone(input.options ?? {})
  };
  structuredClone(request);
  return Object.freeze(request);
}

export function normalizeShapeProviderResult(result = {}) {
  if (!result || typeof result !== "object") throw new TypeError("Object Shape provider returned an invalid result.");
  const normalized = {
    geometry: result.geometry == null ? null : clone(result.geometry),
    asset: result.asset == null ? null : clone(result.asset),
    metrics: result.metrics == null ? null : clone(result.metrics),
    quality: clone(result.quality ?? {}),
    preservation: clone(result.preservation ?? {}),
    metadata: clone(result.metadata ?? {})
  };
  if (!normalized.geometry && !normalized.asset) throw new TypeError("Object Shape provider result requires geometry or an asset reference.");
  structuredClone(normalized);
  return Object.freeze(normalized);
}
