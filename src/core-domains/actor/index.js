export { actorDomainManifest } from "./domain.manifest.js";
export { createActorRegistryKit } from "./kits/actor-registry-kit/index.js";
export { createCreatureKit } from "./creature/kits/creature-kit/index.js";
export { createCharacterKit } from "./character/kits/character-kit/index.js";
export { createPlayerKit } from "./player/kits/player-kit/index.js";

import { createActorRegistryKit } from "./kits/actor-registry-kit/index.js";
import { createCreatureKit } from "./creature/kits/creature-kit/index.js";
import { createCharacterKit } from "./character/kits/character-kit/index.js";
import { createPlayerKit } from "./player/kits/player-kit/index.js";

export function createActorDomain(config = {}) {
  const kits = [createActorRegistryKit(config.actor ?? {})];
  if (config.creature !== false) kits.push(createCreatureKit(config.creature ?? {}));
  if (config.character !== false) kits.push(createCharacterKit(config.character ?? {}));
  if (config.player !== false) kits.push(createPlayerKit(config.player ?? {}));
  return kits;
}
