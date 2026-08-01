import { createWorldEffectReference, defineWorldEffectProvider } from "../../../../kits/world-effect-provider-kit/index.js";
import { clonePortableValue, inspectPortableValue } from "../../../../portable.js";

export const WORLD_FOUNDATION_CAPABILITIES = Object.freeze([
  "world-foundation",
  "terrain-height",
  "terrain-normal",
  "terrain-material",
  "terrain-descriptor"
]);

export function createWorldFoundationCellProvider(options = {}) {
  const id = String(options.id ?? "world-foundation-cell-provider");
  const kind = String(options.kind ?? "world-foundation");
  const capabilities = Object.freeze([...(options.capabilities ?? WORLD_FOUNDATION_CAPABILITIES)].map(String));
  const cells = new Map();

  function normalizeResult(command, result, previous = null) {
    const version = Number(previous?.version ?? 0) + 1;
    const descriptorCandidate = result?.descriptor ?? result?.effectDescriptor ?? result ?? {};
    const descriptor = inspectPortableValue(descriptorCandidate).portable
      ? clonePortableValue(descriptorCandidate, "world-foundation-cell-descriptor")
      : {};
    const state = {
      cellId: command.cell.id,
      version,
      descriptor,
      runtimeHandle: result?.runtimeHandle ?? result?.handle ?? null
    };
    cells.set(command.cell.id, state);
    return state;
  }

  const provider = defineWorldEffectProvider({
    id,
    kind,
    phase: "foundation",
    critical: options.critical !== false,
    provides: capabilities,
    prepareCell(command) {
      const result = options.prepareCell?.(command, null) ?? {};
      if (result && typeof result.then === "function") return result;
      const state = normalizeResult(command, result);
      return createWorldEffectReference({
        id: `${command.cell.id}:${kind}`,
        providerId: id,
        worldId: command.world.id,
        cellId: command.cell.id,
        kind,
        version: state.version,
        capabilities,
        descriptor: state.descriptor
      });
    },
    updateCell(command) {
      const previous = cells.get(command.cell.id) ?? null;
      const result = options.updateCell?.(command, previous) ?? options.prepareCell?.(command, previous) ?? previous?.descriptor ?? {};
      if (result && typeof result.then === "function") return result;
      normalizeResult(command, result, previous);
      return provider.getEffectDescriptor(command.cell.id, command);
    },
    releaseCell(command) {
      const previous = cells.get(command.cell.id) ?? null;
      options.releaseCell?.(command, previous);
      cells.delete(command.cell.id);
    },
    getEffectDescriptor(cellId, command = {}) {
      const state = cells.get(cellId);
      if (!state) return null;
      return createWorldEffectReference({
        id: `${cellId}:${kind}`,
        providerId: id,
        worldId: command.world?.id ?? command.effect?.worldId ?? "world",
        cellId,
        kind,
        version: state.version,
        capabilities,
        descriptor: state.descriptor
      });
    },
    snapshot() {
      const extension = options.snapshot?.() ?? {};
      return {
        cells: [...cells.values()].map(({ cellId, version, descriptor }) => ({ cellId, version, descriptor })).sort((a, b) => a.cellId.localeCompare(b.cellId)),
        ...(extension && typeof extension === "object" && !Array.isArray(extension) ? extension : { extension })
      };
    },
    restoreSnapshot(snapshot = {}) {
      cells.clear();
      for (const entry of snapshot.cells ?? []) {
        cells.set(entry.cellId, { cellId: entry.cellId, version: Number(entry.version ?? 1), descriptor: clonePortableValue(entry.descriptor ?? {}), runtimeHandle: null });
      }
      options.restoreSnapshot?.(snapshot);
    },
    reset() {
      cells.clear();
      options.reset?.();
    }
  });

  return Object.freeze({
    ...provider,
    getCellState(cellId) { return cells.get(cellId) ?? null; },
    listCellDescriptors() {
      return [...cells.values()].map(({ cellId, version, descriptor }) => ({ cellId, version, descriptor: clonePortableValue(descriptor) }));
    }
  });
}
