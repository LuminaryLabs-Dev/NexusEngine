import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function normalizeTransfer(value, label) {
  if (value == null) return null;
  const amount = finite(value.amount, `${label}.amount`, 0);
  return { account: String(value.account ?? "cash"), amount, metadata: cloneSerializableState(value.metadata ?? {}) };
}

export function normalizeFacility(facility = {}, index = 0) {
  const id = String(facility.id ?? `facility-${index + 1}`);
  const intervalSeconds = finite(facility.intervalSeconds, `${id}.intervalSeconds`, 30);
  if (intervalSeconds <= 0) throw new RangeError(`Facility ${id} intervalSeconds must be positive.`);
  const capacity = finite(facility.capacity, `${id}.capacity`, 1);
  if (capacity < 0) throw new RangeError(`Facility ${id} capacity cannot be negative.`);
  return {
    id,
    type: String(facility.type ?? "generic"),
    status: String(facility.status ?? "open"),
    capacity,
    condition: Math.max(0, Math.min(100, finite(facility.condition, `${id}.condition`, 100))),
    conditionDrainPerSecond: Math.max(0, finite(facility.conditionDrainPerSecond ?? facility.upkeep?.conditionDrain, `${id}.conditionDrainPerSecond`, 0)),
    output: normalizeTransfer(facility.output, `${id}.output`),
    upkeep: normalizeTransfer(facility.upkeep, `${id}.upkeep`),
    intervalSeconds,
    nextAt: Math.max(0, finite(facility.firstAt, `${id}.firstAt`, intervalSeconds)),
    cycleCount: Math.max(0, Math.floor(finite(facility.cycleCount, `${id}.cycleCount`, 0))),
    metadata: cloneSerializableState(facility.metadata ?? {})
  };
}

export function normalizeFacilityOperationsConfig(config = {}) {
  const source = config.facilityDataset ?? config;
  const ids = new Set();
  const facilities = (source.facilities ?? []).map((facility, index) => {
    const normalized = normalizeFacility(facility, index);
    if (ids.has(normalized.id)) throw new TypeError(`Facilities contain duplicate id ${normalized.id}.`);
    ids.add(normalized.id);
    return normalized;
  });
  return { id: String(source.id ?? "facility-operations"), facilities };
}

export function createFacilityOperationsState(config = {}) {
  const normalized = normalizeFacilityOperationsConfig(config);
  return { operationsId: normalized.id, elapsedSeconds: 0, facilities: normalized.facilities, outputReceipts: [], lastOutput: null };
}

export function advanceFacilities(state = {}, command = {}) {
  const delta = finite(command.delta, "delta", 0);
  if (delta < 0) throw new RangeError("Facility delta cannot be negative.");
  const elapsedSeconds = finite(state.elapsedSeconds, "state.elapsedSeconds", 0) + delta;
  const outputReceipts = [];
  const conditionChanges = [];
  const facilities = state.facilities.map((facility) => {
    const next = cloneSerializableState(facility);
    if (next.status !== "open") return next;
    const before = next.condition;
    next.condition = Math.max(0, next.condition - next.conditionDrainPerSecond * delta);
    if (next.condition !== before) conditionChanges.push({ facilityId: next.id, before, after: next.condition });
    if (next.condition === 0) {
      next.status = "disabled";
      return next;
    }
    while (elapsedSeconds >= next.nextAt) {
      next.cycleCount += 1;
      const receipt = cloneSerializableState({
        schema: "nexusengine.facility-operation/1",
        id: `${next.id}:cycle:${next.cycleCount}`,
        facilityId: next.id,
        type: next.type,
        cycle: next.cycleCount,
        at: next.nextAt,
        output: next.output,
        upkeep: next.upkeep,
        metadata: next.metadata
      });
      outputReceipts.push(receipt);
      next.nextAt += next.intervalSeconds;
    }
    return next;
  });
  return { elapsedSeconds, facilities, outputReceipts, conditionChanges };
}
