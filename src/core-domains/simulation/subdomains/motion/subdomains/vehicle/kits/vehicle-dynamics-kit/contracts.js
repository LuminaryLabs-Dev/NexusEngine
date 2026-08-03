import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function nonnegative(value, label, fallback) {
  const next = finite(value, label, fallback);
  if (next < 0) throw new RangeError(`${label} cannot be negative.`);
  return next;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function normalizeVehicleDynamicsConfig(config = {}) {
  const profile = config.profile ?? {};
  const boostMax = nonnegative(config.boost?.max, "boost.max", 100);
  return {
    vehicleId: String(config.vehicleId ?? config.id ?? "vehicle"),
    profile: {
      type: String(profile.type ?? "vehicle"),
      acceleration: nonnegative(profile.acceleration, "profile.acceleration", 90),
      maxSpeed: nonnegative(profile.maxSpeed, "profile.maxSpeed", 150),
      turnRate: nonnegative(profile.turnRate, "profile.turnRate", 5),
      drag: nonnegative(profile.drag, "profile.drag", 0.9),
      boostMultiplier: Math.max(1, finite(profile.boostMultiplier, "profile.boostMultiplier", 1.6)),
      boostDrainPerSecond: nonnegative(profile.boostDrainPerSecond, "profile.boostDrainPerSecond", 18),
      boostRecoverPerSecond: nonnegative(profile.boostRecoverPerSecond, "profile.boostRecoverPerSecond", 12),
      impactDamping: clamp(finite(profile.impactDamping, "profile.impactDamping", 0.55), 0, 1)
    },
    start: {
      x: finite(config.start?.x, "start.x", 0),
      y: finite(config.start?.y, "start.y", 0),
      z: finite(config.start?.z, "start.z", 0),
      vx: finite(config.start?.vx, "start.vx", 0),
      vy: finite(config.start?.vy, "start.vy", 0),
      vz: finite(config.start?.vz, "start.vz", 0),
      heading: finite(config.start?.heading, "start.heading", -Math.PI / 2)
    },
    boost: { max: boostMax, start: clamp(finite(config.boost?.start, "boost.start", boostMax), 0, boostMax) },
    bounds: {
      minX: finite(config.bounds?.minX, "bounds.minX", 0),
      maxX: finite(config.bounds?.maxX, "bounds.maxX", 100),
      minZ: finite(config.bounds?.minZ, "bounds.minZ", 0),
      maxZ: finite(config.bounds?.maxZ, "bounds.maxZ", 100)
    }
  };
}

export function createVehicleDynamicsState(config = {}) {
  const normalized = normalizeVehicleDynamicsConfig(config);
  if (normalized.bounds.minX > normalized.bounds.maxX || normalized.bounds.minZ > normalized.bounds.maxZ) {
    throw new RangeError("Vehicle bounds minimums cannot exceed maximums.");
  }
  return {
    vehicleId: normalized.vehicleId,
    profile: normalized.profile,
    position: { x: normalized.start.x, y: normalized.start.y, z: normalized.start.z },
    velocity: { x: normalized.start.vx, y: normalized.start.vy, z: normalized.start.vz },
    heading: normalized.start.heading,
    boost: { value: normalized.boost.start, max: normalized.boost.max, active: false },
    bounds: normalized.bounds,
    sequence: 0,
    lastInput: { x: 0, z: 0, boost: false },
    lastImpact: null,
    lastFrame: null
  };
}

export function advanceVehicleDynamics(state = {}, command = {}) {
  const delta = nonnegative(command.delta, "delta", 1 / 60);
  const input = command.input ?? command;
  const axisX = clamp(finite(input.x, "input.x", 0), -1, 1);
  const axisZ = clamp(finite(input.z ?? input.y, "input.z", 0), -1, 1);
  const axisLength = Math.hypot(axisX, axisZ);
  const profile = state.profile;
  const boost = cloneSerializableState(state.boost);
  const wantsBoost = input.boost === true && boost.max > 0 && boost.value > 0;
  const multiplier = wantsBoost ? profile.boostMultiplier : 1;
  let vx = finite(state.velocity?.x, "state.velocity.x", 0);
  let vy = finite(state.velocity?.y, "state.velocity.y", 0);
  let vz = finite(state.velocity?.z, "state.velocity.z", 0);
  if (axisLength > 0) {
    vx += (axisX / axisLength) * profile.acceleration * multiplier * delta;
    vz += (axisZ / axisLength) * profile.acceleration * multiplier * delta;
  }
  for (const force of command.forces ?? []) {
    vx += finite(force.x, "force.x", 0) * delta;
    vy += finite(force.y, "force.y", 0) * delta;
    vz += finite(force.z, "force.z", 0) * delta;
  }
  boost.value = wantsBoost
    ? clamp(boost.value - profile.boostDrainPerSecond * delta, 0, boost.max)
    : clamp(boost.value + profile.boostRecoverPerSecond * delta, 0, boost.max);
  boost.active = wantsBoost;
  const dragMultiplier = nonnegative(command.dragMultiplier, "dragMultiplier", 1);
  const drag = Math.max(0, 1 - profile.drag * dragMultiplier * delta);
  vx *= drag;
  vy *= drag;
  vz *= drag;
  const speed = Math.hypot(vx, vy, vz);
  const maxSpeed = profile.maxSpeed * multiplier;
  if (speed > maxSpeed && speed > 0) {
    vx = (vx / speed) * maxSpeed;
    vy = (vy / speed) * maxSpeed;
    vz = (vz / speed) * maxSpeed;
  }
  const previous = state.position;
  const position = {
    x: finite(previous.x, "state.position.x", 0) + vx * delta,
    y: finite(previous.y, "state.position.y", 0) + vy * delta,
    z: finite(previous.z, "state.position.z", 0) + vz * delta
  };
  const bounds = state.bounds;
  const impacted = position.x < bounds.minX || position.x > bounds.maxX || position.z < bounds.minZ || position.z > bounds.maxZ;
  let impact = null;
  if (impacted) {
    position.x = clamp(position.x, bounds.minX, bounds.maxX);
    position.z = clamp(position.z, bounds.minZ, bounds.maxZ);
    vx *= -profile.impactDamping;
    vz *= -profile.impactDamping;
    impact = { source: "bounds", position: cloneSerializableState(position), speed };
  }
  const heading = Math.hypot(vx, vz) > 1e-6 ? Math.atan2(vz, vx) : state.heading;
  return {
    schema: "nexusengine.vehicle-dynamics-frame/1",
    vehicleId: state.vehicleId,
    sequence: Number(state.sequence ?? 0) + 1,
    position,
    velocity: { x: vx, y: vy, z: vz },
    heading,
    boost,
    input: { x: axisX, z: axisZ, boost: input.boost === true },
    impact
  };
}
