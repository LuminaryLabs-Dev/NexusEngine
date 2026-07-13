export const NEXUS_CHARACTER_SCHEMA = "nexus-character/1";
export const CORE_CHARACTER_STATUSES = Object.freeze(["declared", "active", "suspended", "disposed"]);

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finiteInteger = (value, fallback = 0) => Math.max(0, Math.floor(Number.isFinite(Number(value)) ? Number(value) : fallback));

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

export function createCharacterDescriptor(input = {}) {
  const status = String(input.status ?? "declared");
  if (!CORE_CHARACTER_STATUSES.includes(status)) throw new RangeError(`Unsupported character status: ${status}`);
  const descriptor = {
    schema: NEXUS_CHARACTER_SCHEMA,
    id: text(input.id, null, "Character id"),
    creatureId: text(input.creatureId, null, "Character creatureId"),
    profileId: input.profileId == null ? null : String(input.profileId),
    bindings: {
      poseId: input.bindings?.poseId == null ? null : String(input.bindings.poseId),
      motionActorId: input.bindings?.motionActorId == null ? null : String(input.bindings.motionActorId),
      physicsBodyId: input.bindings?.physicsBodyId == null ? null : String(input.bindings.physicsBodyId)
    },
    status,
    lifecycleRevision: finiteInteger(input.lifecycleRevision, 0),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

export function validateCharacterDescriptor(value) {
  const errors = [];
  if (value?.schema !== NEXUS_CHARACTER_SCHEMA) errors.push(`schema must be ${NEXUS_CHARACTER_SCHEMA}`);
  try {
    createCharacterDescriptor(value);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { valid: errors.length === 0, errors };
}

export function equalCharacterDescriptors(left, right) {
  return stableStringify(createCharacterDescriptor(left)) === stableStringify(createCharacterDescriptor(right));
}
