import { clone, requireSceneId, unique } from "./utils.js";

export function getAvailableSceneTokens(state, request = {}) {
  const flagTokens = Object.entries(state?.sceneFlags ?? {})
    .filter(([, enabled]) => Boolean(enabled))
    .map(([token]) => token);
  return new Set(unique([
    ...(state?.unlockedTokens ?? []),
    ...flagTokens,
    ...(request.availableTokens ?? []),
    ...(request.tokens ?? [])
  ]));
}

export function evaluateSceneExit(exit, state, request = {}) {
  if (!exit) return { allowed: false, reason: "missing-exit", missingRequirements: [] };
  if (exit.enabled === false) return { allowed: false, reason: "exit-disabled", missingRequirements: [] };
  const tokens = getAvailableSceneTokens(state, request);
  const missingRequirements = (exit.requires ?? []).filter((token) => !tokens.has(token));
  return {
    allowed: missingRequirements.length === 0,
    reason: missingRequirements.length ? "missing-requirements" : null,
    missingRequirements
  };
}

export function createRejectedSceneTransition(state, request, reason, extra = {}) {
  const fromSceneId = request.fromSceneId ?? state.currentSceneId ?? null;
  const transitionId = requireSceneId(
    request.transitionId ?? `rejected:${Number(state.transitionSequence ?? 0) + 1}:${fromSceneId ?? "none"}:${request.exitId ?? extra.toSceneId ?? "unknown"}`,
    "transition id"
  );
  return Object.freeze({
    type: "scene.transition.rejected",
    accepted: false,
    transitionId,
    fromSceneId,
    toSceneId: extra.toSceneId ?? null,
    exitId: request.exitId ?? extra.exit?.id ?? null,
    reason,
    missingRequirements: Object.freeze([...(extra.missingRequirements ?? [])]),
    payload: clone(request.payload ?? {}),
    sequence: Number(state.transitionSequence ?? 0) + 1
  });
}

export function createAcceptedSceneTransition(state, request, fromScene, targetScene, exit) {
  const fromSceneId = request.fromSceneId ?? fromScene?.id ?? state.currentSceneId ?? null;
  const transitionId = requireSceneId(
    request.transitionId ?? `transition:${Number(state.transitionSequence ?? 0) + 1}:${fromSceneId ?? "none"}:${exit?.id ?? targetScene.id}`,
    "transition id"
  );
  const payload = clone({ ...(exit?.payload ?? {}), ...(request.payload ?? {}) });
  return Object.freeze({
    type: "scene.transition.accepted",
    accepted: true,
    transitionId,
    fromSceneId,
    toSceneId: targetScene.id,
    exitId: request.exitId ?? exit?.id ?? null,
    scene: clone(targetScene),
    exit: clone(exit),
    mount: Object.freeze({
      sceneId: targetScene.id,
      kind: targetScene.kind,
      hostBinding: request.hostBinding ?? targetScene.hostBinding,
      entry: targetScene.entry
    }),
    payload,
    restore: clone(request.restore ?? targetScene.restore ?? {}),
    sequence: Number(state.transitionSequence ?? 0) + 1
  });
}
