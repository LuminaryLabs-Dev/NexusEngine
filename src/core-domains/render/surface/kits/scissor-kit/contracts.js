import { inspectSurfaceDescriptor, normalizeSurfaceDescriptor, surfaceKitContract } from "../../surface-contracts.js";

export const scissorContract = () => surfaceKitContract("scissor-kit");
export const normalizeScissor = (input) => normalizeSurfaceDescriptor("scissor-kit", input);
export const inspectScissor = (input) => inspectSurfaceDescriptor("scissor-kit", input);
