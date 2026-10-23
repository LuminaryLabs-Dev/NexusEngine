import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";
import { queryWaterSurface, WaterSurfaceState } from "./water-surface-kit.js";

export const VehicleDynamicsState = defineResource("vehicle.dynamicsState");
export const VehicleDynamicsInput = defineEvent("vehicle.dynamicsInput");
export const VehicleImpact = defineEvent("vehicle.impact");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeProfile(profile = {}) {
  return {
    type: profile.type ?? "watercraft",
    acceleration: Math.max(0, number(profile.acceleration, 90)),
    maxSpeed: Math.max(0, number(profile.maxSpeed, 150)),
    turnRate: Math.max(0, number(profile.turnRate, 5)),
    drag: Math.max(0, number(profile.drag, 0.9)),
    boostMultiplier: Math.max(1, number(profile.boostMultiplier, 1.6)),
    boostDrainPerSecond: Math.max(0, number(profile.boostDrainPerSecond, 18)),
    boostRecoverPerSecond: Math.max(0, number(profile.boostRecoverPerSecond, 12)),
    impactDamping: clamp(number(profile.impactDamping, 0.55), 0, 1)
  };
}

function initialState(config = {}) {
  const start = config.start ?? {};
  return {
    id: config.id ?? "vehicle-dynamics",
    profile: normalizeProfile(config.profile),
    position: { x: number(start.x, 0), y: number(start.y, 0) },
    velocity: { x: number(start.vx, 0), y: number(start.vy, 0) },
    heading: number(start.heading, -Math.PI / 2),
    boost: {
      value: number(config.boost?.start, 100),
      max: number(config.boost?.max, 100),
      active: false
    },
    bounds: {
      width: Math.max(1, number(config.bounds?.width, 100)),
      height: Math.max(1, number(config.bounds?.height, 100)),
      padding: Math.max(0, number(config.bounds?.padding, 0))
    },
    lastInput: { x: 0, y: 0, boost: false },
    lastSurface: null,
    lastImpact: null
  };
}

function vehicleDynamicsSystem(world) {
  const state = world.getResource(VehicleDynamicsState);
  if (!state) return;
  const delta = Math.max(0, number(world.__nexusClock?.delta, 0));
  const inputs = world.readEvents(VehicleDynamicsInput);
  const input = inputs.length ? inputs[inputs.length - 1] : state.lastInput;
  const profile = state.profile;
  const surface = queryWaterSurface(world.getResource(WaterSurfaceState), state.position);
  let vx = number(state.velocity.x, 0) + surface.current.x * delta;
  let vy = number(state.velocity.y, 0) + surface.current.y * delta;
  const axisX = clamp(number(input.x, 0), -1, 1);
  const axisY = clamp(number(input.y, 0), -1, 1);
  const axisLength = Math.hypot(axisX, axisY);
  let boost = { ...state.boost, active: false };
  const wantsBoost = input.boost === true && boost.value > 0;
  const accel = profile.acceleration * (wantsBoost ? profile.boostMultiplier : 1);
  if (axisLength > 0) {
    const nx = axisX / axisLength;
    const ny = axisY / axisLength;
    vx += nx * accel * delta;
    vy += ny * accel * delta;
  }
  if (wantsBoost) {
    boost.value = clamp(boost.value - profile.boostDrainPerSecond * delta, 0, boost.max);
    boost.active = true;
  } else {
    boost.value = clamp(boost.value + profile.boostRecoverPerSecond * delta, 0, boost.max);
  }
  const drag = Math.max(0, profile.drag * number(surface.drag, 1));
  vx *= Math.max(0, 1 - drag * delta);
  vy *= Math.max(0, 1 - drag * delta);
  const speed = Math.hypot(vx, vy);
  const maxSpeed = profile.maxSpeed * (wantsBoost ? profile.boostMultiplier : 1);
  if (speed > maxSpeed && speed > 0) {
    vx = (vx / speed) * maxSpeed;
    vy = (vy / speed) * maxSpeed;
  }
  let x = state.position.x + vx * delta;
  let y = state.position.y + vy * delta;
  const minX = -state.bounds.padding;
  const minY = -state.bounds.padding;
  const maxX = state.bounds.width + state.bounds.padding;
  const maxY = state.bounds.height + state.bounds.padding;
  let lastImpact = state.lastImpact;
  if (x < minX || x > maxX || y < minY || y > maxY) {
    x = clamp(x, minX, maxX);
    y = clamp(y, minY, maxY);
    vx *= -profile.impactDamping;
    vy *= -profile.impactDamping;
    lastImpact = { x, y, source: "bounds", speed };
    world.emit(VehicleImpact, lastImpact);
  }
  const heading = Math.hypot(vx, vy) > 0.01 ? Math.atan2(vy, vx) : state.heading;
  world.setResource(VehicleDynamicsState, {
    ...state,
    position: { x, y },
    velocity: { x: vx, y: vy },
    heading,
    boost,
    lastInput: { x: axisX, y: axisY, boost: input.boost === true },
    lastSurface: surface,
    lastImpact
  });
}

export function createVehicleDynamicsKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "vehicle-dynamics-kit",
    resources: { VehicleDynamicsState },
    events: { VehicleDynamicsInput, VehicleImpact },
    systems: [{ phase: "simulate", system: vehicleDynamicsSystem, name: "vehicleDynamicsSystem" }],
    provides: ["vehicle-dynamics"],
    initWorld({ world }) {
      world.setResource(VehicleDynamicsState, initialState(config));
    },
    install({ engine }) {
      engine.vehicleDynamics = {
        getState() {
          return engine.world.getResource(VehicleDynamicsState);
        },
        input(input = {}) {
          engine.world.emit(VehicleDynamicsInput, input);
          return engine.world.getResource(VehicleDynamicsState);
        },
        setBounds(bounds = {}) {
          const state = engine.world.getResource(VehicleDynamicsState);
          engine.world.setResource(VehicleDynamicsState, {
            ...state,
            bounds: {
              width: Math.max(1, number(bounds.width, state.bounds.width)),
              height: Math.max(1, number(bounds.height, state.bounds.height)),
              padding: Math.max(0, number(bounds.padding, state.bounds.padding))
            }
          });
          return engine.world.getResource(VehicleDynamicsState);
        },
        reset() {
          engine.world.setResource(VehicleDynamicsState, initialState(config));
          return engine.world.getResource(VehicleDynamicsState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(VehicleDynamicsState));
        }
      };
    },
    metadata: { purpose: "Generic vehicle motion profiles, surface response, boost, bounds, and impact state." }
  });
}
