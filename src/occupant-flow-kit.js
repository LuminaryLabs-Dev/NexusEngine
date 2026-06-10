import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const OccupantFlowState = defineResource("occupant.flowState");
export const OccupantSpawn = defineEvent("occupant.spawn");
export const OccupantNeedCreated = defineEvent("occupant.needCreated");
export const OccupantServed = defineEvent("occupant.served");
export const OccupantAbandoned = defineEvent("occupant.abandoned");

function normalizeOccupant(occupant = {}, index = 0) {
  return {
    id: occupant.id ?? `occupant-${index + 1}`,
    name: occupant.name ?? `Occupant ${index + 1}`,
    status: occupant.status ?? "waiting",
    location: occupant.location ?? null,
    destination: occupant.destination ?? null,
    need: occupant.need ?? null,
    patience: Number(occupant.patience ?? 60),
    maxPatience: Number(occupant.maxPatience ?? occupant.patience ?? 60),
    traits: occupant.traits ?? {},
    metadata: occupant.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.occupantDataset ?? config;
  return {
    id: dataset.id ?? "occupant-flow",
    elapsedSeconds: 0,
    nextSequence: 1,
    occupants: (dataset.occupants ?? []).map(normalizeOccupant),
    spawnRules: dataset.spawnRules ?? [],
    lastEvent: null
  };
}

function createFromRule(rule = {}, state) {
  const sequence = state.nextSequence;
  const destinations = rule.destinations ?? [];
  const needs = rule.needs ?? [];
  return normalizeOccupant({
    id: `${rule.id ?? "spawn"}-${sequence}`,
    name: `${rule.namePrefix ?? "Visitor"} ${sequence}`,
    location: rule.location ?? null,
    destination: destinations.length ? destinations[(sequence - 1) % destinations.length] : rule.destination,
    need: needs.length ? needs[(sequence - 1) % needs.length] : rule.need,
    patience: rule.patience ?? 60,
    maxPatience: rule.patience ?? 60,
    traits: rule.traits ?? {},
    metadata: { ruleId: rule.id ?? "spawn", ...(rule.metadata ?? {}) }
  }, sequence - 1);
}

function occupantFlowSystem(world) {
  let state = world.getResource(OccupantFlowState);
  if (!state) return;

  const delta = Math.max(0, Number(world.__nexusClock?.delta ?? 0));
  const elapsedSeconds = Number(state.elapsedSeconds ?? 0) + delta;
  let nextSequence = Number(state.nextSequence ?? 1);
  let occupants = state.occupants.map((occupant) => ({ ...occupant }));
  let lastEvent = state.lastEvent;

  for (const spawn of world.readEvents(OccupantSpawn)) {
    const occupant = normalizeOccupant({ ...spawn, id: spawn.id ?? `occupant-${nextSequence}` }, nextSequence - 1);
    nextSequence += 1;
    occupants.push(occupant);
    if (occupant.need) world.emit(OccupantNeedCreated, { occupantId: occupant.id, need: occupant.need, destination: occupant.destination, patience: occupant.patience });
    lastEvent = { type: "spawn", occupantId: occupant.id };
  }

  for (const rule of state.spawnRules) {
    const interval = Math.max(0.001, Number(rule.intervalSeconds ?? 30));
    const limit = Number(rule.limit ?? Infinity);
    const count = occupants.filter((occupant) => occupant.metadata?.ruleId === (rule.id ?? "spawn")).length;
    const nextAt = Number(rule.nextAt ?? rule.firstAt ?? interval);
    if (count < limit && elapsedSeconds >= nextAt) {
      const occupant = createFromRule(rule, { ...state, nextSequence });
      nextSequence += 1;
      occupants.push(occupant);
      rule.nextAt = nextAt + interval;
      if (occupant.need) world.emit(OccupantNeedCreated, { occupantId: occupant.id, need: occupant.need, destination: occupant.destination, patience: occupant.patience });
      lastEvent = { type: "spawn", occupantId: occupant.id };
    }
  }

  const served = new Set(world.readEvents(OccupantServed).map((event) => event.occupantId).filter(Boolean));
  occupants = occupants.map((occupant) => {
    if (served.has(occupant.id)) {
      lastEvent = { type: "served", occupantId: occupant.id };
      return { ...occupant, status: "served", patience: Math.max(0, occupant.patience) };
    }
    if (occupant.status !== "waiting") return occupant;
    const patience = Number(occupant.patience ?? 0) - delta;
    if (patience <= 0) {
      world.emit(OccupantAbandoned, { occupantId: occupant.id, need: occupant.need, destination: occupant.destination });
      lastEvent = { type: "abandoned", occupantId: occupant.id };
      return { ...occupant, patience: 0, status: "abandoned" };
    }
    return { ...occupant, patience };
  });

  world.setResource(OccupantFlowState, { ...state, elapsedSeconds, nextSequence, occupants, lastEvent });
}

export function createOccupantFlowKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "occupant-flow-kit",
    resources: { OccupantFlowState },
    events: { OccupantSpawn, OccupantNeedCreated, OccupantServed, OccupantAbandoned },
    systems: [{ phase: "simulate", system: occupantFlowSystem, name: "occupantFlowSystem" }],
    provides: ["occupant-flow"],
    initWorld({ world }) {
      world.setResource(OccupantFlowState, initialState(config));
    },
    install({ engine }) {
      engine.occupantFlow = {
        getState() {
          return engine.world.getResource(OccupantFlowState);
        },
        spawn(occupant = {}) {
          engine.world.emit(OccupantSpawn, occupant);
          engine.tick(0);
          return engine.world.getResource(OccupantFlowState);
        },
        serve(occupantId, payload = {}) {
          engine.world.emit(OccupantServed, { occupantId, ...payload });
          engine.tick(0);
          return engine.world.getResource(OccupantFlowState);
        },
        reset() {
          engine.world.setResource(OccupantFlowState, initialState(config));
          return engine.world.getResource(OccupantFlowState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(OccupantFlowState));
        }
      };
    },
    metadata: { purpose: "Generic occupant flow, needs, patience, and service outcomes." }
  });
}
