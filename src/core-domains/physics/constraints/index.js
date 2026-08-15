export { createBallSocketConstraintKit } from "./kits/ball-socket-constraint-kit/index.js";
export { createConeTwistConstraintKit } from "./kits/cone-twist-constraint-kit/index.js";
export { createDistanceConstraintKit } from "./kits/distance-constraint-kit/index.js";
export { createDriveConstraintKit } from "./kits/drive-constraint-kit/index.js";
export { createFixedConstraintKit } from "./kits/fixed-constraint-kit/index.js";
export { createHingeConstraintKit } from "./kits/hinge-constraint-kit/index.js";
export { createLimitConstraintKit } from "./kits/limit-constraint-kit/index.js";
export { createMotorConstraintKit } from "./kits/motor-constraint-kit/index.js";
export { createSliderConstraintKit } from "./kits/slider-constraint-kit/index.js";
export { createSpringConstraintKit } from "./kits/spring-constraint-kit/index.js";
export { createConstraintBreakKit } from "./kits/constraint-break-kit/index.js";
export { createConstraintRegistryKit } from "./kits/constraint-registry-kit/index.js";
export { PHYSICS_CONSTRAINT_KIT_MANIFESTS } from "./constraints-manifests.js";
export { default as physicsConstraintsSubdomainManifest } from "./subdomain.manifest.js";
export * from "./constraints-contracts.js";

import { createBallSocketConstraintKit } from "./kits/ball-socket-constraint-kit/index.js";
import { createConeTwistConstraintKit } from "./kits/cone-twist-constraint-kit/index.js";
import { createDistanceConstraintKit } from "./kits/distance-constraint-kit/index.js";
import { createDriveConstraintKit } from "./kits/drive-constraint-kit/index.js";
import { createFixedConstraintKit } from "./kits/fixed-constraint-kit/index.js";
import { createHingeConstraintKit } from "./kits/hinge-constraint-kit/index.js";
import { createLimitConstraintKit } from "./kits/limit-constraint-kit/index.js";
import { createMotorConstraintKit } from "./kits/motor-constraint-kit/index.js";
import { createSliderConstraintKit } from "./kits/slider-constraint-kit/index.js";
import { createSpringConstraintKit } from "./kits/spring-constraint-kit/index.js";
import { createConstraintBreakKit } from "./kits/constraint-break-kit/index.js";
import { createConstraintRegistryKit } from "./kits/constraint-registry-kit/index.js";

export function createPhysicsConstraintsDomain(config = {}) {
  return [
    createBallSocketConstraintKit(config.ballSocket ?? {}),
    createConeTwistConstraintKit(config.coneTwist ?? {}),
    createDistanceConstraintKit(config.distance ?? {}),
    createDriveConstraintKit(config.drive ?? {}),
    createFixedConstraintKit(config.fixed ?? {}),
    createHingeConstraintKit(config.hinge ?? {}),
    createLimitConstraintKit(config.limit ?? {}),
    createMotorConstraintKit(config.motor ?? {}),
    createSliderConstraintKit(config.slider ?? {}),
    createSpringConstraintKit(config.spring ?? {}),
    createConstraintBreakKit(config.break ?? {}),
    createConstraintRegistryKit(config.registry ?? {})
  ];
}

export default createPhysicsConstraintsDomain;
