export function createInputBindings(bindings = {}) {
  return Object.freeze(Object.fromEntries(Object.entries(bindings).map(([device, map]) => [
    device,
    Object.freeze({ ...(map ?? {}) })
  ])));
}

export function resolveInputBinding(bindings = {}, device, action) {
  return bindings?.[device]?.[action] ?? null;
}
