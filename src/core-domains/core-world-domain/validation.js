import { inspectPortableValue } from "./portable.js";
import { validateWorldCell } from "./kits/world-cell-kit/index.js";
import {
  WORLD_EFFECT_PHASES,
  validateWorldEffectReference
} from "./kits/world-effect-provider-kit/index.js";
import {
  WORLD_CELL_LIFECYCLE_STATES,
  WORLD_PROVIDER_LIFECYCLE_STATES
} from "./state.js";

function duplicateValues(values = []) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function validateWorldProviderSet(providers = []) {
  const issues = [];
  const ids = providers.map((provider) => provider?.id).filter(Boolean);
  for (const id of duplicateValues(ids)) issues.push(`duplicate-provider-id:${id}`);
  for (const provider of providers) {
    if (!provider?.id) issues.push("provider:missing-id");
    if (!WORLD_EFFECT_PHASES.includes(provider?.phase)) issues.push(`provider:${provider?.id ?? "unknown"}:invalid-phase`);
    if (typeof provider?.prepareCell !== "function" && typeof provider?.build !== "function") issues.push(`provider:${provider?.id ?? "unknown"}:missing-prepare`);
    for (const name of ["matches", "updateCell", "releaseCell", "getEffectDescriptor", "snapshot", "restoreSnapshot", "reset"]) {
      if (provider?.[name] !== undefined && typeof provider[name] !== "function") issues.push(`provider:${provider?.id ?? "unknown"}:invalid-${name}`);
    }
  }
  return { valid: issues.length === 0, issues };
}

export function validateWorldDefinition(world) {
  const issues = [];
  if (!world?.id || typeof world.id !== "string") issues.push("missing-id");
  if (!world?.partition?.selectCells || typeof world.partition.selectCells !== "function") issues.push("missing-partition");
  if (!world?.surface?.toWorld || typeof world.surface.toWorld !== "function") issues.push("missing-surface");
  issues.push(...validateWorldProviderSet(world?.providers ?? []).issues);
  const focus = world?.focus ?? { position: { x: 0, y: 0, z: 0 } };
  issues.push(...inspectPortableValue(focus, { path: "world.focus" }).issues);
  return { valid: issues.length === 0, issues };
}

export function validateCellLifecycleRecord(entry, providerIds = new Set()) {
  const issues = [];
  const cellValidation = validateWorldCell(entry?.cell);
  issues.push(...cellValidation.issues.map((issue) => `${entry?.cell?.id ?? "cell"}:${issue}`));
  if (!WORLD_CELL_LIFECYCLE_STATES.includes(entry?.state)) issues.push(`${entry?.cell?.id ?? "cell"}:invalid-lifecycle-state`);
  if (!Number.isFinite(Number(entry?.descriptorVersion)) || Number(entry.descriptorVersion) < 1) issues.push(`${entry?.cell?.id ?? "cell"}:invalid-descriptor-version`);

  const effectIds = [];
  for (const effect of entry?.effects ?? []) {
    effectIds.push(effect?.id);
    const validation = validateWorldEffectReference(effect);
    issues.push(...validation.issues.map((issue) => `${entry?.cell?.id ?? "cell"}:effect:${effect?.id ?? "unknown"}:${issue}`));
    if (effect?.cellId !== entry?.cell?.id) issues.push(`${entry?.cell?.id ?? "cell"}:effect-cell-mismatch:${effect?.id ?? "unknown"}`);
    if (providerIds.size && !providerIds.has(effect?.providerId)) issues.push(`${entry?.cell?.id ?? "cell"}:unknown-effect-provider:${effect?.providerId}`);
  }
  for (const id of duplicateValues(effectIds.filter(Boolean))) issues.push(`${entry?.cell?.id ?? "cell"}:duplicate-effect-id:${id}`);

  for (const [providerId, status] of Object.entries(entry?.providerStatus ?? {})) {
    if (providerIds.size && !providerIds.has(providerId)) issues.push(`${entry?.cell?.id ?? "cell"}:unknown-provider-status:${providerId}`);
    if (!WORLD_PROVIDER_LIFECYCLE_STATES.includes(status?.status)) issues.push(`${entry?.cell?.id ?? "cell"}:provider:${providerId}:invalid-status`);
    if (status?.missingCapabilities && !Array.isArray(status.missingCapabilities)) issues.push(`${entry?.cell?.id ?? "cell"}:provider:${providerId}:invalid-missing-capabilities`);
  }
  return { valid: issues.length === 0, issues };
}

export function validateWorldSnapshot(snapshot) {
  const issues = [];
  if (!snapshot?.id || typeof snapshot.id !== "string") issues.push("missing-id");
  const providers = snapshot?.providers ?? [];
  const providerIds = new Set(providers.map((provider) => provider.id));
  issues.push(...validateWorldProviderSet(providers.map((provider) => ({
    ...provider,
    prepareCell() {}
  }))).issues.filter((issue) => !issue.endsWith("missing-prepare")));

  const cellIds = [];
  for (const entry of snapshot?.activeCells ?? []) {
    cellIds.push(entry?.cell?.id);
    issues.push(...validateCellLifecycleRecord(entry, providerIds).issues);
  }
  for (const id of duplicateValues(cellIds.filter(Boolean))) issues.push(`duplicate-cell-id:${id}`);
  issues.push(...inspectPortableValue(snapshot, { path: "worldSnapshot" }).issues);
  return { valid: issues.length === 0, issues };
}

export function validateCoreWorldState(state) {
  const issues = [];
  for (const [worldId, world] of Object.entries(state?.worlds ?? {})) {
    if (world.id !== worldId) issues.push(`world-key-mismatch:${worldId}`);
    const snapshot = {
      ...world,
      activeCells: Object.values(world.activeCells ?? {})
    };
    issues.push(...validateWorldSnapshot(snapshot).issues.map((issue) => `${worldId}:${issue}`));
  }
  issues.push(...inspectPortableValue(state, { path: "coreWorldState" }).issues);
  return { valid: issues.length === 0, issues };
}
