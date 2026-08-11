import { createCameraKit } from "../../camera-kit.js";
export function createStereoCameraKit(config = {}) { return createCameraKit("stereo-camera-kit", config); }
export { renderStereoCameraContract } from "./contracts.js";
