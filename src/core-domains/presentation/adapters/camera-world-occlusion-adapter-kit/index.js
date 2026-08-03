import { createDomainKit } from "../../../domain-kit.js";
import { constrainCameraDescriptor } from "./contracts.js";
import { createCameraWorldOcclusionServices } from "./services.js";
import { createCameraWorldOcclusionState } from "./state.js";

export { constrainCameraDescriptor } from "./contracts.js";

export function createCameraWorldOcclusionAdapterKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "camera-world-occlusion-adapter-kit",
    id: config.id ?? "camera-world-occlusion-adapter-kit",
    domain: "camera-world-occlusion",
    domainPath: "n:presentation:camera:third-person",
    parentDomainPath: "n:presentation:camera",
    apiName: "cameraWorldOcclusion",
    requires: ["camera:third-person-descriptor", "world:terrain-sampling", "physics:query"],
    provides: ["camera:world-occlusion-response"],
    initialState: createCameraWorldOcclusionState(),
    createApi: createCameraWorldOcclusionServices,
    metadata: { adapter: true, ownsSourceState: false, rendererAgnostic: true }
  });
}

export default createCameraWorldOcclusionAdapterKit;
