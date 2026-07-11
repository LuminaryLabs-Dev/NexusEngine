import { cloneWorldState } from "./state.js";

export function createWorldSnapshot(record) {
  return cloneWorldState({
    id: record.id,
    seed: record.seed,
    focus: record.focus,
    partition: record.partition?.snapshot?.() ?? { id: record.partition?.id, kind: record.partition?.kind },
    surface: { id: record.surface?.id, kind: record.surface?.kind },
    activeCells: Array.from(record.activeCells?.values?.() ?? []).map((entry) => ({ cell: entry.cell, effects: entry.effects })),
    providers: record.providers?.map((provider) => ({ id: provider.id, phase: provider.phase, provides: provider.provides, requires: provider.requires })) ?? []
  });
}
