import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function resultOf(value) {
  return value?.result ?? value;
}

export function createVehicleWaterResponse(input = {}) {
  const frame = cloneSerializableState(input.vehicleFrame ?? input.frame);
  const water = cloneSerializableState(resultOf(input.waterQuery ?? input.water));
  if (!frame?.velocity) throw new TypeError("Vehicle Water Response requires a vehicle frame with velocity.");
  if (!water || typeof water !== "object") throw new TypeError("Vehicle Water Response requires a Water Surface query result.");
  const delta = Math.max(0, finite(input.delta, "delta", 1 / 60));
  const drag = Math.max(0, finite(water.drag, "water.drag", 0));
  const depth = Math.max(0, finite(water.depth, "water.depth", 0));
  const wave = finite(water.wave, "water.wave", 0);
  const buoyancyCoefficient = Math.max(0, finite(input.buoyancyCoefficient, "buoyancyCoefficient", 1));
  const dragFactor = 1 / (1 + drag * delta);
  const buoyancy = depth > 0 ? Math.max(0, depth + wave) * buoyancyCoefficient : 0;
  const current = { x: finite(water.current?.x, "water.current.x", 0), z: finite(water.current?.y ?? water.current?.z, "water.current.z", 0) };
  return cloneSerializableState({
    schema: "nexusengine.vehicle-water-response/1",
    vehicleId: String(frame.vehicleId ?? frame.id ?? "vehicle"),
    submerged: depth > 0,
    velocity: {
      x: finite(frame.velocity.x, "frame.velocity.x", 0) * dragFactor + current.x * delta,
      y: finite(frame.velocity.y, "frame.velocity.y", 0) * dragFactor + buoyancy * delta,
      z: finite(frame.velocity.z, "frame.velocity.z", 0) * dragFactor + current.z * delta
    },
    forces: { drag, buoyancy, current },
    water: { depth, wave, zones: cloneSerializableState(water.zones ?? []), hazards: cloneSerializableState(water.hazards ?? []) }
  });
}
