import { createCreatureKit } from "./kits/creature-kit/index.js";

export * from "./kits/creature-kit/index.js";

export function createCreatureDomain(config = {}) {
  return [createCreatureKit(config.root ?? config)];
}

export default createCreatureDomain;
