import { createCameraKit } from "../../camera-kit.js";
export function createCameraViewportKit(config = {}) { return createCameraKit("camera-viewport-kit", config); }
export { renderCameraViewportContract } from "./contracts.js";
