import { createCoreCreatureKit } from "../../core-kits/core-creature-kit/index.js";

export * from "../../core-kits/core-creature-kit/index.js";

export function createCoreCreatureDomain(config = {}) {
  return [createCoreCreatureKit(config.root ?? config)];
}

export default createCoreCreatureDomain;
