import { inspectSurfaceDescriptor, normalizeSurfaceDescriptor, surfaceKitContract } from "../../surface-contracts.js";

export const swapchainSurfaceContract = () => surfaceKitContract("swapchain-surface-kit");
export const normalizeSwapchainSurface = (input) => normalizeSurfaceDescriptor("swapchain-surface-kit", input);
export const inspectSwapchainSurface = (input) => inspectSurfaceDescriptor("swapchain-surface-kit", input);
