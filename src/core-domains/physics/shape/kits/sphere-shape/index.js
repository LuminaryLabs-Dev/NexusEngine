import { createDomainKit } from "../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createSphereShapeKit = createShapeKit({ createDomainKit, type: "sphere", id: "sphere-shape-kit", apiName: "sphereShape", purpose: "Sphere geometry", provides: ["n:physics:shape","physics:sphere-shape"] });
export default createSphereShapeKit;
