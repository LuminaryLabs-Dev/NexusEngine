import { createCharacterKit } from "./kits/character-kit/index.js";

export * from "./kits/character-kit/index.js";

export function createCharacterDomain(config = {}) {
  return [createCharacterKit(config.root ?? config)];
}

export default createCharacterDomain;
