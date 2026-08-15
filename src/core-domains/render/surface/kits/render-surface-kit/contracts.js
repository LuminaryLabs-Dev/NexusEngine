import { inspectSurfaceDescriptor, normalizeSurfaceDescriptor, surfaceKitContract } from "../../surface-contracts.js";

export const renderSurfaceContract = () => surfaceKitContract("render-surface-kit");
export const normalizeRenderSurface = (input) => normalizeSurfaceDescriptor("render-surface-kit", input);
export const inspectRenderSurface = (input) => inspectSurfaceDescriptor("render-surface-kit", input);
