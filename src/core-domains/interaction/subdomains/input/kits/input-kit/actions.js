export function createInputActionMap(actions = []) {
  const entries = Array.isArray(actions) ? actions : Object.keys(actions ?? {});
  return Object.freeze(Object.fromEntries(entries.map((entry) => {
    const action = typeof entry === "string" ? { id: entry } : entry;
    return [action.id, Object.freeze({
      id: action.id,
      label: action.label ?? action.id,
      kind: action.kind ?? "button",
      metadata: Object.freeze({ ...(action.metadata ?? {}) })
    })];
  })));
}

export function createInputActionEvent(action, payload = {}) {
  return Object.freeze({ action, payload: structuredClone(payload) });
}
