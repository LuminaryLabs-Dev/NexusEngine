export function createModelRegistry(initialModels = []) {
  const models = new Map(initialModels.map((model) => [model.id, structuredClone(model)]));
  return {
    register(model = {}) {
      if (!model.id) throw new TypeError("Model descriptor requires id.");
      models.set(model.id, structuredClone(model));
      return structuredClone(model);
    },
    get(id) {
      return structuredClone(models.get(id));
    },
    list() {
      return Array.from(models.values()).map((model) => structuredClone(model));
    },
    snapshot() {
      return { models: this.list() };
    }
  };
}
