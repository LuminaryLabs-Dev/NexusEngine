import { clonePortableValue } from "./portable.js";

export const WORLD_CELL_LIFECYCLE_STATES = Object.freeze([
  "requested",
  "preparing",
  "active",
  "failed",
  "releasing"
]);

export const WORLD_PROVIDER_LIFECYCLE_STATES = Object.freeze([
  "pending",
  "preparing",
  "active",
  "blocked",
  "failed",
  "releasing",
  "released",
  "not-applicable",
  "rolled-back"
]);

export function createInitialWorldState(config = {}) {
  return {
    worlds: {},
    sequence: 0,
    diagnostics: [],
    diagnosticLimit: Number(config.diagnosticLimit ?? 256)
  };
}

export function cloneWorldState(value) {
  return value == null ? value : clonePortableValue(value, "core-world-state");
}

export function createWorldProviderDescriptor(provider = {}) {
  return {
    id: String(provider.id ?? ""),
    phase: String(provider.phase ?? "population"),
    provides: [...(provider.provides ?? [])].map(String),
    requires: [...(provider.requires ?? [])].map(String),
    critical: Boolean(provider.critical)
  };
}

export function createWorldRecordState(definition = {}) {
  const providers = (definition.providers ?? []).map(createWorldProviderDescriptor);
  return {
    id: String(definition.id),
    seed: String(definition.seed ?? definition.id),
    focus: clonePortableValue(definition.focus ?? { position: { x: 0, y: 0, z: 0 } }, "world-focus"),
    partition: clonePortableValue(definition.partition?.snapshot?.() ?? {
      id: definition.partition?.id,
      kind: definition.partition?.kind
    }, "world-partition-descriptor"),
    surface: {
      id: String(definition.surface?.id ?? ""),
      kind: String(definition.surface?.kind ?? "custom")
    },
    providers,
    activeCells: {},
    diagnostics: [],
    diagnosticSequence: 0,
    sequence: 0
  };
}

export function createCellLifecycleRecord(cell, options = {}) {
  return {
    cell: clonePortableValue(cell, "world-cell"),
    state: options.state ?? "requested",
    descriptorVersion: Number(options.descriptorVersion ?? 1),
    providerStatus: clonePortableValue(options.providerStatus ?? {}, "provider-status"),
    effects: clonePortableValue(options.effects ?? [], "effect-references"),
    lastTransitionSequence: Number(options.lastTransitionSequence ?? 0)
  };
}

export function createWorldDiagnostic(world, input = {}) {
  const sequence = Number(world?.diagnosticSequence ?? 0) + 1;
  return {
    id: `${world?.id ?? "world"}:diagnostic:${sequence}`,
    sequence,
    severity: String(input.severity ?? "error"),
    code: String(input.code ?? "world-diagnostic"),
    message: String(input.message ?? input.code ?? "World diagnostic"),
    worldId: String(input.worldId ?? world?.id ?? ""),
    cellId: input.cellId == null ? null : String(input.cellId),
    providerId: input.providerId == null ? null : String(input.providerId),
    details: clonePortableValue(input.details ?? {}, "diagnostic-details")
  };
}

export function appendWorldDiagnostic(world, input = {}, limit = 256) {
  const diagnostic = createWorldDiagnostic(world, input);
  world.diagnosticSequence = diagnostic.sequence;
  world.diagnostics = [...(world.diagnostics ?? []), diagnostic].slice(-Math.max(1, Number(limit) || 256));
  return diagnostic;
}
