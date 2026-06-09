function objectValues(input) {
  return input && typeof input === "object" ? Object.values(input) : [];
}

function normalizeSystemEntry(entry) {
  if (typeof entry === "function") {
    return { phase: "simulate", system: entry, name: entry.name || "anonymousSystem" };
  }

  if (!entry || typeof entry !== "object" || typeof entry.system !== "function") {
    throw new TypeError("Runtime kit systems must be functions or { phase, system } entries.");
  }

  return {
    phase: entry.phase ?? "simulate",
    system: entry.system,
    name: entry.name ?? entry.system.name ?? "anonymousSystem"
  };
}

export function defineRuntimeKit(config = {}) {
  const kit = {
    id: config.id ?? "runtime-kit",
    components: config.components ?? {},
    resources: config.resources ?? {},
    events: config.events ?? {},
    systems: (config.systems ?? []).map(normalizeSystemEntry),
    shaders: config.shaders ?? [],
    materials: config.materials ?? [],
    sequences: config.sequences ?? [],
    subscriptions: config.subscriptions ?? [],
    initWorld: config.initWorld,
    install: config.install,
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  };

  return Object.freeze(kit);
}

export function validateRuntimeKit(kit) {
  if (!kit || typeof kit !== "object") {
    throw new TypeError("validateRuntimeKit expects a runtime kit object.");
  }

  for (const definition of objectValues(kit.components)) {
    if (definition.kind !== "component") {
      throw new TypeError(`Runtime kit ${kit.id} has an invalid component definition.`);
    }
  }

  for (const definition of objectValues(kit.resources)) {
    if (definition.kind !== "resource") {
      throw new TypeError(`Runtime kit ${kit.id} has an invalid resource definition.`);
    }
  }

  for (const definition of objectValues(kit.events)) {
    if (definition.kind !== "event") {
      throw new TypeError(`Runtime kit ${kit.id} has an invalid event definition.`);
    }
  }

  for (const entry of kit.systems ?? []) {
    if (!entry.phase || typeof entry.system !== "function") {
      throw new TypeError(`Runtime kit ${kit.id} has an invalid system entry.`);
    }
  }

  return kit;
}

export function installRuntimeKit(engine, kit, options = {}) {
  validateRuntimeKit(kit);

  if (!engine || !engine.scheduler || !engine.world) {
    throw new TypeError("installRuntimeKit expects a NexusRealtime engine.");
  }

  engine.kit = kit;
  if (!Array.isArray(engine.kits)) {
    engine.kits = [];
  }
  if (!engine.kits.includes(kit)) {
    engine.kits.push(kit);
  }

  if (typeof kit.initWorld === "function") {
    kit.initWorld({ engine, world: engine.world, kit, options });
  }

  for (const shader of kit.shaders ?? []) {
    engine.shaderRegistry?.register(shader);
  }

  for (const material of kit.materials ?? []) {
    engine.materialRegistry?.register(material);
  }

  for (const entry of kit.systems ?? []) {
    engine.scheduler.addSystem(entry.phase, entry.system);
  }

  if (engine.sequenceRuntime && kit.sequences?.length) {
    if (engine.sequenceRuntime.appendGraph) {
      engine.sequenceRuntime.appendGraph(kit.sequences);
    } else {
      engine.sequenceRuntime.setGraph(kit.sequences);
    }
    for (const subscription of kit.subscriptions ?? []) {
      engine.sequenceRuntime.addSubscription(subscription);
    }
  }

  if (typeof kit.install === "function") {
    kit.install({ engine, world: engine.world, kit, options });
  }

  return kit;
}
