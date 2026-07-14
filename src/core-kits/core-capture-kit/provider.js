export function validateCaptureProvider(provider) {
  if (!provider || typeof provider !== "object") throw new TypeError("Capture provider must be an object.");
  if (typeof provider.id !== "string" || !provider.id.trim()) throw new TypeError("Capture provider requires a stable id.");
  if (typeof provider.capture !== "function") throw new TypeError("Capture provider requires capture(request, context).");
  return provider;
}
