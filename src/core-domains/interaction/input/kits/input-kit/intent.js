function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function normalizeInputIntent(intent = {}) {
  const actions = { ...(intent.actions ?? {}) };
  for (const key of ["primary", "secondary", "boost", "restart", "confirm"] ) {
    if (intent[key] !== undefined) actions[key] = intent[key] === true;
  }
  return Object.freeze({
    x: Math.max(-1, Math.min(1, number(intent.x, 0))),
    y: Math.max(-1, Math.min(1, number(intent.y, 0))),
    actions: Object.freeze(actions),
    metadata: Object.freeze({ ...(intent.metadata ?? {}) })
  });
}

export function getActiveInputActions(intent = {}) {
  return Object.entries(intent.actions ?? {})
    .filter(([, active]) => active === true)
    .map(([action]) => action);
}
