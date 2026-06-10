import { defineComponent, defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeVector(x, z) {
  const length = Math.hypot(x, z);
  if (length === 0) {
    return { x: 0, z: 0 };
  }
  return { x: x / length, z: z / length };
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

function zoneForPosition(position, bounds) {
  const x = number(position?.x);
  const z = number(position?.z);
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

function sampleGroundHeight(environment, x, z) {
  if (typeof environment?.groundHeightAt === "function") {
    return number(environment.groundHeightAt(x, z));
  }
  if (environment?.terrainQuery && typeof environment.terrainQuery.heightAt === "function") {
    return number(environment.terrainQuery.heightAt(x, z));
  }
  return number(environment?.groundHeight, 0);
}

function sampleNormal(environment, x, z) {
  if (typeof environment?.normalAt === "function") {
    const next = environment.normalAt(x, z) ?? {};
    return {
      x: number(next.x, 0),
      y: number(next.y, 1),
      z: number(next.z, 0)
    };
  }
  if (environment?.terrainQuery && typeof environment.terrainQuery.normalAt === "function") {
    const next = environment.terrainQuery.normalAt(x, z) ?? {};
    return {
      x: number(next.x, 0),
      y: number(next.y, 1),
      z: number(next.z, 0)
    };
  }
  return { x: 0, y: 1, z: 0 };
}

function sampleSurface(environment, x, z) {
  if (typeof environment?.surfaceAt === "function") {
    return environment.surfaceAt(x, z) ?? null;
  }
  if (environment?.terrainQuery && typeof environment.terrainQuery.surfaceAt === "function") {
    return environment.terrainQuery.surfaceAt(x, z) ?? null;
  }
  return null;
}

function createMovementRuntimeKit(options = {}, kitId = "character-movement-kit") {
  const components = {
    PlayerController: defineComponent("action-player-controller"),
    MovementMotor: defineComponent("action-movement-motor"),
    CameraTarget: defineComponent("action-camera-target")
  };
  const resources = {
    ActionInput: defineResource("action-input"),
    CharacterInput: defineResource("action-input"),
    ActionEnvironment: defineResource("action-environment"),
    CharacterEnvironment: defineResource("action-environment"),
    PlayerState: defineResource("action-player-state"),
    CharacterState: defineResource("action-player-state")
  };
  const events = {
    DashStarted: defineEvent("action-dash-started"),
    GlideStarted: defineEvent("action-glide-started"),
    JumpStarted: defineEvent("action-jump-started"),
    Landed: defineEvent("action-landed"),
    BoundaryHit: defineEvent("action-boundary-hit"),
    SlopeBlocked: defineEvent("action-slope-blocked"),
    SoftRespawn: defineEvent("action-soft-respawn")
  };

  const fallbackBounds = normalizeBounds(options.bounds ?? 90, {
    minX: -90,
    maxX: 90,
    minZ: -90,
    maxZ: 90
  });
  const respawnPoint = {
    x: number(options.respawnPoint?.x, 0),
    y: number(options.respawnPoint?.y, 0),
    z: number(options.respawnPoint?.z, 0)
  };

  function softRespawn(world, player, environment, reason) {
    const ground = sampleGroundHeight(environment, respawnPoint.x, respawnPoint.z);
    player.position.x = respawnPoint.x;
    player.position.y = ground + player.groundOffset;
    player.position.z = respawnPoint.z;
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.velocity.z = 0;
    player.grounded = true;
    player.isJumping = false;
    player.isGliding = false;
    player.isDashing = false;
    player.respawns = (player.respawns ?? 0) + 1;
    player.zone = zoneForPosition(player.position, player.worldBounds ?? fallbackBounds);
    player.lastSafePosition = { x: player.position.x, y: player.position.y, z: player.position.z };
    player.lastSafeGroundHeight = ground;
    world.emit(events.SoftRespawn, { reason, position: { ...player.position } });
  }

  function movementSystem(world) {
    const input = world.getResource(resources.ActionInput) ?? world.getResource(resources.CharacterInput) ?? {};
    const player = world.getResource(resources.PlayerState) ?? world.getResource(resources.CharacterState);
    const rawEnvironment = world.getResource(resources.ActionEnvironment) ?? world.getResource(resources.CharacterEnvironment) ?? {};
    const terrainQuery = options.terrainQueryResource ? world.getResource(options.terrainQueryResource) : rawEnvironment.terrainQuery;
    const physicsState = options.physicsStateResource ? world.getResource(options.physicsStateResource) : null;
    const environment = terrainQuery ? { ...rawEnvironment, terrainQuery } : rawEnvironment;
    if (!player) return;

    const delta = world.__nexusClock?.delta ?? 1 / 60;
    const worldBounds = normalizeBounds(
      environment.bounds ?? player.bounds ?? fallbackBounds,
      fallbackBounds
    );
    const groundOffset = number(environment.groundOffset, number(player.groundOffset, options.groundOffset ?? 1.2));
    const killY = number(environment.killY, number(player.killY, options.killY ?? -26));
    const slopeLimit = number(environment.slopeLimit, number(player.slopeLimit, options.slopeLimit ?? 0.78));
    const glideHover = number(environment.glideHover, number(player.glideHover, options.glideHover ?? 1.25));
    const gravity = number(player.gravity, options.gravity ?? 28);
    const jumpSpeed = number(player.jumpSpeed, options.jumpSpeed ?? 12);
    const dashSpeed = number(player.dashSpeed, options.dashSpeed ?? 32);
    const sprintSpeed = number(player.sprintSpeed, options.sprintSpeed ?? 18);
    const surface = sampleSurface(environment, player.position.x, player.position.z);
    const physicsContact = physicsState?.contact ?? null;
    const traction = clamp(number(physicsContact?.traction, number(surface?.traction, 1)), 0.25, 1.5);
    const stability = clamp(number(physicsState?.stability, number(surface?.stability, 1)), 0, 1);
    const speed = (input.dash ? dashSpeed : (input.sprint ? sprintSpeed : number(player.speed, options.speed ?? 12))) * traction;
    const moveX = number(input.x ?? input.moveX ?? 0);
    const moveZ = number(input.z ?? input.moveZ ?? 0);
    const move = normalizeVector(moveX, moveZ);
    const hasInput = Math.abs(moveX) + Math.abs(moveZ) > 0.001;

    player.bounds = player.bounds ?? options.bounds ?? 90;
    player.worldBounds = worldBounds;
    player.groundOffset = groundOffset;
    player.killY = killY;
    player.slopeLimit = slopeLimit;
    player.glideHover = glideHover;
    player.step = (player.step ?? 0) + 1;
    player.groundNormal = sampleNormal(environment, player.position.x, player.position.z);

    if (player.isRagdolled || player.controlLocked) {
      player.animation = {
        pose: player.isRagdolled ? "ragdoll" : "locked",
        moveBlend: 0,
        airBlend: 0,
        dashBlend: 0,
        lean: 0,
        bob: 0,
        stride: 0,
        turn: 0
      };
      player.zone = zoneForPosition(player.position, worldBounds);
      player.grounded = true;
      player.isDashing = false;
      player.isGliding = false;
      player.isJumping = false;
      return;
    }

    if (hasInput) {
      player.facing = move;
    } else if (!player.facing) {
      player.facing = { x: 0, z: 1 };
    }

    const accel = player.grounded
      ? number(player.groundAcceleration, options.groundAcceleration ?? 56) * clamp(traction, 0.45, 1.2)
      : number(player.airAcceleration, options.airAcceleration ?? 20);
    const drag = player.grounded
      ? number(player.groundDrag, options.groundDrag ?? 18) * clamp(1.25 - number(surface?.slipperiness, 0.2), 0.55, 1.35)
      : number(player.airDrag, options.airDrag ?? 4);

    const targetVelocityX = move.x * speed;
    const targetVelocityZ = move.z * speed;
    player.velocity.x += (targetVelocityX - number(player.velocity.x, 0)) * clamp(delta * accel, 0, 1);
    player.velocity.z += (targetVelocityZ - number(player.velocity.z, 0)) * clamp(delta * accel, 0, 1);
    player.velocity.x -= player.velocity.x * clamp(delta * drag, 0, 1);
    player.velocity.z -= player.velocity.z * clamp(delta * drag, 0, 1);

    player.isDashing = Boolean(input.dash);
    player.isGliding = Boolean(input.glide) && !player.grounded;

    if (input.jump && player.grounded && number(player.jumpCooldown, 0) <= 0) {
      player.velocity.y = jumpSpeed;
      player.grounded = false;
      player.isJumping = true;
      player.jumpCooldown = number(player.jumpCooldownDuration, options.jumpCooldownDuration ?? 0.18);
      world.emit(events.JumpStarted, { position: { ...player.position } });
    }

    if (input.dash && player.grounded && number(player.dodgeCooldown, 0) <= 0) {
      const dashVector = player.facing ?? move;
      player.velocity.x += dashVector.x * (number(player.dashBoost, options.dashBoost ?? 10));
      player.velocity.z += dashVector.z * (number(player.dashBoost, options.dashBoost ?? 10));
      player.dodgeCooldown = number(player.dodgeCooldownDuration, options.dodgeCooldownDuration ?? 0.6);
      world.emit(events.DashStarted, { position: { ...player.position } });
    }

    if (input.glide && !player.grounded) {
      world.emit(events.GlideStarted, { position: { ...player.position } });
    }

    player.velocity.y -= gravity * delta;
    if (player.isGliding && player.velocity.y < -number(player.glideFallSpeed, options.glideFallSpeed ?? 6)) {
      player.velocity.y = -number(player.glideFallSpeed, options.glideFallSpeed ?? 6);
    }

    player.position.x += player.velocity.x * delta;
    player.position.y += player.velocity.y * delta;
    player.position.z += player.velocity.z * delta;

    if (
      player.position.x < worldBounds.minX ||
      player.position.x > worldBounds.maxX ||
      player.position.z < worldBounds.minZ ||
      player.position.z > worldBounds.maxZ
    ) {
      world.emit(events.BoundaryHit, { position: { ...player.position } });
      softRespawn(world, player, environment, "boundary");
      return;
    }

    const groundHeight = sampleGroundHeight(environment, player.position.x, player.position.z);
    const groundNormal = sampleNormal(environment, player.position.x, player.position.z);
    const slope = 1 - clamp(number(groundNormal.y, 1), 0, 1);
    const targetY = groundHeight + groundOffset + (player.isGliding ? glideHover : 0);
    const tooSteep = (slope > slopeLimit || surface?.fallZone) && !player.isGliding;

    if (tooSteep && player.lastSafePosition) {
      player.position.x += (player.lastSafePosition.x - player.position.x) * 0.22;
      player.position.z += (player.lastSafePosition.z - player.position.z) * 0.22;
      world.emit(events.SlopeBlocked, { slope, position: { ...player.position } });
    } else {
      player.lastSafePosition = { x: player.position.x, y: player.position.y, z: player.position.z };
      player.lastSafeGroundHeight = groundHeight;
    }

    if (player.position.y <= targetY) {
      if (!player.grounded && number(player.velocity.y, 0) <= 0) {
        world.emit(events.Landed, { position: { ...player.position }, groundHeight });
      }
      player.position.y = targetY;
      player.velocity.y = 0;
      player.grounded = true;
      player.isJumping = false;
    } else {
      player.grounded = false;
    }

    if (player.position.y < killY) {
      softRespawn(world, player, environment, "fall");
      return;
    }

    if (player.jumpCooldown > 0) {
      player.jumpCooldown = Math.max(0, player.jumpCooldown - delta);
    }
    if (player.dodgeCooldown > 0) {
      player.dodgeCooldown = Math.max(0, player.dodgeCooldown - delta);
    }

    const speedBlend = clamp(Math.hypot(player.velocity.x, player.velocity.z) / Math.max(1, speed), 0, 1);
    const airBlend = player.grounded ? 0 : 1;
    const dashBlend = player.isDashing ? 1 : 0;
    const lean = clamp(player.velocity.x / Math.max(1, speed * 1.8), -1, 1);
    const stride = player.step * (0.28 + speedBlend * 0.56);
    const bob = player.grounded ? Math.sin(stride) * (0.06 + speedBlend * 0.1) : 0;
    player.animation = {
      pose: player.grounded ? (speedBlend > 0.2 ? "move" : "idle") : (player.isGliding ? "glide" : "air"),
      moveBlend: speedBlend,
      airBlend,
      dashBlend,
      lean,
      bob,
      stride,
      turn: Math.atan2(player.facing?.x ?? 0, player.facing?.z ?? 1)
    };
    player.zone = zoneForPosition(player.position, worldBounds);
    player.groundHeight = groundHeight;
    player.groundNormal = groundNormal;
    player.surface = surface;
    player.locomotion = {
      profile: options.profile ?? "character",
      traction,
      stability,
      slide: Boolean(surface?.slide || slope > slopeLimit * 0.92),
      physicsLinked: Boolean(physicsState),
      terrainLinked: Boolean(terrainQuery)
    };
  }

  return defineRuntimeKit({
    id: options.id ?? kitId,
    components,
    resources,
    events,
    systems: [{ phase: "simulate", name: "CharacterMovementSystem", system: movementSystem }],
    initWorld({ world }) {
      const input = {
        x: 0,
        z: 0,
        dash: false,
        glide: false,
        jump: false,
        recover: false,
        sprint: false
      };
      const state = {
        animation: {
          airBlend: 0,
          bob: 0,
          dashBlend: 0,
          lean: 0,
          moveBlend: 0,
          pose: "idle",
          stride: 0,
          turn: 0
        },
        bounds: options.bounds ?? 90,
        controlLocked: false,
        dashBoost: options.dashBoost ?? 10,
        dashSpeed: options.dashSpeed ?? 32,
        dodgeCooldown: 0,
        dodgeCooldownDuration: options.dodgeCooldownDuration ?? 0.6,
        facing: { x: 0, z: 1 },
        glideFallSpeed: options.glideFallSpeed ?? 6,
        glideHover: options.glideHover ?? 1.25,
        gravity: options.gravity ?? 28,
        groundAcceleration: options.groundAcceleration ?? 56,
        groundDrag: options.groundDrag ?? 18,
        groundOffset: options.groundOffset ?? 1.2,
        isDashing: false,
        isGliding: false,
        isJumping: false,
        isRagdolled: false,
        jumpCooldown: 0,
        jumpCooldownDuration: options.jumpCooldownDuration ?? 0.18,
        jumpSpeed: options.jumpSpeed ?? 12,
        killY: options.killY ?? -26,
        lastSafeGroundHeight: 0,
        lastSafePosition: { ...respawnPoint },
        leapLift: 0,
        position: { x: respawnPoint.x, y: respawnPoint.y, z: respawnPoint.z },
        respawns: 0,
        sprintSpeed: options.sprintSpeed ?? 18,
        speed: options.speed ?? 12,
        step: 0,
        velocity: { x: 0, y: 0, z: 0 },
        worldBounds: { ...fallbackBounds },
        zone: zoneForPosition(respawnPoint, fallbackBounds)
      };

      world.setResource(resources.ActionInput, input);
      world.setResource(resources.CharacterInput, input);
      world.setResource(resources.ActionEnvironment, {
        bounds: options.bounds ?? 90,
        groundHeightAt: options.groundHeightAt,
        glideHover: options.glideHover ?? 1.25,
        killY: options.killY ?? -26,
        normalAt: options.normalAt,
        respawnPoint,
        slopeLimit: options.slopeLimit ?? 0.78
      });
      world.setResource(resources.CharacterEnvironment, world.getResource(resources.ActionEnvironment));
      world.setResource(resources.PlayerState, state);
      world.setResource(resources.CharacterState, state);
    },
    metadata: {
      domain: "locomotion",
      profile: options.profile ?? "character",
      reusable: true,
      terrainAware: true,
      characterControl: true
    }
  });
}

export function createLocomotionKit(options = {}) {
  return createMovementRuntimeKit(options, options.id ?? "locomotion-kit");
}

export function createCharacterMovementKit(options = {}) {
  return createLocomotionKit({ id: options.id ?? "character-movement-kit", ...options, profile: options.profile ?? "character" });
}

export function createActionMovementKit(options = {}) {
  return createLocomotionKit({ id: options.id ?? "action-movement-kit", ...options, profile: options.profile ?? "character" });
}
