export function createSceneHostBinding(config = {}) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new TypeError("createSceneHostBinding expects a config object.");
  }
  const hostId = String(config.id ?? config.hostBinding ?? "scene-host").trim();
  if (!hostId) throw new TypeError("Scene host binding requires a non-empty id.");
  const kinds = new Set((Array.isArray(config.kinds) ? config.kinds : [config.kinds ?? config.kind]).filter(Boolean).map(String));
  return {
    id: hostId,
    kinds: Object.freeze(Array.from(kinds)),
    canLoad(scene) {
      return typeof config.canLoad === "function" ? Boolean(config.canLoad(scene)) : kinds.size === 0 || kinds.has(scene?.kind);
    },
    discard(transition, context = {}) {
      if (typeof config.discard !== "function") throw new Error("SCENE_HOST_DISCARD_REQUIRED: cannot discard staged content.");
      return config.discard(transition, context);
    },
    unload(transition, context = {}) {
      return typeof config.unload === "function"
        ? config.unload(transition, context)
        : { hostBinding: hostId, unloaded: true, sceneId: transition?.fromSceneId ?? null };
    },
    load(transition, context = {}) {
      return typeof config.load === "function"
        ? config.load(transition, context)
        : (() => { throw new Error("SCENE_HOST_LOAD_REQUIRED: supply a real load callback."); })();
    }
  };
}

export function mountAcceptedSceneTransition(engine, hostBinding, resultOrTransition, context = {}) {
  const transition = resultOrTransition?.transition ?? resultOrTransition;
  if (!transition?.accepted) throw new Error("mountAcceptedSceneTransition expects an accepted scene transition.");
  if (!hostBinding?.canLoad?.(transition.scene)) {
    throw new Error(`Scene host binding ${hostBinding?.id ?? "unknown"} cannot load scene kind ${transition.scene?.kind}.`);
  }
  const apply = (mountResult) => {
    if (!mountResult || mountResult.mounted !== true || mountResult.sceneId !== transition.toSceneId) {
      throw new Error("SCENE_LOAD_INVALID_RESULT: host did not confirm destination mount.");
    }
    if (typeof engine?.n?.scene?.mountScene !== "function") {
      throw new Error("SCENE_MOUNT_API_MISSING");
    }
    return ({
    transition,
    mountResult,
    mountedState: engine?.n?.scene?.mountScene?.({
      mountId: context.mountId ?? transition.transitionId,
      transitionId: transition.transitionId,
      sceneId: transition.toSceneId,
      hostBinding: hostBinding.id,
      result: mountResult
    })
    });
  };
  const result = hostBinding.load(transition, context);
  return typeof result?.then === "function" ? result.then(apply) : apply(result);
}
