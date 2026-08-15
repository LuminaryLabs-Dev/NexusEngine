import { DEFAULT_SCENE_HOST_BINDING, DEFAULT_SCENE_KIND, SCENE_HOST_BINDING_BY_KIND } from "./constants.js";
import { asArray, clone, isObject, requireSceneId, unique } from "./utils.js";

export function hostBindingForSceneKind(kind, explicitHostBinding) {
  return explicitHostBinding !== undefined && explicitHostBinding !== null && String(explicitHostBinding).trim()
    ? String(explicitHostBinding).trim()
    : SCENE_HOST_BINDING_BY_KIND[kind] ?? DEFAULT_SCENE_HOST_BINDING;
}

export function createSceneRequirements(...sources) {
  return unique(sources.flatMap((source) => asArray(source)));
}

export function createSceneExit(exit = {}) {
  if (!isObject(exit)) throw new TypeError("createSceneExit expects an exit object.");
  const to = requireSceneId(exit.to ?? exit.toSceneId ?? exit.sceneId, "scene exit target");
  const exitId = requireSceneId(exit.id ?? exit.exitId ?? to, "scene exit id");
  return Object.freeze({
    id: exitId,
    to,
    label: exit.label ?? exitId,
    enabled: exit.enabled !== false,
    requires: Object.freeze(createSceneRequirements(exit.requires, exit.requiredTokens)),
    payload: clone(exit.payload ?? {}),
    metadata: Object.freeze(isObject(exit.metadata) ? clone(exit.metadata) : {})
  });
}

export function normalizeSceneExits(exits = {}) {
  if (Array.isArray(exits)) {
    return Object.fromEntries(exits.map((exit) => {
      const normalized = createSceneExit(exit);
      return [normalized.id, normalized];
    }));
  }
  if (!isObject(exits)) return {};
  return Object.fromEntries(Object.entries(exits).map(([exitId, exit]) => {
    const normalized = createSceneExit({ id: exitId, ...(isObject(exit) ? exit : { to: exit }) });
    return [normalized.id, normalized];
  }));
}

export function createSceneDescriptor(scene = {}) {
  if (!isObject(scene)) throw new TypeError("createSceneDescriptor expects a scene object.");
  const sceneId = requireSceneId(scene.id ?? scene.sceneId, "scene id");
  const kind = requireSceneId(scene.kind ?? DEFAULT_SCENE_KIND, "scene kind");
  return Object.freeze({
    id: sceneId,
    title: scene.title ?? sceneId,
    kind,
    hostBinding: hostBindingForSceneKind(kind, scene.hostBinding),
    entry: scene.entry ?? scene.url ?? scene.bundle ?? scene.module ?? null,
    exits: Object.freeze(normalizeSceneExits(scene.exits ?? {})),
    restore: Object.freeze(clone(scene.restore ?? {})),
    descriptors: Object.freeze(clone(scene.descriptors ?? {})),
    metadata: Object.freeze(isObject(scene.metadata) ? clone(scene.metadata) : {})
  });
}

export function createSceneRegistry(input = {}) {
  const source = input?.scenes ?? input;
  const entries = Array.isArray(source)
    ? source.map((scene) => [scene?.id, scene])
    : Object.entries(isObject(source) ? source : {});
  return Object.freeze(Object.fromEntries(entries.map(([sceneId, scene]) => {
    const descriptor = createSceneDescriptor({ id: sceneId, ...(scene ?? {}) });
    return [descriptor.id, descriptor];
  })));
}
