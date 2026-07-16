import { createCoreStartupKit } from "../../core-kits/core-startup-kit/index.js";

export * from "../../core-kits/core-startup-kit/index.js";
export * from "./core-assets-startup-bridge.js";

export function createCoreStartupDomain(config = {}) {
  return [createCoreStartupKit(config.root ?? config)];
}

export default createCoreStartupDomain;
