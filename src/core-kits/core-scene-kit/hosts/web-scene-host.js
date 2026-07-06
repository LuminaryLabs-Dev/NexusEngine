import { SCENE_PAYLOAD_STORAGE_KEY, SCENE_SNAPSHOT_STORAGE_KEY } from "../constants.js";
import { createSceneHostBinding } from "../host-contract.js";
import { clone } from "../utils.js";

export function createWebSceneHostBinding(config = {}) {
  const storageKey = config.payloadStorageKey ?? SCENE_PAYLOAD_STORAGE_KEY;
  const snapshotKey = config.snapshotStorageKey ?? SCENE_SNAPSHOT_STORAGE_KEY;
  return createSceneHostBinding({
    id: config.id ?? "web-html",
    kinds: config.kinds ?? ["web-html-scene"],
    canLoad: config.canLoad,
    load(transition, context = {}) {
      const storage = config.storage ?? globalThis?.sessionStorage;
      const navigate = config.navigate ?? ((entry) => {
        if (!globalThis?.location) throw new Error("web scene host cannot navigate without globalThis.location or config.navigate.");
        globalThis.location.href = entry;
      });
      if (storage?.setItem) {
        storage.setItem(storageKey, JSON.stringify({
          transitionId: transition.transitionId,
          sceneId: transition.toSceneId,
          payload: clone(transition.payload ?? {}),
          scene: clone(transition.scene)
        }));
        if (context.snapshot) storage.setItem(snapshotKey, JSON.stringify(context.snapshot));
      }
      if (config.autoNavigate !== false) navigate(transition.scene?.entry, transition, context);
      return {
        hostBinding: config.id ?? "web-html",
        mounted: false,
        navigating: config.autoNavigate !== false,
        sceneId: transition.toSceneId,
        entry: transition.scene?.entry ?? null
      };
    }
  });
}

export const createWebHtmlSceneHostBinding = createWebSceneHostBinding;
