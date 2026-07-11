import { clonePortableValue, inspectPortableValue } from "../../portable.js";

export const WORLD_EFFECT_PHASES = Object.freeze(["foundation", "classification", "population", "presentation"]);
export const WORLD_EFFECT_STATUSES = Object.freeze(["requested", "preparing", "active", "failed", "releasing", "released"]);

export function createWorldEffectReference(input = {}) {
  const id = String(input.id ?? "");
  const providerId = String(input.providerId ?? "");
  const worldId = String(input.worldId ?? "");
  const cellId = String(input.cellId ?? "");
  const kind = String(input.kind ?? "world-effect");
  if (!id) throw new TypeError("World effect id is required.");
  if (!providerId) throw new TypeError("World effect providerId is required.");
  if (!worldId) throw new TypeError("World effect worldId is required.");
  if (!cellId) throw new TypeError("World effect cellId is required.");
  const descriptor = clonePortableValue(input.descriptor ?? {}, "world-effect-descriptor");
  return Object.freeze({
    id,
    providerId,
    worldId,
    cellId,
    kind,
    status: String(input.status ?? "active"),
    version: Math.max(1, Number(input.version ?? 1)),
    capabilities: Object.freeze([...(input.capabilities ?? [])].map(String)),
    descriptor: Object.freeze(descriptor)
  });
}

export const createWorldEffect = createWorldEffectReference;

export function normalizeWorldEffectReference(result, context = {}, previous = null) {
  if (result == null) return previous;
  const source = result.reference ?? result.effect ?? result;
  const provider = context.provider ?? {};
  const cell = context.cell ?? {};
  const world = context.world ?? {};
  const descriptor = source.descriptor ?? (source.payload && inspectPortableValue(source.payload).portable ? source.payload : {});
  return createWorldEffectReference({
    id: source.id ?? previous?.id ?? `${cell.id}:${provider.id}`,
    providerId: source.providerId ?? provider.id,
    worldId: source.worldId ?? world.id,
    cellId: source.cellId ?? cell.id,
    kind: source.kind ?? previous?.kind ?? provider.kind ?? provider.id,
    status: source.status ?? "active",
    version: source.version ?? (previous ? previous.version + 1 : 1),
    capabilities: source.capabilities ?? provider.provides ?? [],
    descriptor
  });
}

export function defineWorldEffectProvider(options = {}) {
  const {
    id,
    phase = "population",
    provides = [],
    requires = [],
    matches = () => true,
    critical = false,
    build,
    prepareCell = build,
    updateCell = prepareCell,
    release,
    releaseCell = (command) => release?.(command.effect, command),
    getEffectDescriptor = () => null,
    snapshot = () => null,
    restoreSnapshot = () => {},
    reset = () => {}
  } = options;

  if (!id) throw new TypeError("World effect provider id is required.");
  if (!WORLD_EFFECT_PHASES.includes(phase)) throw new TypeError(`Unsupported world effect phase: ${phase}`);
  if (typeof prepareCell !== "function") throw new TypeError("World effect provider prepareCell or build is required.");
  for (const [name, fn] of Object.entries({ matches, prepareCell, updateCell, releaseCell, getEffectDescriptor, snapshot, restoreSnapshot, reset })) {
    if (typeof fn !== "function") throw new TypeError(`World effect provider ${name} must be a function.`);
  }

  return Object.freeze({
    id: String(id),
    phase,
    provides: Object.freeze([...provides].map(String)),
    requires: Object.freeze([...requires].map(String)),
    critical: Boolean(critical),
    kind: options.kind ?? String(id),
    matches,
    prepareCell,
    updateCell,
    releaseCell,
    getEffectDescriptor,
    snapshot,
    restoreSnapshot,
    reset,
    // Compatibility aliases for early providers.
    build: prepareCell,
    release: releaseCell
  });
}

export function validateWorldEffectReference(effect) {
  const issues = [];
  for (const field of ["id", "providerId", "worldId", "cellId", "kind", "status"]) {
    if (!effect?.[field] || typeof effect[field] !== "string") issues.push(`invalid-${field}`);
  }
  if (!WORLD_EFFECT_STATUSES.includes(effect?.status)) issues.push("invalid-status");
  if (!Number.isFinite(Number(effect?.version)) || Number(effect.version) < 1) issues.push("invalid-version");
  if (!Array.isArray(effect?.capabilities)) issues.push("invalid-capabilities");
  const portable = inspectPortableValue(effect?.descriptor ?? {}, { path: "effect.descriptor" });
  issues.push(...portable.issues);
  return { valid: issues.length === 0, issues };
}
