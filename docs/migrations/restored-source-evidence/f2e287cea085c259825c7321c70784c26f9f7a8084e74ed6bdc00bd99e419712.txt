import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";
import { EconomyTransactionRequest } from "./economy-kit.js";
import { LifecycleProgressionCompleted } from "./lifecycle-progression-kit.js";

export const FacilityOperationsState = defineResource("facility.operationsState");
export const FacilityOutputProduced = defineEvent("facility.outputProduced");
export const FacilityConditionChanged = defineEvent("facility.conditionChanged");

function normalizeFacility(facility = {}, index = 0) {
  return {
    id: facility.id ?? `facility-${index + 1}`,
    type: facility.type ?? "generic",
    status: facility.status ?? "open",
    capacity: Math.max(0, Number(facility.capacity ?? 1)),
    condition: Math.max(0, Math.min(100, Number(facility.condition ?? 100))),
    output: facility.output ?? null,
    upkeep: facility.upkeep ?? null,
    intervalSeconds: Math.max(0.001, Number(facility.intervalSeconds ?? 30)),
    nextAt: Math.max(0.001, Number(facility.firstAt ?? facility.intervalSeconds ?? 30)),
    metadata: facility.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.facilityDataset ?? config;
  return {
    id: dataset.id ?? "facility-operations",
    elapsedSeconds: 0,
    facilities: (dataset.facilities ?? []).map(normalizeFacility),
    lastOutput: null
  };
}

function facilityOperationsSystem(world) {
  let state = world.getResource(FacilityOperationsState);
  if (!state) return;

  for (const completion of world.readEvents(LifecycleProgressionCompleted)) {
    const item = completion.item;
    if (item?.effects?.facility) {
      const facility = normalizeFacility(item.effects.facility, state.facilities.length);
      state = { ...state, facilities: [...state.facilities, facility] };
    }
  }

  const delta = Math.max(0, Number(world.__nexusClock?.delta ?? 0));
  const elapsedSeconds = Number(state.elapsedSeconds ?? 0) + delta;
  const facilities = state.facilities.map((facility) => ({ ...facility }));
  let lastOutput = state.lastOutput;

  for (const facility of facilities) {
    if (facility.status !== "open") continue;
    facility.condition = Math.max(0, facility.condition - delta * Number(facility.upkeep?.conditionDrain ?? 0));
    if (facility.condition <= 0) {
      facility.status = "disabled";
      world.emit(FacilityConditionChanged, { id: facility.id, condition: facility.condition, status: facility.status });
      continue;
    }

    while (elapsedSeconds >= facility.nextAt) {
      if (facility.output?.account && Number(facility.output.amount ?? 0) !== 0) {
        const output = {
          facilityId: facility.id,
          type: facility.type,
          account: facility.output.account,
          amount: Number(facility.output.amount),
          metadata: facility.metadata
        };
        lastOutput = output;
        world.emit(FacilityOutputProduced, output);
        world.emit(EconomyTransactionRequest, {
          account: output.account,
          amount: output.amount,
          source: "facility-output",
          metadata: { facilityId: facility.id, type: facility.type }
        });
      }
      if (facility.upkeep?.account && Number(facility.upkeep.amount ?? 0) !== 0) {
        world.emit(EconomyTransactionRequest, {
          account: facility.upkeep.account,
          amount: -Math.abs(Number(facility.upkeep.amount)),
          source: "facility-upkeep",
          metadata: { facilityId: facility.id, type: facility.type }
        });
      }
      facility.nextAt += facility.intervalSeconds;
    }
  }

  world.setResource(FacilityOperationsState, { ...state, elapsedSeconds, facilities, lastOutput });
}

export function createFacilityOperationsKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "facility-operations-kit",
    resources: { FacilityOperationsState },
    events: { FacilityOutputProduced, FacilityConditionChanged },
    systems: [{ phase: "simulate", system: facilityOperationsSystem, name: "facilityOperationsSystem" }],
    provides: ["facility-operations"],
    initWorld({ world }) {
      world.setResource(FacilityOperationsState, initialState(config));
    },
    install({ engine }) {
      engine.facilityOperations = {
        getState() {
          return engine.world.getResource(FacilityOperationsState);
        },
        add(facility = {}) {
          const state = engine.world.getResource(FacilityOperationsState);
          const next = { ...state, facilities: [...state.facilities, normalizeFacility(facility, state.facilities.length)] };
          engine.world.setResource(FacilityOperationsState, next);
          return next;
        },
        setStatus(id, status) {
          const state = engine.world.getResource(FacilityOperationsState);
          const facilities = state.facilities.map((facility) => facility.id === id ? { ...facility, status } : facility);
          engine.world.setResource(FacilityOperationsState, { ...state, facilities });
          return engine.world.getResource(FacilityOperationsState);
        },
        reset() {
          engine.world.setResource(FacilityOperationsState, initialState(config));
          return engine.world.getResource(FacilityOperationsState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(FacilityOperationsState));
        }
      };
    },
    metadata: { purpose: "Generic operational state for facilities, capacity, output, upkeep, and condition." }
  });
}
