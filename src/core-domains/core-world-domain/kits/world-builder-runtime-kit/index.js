import { WORLD_EFFECT_PHASES } from "../world-effect-provider-kit/index.js";
import { createWorldSnapshot } from "../../snapshot.js";

export function createWorldBuilderRuntime() {
  const worlds = new Map();

  function registerWorld(definition) {
    if (!definition?.id) throw new TypeError("World id is required.");
    if (!definition.partition) throw new TypeError("World partition is required.");
    if (!definition.surface) throw new TypeError("World surface is required.");
    const record = {
      ...definition,
      seed: definition.seed ?? definition.id,
      providers: [...(definition.providers ?? [])],
      providerById: new Map((definition.providers ?? []).map((provider) => [provider.id, provider])),
      activeCells: new Map(),
      focus: definition.focus ?? { position: { x: 0, y: 0, z: 0 } }
    };
    worlds.set(record.id, record);
    return record.id;
  }

  function releaseRecord(world, record) {
    for (const effect of [...record.effects].reverse()) {
      world.providerById.get(effect.providerId)?.release?.(effect, { world, cell: record.cell, surface: world.surface });
    }
    world.activeCells.delete(record.cell.id);
  }

  function buildRecord(world, cell) {
    const effects = [];
    const capabilities = new Map();
    for (const phase of WORLD_EFFECT_PHASES) {
      for (const provider of world.providers) {
        if (provider.phase !== phase) continue;
        const context = { world, cell, surface: world.surface, effects, capabilities };
        if (!provider.matches(cell, context)) continue;
        if (!provider.requires.every((capability) => capabilities.has(capability))) continue;
        const effect = provider.build(context);
        if (!effect) continue;
        const normalized = { providerId: provider.id, ...effect };
        effects.push(normalized);
        for (const capability of provider.provides) capabilities.set(capability, normalized);
      }
    }
    world.activeCells.set(cell.id, { cell, effects });
  }

  return {
    registerWorld,
    removeWorld(id) {
      const world = worlds.get(id);
      if (!world) return false;
      for (const record of [...world.activeCells.values()]) releaseRecord(world, record);
      return worlds.delete(id);
    },
    setFocus(id, focus) { const world = worlds.get(id); if (!world) throw new Error(`Unknown world: ${id}`); world.focus = focus; },
    updateWorld(id) {
      const world = worlds.get(id);
      if (!world) throw new Error(`Unknown world: ${id}`);
      const previousCells = [...world.activeCells.values()].map((entry) => entry.cell);
      const selection = world.partition.selectCells({ worldId: world.id, worldSeed: world.seed, focus: world.focus, previousCells, settings: world.settings ?? {} });
      for (const cell of selection.released) { const record = world.activeCells.get(cell.id); if (record) releaseRecord(world, record); }
      for (const cell of selection.required) buildRecord(world, cell);
      return createWorldSnapshot(world);
    },
    getWorld: (id) => worlds.get(id),
    getCell: (id, cellId) => worlds.get(id)?.activeCells.get(cellId)?.cell ?? null,
    getActiveCells: (id) => [...(worlds.get(id)?.activeCells.values() ?? [])].map((entry) => entry.cell),
    getEffects: (id, cellId) => [...(worlds.get(id)?.activeCells.get(cellId)?.effects ?? [])],
    snapshot: (id) => createWorldSnapshot(worlds.get(id)),
    reset() { for (const id of [...worlds.keys()]) this.removeWorld(id); }
  };
}
