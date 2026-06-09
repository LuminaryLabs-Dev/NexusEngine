import { defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function lerp(current, target, factor) {
  return current + (target - current) * factor;
}

function vectorLerp(target, current, factor) {
  return {
    x: lerp(number(current?.x, 0), number(target?.x, 0), factor),
    y: lerp(number(current?.y, 0), number(target?.y, 0), factor),
    z: lerp(number(current?.z, 0), number(target?.z, 0), factor)
  };
}

export function createCharacterCameraKit(options = {}) {
  const resources = {
    CameraInput: defineResource("character-camera-input"),
    CharacterCameraInput: defineResource("character-camera-input"),
    CameraState: defineResource("character-camera-state"),
    CharacterCameraState: defineResource("character-camera-state")
  };

  function cameraSystem(world) {
    const input = world.getResource(resources.CameraInput) ?? world.getResource(resources.CharacterCameraInput) ?? {};
    const state = world.getResource(resources.CameraState) ?? world.getResource(resources.CharacterCameraState);
    const character = world.getResource(options.characterStateResource);
    const ragdoll = options.ragdollStateResource ? world.getResource(options.ragdollStateResource) : null;
    if (!state || !character) return;

    const delta = world.__nexusClock?.delta ?? 1 / 60;
    const followTarget = ragdoll?.active ? ragdoll.position : character.position;
    const facing = character.facing ?? { x: 0, z: 1 };
    const moveBlend = character.animation?.moveBlend ?? 0;
    const dashBlend = character.animation?.dashBlend ?? 0;
    const ragdollBlend = ragdoll?.active ? 1 : 0;
    const distance = number(input.distance, number(state.distance, options.distance ?? 16));
    const height = number(input.height, number(state.height, options.height ?? 10));
    const lookAhead = number(input.lookAhead, number(state.lookAhead, options.lookAhead ?? 6));
    const sway = number(input.sway, number(state.sway, options.sway ?? 2.2));
    const fov = number(input.fov, number(state.fov, options.fov ?? 48));
    const shakeTarget = Math.max(
      number(input.shake, 0),
      number(ragdoll?.impact ?? 0, 0) * 0.18,
      number(character.isDashing ? 0.14 : 0, 0)
    );

    const backward = { x: -facing.x, z: -facing.z };
    const right = { x: backward.z, z: -backward.x };
    const cameraOffset = {
      x: backward.x * (distance + dashBlend * 2.5) + right.x * sway * moveBlend,
      y: height + (ragdollBlend ? 2.3 : moveBlend * 1.2),
      z: backward.z * (distance + dashBlend * 2.5) + right.z * sway * moveBlend
    };
    const lookTarget = {
      x: followTarget.x + facing.x * lookAhead,
      y: followTarget.y + (ragdollBlend ? 1.2 : 2.7) + moveBlend * 0.6,
      z: followTarget.z + facing.z * lookAhead
    };

    state.position = vectorLerp({
      x: followTarget.x + cameraOffset.x,
      y: followTarget.y + cameraOffset.y,
      z: followTarget.z + cameraOffset.z
    }, state.position, clamp(delta * (ragdollBlend ? 8 : 6), 0, 1));

    state.lookAt = vectorLerp(lookTarget, state.lookAt, clamp(delta * 8, 0, 1));
    state.shake = lerp(number(state.shake, 0), shakeTarget, clamp(delta * 7, 0, 1));
    state.fov = lerp(number(state.fov, fov), fov + moveBlend * 2.4 + dashBlend * 2.2 + ragdollBlend * 2.8, clamp(delta * 5, 0, 1));
    state.mode = ragdollBlend ? "ragdoll" : (moveBlend > 0.25 ? "follow" : "idle");
    state.distance = distance;
    state.height = height;
    state.lookAhead = lookAhead;
    state.sway = sway;
    state.step = (state.step ?? 0) + 1;
  }

  return defineRuntimeKit({
    id: options.id ?? "character-camera-kit",
    resources,
    systems: [{ phase: "resolve", name: "CharacterCameraSystem", system: cameraSystem }],
    initWorld({ world }) {
      const cameraInput = {
        distance: options.distance ?? 16,
        fov: options.fov ?? 48,
        height: options.height ?? 10,
        lookAhead: options.lookAhead ?? 6,
        shake: 0,
        sway: options.sway ?? 2.2
      };
      const cameraState = {
        distance: options.distance ?? 16,
        fov: options.fov ?? 48,
        height: options.height ?? 10,
        lookAhead: options.lookAhead ?? 6,
        mode: "idle",
        position: { x: 0, y: 0, z: 0 },
        shake: 0,
        step: 0,
        sway: options.sway ?? 2.2,
        lookAt: { x: 0, y: 0, z: 0 }
      };

      world.setResource(resources.CameraInput, cameraInput);
      world.setResource(resources.CharacterCameraInput, cameraInput);
      world.setResource(resources.CameraState, cameraState);
      world.setResource(resources.CharacterCameraState, cameraState);
    },
    metadata: { domain: "camera", reusable: true, cinematic: true }
  });
}
