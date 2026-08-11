import { inspectSurfaceDescriptor, normalizeSurfaceDescriptor, surfaceKitContract } from "../../surface-contracts.js";

export const viewportContract = () => surfaceKitContract("viewport-kit");
export const normalizeViewport = (input) => normalizeSurfaceDescriptor("viewport-kit", input);
export const inspectViewport = (input) => inspectSurfaceDescriptor("viewport-kit", input);
