import { createCameraKit } from "../../camera-kit.js";
export function createCameraProjectionKit(config = {}) { return createCameraKit("camera-projection-kit", config); }
export { renderCameraProjectionContract } from "./contracts.js";
