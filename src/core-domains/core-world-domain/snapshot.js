import { clonePortableValue, inspectPortableValue, portableError } from "./portable.js";

function sortedObjectValues(object = {}) {
  return Object.values(object).sort((a, b) => String(a?.cell?.id ?? a?.id ?? "").localeCompare(String(b?.cell?.id ?? b?.id ?? "")));
}

export function createWorldSnapshot(record, options = {}) {
  if (!record) return null;
  const activeCells = sortedObjectValues(record.activeCells).map((entry) => ({
    cell: clonePortableValue(entry.cell, "snapshot-cell"),
    state: entry.state,
    descriptorVersion: entry.descriptorVersion,
    providerStatus: clonePortableValue(entry.providerStatus ?? {}, "snapshot-provider-status"),
    effects: [...(entry.effects ?? [])]
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
      .map((effect) => clonePortableValue(effect, "snapshot-effect")),
    lastTransitionSequence: entry.lastTransitionSequence ?? 0
  }));

  return clonePortableValue({
    id: record.id,
    seed: record.seed,
    focus: record.focus,
    partition: record.partition,
    surface: record.surface,
    activeCells,
    providers: record.providers ?? [],
    providerSnapshots: options.providerSnapshots ?? {},
    providerSnapshotDiagnostics: options.providerSnapshotDiagnostics ?? [],
    diagnostics: record.diagnostics ?? [],
    sequence: record.sequence ?? 0
  }, "world-snapshot");
}

export function collectProviderSnapshots(runtimeWorld, record) {
  const providerSnapshots = {};
  const providerSnapshotDiagnostics = [];
  for (const provider of runtimeWorld?.providers ?? []) {
    try {
      const snapshot = provider.snapshot({ world: runtimeWorld, worldState: record });
      if (snapshot == null) continue;
      const inspection = inspectPortableValue(snapshot, { path: `providerSnapshots.${provider.id}` });
      if (!inspection.portable) {
        providerSnapshotDiagnostics.push({
          providerId: provider.id,
          code: "provider-snapshot-not-portable",
          issues: inspection.issues
        });
        continue;
      }
      providerSnapshots[provider.id] = clonePortableValue(snapshot, `providerSnapshots.${provider.id}`);
    } catch (error) {
      providerSnapshotDiagnostics.push({ providerId: provider.id, ...portableError(error, "provider-snapshot-failed") });
    }
  }
  return { providerSnapshots, providerSnapshotDiagnostics };
}

export function createCoreWorldSnapshot(state, runtimeWorlds = new Map()) {
  const worlds = {};
  for (const [worldId, record] of Object.entries(state?.worlds ?? {})) {
    const runtimeWorld = runtimeWorlds.get(worldId);
    const providerData = collectProviderSnapshots(runtimeWorld, record);
    worlds[worldId] = createWorldSnapshot(record, providerData);
  }
  const coordinationState = clonePortableValue({
    worlds: state?.worlds ?? {},
    sequence: state?.sequence ?? 0,
    diagnostics: state?.diagnostics ?? [],
    diagnosticLimit: state?.diagnosticLimit ?? 256
  }, "core-world-coordination-state");
  return clonePortableValue({
    state: coordinationState,
    worlds,
    sequence: state?.sequence ?? 0,
    diagnostics: state?.diagnostics ?? []
  }, "core-world-snapshot");
}
