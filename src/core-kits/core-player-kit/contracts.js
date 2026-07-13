export const NEXUS_PLAYER_SCHEMA = "nexus-player/1";
export const CORE_PLAYER_CONTROL_STATUSES = Object.freeze(["enabled", "disabled"]);

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

export function createPlayerDescriptor(input = {}) {
  const controlStatus = String(input.controlStatus ?? "disabled");
  if (!CORE_PLAYER_CONTROL_STATUSES.includes(controlStatus)) {
    throw new RangeError(`Unsupported player control status: ${controlStatus}`);
  }
  const descriptor = {
    schema: NEXUS_PLAYER_SCHEMA,
    id: text(input.id, null, "Player id"),
    characterId: input.characterId == null ? null : String(input.characterId),
    controlStatus,
    controlGeneration: finiteInteger(input.controlGeneration, 0),
    spawnGeneration: finiteInteger(input.spawnGeneration, 0),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

export function validatePlayerDescriptor(value) {
  const errors = [];
  if (value?.schema !== NEXUS_PLAYER_SCHEMA) errors.push(`schema must be ${NEXUS_PLAYER_SCHEMA}`);
  try {
    createPlayerDescriptor(value);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { valid: errors.length === 0, errors };
}

export function equalPlayerDescriptors(left, right) {
  return stableStringify(createPlayerDescriptor(left)) === stableStringify(createPlayerDescriptor(right));
}
