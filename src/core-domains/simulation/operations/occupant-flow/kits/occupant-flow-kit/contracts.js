import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function normalizeOccupant(occupant = {}, index = 0) {
  const patience = finite(occupant.patience, `occupant-${index}.patience`, 60);
  if (patience < 0) throw new RangeError("Occupant patience cannot be negative.");
  return { id: String(occupant.id ?? `occupant-${index + 1}`), name: String(occupant.name ?? `Occupant ${index + 1}`), status: String(occupant.status ?? "waiting"), location: occupant.location == null ? null : String(occupant.location), destination: occupant.destination == null ? null : String(occupant.destination), need: occupant.need == null ? null : String(occupant.need), patience, maxPatience: Math.max(patience, finite(occupant.maxPatience, `occupant-${index}.maxPatience`, patience)), traits: cloneSerializableState(occupant.traits ?? {}), metadata: cloneSerializableState(occupant.metadata ?? {}) };
}

function normalizeRule(rule = {}, index = 0) {
  const id = String(rule.id ?? `rule-${index + 1}`);
  const intervalSeconds = finite(rule.intervalSeconds, `${id}.intervalSeconds`, 30);
  if (intervalSeconds <= 0) throw new RangeError(`Spawn rule ${id} intervalSeconds must be positive.`);
  const limit = rule.limit == null ? null : Math.floor(finite(rule.limit, `${id}.limit`));
  if (limit !== null && limit < 0) throw new RangeError(`Spawn rule ${id} limit cannot be negative.`);
  return { id, namePrefix: String(rule.namePrefix ?? "Visitor"), location: rule.location == null ? null : String(rule.location), destination: rule.destination == null ? null : String(rule.destination), destinations: (rule.destinations ?? []).map(String), need: rule.need == null ? null : String(rule.need), needs: (rule.needs ?? []).map(String), patience: Math.max(0, finite(rule.patience, `${id}.patience`, 60)), intervalSeconds, nextAt: Math.max(0, finite(rule.firstAt, `${id}.firstAt`, intervalSeconds)), limit, spawnedCount: 0, traits: cloneSerializableState(rule.traits ?? {}), metadata: cloneSerializableState(rule.metadata ?? {}) };
}

export function normalizeOccupantFlowConfig(config = {}) {
  const source = config.occupantDataset ?? config;
  const occupants = (source.occupants ?? []).map(normalizeOccupant);
  const ids = new Set();
  for (const occupant of occupants) {
    if (ids.has(occupant.id)) throw new TypeError(`Occupants contain duplicate id ${occupant.id}.`);
    ids.add(occupant.id);
  }
  const spawnRules = (source.spawnRules ?? []).map(normalizeRule);
  if (new Set(spawnRules.map((rule) => rule.id)).size !== spawnRules.length) throw new TypeError("Spawn rules contain duplicate IDs.");
  return { id: String(source.id ?? "occupant-flow"), occupants, spawnRules };
}

export function createOccupantFlowState(config = {}) {
  const normalized = normalizeOccupantFlowConfig(config);
  return { flowId: normalized.id, elapsedSeconds: 0, nextSequence: 1, occupants: normalized.occupants, spawnRules: normalized.spawnRules, lastEvent: null };
}

function occupantFromRule(rule, sequence) {
  return normalizeOccupant({ id: `${rule.id}-${sequence}`, name: `${rule.namePrefix} ${sequence}`, location: rule.location, destination: rule.destinations.length ? rule.destinations[(sequence - 1) % rule.destinations.length] : rule.destination, need: rule.needs.length ? rule.needs[(sequence - 1) % rule.needs.length] : rule.need, patience: rule.patience, maxPatience: rule.patience, traits: rule.traits, metadata: { ruleId: rule.id, ...rule.metadata } }, sequence - 1);
}

export function advanceOccupantFlow(state = {}, command = {}) {
  const delta = finite(command.delta, "delta", 0);
  if (delta < 0) throw new RangeError("Occupant Flow delta cannot be negative.");
  const elapsedSeconds = state.elapsedSeconds + delta;
  let nextSequence = state.nextSequence;
  const occupants = state.occupants.map((occupant) => cloneSerializableState(occupant));
  const ids = new Set(occupants.map((occupant) => occupant.id));
  const spawned = [];
  const spawnRules = state.spawnRules.map((rule) => {
    const next = cloneSerializableState(rule);
    while (elapsedSeconds >= next.nextAt && (next.limit === null || next.spawnedCount < next.limit)) {
      const occupant = occupantFromRule(next, nextSequence);
      if (ids.has(occupant.id)) throw new TypeError(`Generated occupant id ${occupant.id} collides with existing state.`);
      ids.add(occupant.id);
      occupants.push(occupant);
      spawned.push(occupant);
      nextSequence += 1;
      next.spawnedCount += 1;
      next.nextAt += next.intervalSeconds;
    }
    return next;
  });
  const abandoned = [];
  const advanced = occupants.map((occupant) => {
    if (occupant.status !== "waiting") return occupant;
    const patience = Math.max(0, occupant.patience - delta);
    if (patience === 0 && occupant.patience > 0) abandoned.push(occupant.id);
    return { ...occupant, patience, status: patience === 0 ? "abandoned" : occupant.status };
  });
  return { elapsedSeconds, nextSequence, occupants: advanced, spawnRules, spawned, abandoned };
}
