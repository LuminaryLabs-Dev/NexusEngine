import { createDomainKit } from "../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createCylinderShapeKit = createShapeKit({ createDomainKit, type: "cylinder", id: "cylinder-shape-kit", apiName: "cylinderShape", purpose: "Cylinder geometry", provides: ["n:physics:shape","physics:cylinder-shape"] });
export default createCylinderShapeKit;
