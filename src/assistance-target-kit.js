import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const AssistanceTargetState = defineResource("assistance.targetState");
export const AssistanceTargetStabilized = defineEvent("assistance.targetStabilized");
export const AssistanceTargetAttached = defineEvent("assistance.targetAttached");
export const AssistanceTargetCompleted = defineEvent("assistance.targetCompleted");
export const AssistanceTargetLost = defineEvent("assistance.targetLost");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeTarget(target = {}, index = 0) {
  return {
    id: target.id ?? `target-${index + 1}`,
    kind: target.kind ?? "assistance-target",
    x: number(target.x, 0),
    y: number(target.y, 0),
    radius: Math.max(1, number(target.radius, 14)),
    urgency: Math.max(0, number(target.urgency, 100)),
    decayPerSecond: Math.max(0, number(target.decayPerSecond, 0.8)),
    stabilizeAmount: Math.max(0, number(target.stabilizeAmount, 25)),
    attachDistance: Math.max(0, number(target.attachDistance, 28)),
    status: target.status ?? "distressed",
    attachedTo: target.attachedTo ?? null,
    completed: target.completed === true,
    lost: target.lost === true,
    metadata: target.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.assistanceTargetDataset ?? config;
  return {
    id: dataset.id ?? "assistance-targets",
    elapsedSeconds: 0,
    targets: (dataset.targets ?? []).map(normalizeTarget),
    completedCount: 0,
    lostCount: 0,
    lastEvent: null
  };
}

function distance(a = {}, b = {}) {
  return Math.hypot(number(a.x, 0) - number(b.x, 0), number(a.y, 0) - number(b.y, 0));
}

function assistanceTargetSystem(world) {
  const state = world.getResource(AssistanceTargetState);
  if (!state) return;
  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  const targets = state.targets.map((target) => {
    if (target.completed || target.lost) return target;
    const urgency = Math.max(0, number(target.urgency, 0) - number(target.decayPerSecond, 0) * delta);
    const next = { ...target, urgency };
    if (urgency <= 0) {
      next.status = "lost";
      next.lost = true;
      world.emit(AssistanceTargetLost, { target: next });
    }
    return next;
  });
  world.setResource(AssistanceTargetState, {
    ...state,
    elapsedSeconds: number(state.elapsedSeconds, 0) + delta,
    targets,
    completedCount: targets.filter((target) => target.completed).length,
    lostCount: targets.filter((target) => target.lost).length
  });
}

function updateTarget(engine, targetId, updater, eventDefinition, eventName) {
  const state = engine.world.getResource(AssistanceTargetState);
  let payload = null;
  const targets = state.targets.map((target) => {
    if (target.id !== targetId) return target;
    const next = updater(target);
    payload = { target: next };
    return next;
  });
  const nextState = {
    ...state,
    targets,
    completedCount: targets.filter((target) => target.completed).length,
    lostCount: targets.filter((target) => target.lost).length,
    lastEvent: payload ? { type: eventName, ...payload } : state.lastEvent
  };
  engine.world.setResource(AssistanceTargetState, nextState);
  if (payload) engine.world.emit(eventDefinition, payload);
  return nextState;
}

export function createAssistanceTargetKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "assistance-target-kit",
    resources: { AssistanceTargetState },
    events: { AssistanceTargetStabilized, AssistanceTargetAttached, AssistanceTargetCompleted, AssistanceTargetLost },
    systems: [{ phase: "simulate", system: assistanceTargetSystem, name: "assistanceTargetSystem" }],
    provides: ["assistance-targets"],
    initWorld({ world }) {
      world.setResource(AssistanceTargetState, initialState(config));
    },
    install({ engine }) {
      engine.assistanceTargets = {
        getState() {
          return engine.world.getResource(AssistanceTargetState);
        },
        nearest(point = {}, filter = (target) => !target.completed && !target.lost) {
          const targets = engine.world.getResource(AssistanceTargetState)?.targets ?? [];
          return targets.filter(filter).sort((left, right) => distance(left, point) - distance(right, point))[0] ?? null;
        },
        stabilize(targetId, amount) {
          return updateTarget(engine, targetId, (target) => {
            const urgency = Math.min(100, number(target.urgency, 0) + number(amount, target.stabilizeAmount));
            return { ...target, urgency, status: urgency >= 100 ? "stable" : "distressed" };
          }, AssistanceTargetStabilized, "stabilized");
        },
        attach(targetId, carrierId) {
          return updateTarget(engine, targetId, (target) => ({ ...target, status: "attached", attachedTo: carrierId }), AssistanceTargetAttached, "attached");
        },
        complete(targetId) {
          return updateTarget(engine, targetId, (target) => ({ ...target, status: "completed", completed: true, attachedTo: null }), AssistanceTargetCompleted, "completed");
        },
        reset() {
          engine.world.setResource(AssistanceTargetState, initialState(config));
          return engine.world.getResource(AssistanceTargetState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(AssistanceTargetState));
        }
      };
    },
    metadata: { purpose: "Generic distressed or recoverable entity state, urgency, attachment, completion, and loss events." }
  });
}
