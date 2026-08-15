export function createMigrationPlan(config = {}) {
  return Object.freeze({
    id: config.id ?? "migration-plan",
    from: config.from ?? "0.0.0",
    to: config.to ?? "0.0.4",
    steps: Object.freeze([...(config.steps ?? [])])
  });
}

export function migrateState(state = {}, plan = createMigrationPlan()) {
  return (plan.steps ?? []).reduce((current, step) => {
    if (typeof step === "function") return step(current);
    if (typeof step?.apply === "function") return step.apply(current);
    return current;
  }, structuredClone(state));
}
