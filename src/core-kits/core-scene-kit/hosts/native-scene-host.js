import { createSceneHostBinding } from "../host-contract.js";

export function createNativeSceneHostBinding(config = {}) {
  return createSceneHostBinding({
    id: config.id ?? "rust-native",
    kinds: config.kinds ?? ["native-rust-scene", "native-command-scene", "openxr-scene"],
    canLoad: config.canLoad,
    load: config.load ?? ((transition) => ({
      hostBinding: config.id ?? "rust-native",
      mounted: true,
      sceneId: transition.toSceneId,
      entry: transition.scene?.entry ?? null,
      descriptorCommands: transition.scene?.descriptors?.commands ?? []
    }))
  });
}
