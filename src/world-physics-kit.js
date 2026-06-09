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

export function createWorldPhysicsKit(options = {}) {
  const resources = {
    WorldPhysicsInput: defineResource("world-physics-input"),
    WorldPhysicsState: defineResource("world-physics-state")
  };

  const events = {
    BoundaryHit: defineEvent("world-boundary-hit"),
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
    const state = world.getResource(resources.WorldPhysicsState);
    if (!player || !state) return;

    const delta = world.__nexusClock?.delta ?? 1 / 60;
    const bounds = normalizeBounds(player.bounds ? { minX: -player.bounds, maxX: player.bounds, minZ: -player.bounds, maxZ: player.bounds } : fallbackBounds, fallbackBounds);
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
    const slope = 1 - clamp(normal.y ?? 1, 0, 1);
    const tooSteep = slope > slopeLimit && !player.isGliding;
    const targetY = groundHeight + groundOffset + (player.isGliding ? glideHover : 0);

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

    if (position.y < killY) {
      world.emit(events.SoftRespawn, { reason: "fall", position: { ...position } });
      softRespawn(world, player, state, "fall");
      return;
    }

    state.groundHeight = groundHeight;
    state.grounded = Math.abs(position.y - targetY) < 0.18;
    state.normal = { x: normal.x ?? 0, y: normal.y ?? 1, z: normal.z ?? 0 };
    state.slope = slope;
    state.zone = zoneForPosition(position, bounds);
    state.step += 1;
    state.distanceFromRespawn = distance2(position, respawnPoint);
    state.worldBounds = { ...bounds };
    state.playerPosition = { x: position.x, y: position.y, z: position.z };
  }

  return defineRuntimeKit({
    id: options.id ?? "world-physics-kit",
    resources,
    events,
    systems: [{ phase: "simulate", name: "WorldPhysicsSystem", system: physicsSystem }],
    initWorld({ world }) {
      world.setResource(resources.WorldPhysicsInput, {
        glideHover,
        groundOffset,
        killY,
        slopeLimit
      });
      world.setResource(resources.WorldPhysicsState, {
        blockedBySlope: false,
        distanceFromRespawn: 0,
        groundHeight: 0,
        grounded: false,
        lastSafeGroundHeight: 0,
        lastSafePosition: { ...respawnPoint },
        normal: { x: 0, y: 1, z: 0 },
        outOfBounds: false,
        playerPosition: { ...respawnPoint },
        respawns: 0,
        slope: 0,
        step: 0,
        worldBounds: { ...fallbackBounds },
        zone: zoneForPosition(respawnPoint, fallbackBounds)
      });
    },
    metadata: {
      domain: "movement",
      reusable: true,
      terrainAware: true
    }
  });
}
