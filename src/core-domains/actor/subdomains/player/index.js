import { createPlayerKit } from "./kits/player-kit/index.js";

export * from "./kits/player-kit/index.js";

export function createPlayerDomain(config = {}) {
  return [createPlayerKit(config.root ?? config)];
}

export default createPlayerDomain;
