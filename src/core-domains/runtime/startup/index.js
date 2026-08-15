import { createStartupKit } from "./kits/startup-kit/index.js";

export * from "./kits/startup-kit/index.js";
export * from "./core-assets-startup-bridge.js";

export function createStartupDomain(config = {}) {
  return [createStartupKit(config.root ?? config)];
}

export default createStartupDomain;
