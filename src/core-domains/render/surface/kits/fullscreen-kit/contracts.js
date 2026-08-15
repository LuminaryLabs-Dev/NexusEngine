import { inspectSurfaceDescriptor, normalizeSurfaceDescriptor, surfaceKitContract } from "../../surface-contracts.js";

export const fullscreenIntentContract = () => surfaceKitContract("fullscreen-kit");
export const normalizeFullscreenIntent = (input) => normalizeSurfaceDescriptor("fullscreen-kit", input);
export const inspectFullscreenIntent = (input) => inspectSurfaceDescriptor("fullscreen-kit", input);
