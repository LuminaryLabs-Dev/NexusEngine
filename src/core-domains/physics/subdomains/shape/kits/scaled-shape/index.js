import { createDomainKit } from "../../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createScaledShapeKit = createShapeKit({ createDomainKit, type: "scaled", id: "scaled-shape-kit", apiName: "scaledShape", purpose: "Scaled shape composition", provides: ["n:physics:shape","physics:scaled-shape"] });
export default createScaledShapeKit;
