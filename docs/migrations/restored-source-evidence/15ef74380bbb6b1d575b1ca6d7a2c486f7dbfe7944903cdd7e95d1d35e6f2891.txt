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

function normalize(vector) {
  const length = Math.hypot(number(vector.x), number(vector.y), number(vector.z)) || 1;
  return {
    x: number(vector.x) / length,
    y: number(vector.y) / length,
    z: number(vector.z) / length
  };
}

function pushOutOfSphere(position, sphere) {
  const center = sphere.center ?? sphere.position ?? { x: 0, y: 0, z: 0 };
  const radius = number(sphere.radius, 1);
  const dx = number(position.x) - number(center.x);
  const dy = number(position.y) - number(center.y);
  const dz = number(position.z) - number(center.z);
  const distance = Math.hypot(dx, dy, dz) || 0.001;
  if (distance >= radius) return null;
  const direction = normalize({ x: dx, y: dy + 0.08, z: dz });
  return {
    x: number(center.x) + direction.x * radius,
    y: number(center.y) + direction.y * radius,
    z: number(center.z) + direction.z * radius
  };
}

function terrainLineClearance(camera, lookAt, groundHeightAt, clearance, samples) {
  let intrusion = 0;
  for (let index = 1; index <= samples; index += 1) {
    const t = index / (samples + 1);
    const x = lookAt.x + (camera.x - lookAt.x) * t;
    const y = lookAt.y + (camera.y - lookAt.y) * t;
    const z = lookAt.z + (camera.z - lookAt.z) * t;
    const ground = groundHeightAt(x, z) + clearance;
    intrusion = Math.max(intrusion, ground - y);
  }
  return intrusion;
}

export function createCameraKit(options = {}) {
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
    const terrainQuery = options.terrainQueryResource ? world.getResource(options.terrainQueryResource) : null;
    const groundHeightAt = input.groundHeightAt ?? options.groundHeightAt ?? terrainQuery?.heightAt?.bind(terrainQuery) ?? (() => -Infinity);
    const cameraVolume = terrainQuery?.cameraVolumeAt?.(character.position?.x ?? 0, character.position?.z ?? 0);
    const followTarget = ragdoll?.active ? ragdoll.position : character.position;
    const facing = character.facing ?? { x: 0, z: 1 };
    const moveBlend = character.animation?.moveBlend ?? 0;
    const dashBlend = character.animation?.dashBlend ?? 0;
    const ragdollBlend = ragdoll?.active ? 1 : 0;
    const distance = number(cameraVolume?.distance, number(input.distance, number(state.distance, options.distance ?? 16)));
    const height = number(cameraVolume?.height, number(input.height, number(state.height, options.height ?? 10)));
    const lookAhead = number(cameraVolume?.lookAhead, number(input.lookAhead, number(state.lookAhead, options.lookAhead ?? 6)));
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
    const occlusion = resolveOcclusion({
      delta,
      groundHeightAt,
      input,
      lookAt: state.lookAt,
      options,
      position: state.position
    });
    state.position = occlusion.position;
    if (occlusion.lookLift) {
      state.lookAt.y += occlusion.lookLift;
    }
    state.shake = lerp(number(state.shake, 0), shakeTarget, clamp(delta * 7, 0, 1));
    state.fov = lerp(number(state.fov, fov), fov + moveBlend * 2.4 + dashBlend * 2.2 + ragdollBlend * 2.8, clamp(delta * 5, 0, 1));
    state.mode = ragdollBlend ? "ragdoll" : (moveBlend > 0.25 ? "follow" : "idle");
    state.occlusionAdjusted = occlusion.reasons.length > 0;
    state.occlusionScore = occlusion.score;
    state.occlusionReasons = occlusion.reasons;
    state.cameraSafe = occlusion.safe;
    state.cameraVolume = cameraVolume?.id ?? null;
    state.distance = distance;
    state.height = height;
    state.lookAhead = lookAhead;
    state.sway = sway;
    state.step = (state.step ?? 0) + 1;
  }

  return defineRuntimeKit({
    id: options.id ?? "camera-kit",
    resources,
    systems: [{ phase: "resolve", name: "CharacterCameraSystem", system: cameraSystem }],
    initWorld({ world }) {
      const cameraInput = {
        distance: options.distance ?? 16,
        fov: options.fov ?? 48,
        lineClearance: options.lineClearance ?? 2.25,
        height: options.height ?? 10,
        lookAhead: options.lookAhead ?? 6,
        minGroundClearance: options.minGroundClearance ?? 4.5,
        obstructions: options.obstructions ?? [],
        shake: 0,
        sway: options.sway ?? 2.2
      };
      const cameraState = {
        distance: options.distance ?? 16,
        fov: options.fov ?? 48,
        height: options.height ?? 10,
        lookAhead: options.lookAhead ?? 6,
        mode: "idle",
        cameraSafe: true,
        cameraVolume: null,
        occlusionAdjusted: false,
        occlusionReasons: [],
        occlusionScore: 0,
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
    metadata: {
      domain: "camera",
      reusable: true,
      cinematic: true,
      occlusion: true,
      terrainAware: true
    }
  });
}

function resolveOcclusion({ delta, groundHeightAt, input, lookAt, options, position }) {
  const minGroundClearance = number(input.minGroundClearance, number(options.minGroundClearance, 4.5));
  const lineClearance = number(input.lineClearance, number(options.lineClearance, 2.25));
  const samples = Math.max(2, Math.floor(number(input.samples, number(options.samples, 7))));
  const maxLiftPerSecond = number(input.maxLiftPerSecond, number(options.maxLiftPerSecond, 34));
  const obstructions = input.obstructions ?? options.obstructions ?? [];
  const reasons = [];
  let score = 0;
  let next = { ...position };
  let lookLift = 0;

  const groundFloor = groundHeightAt(next.x, next.z) + minGroundClearance;
  if (next.y < groundFloor) {
    const lift = Math.min(groundFloor - next.y, maxLiftPerSecond * delta);
    next.y += lift;
    score = Math.max(score, clamp(lift / Math.max(minGroundClearance, 1), 0, 1));
    reasons.push("terrain-floor");
  }

  const lineIntrusion = terrainLineClearance(next, lookAt, groundHeightAt, lineClearance, samples);
  if (lineIntrusion > 0) {
    const lift = Math.min(lineIntrusion, maxLiftPerSecond * delta);
    next.y += lift;
    lookLift += lift * 0.18;
    score = Math.max(score, clamp(lineIntrusion / Math.max(lineClearance * 2, 1), 0, 1));
    reasons.push("terrain-line");
  }

  for (const obstruction of obstructions) {
    if (obstruction.type !== "sphere") continue;
    const pushed = pushOutOfSphere(next, obstruction);
    if (!pushed) continue;
    next = { x: pushed.x, y: Math.max(pushed.y, next.y), z: pushed.z };
    score = Math.max(score, 0.7);
    reasons.push(obstruction.id ?? "sphere");
  }

  return {
    lookLift,
    position: next,
    reasons,
    safe: next.y >= groundHeightAt(next.x, next.z) + minGroundClearance - 0.05,
    score
  };
}

export function createCharacterCameraKit(options = {}) {
  return createCameraKit({ id: options.id ?? "character-camera-kit", ...options });
}
