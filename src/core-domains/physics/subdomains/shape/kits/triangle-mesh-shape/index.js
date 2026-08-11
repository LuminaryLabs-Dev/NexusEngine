import { createDomainKit } from "../../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createTriangleMeshShapeKit = createShapeKit({ createDomainKit, type: "triangle-mesh", id: "triangle-mesh-shape-kit", apiName: "triangleMeshShape", purpose: "Triangle mesh geometry", provides: ["n:physics:shape","physics:triangle-mesh-shape"] });
export default createTriangleMeshShapeKit;
