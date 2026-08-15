import { createDomainKit } from "../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createConeShapeKit = createShapeKit({ createDomainKit, type: "cone", id: "cone-shape-kit", apiName: "coneShape", purpose: "Cone geometry", provides: ["n:physics:shape","physics:cone-shape"] });
export default createConeShapeKit;
