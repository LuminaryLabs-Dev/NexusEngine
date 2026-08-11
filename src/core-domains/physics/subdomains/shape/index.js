export { createShapeIdentityKit } from "./kits/shape-identity/index.js";
export { createShapeRegistryKit } from "./kits/shape-registry/index.js";
export { createShapeValidationKit } from "./kits/shape-validation/index.js";
export { createSphereShapeKit } from "./kits/sphere-shape/index.js";
export { createBoxShapeKit } from "./kits/box-shape/index.js";
export { createCapsuleShapeKit } from "./kits/capsule-shape/index.js";
export { createCylinderShapeKit } from "./kits/cylinder-shape/index.js";
export { createConeShapeKit } from "./kits/cone-shape/index.js";
export { createPlaneShapeKit } from "./kits/plane-shape/index.js";
export { createConvexShapeKit } from "./kits/convex-shape/index.js";
export { createTriangleMeshShapeKit } from "./kits/triangle-mesh-shape/index.js";
export { createHeightfieldShapeKit } from "./kits/heightfield-shape/index.js";
export { createCompoundShapeKit } from "./kits/compound-shape/index.js";
export { createScaledShapeKit } from "./kits/scaled-shape/index.js";
export { PHYSICS_SHAPE_KIT_MANIFESTS } from "./shape-manifests.js";
export { default as physicsShapeSubdomainManifest } from "./subdomain.manifest.js";
export * from "./shape-contracts.js";

import { createShapeIdentityKit } from "./kits/shape-identity/index.js";
import { createShapeRegistryKit } from "./kits/shape-registry/index.js";
import { createShapeValidationKit } from "./kits/shape-validation/index.js";
import { createSphereShapeKit } from "./kits/sphere-shape/index.js";
import { createBoxShapeKit } from "./kits/box-shape/index.js";
import { createCapsuleShapeKit } from "./kits/capsule-shape/index.js";
import { createCylinderShapeKit } from "./kits/cylinder-shape/index.js";
import { createConeShapeKit } from "./kits/cone-shape/index.js";
import { createPlaneShapeKit } from "./kits/plane-shape/index.js";
import { createConvexShapeKit } from "./kits/convex-shape/index.js";
import { createTriangleMeshShapeKit } from "./kits/triangle-mesh-shape/index.js";
import { createHeightfieldShapeKit } from "./kits/heightfield-shape/index.js";
import { createCompoundShapeKit } from "./kits/compound-shape/index.js";
import { createScaledShapeKit } from "./kits/scaled-shape/index.js";

export function createPhysicsShapeDomain(config = {}) {
  return [
    createShapeIdentityKit(config.identity ?? {}),
    createShapeValidationKit(config.validation ?? {}),
    createSphereShapeKit(config.sphere ?? {}),
    createBoxShapeKit(config.box ?? {}),
    createCapsuleShapeKit(config.capsule ?? {}),
    createCylinderShapeKit(config.cylinder ?? {}),
    createConeShapeKit(config.cone ?? {}),
    createPlaneShapeKit(config.plane ?? {}),
    createConvexShapeKit(config.convex ?? {}),
    createTriangleMeshShapeKit(config.triangleMesh ?? {}),
    createHeightfieldShapeKit(config.heightfield ?? {}),
    createCompoundShapeKit(config.compound ?? {}),
    createScaledShapeKit(config.scaled ?? {}),
    createShapeRegistryKit(config.registry ?? {})
  ];
}

export default createPhysicsShapeDomain;
