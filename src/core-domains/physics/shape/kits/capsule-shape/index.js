import { createDomainKit } from "../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createCapsuleShapeKit = createShapeKit({ createDomainKit, type: "capsule", id: "capsule-shape-kit", apiName: "capsuleShape", purpose: "Capsule geometry", provides: ["n:physics:shape","physics:capsule-shape"] });
export default createCapsuleShapeKit;
