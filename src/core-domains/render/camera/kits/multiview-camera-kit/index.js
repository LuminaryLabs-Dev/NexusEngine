import { createCameraKit } from "../../camera-kit.js";
export function createMultiviewCameraKit(config = {}) { return createCameraKit("multiview-camera-kit", config); }
export { renderMultiviewCameraContract } from "./contracts.js";
