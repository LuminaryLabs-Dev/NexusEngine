import { createCorePlayerKit } from "../../core-kits/core-player-kit/index.js";

export * from "../../core-kits/core-player-kit/index.js";

export function createCorePlayerDomain(config = {}) {
  return [createCorePlayerKit(config.root ?? config)];
}

export default createCorePlayerDomain;
