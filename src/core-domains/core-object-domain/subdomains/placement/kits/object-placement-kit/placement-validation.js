import { createObjectPlacementDescriptor } from "../../contracts/placement-descriptor.js";
import {
  finitePlacementValue,
  normalizePlacementBounds,
  placementBoundsCorners,
  placementBoundsOverlap,
  placementPointInsideBounds,
  placementVector3,
  dotPlacementVectors,
  subtractPlacementVectors,
  unitPlacementVector
} from "./placement-math.js";
import {
  computePlacementWorldPoint,
  getPlacementWorldAnchor,
  getPlacementWorldBounds
} from "./placement-operations.js";

export function validatePlacement(input, options = {}) {
  const errors = [];
  const warnings = [];
  let placement;
  try {
    placement = createObjectPlacementDescriptor(input);
  } catch (error) {
    return {
      valid: false,
      errors: [{ code: "invalid-descriptor", message: error instanceof Error ? error.message : String(error) }],
      warnings,
      metrics: {}
    };
  }
  const tolerance = Math.max(0, finitePlacementValue(options.tolerance, 0.001, "tolerance"));
  if (!placementPointInsideBounds(placement.pivot, placement.localBounds, tolerance)) {
    warnings.push({ code: "pivot-outside-bounds", message: "The pivot is outside local bounds." });
  }
  if (!placementPointInsideBounds(placement.origin, placement.localBounds, tolerance)) {
    warnings.push({ code: "origin-outside-bounds", message: "The origin is outside local bounds." });
  }
  for (const anchor of placement.anchors) {
    if (!placementPointInsideBounds(anchor.position, placement.localBounds, tolerance)) {
      warnings.push({
        code: "anchor-outside-bounds",
        anchorId: anchor.id,
        message: `Anchor ${anchor.id} is outside local bounds.`
      });
    }
  }

  const worldBounds = getPlacementWorldBounds(placement);
  const metrics = { worldBounds };
  if (options.containerBounds) {
    const container = normalizePlacementBounds(options.containerBounds, "containerBounds");
    const outside = worldBounds.min.some((entry, axis) => (
      entry < container.min[axis] - tolerance
      || worldBounds.max[axis] > container.max[axis] + tolerance
    ));
    if (outside) errors.push({ code: "outside-container", message: "Placement exceeds the required container bounds." });
  }
  for (const [index, obstacleInput] of (options.obstacleBounds ?? []).entries()) {
    const obstacle = normalizePlacementBounds(obstacleInput, `obstacleBounds[${index}]`);
    if (placementBoundsOverlap(worldBounds, obstacle, tolerance)) {
      errors.push({
        code: "bounds-overlap",
        obstacleIndex: index,
        message: `Placement overlaps obstacle ${index}.`
      });
    }
  }
  if (options.contactPlane) {
    const plane = {
      point: placementVector3(options.contactPlane.point, [0, 0, 0], "contactPlane.point"),
      normal: unitPlacementVector(
        placementVector3(options.contactPlane.normal, [0, 1, 0], "contactPlane.normal"),
        "contactPlane.normal"
      )
    };
    const clearance = finitePlacementValue(options.clearance, 0, "clearance");
    const support = getPlacementWorldAnchor(placement, placement.supportAnchorId);
    const contactError = Math.abs(
      dotPlacementVectors(subtractPlacementVectors(support.position, plane.point), plane.normal)
      - clearance
    );
    const minimumCornerDistance = Math.min(...placementBoundsCorners(placement.localBounds).map((point) => (
      dotPlacementVectors(
        subtractPlacementVectors(computePlacementWorldPoint(placement, point), plane.point),
        plane.normal
      )
    )));
    metrics.contactError = contactError;
    metrics.minimumCornerDistance = minimumCornerDistance;
    if (contactError > tolerance) {
      errors.push({ code: "contact-gap", value: contactError, message: "Support anchor does not meet the contact plane." });
    }
    if (minimumCornerDistance < -tolerance) {
      errors.push({
        code: "surface-penetration",
        value: -minimumCornerDistance,
        message: "Placement penetrates the contact plane."
      });
    }
  }
  return { valid: errors.length === 0, errors, warnings, metrics };
}
