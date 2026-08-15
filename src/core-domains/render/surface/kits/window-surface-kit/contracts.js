import { inspectSurfaceDescriptor, normalizeSurfaceDescriptor, surfaceKitContract } from "../../surface-contracts.js";

export const windowSurfaceContract = () => surfaceKitContract("window-surface-kit");
export const normalizeWindowSurface = (input) => normalizeSurfaceDescriptor("window-surface-kit", input);
export const inspectWindowSurface = (input) => inspectSurfaceDescriptor("window-surface-kit", input);
