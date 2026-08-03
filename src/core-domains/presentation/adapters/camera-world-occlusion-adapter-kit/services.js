import { constrainCameraDescriptor } from "./contracts.js";

export function createCameraWorldOcclusionServices() {
  return Object.freeze({ constrain: constrainCameraDescriptor });
}
