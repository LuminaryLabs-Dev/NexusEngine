import {
  WORLD_EFFECT_PHASES,
  normalizeWorldEffectReference
} from "../world-effect-provider-kit/index.js";
import {
  appendWorldDiagnostic,
  cloneWorldState,
  createCellLifecycleRecord,
  createInitialWorldState,
  createWorldRecordState
} from "../../state.js";
import {
  collectProviderSnapshots,
  createCoreWorldSnapshot,
  createWorldSnapshot
} from "../../snapshot.js";
import {
  validateCoreWorldState,
  validateWorldDefinition,
  validateWorldProviderSet
} from "../../validation.js";
import { inspectPortableValue, portableError } from "../../portable.js";
import { validateWorldCell } from "../world-cell-kit/index.js";

function isPromiseLike(value) {
  return Boolean(value && typeof value.then === "function");
}

function providerMetadata(provider) {
  return {
    id: provider.id,
    phase: provider.phase,
    provides: [...provider.provides],
    requires: [...provider.requires],
    critical: Boolean(provider.critical)
  };
}

function createStateAdapter(options = {}) {
  if (typeof options.getState === "function" && typeof options.commit === "function") {
    return { getState: options.getState, commit: options.commit };
  }
  let localState = createInitialWorldState(options.initialState);
  return {
    getState: () => localState,
    commit(patch = {}, eventName = "updated") {
      localState = {
        ...localState,
        ...cloneWorldState(patch),
        sequence: Number(localState.sequence ?? 0) + 1,
        lastEvent: eventName
      };
      return localState;
    }
  };
}

function makeProviderStatus(status, extra = {}) {
  return {
    status,
    effectId: extra.effectId ?? null,
    version: Number(extra.version ?? 0),
    missingCapabilities: [...(extra.missingCapabilities ?? [])],
    error: extra.error ?? null
  };
}

function validatePartitionSelection(selection, partitionId) {
  const issues = [];
  const ids = new Set();
  const cells = [
    ...(selection.required ?? []),
    ...(selection.retained ?? []),
    ...(selection.released ?? []),
    ...(selection.updated ?? []).map((entry) => entry.next)
  ];
  for (const cell of cells) {
    const validation = validateWorldCell(cell);
    issues.push(...validation.issues.map((issue) => `${cell?.id ?? "cell"}:${issue}`));
    const key = `${cell?.id}:${selection.released?.includes(cell) ? "released" : "next"}`;
    if (ids.has(key)) issues.push(`duplicate-selection-cell:${cell?.id}`);
    ids.add(key);
  }
  if (issues.length) throw new TypeError(`Partition ${partitionId} returned invalid cells: ${issues.join(", ")}`);
}

function capabilitiesFromEffects(effects = []) {
  const capabilities = new Map();
  for (const effect of effects) {
    for (const capability of effect.capabilities ?? []) capabilities.set(capability, effect);
  }
  return capabilities;
}

function removeEffectForProvider(effects, providerId) {
  return effects.filter((effect) => effect.providerId !== providerId);
}

