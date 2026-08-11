import { createDomainKit } from "../../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createCompoundShapeKit = createShapeKit({ createDomainKit, type: "compound", id: "compound-shape-kit", apiName: "compoundShape", purpose: "Compound shape composition", provides: ["n:physics:shape","physics:compound-shape"] });
export default createCompoundShapeKit;
