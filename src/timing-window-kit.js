import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const TimingWindowState = defineResource("timing.windowState");
export const TimingWindowAction = defineEvent("timing.windowAction");
export const TimingWindowResolved = defineEvent("timing.windowResolved");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeWindow(window = {}, index = 0) {
  const intervalSeconds = Math.max(0.001, number(window.intervalSeconds ?? window.interval, 1.2));
  return {
    id: window.id ?? `window-${index + 1}`,
    intervalSeconds,
    offsetSeconds: number(window.offsetSeconds ?? window.offset, 0),
    perfectWindowSeconds: Math.max(0.001, number(window.perfectWindowSeconds ?? window.perfect, intervalSeconds * 0.1)),
    goodWindowSeconds: Math.max(0.001, number(window.goodWindowSeconds ?? window.good, intervalSeconds * 0.22)),
    metadata: window.metadata ?? {}
  };
}

function initialState(config = {}) {
  const windows = (config.windows ?? [config]).map(normalizeWindow);
  return {
    id: config.id ?? "timing-windows",
    elapsedSeconds: 0,
    windows,
    active: Object.fromEntries(windows.map((window) => [window.id, evaluateWindow(window, 0)])),
    lastResult: null
  };
}

function evaluateWindow(window, elapsedSeconds) {
  const wrapped = ((elapsedSeconds - window.offsetSeconds) % window.intervalSeconds + window.intervalSeconds) % window.intervalSeconds;
  const distance = Math.min(wrapped, window.intervalSeconds - wrapped);
  const quality = distance <= window.perfectWindowSeconds
    ? "perfect"
    : distance <= window.goodWindowSeconds
      ? "good"
      : "miss";
  const multiplier = quality === "perfect" ? 1.4 : quality === "good" ? 1 : 0;
  return {
    id: window.id,
    phase: wrapped / window.intervalSeconds,
    secondsToPeak: wrapped <= window.intervalSeconds / 2 ? -wrapped : window.intervalSeconds - wrapped,
    distanceSeconds: distance,
    quality,
    multiplier,
    open: quality !== "miss",
    metadata: window.metadata
  };
}

function timingWindowSystem(world) {
  const state = world.getResource(TimingWindowState);
  if (!state) return;

  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  const elapsedSeconds = number(state.elapsedSeconds, 0) + delta;
  const active = Object.fromEntries(state.windows.map((window) => [window.id, evaluateWindow(window, elapsedSeconds)]));
  let lastResult = state.lastResult;

  for (const action of world.readEvents(TimingWindowAction)) {
    const windowId = action.windowId ?? state.windows[0]?.id;
    const result = {
      id: action.id ?? `timing-${Math.round(elapsedSeconds * 1000)}`,
      windowId,
      actorId: action.actorId ?? null,
      at: elapsedSeconds,
      ...(active[windowId] ?? { quality: "miss", multiplier: 0, open: false }),
      metadata: action.metadata ?? {}
    };
    lastResult = result;
    world.emit(TimingWindowResolved, result);
  }

  world.setResource(TimingWindowState, { ...state, elapsedSeconds, active, lastResult });
}

export function createTimingWindowKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "timing-window-kit",
    resources: { TimingWindowState },
    events: { TimingWindowAction, TimingWindowResolved },
    systems: [{ phase: "simulate", system: timingWindowSystem, name: "timingWindowSystem" }],
    provides: ["timing-window"],
    initWorld({ world }) {
      world.setResource(TimingWindowState, initialState(config));
    },
    install({ engine }) {
      engine.timingWindows = {
        getState() {
          return engine.world.getResource(TimingWindowState);
        },
        getActive(windowId) {
          const state = engine.world.getResource(TimingWindowState);
          return state?.active?.[windowId ?? state.windows?.[0]?.id] ?? null;
        },
        action(action = {}) {
          engine.world.emit(TimingWindowAction, action);
          engine.tick(0);
          return engine.world.getResource(TimingWindowState)?.lastResult ?? null;
        },
        reset() {
          engine.world.setResource(TimingWindowState, initialState(config));
          return engine.world.getResource(TimingWindowState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(TimingWindowState));
        }
      };
    },
    metadata: { purpose: "Generic repeating timing windows for action judgment and rhythm-like interactions." }
  });
}

export function gradeTimingWindow(state, windowId) {
  const active = state?.active?.[windowId ?? state?.windows?.[0]?.id];
  return active ? structuredClone(active) : { quality: "miss", multiplier: 0, open: false };
}
