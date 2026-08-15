import {
  clonePlacementValue,
  fallbackPlacementForward,
  finitePlacementValue,
  normalizePlacementBounds,
  normalizePlacementQuaternion,
  placementVector3,
  placementVectorMagnitude,
  projectPlacementVectorToPlane,
  unitPlacementVector
} from "../kits/object-placement-kit/placement-math.js";

export const OBJECT_PLACEMENT_VERSION = "0.1.0";
export const OBJECT_PLACEMENT_SCHEMA = "nexus-object-placement/1";
export const OBJECT_PLACEMENT_FRAME = Object.freeze({
  handedness: "right",
  upAxis: "y",
  forwardAxis: "-z",
  unitsPerMeter: 1
});

function normalizeFrame(input = {}) {
  const frame = {
    handedness: String(input.handedness ?? OBJECT_PLACEMENT_FRAME.handedness),
    upAxis: String(input.upAxis ?? OBJECT_PLACEMENT_FRAME.upAxis),
    forwardAxis: String(input.forwardAxis ?? OBJECT_PLACEMENT_FRAME.forwardAxis),
    unitsPerMeter: finitePlacementValue(
      input.unitsPerMeter,
      OBJECT_PLACEMENT_FRAME.unitsPerMeter,
      "coordinateFrame.unitsPerMeter"
    )
  };
  if (frame.handedness !== "right" || frame.upAxis !== "y" || frame.forwardAxis !== "-z") {
    throw new TypeError("Object placement v1 requires a right-handed, Y-up, -Z-forward coordinate frame.");
  }
  if (frame.unitsPerMeter <= 0) throw new RangeError("coordinateFrame.unitsPerMeter must be greater than zero.");
  return frame;
}

function normalizeTransform(input = {}) {
  const scale = typeof input.scale === "number"
    ? [input.scale, input.scale, input.scale]
    : placementVector3(input.scale, [1, 1, 1], "transform.scale");
  if (scale.some((entry) => entry <= 0)) throw new RangeError("transform.scale values must be greater than zero.");
  return {
    position: placementVector3(input.position, [0, 0, 0], "transform.position"),
    rotation: normalizePlacementQuaternion(input.rotation, "transform.rotation"),
    scale
  };
}

function normalizeAnchor(input, index) {
  const id = String(input?.id ?? "").trim();
  if (!id) throw new TypeError(`anchors[${index}].id is required.`);
  const normal = unitPlacementVector(
    placementVector3(input.normal, [0, 1, 0], `anchors[${index}].normal`),
    `anchors[${index}].normal`
  );
  const requestedForward = placementVector3(
    input.forward,
    fallbackPlacementForward(normal),
    `anchors[${index}].forward`
  );
  const projectedForward = projectPlacementVectorToPlane(requestedForward, normal);
  return {
    id,
    position: placementVector3(input.position, [0, 0, 0], `anchors[${index}].position`),
    normal,
    forward: placementVectorMagnitude(projectedForward) === 0
      ? fallbackPlacementForward(normal)
      : unitPlacementVector(projectedForward, `anchors[${index}].forward`),
    tags: [...new Set((input.tags ?? []).map(String))].sort(),
    metadata: clonePlacementValue(input.metadata ?? {})
  };
}

export function createObjectPlacementDescriptor(input = {}) {
  const objectId = String(input.objectId ?? "").trim();
  if (!objectId) throw new TypeError("objectId is required.");
  const localBounds = normalizePlacementBounds(input.localBounds);
  const anchors = (input.anchors ?? []).map(normalizeAnchor);
  const anchorIds = new Set();
  for (const anchor of anchors) {
    if (anchorIds.has(anchor.id)) throw new TypeError(`Duplicate anchor id ${anchor.id}.`);
    anchorIds.add(anchor.id);
  }
  const supportAnchorId = String(input.supportAnchorId ?? input.support?.anchorId ?? "support").trim();
  if (!anchorIds.has(supportAnchorId)) {
    if (supportAnchorId !== "support") throw new TypeError(`Support anchor ${supportAnchorId} is not defined.`);
    anchors.push(normalizeAnchor({
      id: "support",
      position: [localBounds.center[0], localBounds.min[1], localBounds.center[2]],
      normal: [0, -1, 0],
      forward: [0, 0, -1],
      tags: ["support"]
    }, anchors.length));
  }
  anchors.sort((left, right) => left.id.localeCompare(right.id));
  return {
    schema: OBJECT_PLACEMENT_SCHEMA,
    version: OBJECT_PLACEMENT_VERSION,
    id: String(input.id ?? `${objectId}:placement`),
    objectId,
    revision: Math.max(0, Math.trunc(finitePlacementValue(input.revision, 0, "revision"))),
    coordinateFrame: normalizeFrame(input.coordinateFrame),
    localBounds,
    origin: placementVector3(input.origin, [0, 0, 0], "origin"),
    pivot: placementVector3(input.pivot, localBounds.center, "pivot"),
    anchors,
    supportAnchorId,
    transform: normalizeTransform(input.transform),
    metadata: clonePlacementValue(input.metadata ?? {})
  };
}

export function validateObjectPlacementDescriptor(value) {
  try {
    createObjectPlacementDescriptor(value);
    return { valid: true, errors: [] };
  } catch (error) {
    return { valid: false, errors: [error instanceof Error ? error.message : String(error)] };
  }
}
