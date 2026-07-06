import { DEFAULT_SCENE_HOST_BINDING } from "../constants.js";
import { createSceneHostBinding } from "../host-contract.js";
import { clone } from "../utils.js";

export function createHeadlessSceneHostBinding(config = {}) {
  const mounts = [];
  const host = createSceneHostBinding({
    id: config.id ?? DEFAULT_SCENE_HOST_BINDING,
    kinds: config.kinds ?? [],
    canLoad: config.canLoad ?? (() => true),
    load(transition, context = {}) {
      const mount = {
        hostBinding: config.id ?? DEFAULT_SCENE_HOST_BINDING,
        mounted: true,
        sceneId: transition.toSceneId,
        transitionId: transition.transitionId,
        entry: transition.scene?.entry ?? null,
        payload: clone(transition.payload ?? {}),
        context: clone(context)
      };
      mounts.push(mount);
      return clone(mount);
    }
  });
  return Object.freeze({ ...host, getMounts: () => clone(mounts) });
}
