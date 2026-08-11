import { createCameraKit } from "../../camera-kit.js";
export function createCameraBindingKit(config = {}) { return createCameraKit("camera-binding-kit", config); }
export { renderCameraBindingContract } from "./contracts.js";
