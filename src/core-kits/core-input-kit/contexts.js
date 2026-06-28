export function createInputContext(config = {}) {
  return Object.freeze({
    id: config.id ?? "default",
    priority: Number(config.priority ?? 0),
    enabled: config.enabled !== false,
    actions: Object.freeze([...(config.actions ?? [])]),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}

export function selectActiveInputContext(contexts = []) {
  return [...contexts]
    .filter((context) => context.enabled !== false)
    .sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0))[0] ?? null;
}
