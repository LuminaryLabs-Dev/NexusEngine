import { inspectSurfaceDescriptor, normalizeSurfaceDescriptor, surfaceKitContract } from "../../surface-contracts.js";

export const surfaceFormatContract = () => surfaceKitContract("surface-format-kit");
export const normalizeSurfaceFormat = (input) => normalizeSurfaceDescriptor("surface-format-kit", input);
export const inspectSurfaceFormat = (input) => inspectSurfaceDescriptor("surface-format-kit", input);
