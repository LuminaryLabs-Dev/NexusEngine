import { createObjectPlacementDescriptor, OBJECT_PLACEMENT_SCHEMA } from "../../contracts/placement-descriptor.js";
import {
  PLACEMENT_EPSILON,
  addPlacementVectors,
  clonePlacementValue,
  crossPlacementVectors,
  dotPlacementVectors,
  fallbackPlacementForward,
  finitePlacementValue,
  multiplyPlacementQuaternions,
  multiplyPlacementVectors,
  normalizePlacementBounds,
  placementBoundsCorners,
  placementQuaternionFromAxisAngle,
  placementQuaternionFromUnitVectors,
  placementVector3,
  placementVectorMagnitude,
  projectPlacementVectorToPlane,
  rotatePlacementVector,
  scalePlacementVector,
  subtractPlacementVectors,
  unitPlacementVector
} from "./placement-math.js";

const descriptor = (value) => createObjectPlacementDescriptor(value);

export function computePlacementWorldPoint(input, localPoint) {
  const placement = descriptor(input);
  const point = placementVector3(localPoint, [0, 0, 0], "localPoint");
  return addPlacementVectors(
    placement.transform.position,
    rotatePlacementVector(
      multiplyPlacementVectors(point, placement.transform.scale),
      placement.transform.rotation
    )
  );
}

export function computePlacementWorldDirection(input, localDirection) {
  const placement = descriptor(input);
  return unitPlacementVector(
    rotatePlacementVector(
      unitPlacementVector(placementVector3(localDirection, [0, 1, 0], "localDirection"), "localDirection"),
      placement.transform.rotation
    ),
    "worldDirection"
  );
}

export function getPlacementWorldAnchor(input, anchorId) {
  const placement = descriptor(input);
  const anchor = placement.anchors.find((entry) => entry.id === String(anchorId));
  if (!anchor) throw new TypeError(`Unknown placement anchor ${anchorId}.`);
  return {
    id: anchor.id,
    objectId: placement.objectId,
    position: computePlacementWorldPoint(placement, anchor.position),
    normal: computePlacementWorldDirection(placement, anchor.normal),
    forward: computePlacementWorldDirection(placement, anchor.forward),
    tags: [...anchor.tags],
    metadata: clonePlacementValue(anchor.metadata)
  };
}

export function getPlacementWorldBounds(input) {
  const placement = descriptor(input);
  const points = placementBoundsCorners(placement.localBounds)
    .map((point) => computePlacementWorldPoint(placement, point));
  const minimum = [Infinity, Infinity, Infinity];
  const maximum = [-Infinity, -Infinity, -Infinity];
  for (const point of points) {
    for (let axis = 0; axis < 3; axis += 1) {
      minimum[axis] = Math.min(minimum[axis], point[axis]);
      maximum[axis] = Math.max(maximum[axis], point[axis]);
    }
  }
  return normalizePlacementBounds({ min: minimum, max: maximum }, "worldBounds");
}

function normalizeWorldAnchor(input, label = "targetAnchor") {
  const normal = unitPlacementVector(
    placementVector3(input?.normal, [0, 1, 0], `${label}.normal`),
    `${label}.normal`
  );
  const requestedForward = placementVector3(
    input?.forward,
    fallbackPlacementForward(normal),
    `${label}.forward`
  );
  const projectedForward = projectPlacementVectorToPlane(requestedForward, normal);
  return {
    id: String(input?.id ?? label),
    position: placementVector3(input?.position, [0, 0, 0], `${label}.position`),
    normal,
    forward: placementVectorMagnitude(projectedForward) <= PLACEMENT_EPSILON
      ? fallbackPlacementForward(normal)
      : unitPlacementVector(projectedForward, `${label}.forward`)
  };
}

