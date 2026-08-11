import { inspectSurfaceDescriptor, normalizeSurfaceDescriptor, surfaceKitContract } from "../../surface-contracts.js";

export const resizeIntentContract = () => surfaceKitContract("resize-kit");
export const normalizeResizeIntent = (input) => normalizeSurfaceDescriptor("resize-kit", input);
export const inspectResizeIntent = (input) => inspectSurfaceDescriptor("resize-kit", input);
