import { createMotionKit } from "./kits/motion-kit/index.js";
import { createArticulatedMotionDomain } from "./subdomains/articulated-motion-domain/index.js";

export * from "./kits/motion-kit/index.js";
export * from "./subdomains/articulated-motion-domain/index.js";

export function createMotionDomain(config = {}) {
  return [
    createMotionKit(config.root ?? {}),
    createArticulatedMotionDomain(config.articulation ?? {})
  ];
}

export default createMotionDomain;
