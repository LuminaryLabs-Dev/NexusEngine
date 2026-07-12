import { createCoreMotionKit } from "../../core-kits/core-motion-kit/index.js";
import { createArticulatedMotionDomain } from "./subdomains/articulated-motion-domain/index.js";

export * from "../../core-kits/core-motion-kit/index.js";
export * from "./subdomains/articulated-motion-domain/index.js";

export function createCoreMotionDomain(config = {}) {
  return [
    createCoreMotionKit(config.root ?? {}),
    createArticulatedMotionDomain(config.articulation ?? {})
  ];
}

export default createCoreMotionDomain;