export function alignPlacementAnchors(sourceInput, targetInput, options = {}) {
  const source = descriptor(sourceInput);
  const sourceAnchorId = String(options.sourceAnchorId ?? source.supportAnchorId);
  const sourceAnchor = getPlacementWorldAnchor(source, sourceAnchorId);
  const targetAnchor = targetInput?.schema === OBJECT_PLACEMENT_SCHEMA
    ? getPlacementWorldAnchor(targetInput, options.targetAnchorId ?? targetInput.supportAnchorId)
    : normalizeWorldAnchor(targetInput);
  const normalMode = String(options.normalMode ?? "opposed");
  if (!["opposed", "same", "position-only"].includes(normalMode)) {
    throw new TypeError(`Unsupported normalMode ${normalMode}.`);
  }

  let rotation = source.transform.rotation;
  if (normalMode !== "position-only") {
    const desiredNormal = normalMode === "opposed"
      ? scalePlacementVector(targetAnchor.normal, -1)
      : targetAnchor.normal;
    const normalDelta = placementQuaternionFromUnitVectors(sourceAnchor.normal, desiredNormal);
    rotation = multiplyPlacementQuaternions(normalDelta, rotation);
    if (options.alignForward !== false) {
      const rotatedForward = unitPlacementVector(
        projectPlacementVectorToPlane(rotatePlacementVector(sourceAnchor.forward, normalDelta), desiredNormal),
        "aligned source forward"
      );
      const targetForward = unitPlacementVector(
        projectPlacementVectorToPlane(targetAnchor.forward, desiredNormal),
        "target forward"
      );
      const angle = Math.atan2(
        dotPlacementVectors(desiredNormal, crossPlacementVectors(rotatedForward, targetForward)),
        dotPlacementVectors(rotatedForward, targetForward)
      );
      rotation = multiplyPlacementQuaternions(
        placementQuaternionFromAxisAngle(desiredNormal, angle),
        rotation
      );
    }
  }

  const localAnchor = source.anchors.find((entry) => entry.id === sourceAnchorId);
  const rotatedAnchor = rotatePlacementVector(
    multiplyPlacementVectors(localAnchor.position, source.transform.scale),
    rotation
  );
  const offset = finitePlacementValue(options.offset, 0, "offset");
  const targetPosition = addPlacementVectors(
    targetAnchor.position,
    scalePlacementVector(targetAnchor.normal, offset)
  );
  return createObjectPlacementDescriptor({
    ...source,
    revision: source.revision + 1,
    transform: {
      ...source.transform,
      rotation,
      position: subtractPlacementVectors(targetPosition, rotatedAnchor)
    }
  });
}

export function groundPlacement(input, planeInput = {}, options = {}) {
  const source = descriptor(input);
  const plane = {
    point: placementVector3(planeInput.point, [0, 0, 0], "plane.point"),
    normal: unitPlacementVector(
      placementVector3(planeInput.normal, [0, 1, 0], "plane.normal"),
      "plane.normal"
    )
  };
  let rotation = source.transform.rotation;
  if (options.orientToSurface !== false) {
    const support = getPlacementWorldAnchor(source, source.supportAnchorId);
    rotation = multiplyPlacementQuaternions(
      placementQuaternionFromUnitVectors(support.normal, scalePlacementVector(plane.normal, -1)),
      rotation
    );
  }
  let next = createObjectPlacementDescriptor({
    ...source,
    revision: source.revision + 1,
    transform: { ...source.transform, rotation }
  });
  const clearance = finitePlacementValue(options.clearance, 0, "clearance");
  const contactMode = String(options.contactMode ?? "anchor");
  let distance;
  if (contactMode === "anchor") {
    const support = getPlacementWorldAnchor(next, next.supportAnchorId);
    distance = dotPlacementVectors(subtractPlacementVectors(support.position, plane.point), plane.normal);
  } else if (contactMode === "bounds") {
    distance = Math.min(...placementBoundsCorners(next.localBounds).map((point) => (
      dotPlacementVectors(
        subtractPlacementVectors(computePlacementWorldPoint(next, point), plane.point),
        plane.normal
      )
    )));
  } else {
    throw new TypeError(`Unsupported contactMode ${contactMode}.`);
  }
  next = createObjectPlacementDescriptor({
    ...next,
    transform: {
      ...next.transform,
      position: addPlacementVectors(
        next.transform.position,
        scalePlacementVector(plane.normal, clearance - distance)
      )
    }
  });
  return next;
}

export function fitPlacementWithinBounds(input, targetBoundsInput, options = {}) {
  const source = descriptor(input);
  const targetBounds = normalizePlacementBounds(targetBoundsInput, "targetBounds");
  const mode = String(options.mode ?? "contain");
  if (!["contain", "cover"].includes(mode)) throw new TypeError(`Unsupported fit mode ${mode}.`);
  const originPlacement = createObjectPlacementDescriptor({
    ...source,
    transform: { ...source.transform, position: [0, 0, 0] }
  });
  const currentBounds = getPlacementWorldBounds(originPlacement);
  const ratios = targetBounds.size
    .map((size, axis) => currentBounds.size[axis] <= PLACEMENT_EPSILON
      ? Infinity
      : size / currentBounds.size[axis])
    .filter(Number.isFinite);
  if (!ratios.length) throw new RangeError("Placement cannot be fit because its transformed bounds have no measurable size.");
  const factor = mode === "contain" ? Math.min(...ratios) : Math.max(...ratios);
  if (!Number.isFinite(factor) || factor <= 0) throw new RangeError("Placement fit produced an invalid scale.");
  const fitted = createObjectPlacementDescriptor({
    ...source,
    revision: source.revision + 1,
    transform: {
      ...source.transform,
      position: [0, 0, 0],
      scale: scalePlacementVector(source.transform.scale, factor)
    }
  });
  const fittedBounds = getPlacementWorldBounds(fitted);
  return createObjectPlacementDescriptor({
    ...fitted,
    transform: {
      ...fitted.transform,
      position: subtractPlacementVectors(targetBounds.center, fittedBounds.center)
    }
  });
}
