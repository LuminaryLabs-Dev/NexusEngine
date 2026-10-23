import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const HazardFieldState = defineResource("hazard.fieldState");
export const HazardFieldSpawned = defineEvent("hazard.fieldSpawned");
export const HazardFieldCollision = defineEvent("hazard.fieldCollision");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(seed) {
  let value = 2166136261;
  for (const char of String(seed ?? "hazard-field")) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function randomFor(seed) {
  let state = hashSeed(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 100000) / 100000;
  };
}

function normalizeBounds(bounds = {}) {
  return {
    width: Math.max(1, number(bounds.width, 100)),
    height: Math.max(1, number(bounds.height, 100)),
    padding: Math.max(0, number(bounds.padding, 0))
  };
}

function normalizeHazard(hazard = {}, index = 0) {
  return {
    id: hazard.id ?? `hazard-${index + 1}`,
    x: number(hazard.x, 0),
    y: number(hazard.y, 0),
    vx: number(hazard.vx, 0),
    vy: number(hazard.vy, 0),
    radius: Math.max(1, number(hazard.radius ?? hazard.size, 10)),
    mass: Math.max(0, number(hazard.mass, 1)),
    damage: Math.max(0, number(hazard.damage, 1)),
    kind: hazard.kind ?? "hazard",
    metadata: hazard.metadata ?? {}
  };
}

function createSpawn(rule = {}, state) {
  const random = randomFor(`${state.seed}:${state.nextSequence}:${rule.id ?? "spawn"}`);
  const bounds = state.bounds;
  const edge = Math.floor(random() * 4);
  const radius = number(rule.radius, 12 + random() * 10);
  let x = random() * bounds.width;
  let y = random() * bounds.height;
  if (edge === 0) y = -radius;
  if (edge === 1) x = bounds.width + radius;
  if (edge === 2) y = bounds.height + radius;
  if (edge === 3) x = -radius;
  const target = rule.target ?? { x: bounds.width / 2, y: bounds.height / 2 };
  const angle = Math.atan2(target.y - y, target.x - x) + (random() - 0.5) * number(rule.spreadRadians, 0.8);
  const speed = number(rule.speed, state.baseSpeed) * (0.85 + random() * 0.35);
  return normalizeHazard({
    id: `${rule.id ?? "spawn"}-${state.nextSequence}`,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
    damage: rule.damage ?? 1,
    kind: rule.kind ?? "hazard",
    metadata: rule.metadata ?? {}
  }, state.nextSequence);
}

function initialState(config = {}) {
  const dataset = config.hazardFieldDataset ?? config;
  return {
    id: dataset.id ?? "hazard-field",
    seed: dataset.seed ?? dataset.id ?? "hazard-field",
    elapsedSeconds: 0,
    bounds: normalizeBounds(dataset.bounds),
    baseSpeed: Math.max(0, number(dataset.baseSpeed ?? dataset.speed, 80)),
    maxHazards: Math.max(0, Math.round(number(dataset.maxHazards, 24))),
    spawnRules: dataset.spawnRules ?? [],
    hazards: (dataset.hazards ?? []).map(normalizeHazard),
    nextSequence: 1,
    lastSpawn: null,
    lastCollision: null
  };
}

function updateHazard(hazard, bounds, delta) {
  const next = { ...hazard };
  next.x += next.vx * delta;
  next.y += next.vy * delta;
  const minX = -bounds.padding;
  const minY = -bounds.padding;
  const maxX = bounds.width + bounds.padding;
  const maxY = bounds.height + bounds.padding;
  if (next.x - next.radius < minX || next.x + next.radius > maxX) {
    next.vx *= -1;
    next.x = clamp(next.x, minX + next.radius, maxX - next.radius);
  }
  if (next.y - next.radius < minY || next.y + next.radius > maxY) {
    next.vy *= -1;
    next.y = clamp(next.y, minY + next.radius, maxY - next.radius);
  }
  return next;
}

function hazardFieldSystem(world) {
  const state = world.getResource(HazardFieldState);
  if (!state) return;

  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  const elapsedSeconds = number(state.elapsedSeconds, 0) + delta;
  let hazards = state.hazards.map((hazard) => updateHazard(hazard, state.bounds, delta));
  let nextSequence = Number(state.nextSequence ?? 1);
  let lastSpawn = state.lastSpawn;

  for (const rule of state.spawnRules) {
    const interval = Math.max(0.001, number(rule.intervalSeconds ?? rule.interval, 2));
    const previousCount = Math.floor(state.elapsedSeconds / interval);
    const nextCount = Math.floor(elapsedSeconds / interval);
    for (let count = previousCount; count < nextCount && hazards.length < state.maxHazards; count += 1) {
      const spawned = createSpawn(rule, { ...state, nextSequence });
      nextSequence += 1;
      hazards.push(spawned);
      lastSpawn = spawned;
      world.emit(HazardFieldSpawned, spawned);
    }
  }

  world.setResource(HazardFieldState, { ...state, elapsedSeconds, hazards, nextSequence, lastSpawn });
}

function circleCollisions(state, circle = {}) {
  const x = number(circle.x, 0);
  const y = number(circle.y, 0);
  const radius = Math.max(0, number(circle.radius, 0));
  return (state?.hazards ?? []).filter((hazard) => {
    const dx = hazard.x - x;
    const dy = hazard.y - y;
    return dx * dx + dy * dy <= (hazard.radius + radius) ** 2;
  });
}

export function createHazardFieldKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "hazard-field-kit",
    resources: { HazardFieldState },
    events: { HazardFieldSpawned, HazardFieldCollision },
    systems: [{ phase: "simulate", system: hazardFieldSystem, name: "hazardFieldSystem" }],
    provides: ["hazard-field"],
    initWorld({ world }) {
      world.setResource(HazardFieldState, initialState(config));
    },
    install({ engine }) {
      engine.hazardField = {
        getState() {
          return engine.world.getResource(HazardFieldState);
        },
        setBounds(bounds = {}) {
          const state = engine.world.getResource(HazardFieldState);
          const next = { ...state, bounds: normalizeBounds(bounds) };
          engine.world.setResource(HazardFieldState, next);
          return next;
        },
        checkCircle(circle = {}) {
          const state = engine.world.getResource(HazardFieldState);
          const collisions = circleCollisions(state, circle);
          if (collisions.length) {
            const collision = { circle, hazards: collisions };
            engine.world.emit(HazardFieldCollision, collision);
            engine.world.setResource(HazardFieldState, { ...state, lastCollision: collision });
          }
          return collisions;
        },
        reset() {
          engine.world.setResource(HazardFieldState, initialState(config));
          return engine.world.getResource(HazardFieldState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(HazardFieldState));
        }
      };
    },
    metadata: { purpose: "Generic bounded moving hazard fields, spawn cadence, drift, bounce, and collision queries." }
  });
}

export function queryHazardCircle(state, circle = {}) {
  return circleCollisions(state, circle).map((hazard) => ({ ...hazard }));
}
