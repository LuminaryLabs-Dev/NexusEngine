export function validateAssetProvider(provider) {
  if (!provider || typeof provider !== "object") throw new TypeError("Core Assets provider must be an object.");
  if (typeof provider.id !== "string" || !provider.id.trim()) throw new TypeError("Core Assets provider requires a stable id.");
  if (typeof provider.load !== "function" && typeof provider.prepare !== "function") {
    throw new TypeError("Core Assets provider requires load(request, context) or prepare(request, context).");
  }
  return provider;
}
