import { inspectSurfaceDescriptor, normalizeSurfaceDescriptor, surfaceKitContract } from "../../surface-contracts.js";

export const offscreenSurfaceContract = () => surfaceKitContract("offscreen-surface-kit");
export const normalizeOffscreenSurface = (input) => normalizeSurfaceDescriptor("offscreen-surface-kit", input);
export const inspectOffscreenSurface = (input) => inspectSurfaceDescriptor("offscreen-surface-kit", input);
