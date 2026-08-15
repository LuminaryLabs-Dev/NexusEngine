export const NEXUS_CREATURE_DEFINITION_SCHEMA = "nexus-creature-definition/1";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function reference(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} requires a descriptor reference.`);
  }
  return {
    provider: text(value.provider, null, `${label}.provider`),
    descriptorId: text(value.descriptorId ?? value.id, null, `${label}.descriptorId`),
    contentHash: value.contentHash == null ? null : String(value.contentHash),
    metadata: clone(value.metadata ?? {})
  };
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

export function createCreatureDefinition(input = {}) {
  const fovRange = Array.isArray(input.presentation?.fovRange)
    ? input.presentation.fovRange
    : [36, 48];
  const minimumFov = finite(fovRange[0], 36);
  const maximumFov = finite(fovRange[1], 48);
  if (maximumFov < minimumFov) throw new RangeError("Creature presentation fovRange must be ascending.");

  const descriptor = {
    schema: NEXUS_CREATURE_DEFINITION_SCHEMA,
    id: text(input.id, null, "Creature id"),
    archetype: text(input.archetype, "creature", "Creature archetype"),
    body: reference(input.body, "Creature body"),
    rig: reference(input.rig, "Creature rig"),
    collision: clone(input.collision ?? {}),
    support: {
      kind: text(input.support?.kind, "bounds", "Creature support kind"),
      boneIds: [...new Set((input.support?.boneIds ?? []).map(String))].sort(),
      fallback: String(input.support?.fallback ?? "bounds-minimum"),
      clearance: finite(input.support?.clearance, 0),
      metadata: clone(input.support?.metadata ?? {})
    },
    presentation: {
      focusBoneId: input.presentation?.focusBoneId == null ? null : String(input.presentation.focusBoneId),
      framingPadding: Math.max(1, finite(input.presentation?.framingPadding, 1.18)),
      fovRange: [minimumFov, maximumFov],
      metadata: clone(input.presentation?.metadata ?? {})
    },
    capabilities: [...new Set((input.capabilities ?? []).map(String))].sort(),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

export function validateCreatureDefinition(value) {
  const errors = [];
  if (value?.schema !== NEXUS_CREATURE_DEFINITION_SCHEMA) {
    errors.push(`schema must be ${NEXUS_CREATURE_DEFINITION_SCHEMA}`);
  }
  try {
    createCreatureDefinition(value);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { valid: errors.length === 0, errors };
}

export function equalCreatureDefinitions(left, right) {
  return stableStringify(createCreatureDefinition(left)) === stableStringify(createCreatureDefinition(right));
}
