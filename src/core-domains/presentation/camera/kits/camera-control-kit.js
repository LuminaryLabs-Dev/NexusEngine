import { clamp, normalizeAngle, shortestAngle, smoothstep } from "nexusengine/domains/spatial/transform-math";
import { createDomainKit } from "../../../domain-kit.js";

export function cameraYawFromRootAndOrbit(rootYaw = 0, orbitYawOffset = 0) {
  return normalizeAngle(rootYaw + orbitYawOffset);
}

export function clampOrbitYaw(offset = 0, maxOrbitYaw = Math.PI / 2) {
  return clamp(offset, -maxOrbitYaw, maxOrbitYaw);
}

export function preserveOrbitForCameraYaw(rootYaw, cameraYaw, maxOrbitYaw = Math.PI / 2) {
  return clampOrbitYaw(shortestAngle(rootYaw, cameraYaw), maxOrbitYaw);
}

export function applyRootYawHandoff(state = {}, config = {}) {
  const maxOrbitYaw = config.maxOrbitYaw ?? Math.PI / 2;
  const handoffStartYaw = config.handoffStartYaw ?? Math.PI / 4;
  const speed = config.rootYawHandoffSpeed ?? 2.35;
  const dt = config.dt ?? 1 / 60;
  let rootYaw = normalizeAngle(state.rootYaw ?? 0);
  let orbitYawOffset = clampOrbitYaw(state.orbitYawOffset ?? 0, maxOrbitYaw);
  const excess = Math.max(0, Math.abs(orbitYawOffset) - handoffStartYaw);
  const span = Math.max(0.0001, maxOrbitYaw - handoffStartYaw);
  const handoffAlpha = excess > 0 ? smoothstep(excess / span) : 0;
  if (handoffAlpha > 0) {
    const delta = Math.sign(orbitYawOffset) * Math.min(excess, speed * handoffAlpha * dt);
    rootYaw = normalizeAngle(rootYaw + delta);
    orbitYawOffset -= delta;
  }
  return {
    rootYaw,
    orbitYawOffset: clampOrbitYaw(orbitYawOffset, maxOrbitYaw),
    cameraYaw: cameraYawFromRootAndOrbit(rootYaw, orbitYawOffset),
    handoffAlpha
  };
}

export function createCameraControlMathKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "camera-control-math-kit",
    id: "camera-control-math-kit",
    domain: "camera-control",
    domainPath: "n:presentation:camera",
    parentDomainPath: "n:presentation",
    apiName: "cameraControl",
    provides: ["camera:control-math"],
    purpose: "Provide deterministic orbit clamping, yaw preservation, and root-yaw handoff operations.",
    createApi: () => ({
      cameraYawFromRootAndOrbit,
      clampOrbitYaw,
      preserveOrbitForCameraYaw,
      applyRootYawHandoff
    })
  });
}
