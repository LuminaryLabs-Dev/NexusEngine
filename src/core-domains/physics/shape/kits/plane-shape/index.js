import { createDomainKit } from "../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createPlaneShapeKit = createShapeKit({ createDomainKit, type: "plane", id: "plane-shape-kit", apiName: "planeShape", purpose: "Plane geometry", provides: ["n:physics:shape","physics:plane-shape"] });
export default createPlaneShapeKit;
