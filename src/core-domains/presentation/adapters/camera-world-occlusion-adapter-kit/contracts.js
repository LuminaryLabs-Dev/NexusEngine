import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function vectorLength(value) {
  return Math.hypot(value.x, value.y, value.z);
}

export function constrainCameraDescriptor(input = {}) {
  const descriptor = cloneSerializableState(input.descriptor);
  if (!descriptor?.position || !descriptor?.lookAt) throw new TypeError("Camera World Occlusion requires a camera descriptor with position and lookAt.");
  const clearance = Math.max(0, finite(input.clearance, "clearance", 0.35));
  const padding = Math.max(0, finite(input.padding, "padding", 0.2));
  const minimumDistance = Math.max(0, finite(input.minimumDistance, "minimumDistance", 0.5));
  const position = cloneSerializableState(descriptor.position);
  const constraints = [];
  const terrainHeight = input.terrainSample?.height ?? input.terrainSample?.groundHeight;
  if (terrainHeight !== undefined) {
    const minimumY = finite(terrainHeight, "terrain height") + clearance;
    if (position.y < minimumY) {
      position.y = minimumY;
      constraints.push("terrain-clearance");
    }
  }
  const obstructionDistance = input.obstruction?.distance;
  if (obstructionDistance !== undefined) {
    const delta = { x: position.x - descriptor.lookAt.x, y: position.y - descriptor.lookAt.y, z: position.z - descriptor.lookAt.z };
    const length = vectorLength(delta);
    const allowed = Math.max(minimumDistance, finite(obstructionDistance, "obstruction.distance") - padding);
    if (length > 0 && allowed < length) {
      const vertical = position.y - descriptor.lookAt.y;
      const horizontal = Math.hypot(delta.x, delta.z);
      if (Math.abs(vertical) < allowed && horizontal > 0) {
        const horizontalLimit = Math.sqrt(Math.max(0, allowed ** 2 - vertical ** 2));
        const scale = Math.min(1, horizontalLimit / horizontal);
        position.x = descriptor.lookAt.x + delta.x * scale;
        position.z = descriptor.lookAt.z + delta.z * scale;
      } else {
        const scale = allowed / length;
        position.x = descriptor.lookAt.x + delta.x * scale;
        position.y = descriptor.lookAt.y + delta.y * scale;
        position.z = descriptor.lookAt.z + delta.z * scale;
      }
      constraints.push("world-occlusion");
    }
  }
  return cloneSerializableState({
    ...descriptor,
    position,
    distance: vectorLength({ x: position.x - descriptor.lookAt.x, y: position.y - descriptor.lookAt.y, z: position.z - descriptor.lookAt.z }),
    metadata: { ...(descriptor.metadata ?? {}), occlusionResolved: true, constraints }
  });
}
