import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function vector(value = {}, label = "vector", fallback = {}) {
  return {
    x: finite(value.x, `${label}.x`, fallback.x ?? 0),
    y: finite(value.y, `${label}.y`, fallback.y ?? 0),
    z: finite(value.z, `${label}.z`, fallback.z ?? 0)
  };
}

export function normalizeWorldContactConfig(config = {}) {
  const bounds = {
    minX: finite(config.bounds?.minX, "bounds.minX", -120),
    maxX: finite(config.bounds?.maxX, "bounds.maxX", 120),
    minZ: finite(config.bounds?.minZ, "bounds.minZ", -120),
    maxZ: finite(config.bounds?.maxZ, "bounds.maxZ", 120)
  };
  if (bounds.minX > bounds.maxX || bounds.minZ > bounds.maxZ) throw new RangeError("World Contact bounds minimums cannot exceed maximums.");
  return {
    bounds,
    groundOffset: finite(config.groundOffset, "groundOffset", 1.25),
    killY: finite(config.killY, "killY", -40),
    slopeLimit: clamp(finite(config.slopeLimit, "slopeLimit", 0.66), 0, 1),
    impactThreshold: Math.max(0, finite(config.impactThreshold, "impactThreshold", 2.5))
  };
}

export function createWorldContactState(config = {}) {
  const normalized = normalizeWorldContactConfig(config);
  return {
    bounds: normalized.bounds,
    grounded: false,
    stability: 1,
    contact: null,
    correction: null,
    recoveryRequired: null,
    sequence: 0,
    lastResult: null
  };
}

export function resolveWorldContact(state = {}, command = {}, rawConfig = {}) {
  const config = normalizeWorldContactConfig({ ...rawConfig, bounds: command.bounds ?? state.bounds ?? rawConfig.bounds });
  const body = command.body ?? {};
  const position = vector(body.position, "body.position");
  const velocity = vector(body.velocity, "body.velocity");
  const sample = command.sample ?? {};
  const groundHeight = finite(sample.groundHeight, "sample.groundHeight", 0);
  const normal = vector(sample.normal, "sample.normal", { x: 0, y: 1, z: 0 });
  const surface = cloneSerializableState(sample.surface ?? {});
  const outside = position.x < config.bounds.minX || position.x > config.bounds.maxX || position.z < config.bounds.minZ || position.z > config.bounds.maxZ;
  const belowKillY = position.y < config.killY;
  const recoveryRequired = outside || belowKillY
    ? { reason: outside ? "boundary" : "fall", position: cloneSerializableState(position) }
    : null;
  const slope = 1 - clamp(normal.y, 0, 1);
  const blockedBySlope = !recoveryRequired && (surface.fallZone === true || slope > config.slopeLimit);
  const targetY = groundHeight + config.groundOffset;
  const previousGrounded = state.grounded === true;
  const grounded = !recoveryRequired && !blockedBySlope && position.y <= targetY && velocity.y <= 0;
  const correctedPosition = cloneSerializableState(position);
  const correctedVelocity = cloneSerializableState(velocity);
  if (grounded) {
    correctedPosition.y = targetY;
    correctedVelocity.y = 0;
  }
  const mass = Math.max(0.01, finite(body.mass, "body.mass", 1));
  const impactForce = grounded && !previousGrounded ? Math.max(0, -velocity.y) * mass * Math.max(0, finite(surface.impactHardness, "surface.impactHardness", 0.4)) : 0;
  const stability = clamp(finite(state.stability, "state.stability", 1) - slope * 0.18 - impactForce * 0.012 + Math.max(0, finite(surface.stability, "surface.stability", 0.75)) * 0.01, 0, 1);
  const correction = {
    schema: "nexusengine.world-contact-correction/1",
    bodyId: String(body.id ?? "body"),
    position: correctedPosition,
    velocity: correctedVelocity,
    blockedBySlope,
    recoveryRequired
  };
  const contact = {
    schema: "nexusengine.world-contact/1",
    bodyId: correction.bodyId,
    grounded,
    groundHeight,
    normal,
    slope,
    surface,
    traction: Math.max(0, finite(surface.traction, "surface.traction", 0.8)),
    impactForce,
    stability
  };
  return {
    schema: "nexusengine.world-contact-result/1",
    sequence: Number(state.sequence ?? 0) + 1,
    contact,
    correction,
    recoveryRequired,
    transitions: [
      ...(grounded !== previousGrounded ? [grounded ? "contact-started" : "contact-ended"] : []),
      ...(impactForce > config.impactThreshold ? ["impact"] : []),
      ...(recoveryRequired ? ["recovery-required"] : [])
    ]
  };
}
