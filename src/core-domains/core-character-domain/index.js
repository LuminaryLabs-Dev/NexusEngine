import { createCoreCharacterKit } from "../../core-kits/core-character-kit/index.js";

export * from "../../core-kits/core-character-kit/index.js";

export function createCoreCharacterDomain(config = {}) {
  return [createCoreCharacterKit(config.root ?? config)];
}

export default createCoreCharacterDomain;
