import {
  BUILD_TARGET_PROVIDER_SCHEMA,
  clone,
  requirePlainObject,
  requireText,
  sortedUnique
} from "../../../../contracts.js";

export function defineBuildTargetProvider(input = {}) {
  requirePlainObject(input, "Build target provider");
  const id = requireText(input.id, "Build target id");
  if (typeof input.plan !== "function" || typeof input.execute !== "function") {
    throw new TypeError(`Build target ${id} requires plan and execute functions.`);
  }
  return Object.freeze({
    schema: BUILD_TARGET_PROVIDER_SCHEMA,
    id,
    label: requireText(input.label ?? id, `Build target ${id} label`),
    environments: Object.freeze(sortedUnique(input.environments ?? [])),
    capabilities: Object.freeze(sortedUnique(input.capabilities ?? [])),
    sourceRecords: Object.freeze(clone(input.sourceRecords ?? [])),
    plan: input.plan,
    execute: input.execute,
    validate: typeof input.validate === "function" ? input.validate : async () => ({ ok: true })
  });
}

export function createTargetRegistryService(config = {}) {
  const providers = new Map();

  function register(input) {
    const provider = defineBuildTargetProvider(input);
    const existing = providers.get(provider.id);
    if (existing && existing !== provider) throw new TypeError(`Build target collision: ${provider.id}.`);
    providers.set(provider.id, provider);
    return publicRecord(provider);
  }

  function publicRecord(provider) {
    if (!provider) return null;
    return Object.freeze({
      schema: provider.schema,
      id: provider.id,
      label: provider.label,
      environments: provider.environments,
      capabilities: provider.capabilities,
      sourceRecords: provider.sourceRecords
    });
  }

  for (const provider of config.providers ?? []) register(provider);

  return Object.freeze({
    register,
    get(id) { return providers.get(String(id)) ?? null; },
    list() { return Object.freeze([...providers.values()].sort((left, right) => left.id.localeCompare(right.id)).map(publicRecord)); },
    reset() {
      providers.clear();
      for (const provider of config.providers ?? []) register(provider);
      return this.list();
    }
  });
}

export default createTargetRegistryService;
