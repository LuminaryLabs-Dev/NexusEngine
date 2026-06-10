import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeBounds(bounds, fallback) {
  if (typeof bounds === "number") {
    const size = Math.abs(bounds);
    return { minX: -size, maxX: size, minZ: -size, maxZ: size };
  }
  if (!bounds || typeof bounds !== "object") {
    return { ...fallback };
  }
  return {
    minX: number(bounds.minX, fallback.minX),
    maxX: number(bounds.maxX, fallback.maxX),
    minZ: number(bounds.minZ, fallback.minZ),
    maxZ: number(bounds.maxZ, fallback.maxZ)
  };
}

function distance2(a, b) {
  return Math.hypot(number(a.x) - number(b.x), number(a.z) - number(b.z));
}

function zoneForPosition(position, bounds) {
  const x = number(position.x);
  const z = number(position.z);
  const east = bounds.maxX - x;
  const west = x - bounds.minX;
  const north = bounds.maxZ - z;
  const south = z - bounds.minZ;

  if (x > bounds.maxX * 0.42 && z < bounds.minZ * 0.15) return "rift basin";
  if (x > bounds.maxX * 0.2 && z < bounds.maxZ * 0.45) return "shrine approach";
  if (x > bounds.minX * 0.15 && z < bounds.maxZ * 0.63 && z > bounds.minZ * 0.2) return "sentinel basin";
  if (x > bounds.minX * 0.35 && x < bounds.maxX * 0.1 && z > bounds.maxZ * 0.35) return "relic trail";
  if (west < 40 && north < 40) return "outer overlook";
  if (east < 40 && north < 40) return "outer overlook";
  if (south < 24) return "lowland rim";
  return "outer ring";
}

