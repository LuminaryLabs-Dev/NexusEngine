import { createDomainKit } from "../../../../../domain-kit.js";
import { createShapeKit } from "../../shape-contracts.js";
export const createConvexShapeKit = createShapeKit({ createDomainKit, type: "convex", id: "convex-shape-kit", apiName: "convexShape", purpose: "Convex hull geometry", provides: ["n:physics:shape","physics:convex-shape"] });
export default createConvexShapeKit;
