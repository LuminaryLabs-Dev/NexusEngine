export function createModelRegistry(initialModels = []) {
  const models = new Map(initialModels.map((model) => [model.id, structuredClone(model)]));
  return {
    register(model = {}) {
      if (!model.id) throw new TypeError("Model descriptor requires id.");
      const existing = models.get(model.id);
      if (existing) {
        if (JSON.stringify(existing) !== JSON.stringify(model)) {
          throw new Error(`Model descriptor ${model.id} already exists with different content.`);
        }
        return structuredClone(existing);
      }
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