export function createPhysicsKit(options = {}) {
  const PhysicsInput = defineResource("physics-input");
  const PhysicsState = defineResource("physics-state");
  const resources = {
    PhysicsInput,
    PhysicsState,
    WorldPhysicsInput: PhysicsInput,
    WorldPhysicsState: PhysicsState
  };

  const events = {
    BoundaryHit: defineEvent("world-boundary-hit"),
    GroundContactChanged: defineEvent("physics-ground-contact-changed"),
    Impact: defineEvent("physics-impact"),
    StabilityChanged: defineEvent("physics-stability-changed"),
    SlopeBlocked: defineEvent("world-slope-blocked"),
    SoftRespawn: defineEvent("world-soft-respawn")
  };

  const fallbackBounds = normalizeBounds(options.worldBounds ?? 120, { minX: -120, maxX: 120, minZ: -120, maxZ: 120 });
  const playerStateResource = options.playerStateResource ?? null;
  const terrainQueryResource = options.terrainQueryResource ?? null;
  const groundOffset = number(options.groundOffset, 1.25);
  const glideHover = number(options.glideHover, 1.1);
  const killY = number(options.killY, -40);
  const slopeLimit = number(options.slopeLimit, 0.66);
  const snapSpeed = Math.max(0.5, number(options.snapSpeed, 8));
  const respawnPoint = {
    x: number(options.respawnPoint?.x, fallbackBounds.minX + 12),
    y: number(options.respawnPoint?.y, 0),
    z: number(options.respawnPoint?.z, fallbackBounds.maxZ - 12)
  };

  function getTerrainHeight(world, x, z) {
    const terrainQuery = terrainQueryResource ? world.getResource(terrainQueryResource) : null;
    return terrainQuery?.heightAt?.(x, z) ?? 0;
  }

  function getTerrainNormal(world, x, z) {
    const terrainQuery = terrainQueryResource ? world.getResource(terrainQueryResource) : null;
    return terrainQuery?.normalAt?.(x, z) ?? { x: 0, y: 1, z: 0 };
  }

  function getSurface(world, x, z) {
    const terrainQuery = terrainQueryResource ? world.getResource(terrainQueryResource) : null;
    return terrainQuery?.surfaceAt?.(x, z) ?? {
      material: "default",
      traction: 0.8,
      slipperiness: 0.2,
      stability: 0.75,
      impactHardness: 0.4,
      climbable: false,
      slide: false,
      fallZone: false,
      slope: 0
    };
  }

  function softRespawn(world, player, state, reason) {
    const height = getTerrainHeight(world, respawnPoint.x, respawnPoint.z);
    player.position.x = respawnPoint.x;
    player.position.z = respawnPoint.z;
    player.position.y = height + groundOffset;
    state.respawns += 1;
    state.grounded = true;
    state.outOfBounds = false;
    state.blockedBySlope = false;
    state.lastSafePosition = { x: player.position.x, y: player.position.y, z: player.position.z };
    state.lastSafeGroundHeight = height;
    state.zone = zoneForPosition(player.position, fallbackBounds);
    world.emit(events.SoftRespawn, { reason, position: { ...player.position } });
  }

  function physicsSystem(world) {
    const player = playerStateResource ? world.getResource(playerStateResource) : null;
    const input = world.getResource(resources.PhysicsInput) ?? {};
    const state = world.getResource(resources.PhysicsState);
    if (!player || !state) return;

    const delta = world.__nexusClock?.delta ?? 1 / 60;
    const bounds = normalizeBounds(player.worldBounds ?? player.bounds ?? fallbackBounds, fallbackBounds);
    const position = player.position ?? (player.position = { x: 0, y: 0, z: 0 });

    if (
      position.x < bounds.minX ||
      position.x > bounds.maxX ||
      position.z < bounds.minZ ||
      position.z > bounds.maxZ
    ) {
      state.outOfBounds = true;
      world.emit(events.BoundaryHit, { position: { ...position } });
      softRespawn(world, player, state, "boundary");
      return;
    }

    const groundHeight = getTerrainHeight(world, position.x, position.z);
    const normal = getTerrainNormal(world, position.x, position.z);
    const surface = getSurface(world, position.x, position.z);
    const slope = 1 - clamp(normal.y ?? 1, 0, 1);
    const effectiveSlopeLimit = number(input.slopeLimit, slopeLimit);
    const effectiveGroundOffset = number(input.groundOffset, groundOffset);
    const effectiveGlideHover = number(input.glideHover, glideHover);
    const tooSteep = (surface.fallZone || slope > effectiveSlopeLimit) && !player.isGliding;
    const targetY = groundHeight + effectiveGroundOffset + (player.isGliding ? effectiveGlideHover : 0);
    const previousGrounded = state.grounded;
    const previousStability = number(state.stability, 1);
    const previousY = number(state.playerPosition?.y, position.y);
    const verticalSpeed = delta > 0 ? (position.y - previousY) / delta : 0;
    const mass = Math.max(0.01, number(input.mass, number(state.rigidBody?.mass, options.mass ?? 1)));
    const carriedMass = Math.max(0, number(input.carriedMass, number(state.carried?.mass, options.carriedMass ?? 0)));
    const totalMass = mass + carriedMass;

    if (tooSteep && state.lastSafePosition) {
      position.x += (state.lastSafePosition.x - position.x) * 0.35;
      position.z += (state.lastSafePosition.z - position.z) * 0.35;
      world.emit(events.SlopeBlocked, { slope, position: { ...position } });
      state.blockedBySlope = true;
    } else {
      state.blockedBySlope = false;
      state.lastSafePosition = { x: position.x, y: targetY, z: position.z };
      state.lastSafeGroundHeight = groundHeight;
    }

    position.y += (targetY - position.y) * clamp(delta * snapSpeed, 0, 1);
    const grounded = Math.abs(position.y - targetY) < 0.18;
    const impactForce = grounded && !previousGrounded
      ? Math.max(0, -verticalSpeed) * totalMass * number(surface.impactHardness, 0.4)
      : 0;
    const stabilityLoss = clamp(
      slope * 0.18 + number(surface.slipperiness, 0.2) * 0.08 + impactForce * 0.012,
      0,
      0.45
    );
    const stabilityRecovery = number(surface.stability, 0.75) * delta * 0.32;
    state.stability = clamp(previousStability - stabilityLoss + stabilityRecovery, 0, 1);

    if (grounded !== previousGrounded) {
      world.emit(events.GroundContactChanged, { grounded, position: { ...position }, surface });
    }
    if (impactForce > number(input.impactThreshold, options.impactThreshold ?? 2.5)) {
      world.emit(events.Impact, { force: impactForce, position: { ...position }, surface });
    }
    if (Math.abs(state.stability - previousStability) > 0.08) {
      world.emit(events.StabilityChanged, { stability: state.stability, previous: previousStability, surface });
    }

    if (position.y < killY) {
      world.emit(events.SoftRespawn, { reason: "fall", position: { ...position } });
      softRespawn(world, player, state, "fall");
      return;
    }

    state.groundHeight = groundHeight;
    state.grounded = grounded;
    state.contact = {
      grounded,
      groundHeight,
      normal: { x: normal.x ?? 0, y: normal.y ?? 1, z: normal.z ?? 0 },
      surface,
      slope,
      traction: number(surface.traction, 0.8),
      friction: number(surface.traction, 0.8),
      impactForce
    };
    state.carried = {
      mass: carriedMass,
      stability: state.stability,
      constrained: Boolean(input.constrained ?? options.constrained)
    };
    state.rigidBody = {
      mass,
      damping: number(input.damping, options.damping ?? 0.08),
      velocity: { ...(player.velocity ?? { x: 0, y: verticalSpeed, z: 0 }) }
    };
    state.fall = {
      active: Boolean(surface.fallZone || position.y < killY),
      zone: surface.fallZone?.id ?? null,
      classification: surface.fallZone ? "fall-zone" : (position.y < killY ? "kill-y" : "none")
    };
    state.normal = { x: normal.x ?? 0, y: normal.y ?? 1, z: normal.z ?? 0 };
    state.slope = slope;
    state.surface = surface;
    state.zone = zoneForPosition(position, bounds);
    state.step += 1;
    state.distanceFromRespawn = distance2(position, respawnPoint);
    state.worldBounds = { ...bounds };
    state.playerPosition = { x: position.x, y: position.y, z: position.z };
  }

  return defineRuntimeKit({
    id: options.id ?? "physics-kit",
    resources,
    events,
    systems: [{ phase: "simulate", name: "PhysicsSystem", system: physicsSystem }],
    initWorld({ world }) {
      world.setResource(resources.PhysicsInput, {
        carriedMass: options.carriedMass ?? 0,
        constrained: options.constrained ?? false,
        damping: options.damping ?? 0.08,
        glideHover,
        groundOffset,
        impactThreshold: options.impactThreshold ?? 2.5,
        killY,
        mass: options.mass ?? 1,
        slopeLimit
      });
      world.setResource(resources.PhysicsState, {
        blockedBySlope: false,
        carried: { mass: options.carriedMass ?? 0, stability: 1, constrained: options.constrained ?? false },
        contact: {
          grounded: false,
          groundHeight: 0,
          impactForce: 0,
          friction: 0.8,
          normal: { x: 0, y: 1, z: 0 },
          slope: 0,
          surface: null,
          traction: 0.8
        },
        distanceFromRespawn: 0,
        fall: { active: false, classification: "none", zone: null },
        groundHeight: 0,
        grounded: false,
        lastSafeGroundHeight: 0,
        lastSafePosition: { ...respawnPoint },
        normal: { x: 0, y: 1, z: 0 },
        outOfBounds: false,
        playerPosition: { ...respawnPoint },
        respawns: 0,
        rigidBody: { mass: options.mass ?? 1, damping: options.damping ?? 0.08, velocity: { x: 0, y: 0, z: 0 } },
        slope: 0,
        stability: 1,
        surface: null,
        step: 0,
        worldBounds: { ...fallbackBounds },
        zone: zoneForPosition(respawnPoint, fallbackBounds)
      });
    },
    metadata: {
      domain: "physics",
      contactResolution: true,
      stability: true,
      carryMass: true,
      reusable: true,
      terrainAware: true
    }
  });
}

export function createWorldPhysicsKit(options = {}) {
  return createPhysicsKit({ id: options.id ?? "world-physics-kit", ...options });
}
