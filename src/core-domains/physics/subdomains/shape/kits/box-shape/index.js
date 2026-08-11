import { createDomainKit } from "../../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createBoxShapeKit = createShapeKit({ createDomainKit, type: "box", id: "box-shape-kit", apiName: "boxShape", purpose: "Box geometry", provides: ["n:physics:shape","physics:box-shape"] });
export default createBoxShapeKit;
