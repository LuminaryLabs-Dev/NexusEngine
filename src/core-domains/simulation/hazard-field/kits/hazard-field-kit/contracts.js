import { cloneSerializableState } from "../../../../../foundation/serializable-state.js";
import { sha256Hex } from "../../../../../foundation/sha256.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function randomFor(seed) {
  let state = Number.parseInt(sha256Hex(seed).slice(0, 8), 16) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
}

function normalizeBounds(bounds = {}) {
  const width = finite(bounds.width, "bounds.width", 100);
  const height = finite(bounds.height, "bounds.height", 100);
  const padding = finite(bounds.padding, "bounds.padding", 0);
  if (width <= 0 || height <= 0 || padding < 0) throw new RangeError("Hazard bounds width and height must be positive and padding nonnegative.");
  return { width, height, padding };
}

export function normalizeHazard(hazard = {}, index = 0) {
  const id = String(hazard.id ?? `hazard-${index + 1}`);
  const radius = finite(hazard.radius ?? hazard.size, `${id}.radius`, 10);
  if (radius < 0) throw new RangeError(`Hazard ${id} radius cannot be negative.`);
  return { id, x: finite(hazard.x, `${id}.x`, 0), y: finite(hazard.y, `${id}.y`, 0), vx: finite(hazard.vx, `${id}.vx`, 0), vy: finite(hazard.vy, `${id}.vy`, 0), radius, mass: Math.max(0, finite(hazard.mass, `${id}.mass`, 1)), damage: Math.max(0, finite(hazard.damage, `${id}.damage`, 1)), kind: String(hazard.kind ?? "hazard"), metadata: cloneSerializableState(hazard.metadata ?? {}) };
}

function normalizeRule(rule = {}, index = 0) {
  const id = String(rule.id ?? `spawn-${index + 1}`);
  const intervalSeconds = finite(rule.intervalSeconds ?? rule.interval, `${id}.intervalSeconds`, 2);
  if (intervalSeconds <= 0) throw new RangeError(`Hazard spawn rule ${id} intervalSeconds must be positive.`);
  return { id, intervalSeconds, nextAt: Math.max(0, finite(rule.firstAt, `${id}.firstAt`, intervalSeconds)), radius: Math.max(0, finite(rule.radius, `${id}.radius`, 12)), speed: Math.max(0, finite(rule.speed, `${id}.speed`, 80)), damage: Math.max(0, finite(rule.damage, `${id}.damage`, 1)), spreadRadians: Math.max(0, finite(rule.spreadRadians, `${id}.spreadRadians`, 0.8)), kind: String(rule.kind ?? "hazard"), target: rule.target ? { x: finite(rule.target.x, `${id}.target.x`, 0), y: finite(rule.target.y, `${id}.target.y`, 0) } : null, metadata: cloneSerializableState(rule.metadata ?? {}) };
}

export function normalizeHazardFieldConfig(config = {}) {
  const source = config.hazardFieldDataset ?? config;
  const bounds = normalizeBounds(source.bounds);
  const hazards = (source.hazards ?? []).map(normalizeHazard);
  if (new Set(hazards.map((hazard) => hazard.id)).size !== hazards.length) throw new TypeError("Hazards contain duplicate IDs.");
  const spawnRules = (source.spawnRules ?? []).map(normalizeRule);
  if (new Set(spawnRules.map((rule) => rule.id)).size !== spawnRules.length) throw new TypeError("Hazard spawn rules contain duplicate IDs.");
  return { id: String(source.id ?? "hazard-field"), seed: String(source.seed ?? source.id ?? "hazard-field"), bounds, baseSpeed: Math.max(0, finite(source.baseSpeed ?? source.speed, "baseSpeed", 80)), maxHazards: Math.max(0, Math.floor(finite(source.maxHazards, "maxHazards", 24))), spawnRules, hazards };
}

export function createHazardFieldState(config = {}) {
  const normalized = normalizeHazardFieldConfig(config);
  return { fieldId: normalized.id, seed: normalized.seed, elapsedSeconds: 0, bounds: normalized.bounds, baseSpeed: normalized.baseSpeed, maxHazards: normalized.maxHazards, spawnRules: normalized.spawnRules, hazards: normalized.hazards, nextSequence: 1, lastSpawn: null };
}

function spawnHazard(rule, state) {
  const random = randomFor(`${state.seed}:${state.nextSequence}:${rule.id}`);
  const edge = Math.floor(random() * 4);
  const radius = rule.radius;
  let x = random() * state.bounds.width;
  let y = random() * state.bounds.height;
  if (edge === 0) y = radius;
  if (edge === 1) x = state.bounds.width - radius;
  if (edge === 2) y = state.bounds.height - radius;
  if (edge === 3) x = radius;
  const target = rule.target ?? { x: state.bounds.width / 2, y: state.bounds.height / 2 };
  const angle = Math.atan2(target.y - y, target.x - x) + (random() - 0.5) * rule.spreadRadians;
  return normalizeHazard({ id: `${rule.id}-${state.nextSequence}`, x, y, vx: Math.cos(angle) * rule.speed, vy: Math.sin(angle) * rule.speed, radius, damage: rule.damage, kind: rule.kind, metadata: rule.metadata }, state.nextSequence);
}

function moveHazard(source, bounds, delta) {
  const next = { ...source, x: source.x + source.vx * delta, y: source.y + source.vy * delta };
  const minX = bounds.padding + next.radius;
  const maxX = bounds.width - bounds.padding - next.radius;
  const minY = bounds.padding + next.radius;
  const maxY = bounds.height - bounds.padding - next.radius;
  if (minX > maxX || minY > maxY) throw new RangeError(`Hazard ${next.id} does not fit within current bounds.`);
  if (next.x < minX || next.x > maxX) { next.vx *= -1; next.x = clamp(next.x, minX, maxX); }
  if (next.y < minY || next.y > maxY) { next.vy *= -1; next.y = clamp(next.y, minY, maxY); }
  return next;
}

export function advanceHazardField(state = {}, command = {}) {
  const delta = finite(command.delta, "delta", 0);
  if (delta < 0) throw new RangeError("Hazard Field delta cannot be negative.");
  const elapsedSeconds = state.elapsedSeconds + delta;
  const hazards = state.hazards.map((hazard) => moveHazard(hazard, state.bounds, delta));
  const ids = new Set(hazards.map((hazard) => hazard.id));
  const spawned = [];
  let nextSequence = state.nextSequence;
  const spawnRules = state.spawnRules.map((source) => {
    const rule = { ...source };
    while (elapsedSeconds >= rule.nextAt && hazards.length < state.maxHazards) {
      const hazard = spawnHazard(rule, { ...state, nextSequence });
      if (ids.has(hazard.id)) throw new TypeError(`Generated hazard id ${hazard.id} collides with existing state.`);
      ids.add(hazard.id);
      hazards.push(hazard);
      spawned.push(hazard);
      nextSequence += 1;
      rule.nextAt += rule.intervalSeconds;
    }
    return rule;
  });
  return { elapsedSeconds, hazards, spawnRules, nextSequence, spawned };
}

export function queryHazardCircle(state = {}, circle = {}) {
  const x = finite(circle.x, "circle.x", 0);
  const y = finite(circle.y, "circle.y", 0);
  const radius = finite(circle.radius, "circle.radius", 0);
  if (radius < 0) throw new RangeError("Collision radius cannot be negative.");
  return state.hazards.filter((hazard) => Math.hypot(hazard.x - x, hazard.y - y) <= hazard.radius + radius).sort((left, right) => left.id.localeCompare(right.id)).map(cloneSerializableState);
}
