export function validateAssetCacheProvider(provider) {
  if (!provider || typeof provider !== "object") throw new TypeError("Core Assets cache provider must be an object.");
  for (const method of ["get", "put", "delete"]) {
    if (typeof provider[method] !== "function") throw new TypeError(`Core Assets cache provider requires ${method}().`);
  }
  return provider;
}