export function createWorldBuilderRuntime(options = {}) {
  const stateAdapter = createStateAdapter(options);
  const runtimeWorlds = new Map();
  const diagnosticLimit = Number(options.diagnosticLimit ?? 256);

  function readState() {
    return cloneWorldState(stateAdapter.getState() ?? createInitialWorldState({ diagnosticLimit }));
  }

  function commitState(nextState, eventName = "updated", payload = {}) {
    const validation = validateCoreWorldState(nextState);
    if (!validation.valid) {
      throw new TypeError(`CoreWorldState validation failed before commit: ${validation.issues.join(", ")}`);
    }
    return stateAdapter.commit({
      worlds: nextState.worlds,
      diagnostics: nextState.diagnostics ?? [],
      diagnosticLimit: nextState.diagnosticLimit ?? diagnosticLimit
    }, eventName, payload);
  }

  function runtimeWorld(id) {
    const runtime = runtimeWorlds.get(id);
    if (!runtime) throw new Error(`World ${id} has no registered runtime definition.`);
    return runtime;
  }

  function addDiagnostic(worldState, input) {
    return appendWorldDiagnostic(worldState, input, diagnosticLimit);
  }

  function createRuntimeDefinition(definition) {
    const providers = [...(definition.providers ?? [])];
    return {
      ...definition,
      seed: definition.seed ?? definition.id,
      providers,
      providerById: new Map(providers.map((provider) => [provider.id, provider]))
    };
  }

  function registerWorld(definition, registrationOptions = {}) {
    const validation = validateWorldDefinition(definition);
    if (!validation.valid) throw new TypeError(`Invalid world definition: ${validation.issues.join(", ")}`);
    const providerValidation = validateWorldProviderSet(definition.providers ?? []);
    if (!providerValidation.valid) throw new TypeError(`Invalid world providers: ${providerValidation.issues.join(", ")}`);
    if (runtimeWorlds.has(definition.id)) throw new Error(`World runtime already registered: ${definition.id}`);

    const nextState = readState();
    const existing = nextState.worlds?.[definition.id];
    if (existing && !registrationOptions.attachExisting) throw new Error(`World state already registered: ${definition.id}`);

    const runtime = createRuntimeDefinition(definition);
    runtimeWorlds.set(definition.id, runtime);

    if (existing) {
      const nextWorld = cloneWorldState(existing);
      nextWorld.partition = cloneWorldState(definition.partition.snapshot?.() ?? { id: definition.partition.id, kind: definition.partition.kind });
      nextWorld.surface = { id: definition.surface.id, kind: definition.surface.kind };
      nextWorld.providers = runtime.providers.map(providerMetadata);
      for (const record of Object.values(nextWorld.activeCells ?? {})) {
        record.state = "requested";
        record.effects = [];
        record.providerStatus = {};
      }
      nextWorld.sequence = Number(nextWorld.sequence ?? 0) + 1;
      nextState.worlds[definition.id] = nextWorld;
    } else {
      nextState.worlds[definition.id] = createWorldRecordState(definition);
    }

    commitState(nextState, "worldRegistered", { worldId: definition.id });
    return definition.id;
  }

  function invokeProvider(provider, method, command) {
    const result = provider[method](command);
    if (isPromiseLike(result)) {
      const error = new Error(`Async provider method is not supported by the synchronous world builder: ${provider.id}.${method}`);
      error.code = "async-provider-not-supported";
      throw error;
    }
    return result;
  }

  function resolveEffect(provider, result, context, previous = null) {
    const providerDescriptor = provider.getEffectDescriptor(context.cell.id, context);
    if (isPromiseLike(providerDescriptor)) {
      const error = new Error(`Async getEffectDescriptor is not supported: ${provider.id}`);
      error.code = "async-provider-not-supported";
      throw error;
    }
    return normalizeWorldEffectReference(providerDescriptor ?? result, { ...context, provider }, previous);
  }

  function releaseProvider(runtime, worldState, cellRecord, provider, effect, reason = "release") {
    const status = cellRecord.providerStatus[provider.id] ?? makeProviderStatus("pending");
    cellRecord.providerStatus[provider.id] = { ...status, status: "releasing" };
    try {
      invokeProvider(provider, "releaseCell", {
        reason,
        world: runtime,
        worldState,
        cell: cellRecord.cell,
        surface: runtime.surface,
        effect
      });
      cellRecord.providerStatus[provider.id] = { ...status, status: "released", effectId: null };
      return null;
    } catch (error) {
      const normalized = portableError(error, "provider-release-failed");
      cellRecord.providerStatus[provider.id] = { ...status, status: "failed", error: normalized };
      addDiagnostic(worldState, {
        code: normalized.code,
        message: normalized.message,
        cellId: cellRecord.cell.id,
        providerId: provider.id,
        details: { phase: provider.phase, reason }
      });
      return normalized;
    }
  }

  function rollbackPreparedProviders(runtime, worldState, cellRecord, preparedProviders) {
    for (const { provider, effect } of [...preparedProviders].reverse()) {
      releaseProvider(runtime, worldState, cellRecord, provider, effect, "rollback");
      const prior = cellRecord.providerStatus[provider.id] ?? {};
      cellRecord.providerStatus[provider.id] = { ...prior, status: "rolled-back", effectId: null };
    }
    cellRecord.effects = [];
  }

  function prepareCellRecord(runtime, worldState, cell) {
    const record = createCellLifecycleRecord(cell, {
      state: "preparing",
      descriptorVersion: 1,
      lastTransitionSequence: Number(worldState.sequence ?? 0) + 1
    });
    const capabilities = new Map();
    const preparedProviders = [];
    let criticalFailure = false;

    for (const phase of WORLD_EFFECT_PHASES) {
      for (const provider of runtime.providers) {
        if (provider.phase !== phase) continue;
        const context = { world: runtime, worldState, cell, surface: runtime.surface, effects: record.effects, capabilities };
        if (!provider.matches(cell, context)) {
          record.providerStatus[provider.id] = makeProviderStatus("not-applicable");
          continue;
        }
        const missingCapabilities = provider.requires.filter((capability) => !capabilities.has(capability));
        if (missingCapabilities.length > 0) {
          record.providerStatus[provider.id] = makeProviderStatus("blocked", { missingCapabilities });
          addDiagnostic(worldState, {
            severity: provider.critical ? "error" : "warning",
            code: "provider-capabilities-missing",
            message: `Provider ${provider.id} is missing capabilities: ${missingCapabilities.join(", ")}`,
            cellId: cell.id,
            providerId: provider.id,
            details: { missingCapabilities }
          });
          if (provider.critical) {
            criticalFailure = true;
            rollbackPreparedProviders(runtime, worldState, record, preparedProviders);
            break;
          }
          continue;
        }

        record.providerStatus[provider.id] = makeProviderStatus("preparing");
        try {
          const result = invokeProvider(provider, "prepareCell", context);
          const effect = resolveEffect(provider, result, context);
          if (effect) {
            record.effects.push(effect);
            for (const capability of effect.capabilities) capabilities.set(capability, effect);
          }
          record.providerStatus[provider.id] = makeProviderStatus("active", {
            effectId: effect?.id,
            version: effect?.version ?? 0
          });
          preparedProviders.push({ provider, effect });
        } catch (error) {
          const normalized = portableError(error, "provider-prepare-failed");
          record.providerStatus[provider.id] = makeProviderStatus("failed", { error: normalized });
          addDiagnostic(worldState, {
            code: normalized.code,
            message: normalized.message,
            cellId: cell.id,
            providerId: provider.id,
            details: { phase }
          });
          rollbackPreparedProviders(runtime, worldState, record, preparedProviders);
          criticalFailure = true;
          break;
        }
      }
      if (criticalFailure) break;
    }

    record.state = criticalFailure ? "failed" : "active";
    worldState.activeCells[cell.id] = record;
    return record;
  }

  function updateCellRecord(runtime, worldState, previousRecord, nextCell, changes = []) {
    const record = cloneWorldState(previousRecord);
    const previousCell = record.cell;
    record.cell = cloneWorldState(nextCell);
    record.state = "preparing";
    record.descriptorVersion = Number(record.descriptorVersion ?? 1) + 1;
    record.lastTransitionSequence = Number(worldState.sequence ?? 0) + 1;
    let effects = [...(record.effects ?? [])];
    const capabilities = capabilitiesFromEffects(effects);
    let criticalFailure = false;

    for (const phase of WORLD_EFFECT_PHASES) {
      for (const provider of runtime.providers) {
        if (provider.phase !== phase) continue;
        const previousEffect = effects.find((effect) => effect.providerId === provider.id) ?? null;
        const context = {
          world: runtime,
          worldState,
          cell: nextCell,
          previousCell,
          changes,
          surface: runtime.surface,
          effects,
          capabilities,
          effect: previousEffect
        };

        if (!provider.matches(nextCell, context)) {
          if (previousEffect) releaseProvider(runtime, worldState, record, provider, previousEffect, "no-longer-matches");
          effects = removeEffectForProvider(effects, provider.id);
          record.providerStatus[provider.id] = makeProviderStatus("not-applicable");
          continue;
        }

        const missingCapabilities = provider.requires.filter((capability) => !capabilities.has(capability));
        if (missingCapabilities.length > 0) {
          if (previousEffect) releaseProvider(runtime, worldState, record, provider, previousEffect, "capability-lost");
          effects = removeEffectForProvider(effects, provider.id);
          record.providerStatus[provider.id] = makeProviderStatus("blocked", { missingCapabilities });
          addDiagnostic(worldState, {
            severity: provider.critical ? "error" : "warning",
            code: "provider-capabilities-missing",
            message: `Provider ${provider.id} is missing capabilities after a cell update.`,
            cellId: nextCell.id,
            providerId: provider.id,
            details: { missingCapabilities, changes }
          });
          if (provider.critical) criticalFailure = true;
          continue;
        }

        record.providerStatus[provider.id] = makeProviderStatus("preparing", {
          effectId: previousEffect?.id,
          version: previousEffect?.version ?? 0
        });
        try {
          const method = previousEffect ? "updateCell" : "prepareCell";
          const result = invokeProvider(provider, method, context);
          const nextEffect = resolveEffect(provider, result, context, previousEffect);
          effects = removeEffectForProvider(effects, provider.id);
          if (nextEffect) effects.push(nextEffect);
          record.providerStatus[provider.id] = makeProviderStatus("active", {
            effectId: nextEffect?.id,
            version: nextEffect?.version ?? 0
          });
          for (const capability of nextEffect?.capabilities ?? []) capabilities.set(capability, nextEffect);
        } catch (error) {
          if (previousEffect) releaseProvider(runtime, worldState, record, provider, previousEffect, "update-failed");
          effects = removeEffectForProvider(effects, provider.id);
          const normalized = portableError(error, "provider-update-failed");
          record.providerStatus[provider.id] = makeProviderStatus("failed", { error: normalized });
          addDiagnostic(worldState, {
            code: normalized.code,
            message: normalized.message,
            cellId: nextCell.id,
            providerId: provider.id,
            details: { changes }
          });
          if (provider.critical) criticalFailure = true;
        }
      }
    }

    record.effects = effects;
    record.state = criticalFailure ? "failed" : "active";
    worldState.activeCells[nextCell.id] = record;
    return record;
  }

  function releaseCellRecord(runtime, worldState, record, reason = "partition-release") {
    const nextRecord = cloneWorldState(record);
    nextRecord.state = "releasing";
    const effectsByProvider = new Map((nextRecord.effects ?? []).map((effect) => [effect.providerId, effect]));
    for (const provider of [...runtime.providers].reverse()) {
      const status = nextRecord.providerStatus?.[provider.id];
      if (!status || ["not-applicable", "released"].includes(status.status)) continue;
      releaseProvider(runtime, worldState, nextRecord, provider, effectsByProvider.get(provider.id) ?? null, reason);
    }
    delete worldState.activeCells[nextRecord.cell.id];
  }

  function updateWorld(id) {
    const runtime = runtimeWorld(id);
    const nextState = readState();
    const worldState = nextState.worlds?.[id];
    if (!worldState) throw new Error(`Unknown world state: ${id}`);
    const previousRecords = Object.values(worldState.activeCells ?? {});
    const previousCells = previousRecords.map((entry) => entry.cell);
    const selection = runtime.partition.selectCells({
      worldId: runtime.id,
      worldSeed: runtime.seed,
      focus: worldState.focus,
      previousCells,
      settings: runtime.settings ?? {}
    });
    if (!selection || !Array.isArray(selection.required) || !Array.isArray(selection.released)) {
      throw new TypeError(`Partition ${runtime.partition.id} returned an invalid cell selection.`);
    }
    validatePartitionSelection(selection, runtime.partition.id);

    for (const cell of selection.released) {
      const record = worldState.activeCells[cell.id];
      if (record) releaseCellRecord(runtime, worldState, record);
    }
    for (const update of selection.updated ?? []) {
      const record = worldState.activeCells[update.next.id];
      if (record) updateCellRecord(runtime, worldState, record, update.next, update.changes);
      else prepareCellRecord(runtime, worldState, update.next);
    }
    for (const cell of selection.required) prepareCellRecord(runtime, worldState, cell);
    for (const cell of selection.retained ?? []) {
      const record = worldState.activeCells[cell.id];
      if (record && record.state !== "active") updateCellRecord(runtime, worldState, record, cell, ["retry"]);
    }

    worldState.partition = cloneWorldState(runtime.partition.snapshot?.() ?? worldState.partition);
    worldState.sequence = Number(worldState.sequence ?? 0) + 1;
    commitState(nextState, "cellsChanged", {
      worldId: id,
      required: selection.required.length,
      updated: selection.updated?.length ?? 0,
      retained: selection.retained?.length ?? 0,
      released: selection.released.length
    });
    return createWorldSnapshot(worldState);
  }

  function releaseWorldRuntime(id, options = {}) {
    const runtime = runtimeWorlds.get(id);
    const nextState = readState();
    const worldState = nextState.worlds?.[id];
    if (runtime && worldState) {
      for (const record of Object.values(worldState.activeCells ?? {})) releaseCellRecord(runtime, worldState, record, options.reason ?? "world-release");
      for (const provider of [...runtime.providers].reverse()) {
        try {
          provider.reset({ world: runtime, worldState, reason: options.reason ?? "world-release" });
        } catch (error) {
          const normalized = portableError(error, "provider-reset-failed");
          addDiagnostic(worldState, { code: normalized.code, message: normalized.message, providerId: provider.id });
        }
      }
    }
    return { runtime, nextState, worldState };
  }

  function removeWorld(id) {
    if (!runtimeWorlds.has(id) && !readState().worlds?.[id]) return false;
    const { nextState } = releaseWorldRuntime(id, { reason: "world-removed" });
    runtimeWorlds.delete(id);
    delete nextState.worlds[id];
    commitState(nextState, "worldRemoved", { worldId: id });
    return true;
  }

  function setFocus(id, focus) {
    runtimeWorld(id);
    const portable = inspectPortableValue(focus, { path: "world.focus" });
    if (!portable.portable) throw new TypeError(`World focus must be portable: ${portable.issues.join(", ")}`);
    const nextState = readState();
    const worldState = nextState.worlds?.[id];
    if (!worldState) throw new Error(`Unknown world state: ${id}`);
    worldState.focus = cloneWorldState(focus);
    worldState.sequence = Number(worldState.sequence ?? 0) + 1;
    commitState(nextState, "focusChanged", { worldId: id });
    return cloneWorldState(worldState.focus);
  }

  function snapshot(id, snapshotOptions = {}) {
    const state = readState();
    const worldState = state.worlds?.[id];
    if (!worldState) return null;
    const providerData = snapshotOptions.includeProviders === false
      ? {}
      : collectProviderSnapshots(runtimeWorlds.get(id), worldState);
    return createWorldSnapshot(worldState, providerData);
  }

  function snapshotAll(snapshotOptions = {}) {
    if (snapshotOptions.includeProviders === false) return createCoreWorldSnapshot(readState());
    return createCoreWorldSnapshot(readState(), runtimeWorlds);
  }

  function restoreProviderSnapshots(id, providerSnapshots = {}) {
    const runtime = runtimeWorld(id);
    const state = readState();
    const worldState = state.worlds?.[id];
    if (!worldState) throw new Error(`Unknown world state: ${id}`);
    const diagnostics = [];
    for (const provider of runtime.providers) {
      if (!(provider.id in providerSnapshots)) continue;
      try {
        const result = provider.restoreSnapshot(providerSnapshots[provider.id], { world: runtime, worldState });
        if (isPromiseLike(result)) throw Object.assign(new Error(`Async restoreSnapshot is not supported: ${provider.id}`), { code: "async-provider-not-supported" });
      } catch (error) {
        const normalized = portableError(error, "provider-restore-failed");
        diagnostics.push({ providerId: provider.id, ...normalized });
        addDiagnostic(worldState, { code: normalized.code, message: normalized.message, providerId: provider.id });
      }
    }
    commitState(state, "providerSnapshotsRestored", { worldId: id });
    return diagnostics;
  }

  function markLoadedCellsForRestore() {
    const nextState = readState();
    for (const worldState of Object.values(nextState.worlds ?? {})) {
      for (const record of Object.values(worldState.activeCells ?? {})) {
        record.state = "requested";
        record.effects = [];
        record.providerStatus = {};
      }
    }
    commitState(nextState, "snapshotReconciled");
  }

  function disposeRuntime(disposeOptions = {}) {
    const nextState = readState();
    for (const [id, runtime] of runtimeWorlds) {
      const worldState = nextState.worlds?.[id];
      if (!worldState) continue;
      for (const record of Object.values(worldState.activeCells ?? {})) releaseCellRecord(runtime, worldState, record, disposeOptions.reason ?? "runtime-dispose");
      for (const provider of runtime.providers) {
        try { provider.reset({ world: runtime, worldState, reason: disposeOptions.reason ?? "runtime-dispose" }); } catch {}
      }
    }
    if (disposeOptions.clearDefinitions !== false) runtimeWorlds.clear();
    return nextState;
  }

  function reset() {
    disposeRuntime({ clearDefinitions: true, reason: "reset" });
    const nextState = createInitialWorldState({ diagnosticLimit });
    commitState(nextState, "reset");
    return cloneWorldState(stateAdapter.getState());
  }

  return {
    registerWorld,
    removeWorld,
    setFocus,
    updateWorld,
    getWorld(id) { return cloneWorldState(readState().worlds?.[id] ?? null); },
    getWorldDefinition(id) { return runtimeWorlds.get(id) ?? null; },
    getCell(id, cellId) { return cloneWorldState(readState().worlds?.[id]?.activeCells?.[cellId]?.cell ?? null); },
    getCellRecord(id, cellId) { return cloneWorldState(readState().worlds?.[id]?.activeCells?.[cellId] ?? null); },
    getActiveCells(id) { return Object.values(readState().worlds?.[id]?.activeCells ?? {}).map((entry) => cloneWorldState(entry.cell)); },
    getEffects(id, cellId) { return cloneWorldState(readState().worlds?.[id]?.activeCells?.[cellId]?.effects ?? []); },
    getDiagnostics(id) { return cloneWorldState(readState().worlds?.[id]?.diagnostics ?? []); },
    snapshot,
    snapshotAll,
    restoreProviderSnapshots,
    markLoadedCellsForRestore,
    disposeRuntime,
    reset,
    runtimeWorlds,
    validateState() { return validateCoreWorldState(readState()); }
  };
}
