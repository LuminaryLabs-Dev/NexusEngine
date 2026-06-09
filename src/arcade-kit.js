import {
  defineComponent,
  defineResource
} from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

/**
 * ArcadeKit provides modular components and systems for building 
 * high-performance arcade-style games, including infinite runners,
 * arena shooters, and rail raids.
 */

function createDefinitions() {
  const components = {
    // Basic Movement
    ForwardVelocity: defineComponent("forward-velocity"), // Constant forward speed
    SideSteer: defineComponent("side-steer"), // Constraints for lane-based movement
    
    // Camera
    CameraTarget: defineComponent("camera-target"), // Marks entity for camera to follow
    CameraOffset: defineComponent("camera-offset"), // Custom camera distance/height per entity
    
    // Arcade Logic
    Collector: defineComponent("collector"), // Marks entity that can pick up items
    Collectible: defineComponent("collectible"), // Score items
    Hazard: defineComponent("hazard"), // Damage dealers
    
    // Infinite Runner specific
    RunnerState: defineComponent("runner-state"), // Track distance and current speed multiplier
    SpawnTrigger: defineComponent("spawn-trigger") // Entities that trigger new segment generation
  };

  const resources = {
    ArcadeSession: defineResource("arcade-session"),
    GlobalInput: defineResource("global-input"),
    RunnerConfig: defineResource("runner-config")
  };

  return { components, resources };
}

/**
 * System that applies constant forward motion to entities with ForwardVelocity.
 * Perfect for infinite runners or rail shooters.
 */
function createMovementSystem(defs) {
  return function arcadeMovementSystem(world) {
    const delta = world.__nexusClock?.delta ?? 1/60;
    
    for (const entity of world.query(defs.components.ForwardVelocity, "velocity")) {
      const forward = world.getComponent(entity, defs.components.ForwardVelocity);
      const velocity = world.getComponent(entity, "velocity");
      
      // Keep pushing forward (Z-axis)
      velocity.z = -forward.speed;
      
      // Apply side steering if SideSteer is present
      if (world.hasComponent(entity, defs.components.SideSteer)) {
        const steer = world.getComponent(entity, defs.components.SideSteer);
        const input = world.getResource(defs.resources.GlobalInput) ?? { x: 0 };
        velocity.x = steer.sensitivity * input.x;
      }
    }
  };
}

/**
 * Modular Camera Follow system.
 * Looks for an entity with CameraTarget and updates the engine camera.
 */
function createCameraSystem(defs) {
  return function arcadeCameraSystem(world) {
    const player = world.query(defs.components.CameraTarget)[0];
    if (!player) return;

    const transform = world.getComponent(player, "transform");
    const offset = world.getComponent(player, defs.components.CameraOffset) ?? { x: 0, y: 24, z: 32 };
    const cameraState = world.getResource("camera-state");
    
    if (!cameraState) return;

    // Smoothly interpolate camera position
    const blend = offset.blend ?? 0.1;
    cameraState.position.x += (transform.position.x + offset.x - cameraState.position.x) * blend;
    cameraState.position.y += (transform.position.y + offset.y - cameraState.position.y) * blend;
    cameraState.position.z += (transform.position.z + offset.z - cameraState.position.z) * blend;
    
    // Keep looking at the player
    cameraState.lookAt.copy(transform.position);
  };
}

export function createArcadeKit(options = {}) {
  const defs = createDefinitions();
  
  return defineRuntimeKit({
    id: "arcade-kit",
    components: defs.components,
    resources: defs.resources,
    systems: [
      { phase: "simulate", name: "ArcadeMovementSystem", system: createMovementSystem(defs) },
      { phase: "resolve", name: "ArcadeCameraSystem", system: createCameraSystem(defs) }
    ],
    initWorld({ world, options }) {
      world.setResource(defs.resources.ArcadeSession, {
        score: 0,
        status: "running",
        startTime: Date.now()
      });
      
      world.setResource(defs.resources.RunnerConfig, {
        baseSpeed: options.baseSpeed ?? 20,
        difficultyRamp: options.difficultyRamp ?? 0.1
      });
    }
  });
}
