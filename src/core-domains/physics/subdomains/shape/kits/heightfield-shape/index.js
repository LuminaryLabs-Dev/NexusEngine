import { createDomainKit } from "../../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createHeightfieldShapeKit = createShapeKit({ createDomainKit, type: "heightfield", id: "heightfield-shape-kit", apiName: "heightfieldShape", purpose: "Heightfield geometry", provides: ["n:physics:shape","physics:heightfield-shape"] });
export default createHeightfieldShapeKit;
