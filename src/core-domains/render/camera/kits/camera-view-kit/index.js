import { createCameraKit } from "../../camera-kit.js";
export function createCameraViewKit(config = {}) { return createCameraKit("camera-view-kit", config); }
export { renderCameraViewContract } from "./contracts.js";
