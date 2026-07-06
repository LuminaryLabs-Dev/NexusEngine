import { createCoreCapabilityKit } from "../core-capability-kit.js";
import { CORE_SCENE_EVENT_NAMES, SCENE_HOST_BINDING_BY_KIND, SUPPORTED_SCENE_KINDS } from "./constants.js";
import { createSceneDescriptor, createSceneRegistry } from "./descriptors.js";
import { addVisitedScene, ledgerValues, ledgerWith } from "./ledgers.js";
import { createInitialSceneState, getCurrentScene, getSceneById } from "./state.js";
import { createAcceptedSceneTransition, createRejectedSceneTransition, evaluateSceneExit } from "./transitions.js";
import { clone, requireSceneId, unique } from "./utils.js";

export * from "./constants.js";
export * from "./descriptors.js";
export * from "./ledgers.js";
export * from "./state.js";
export * from "./transitions.js";
export * from "./host-contract.js";
export * from "./hosts/headless-scene-host.js";
export * from "./hosts/web-scene-host.js";
export * from "./hosts/native-scene-host.js";

export function createCoreSceneKit(config = {}) {
  const startState = createInitialSceneState(config);
  const userCreateApi = config.createApi;

  return createCoreCapabilityKit({
    ...config,
    domain: "core-scene",
    apiName: config.apiName ?? "coreScene",
    eventNames: config.eventNames ?? CORE_SCENE_EVENT_NAMES,
    services: ["scene-lifecycle", "scene-transition", "scene-host-contract", "scene-descriptors", ...(config.services ?? [])],
    purpose: "Host-agnostic scene lifecycle, scene identity, peer scene transitions, host binding descriptors, visited ledgers, and scene snapshot state.",
    owns: ["scene identity", "scene lifecycle", "scene transitions", "scene exits", "visited scene ledgers", "transition validation", "scene host descriptors", "scene snapshot state"],
    doesNotOwn: ["HTML navigation implementation", "native scene loading implementation", "renderer meshes", "dialogue text", "quest completion", "inventory rewards", "combat outcomes"],
    initialState: startState,
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      sceneDomain: true,
      hostAgnostic: true,
      supportedSceneKinds: SUPPORTED_SCENE_KINDS,
      hostBindingByKind: SCENE_HOST_BINDING_BY_KIND
    },
    createApi(context) {
      const { baseApi } = context;
      const userApi = typeof userCreateApi === "function" ? userCreateApi(context) : {};
      const state = () => baseApi.getState();
      const snap = () => baseApi.getSnapshot();
      const limit = config.transitionHistoryLimit ?? 512;
      const commit = (patch, eventName, payload = {}) => baseApi.update(patch, eventName, payload);
      const reject = (request, reason, extra = {}) => {
        const current = state();
        const transition = createRejectedSceneTransition(current, request, reason, extra);
        const next = commit({
          rejectedTransitionLedger: ledgerWith(current.rejectedTransitionLedger, transition.transitionId, transition, limit),
          lastRejectedTransition: transition,
          transitionSequence: transition.sequence
        }, "transitionRejected", { transition });
        return { accepted: false, rejected: true, transition, state: clone(next) };
      };

      const api = {
        ...baseApi,
        getSceneRegistry: () => clone(snap().registry ?? {}),
        registerScene(scene) {
          const descriptor = createSceneDescriptor(scene);
          const current = state();
          return commit({ registry: { ...(current.registry ?? {}), [descriptor.id]: descriptor } }, "descriptorChanged", { scene: descriptor });
        },
        getScene: (sceneId) => clone(getSceneById(snap(), requireSceneId(sceneId, "scene id"))),
        getCurrentScene: () => clone(getCurrentScene(snap())),
        getVisitedScenes: () => clone(snap().visitedSceneIds ?? []),
        getTransitionLedger: () => ledgerValues(snap().transitionLedger),
        getRejectedTransitionLedger: () => ledgerValues(snap().rejectedTransitionLedger),
        getMountedSceneLedger: () => ledgerValues(snap().mountedSceneLedger),
        getUnlockedTokens: () => clone(snap().unlockedTokens ?? []),
        grantToken(token) {
          const current = state();
          const tokenId = requireSceneId(token, "scene token");
          return commit({ unlockedTokens: unique([...(current.unlockedTokens ?? []), tokenId]) }, "tokenChanged", { token: tokenId, granted: true });
        },
        revokeToken(token) {
          const current = state();
          const tokenId = requireSceneId(token, "scene token");
          return commit({ unlockedTokens: (current.unlockedTokens ?? []).filter((entry) => entry !== tokenId) }, "tokenChanged", { token: tokenId, granted: false });
        },
        setSceneFlag(flagId, value = true) {
          const current = state();
          const flag = requireSceneId(flagId, "scene flag id");
          return commit({ sceneFlags: { ...(current.sceneFlags ?? {}), [flag]: Boolean(value) } }, "tokenChanged", { flagId: flag, value: Boolean(value) });
        },
        enterScene(request = {}) {
          const current = state();
          const sceneId = requireSceneId(request.sceneId ?? request.id ?? current.currentSceneId, "scene id");
          const scene = getSceneById(current, sceneId);
          if (!scene) return reject(request, "unknown-scene", { toSceneId: sceneId });
          const entryId = requireSceneId(request.entryId ?? `enter:${Number(current.transitionSequence ?? 0) + 1}:${sceneId}`, "scene entry id");
          if (current.sceneEntryLedger?.[entryId]) return { accepted: true, duplicate: true, entry: clone(current.sceneEntryLedger[entryId]), state: current };
          const entry = Object.freeze({ entryId, sceneId, fromSceneId: current.currentSceneId ?? null, source: request.source ?? "api", payload: clone(request.payload ?? {}) });
          const next = commit({
            previousSceneId: current.currentSceneId ?? null,
            currentSceneId: sceneId,
            visitedSceneIds: addVisitedScene(current.visitedSceneIds, sceneId),
            sceneEntryLedger: ledgerWith(current.sceneEntryLedger, entryId, entry, limit),
            activePayload: clone(request.payload ?? {})
          }, "sceneEntered", { entry, scene });
          return { accepted: true, entry, state: clone(next) };
        },
        requestTransition(request = {}) {
          if (!request || typeof request !== "object" || Array.isArray(request)) {
            throw new TypeError("coreScene.requestTransition expects a request object.");
          }
          const current = state();
          const transitionId = request.transitionId ? requireSceneId(request.transitionId, "transition id") : null;
          if (transitionId && current.transitionLedger?.[transitionId]) return { accepted: true, duplicate: true, transition: clone(current.transitionLedger[transitionId]), state: current };
          if (transitionId && current.rejectedTransitionLedger?.[transitionId]) return { accepted: false, duplicate: true, transition: clone(current.rejectedTransitionLedger[transitionId]), state: current };
          const fromSceneId = request.fromSceneId ?? current.currentSceneId;
          const fromScene = fromSceneId ? getSceneById(current, fromSceneId) : null;
          if (!fromScene && fromSceneId) return reject({ ...request, transitionId }, "unknown-from-scene", { toSceneId: request.toSceneId ?? null });
          const exit = request.exitId ? fromScene?.exits?.[request.exitId] ?? null : null;
          if (request.exitId && !exit) return reject({ ...request, transitionId }, "missing-exit");
          const directAllowed = request.direct === true || config.allowDirectTransitions === true;
          const toSceneId = exit?.to ?? request.toSceneId ?? request.sceneId ?? null;
          if (!toSceneId) return reject({ ...request, transitionId }, "missing-target-scene");
          if (!exit && !directAllowed) return reject({ ...request, transitionId }, "direct-transition-disabled", { toSceneId });
          const targetScene = getSceneById(current, toSceneId);
          if (!targetScene) return reject({ ...request, transitionId }, "unknown-target-scene", { exit, toSceneId });
          const verdict = evaluateSceneExit(exit ?? { enabled: true, requires: request.requires ?? [] }, current, request);
          if (!verdict.allowed) return reject({ ...request, transitionId }, verdict.reason, { exit, toSceneId, missingRequirements: verdict.missingRequirements });
          const transition = createAcceptedSceneTransition(current, { ...request, transitionId }, fromScene, targetScene, exit);
          const sceneEntryId = `transition:${transition.transitionId}:enter:${transition.toSceneId}`;
          const sceneExitId = transition.fromSceneId ? `transition:${transition.transitionId}:exit:${transition.fromSceneId}` : null;
          const sceneEntry = Object.freeze({ entryId: sceneEntryId, sceneId: transition.toSceneId, fromSceneId: transition.fromSceneId, transitionId: transition.transitionId, payload: clone(transition.payload ?? {}) });
          const sceneExit = sceneExitId ? Object.freeze({ exitId: sceneExitId, sceneId: transition.fromSceneId, toSceneId: transition.toSceneId, transitionId: transition.transitionId }) : null;
          const next = commit({
            previousSceneId: transition.fromSceneId,
            currentSceneId: transition.toSceneId,
            visitedSceneIds: addVisitedScene(current.visitedSceneIds, transition.toSceneId),
            transitionLedger: ledgerWith(current.transitionLedger, transition.transitionId, transition, limit),
            sceneEntryLedger: ledgerWith(current.sceneEntryLedger, sceneEntryId, sceneEntry, limit),
            sceneExitLedger: sceneExit ? ledgerWith(current.sceneExitLedger, sceneExitId, sceneExit, limit) : { ...(current.sceneExitLedger ?? {}) },
            activePayload: clone(transition.payload ?? {}),
            lastAcceptedTransition: transition,
            lastRejectedTransition: null,
            transitionSequence: transition.sequence
          }, "transitionAccepted", { transition });
          return { accepted: true, transition, state: clone(next) };
        },
        mountScene(request = {}) {
          const current = state();
          const sceneId = requireSceneId(request.sceneId ?? current.currentSceneId, "mounted scene id");
          const scene = getSceneById(current, sceneId);
          if (!scene) return reject(request, "unknown-scene", { toSceneId: sceneId });
          const mountId = requireSceneId(request.mountId ?? `mount:${Number(current.transitionSequence ?? 0) + 1}:${sceneId}`, "scene mount id");
          if (current.mountedSceneLedger?.[mountId]) return { accepted: true, duplicate: true, mount: clone(current.mountedSceneLedger[mountId]), state: current };
          const mount = Object.freeze({ mountId, transitionId: request.transitionId ?? null, sceneId, hostBinding: request.hostBinding ?? scene.hostBinding, kind: scene.kind, entry: scene.entry, result: clone(request.result ?? {}) });
          const next = commit({ mountedSceneLedger: ledgerWith(current.mountedSceneLedger, mountId, mount, limit), lastMountedScene: mount }, "sceneMounted", { mount, scene });
          return { accepted: true, mount, state: clone(next) };
        },
        getAvailableExits(options = {}) {
          const current = state();
          const scene = options.sceneId ? getSceneById(current, requireSceneId(options.sceneId, "scene id")) : getCurrentScene(current);
          if (!scene) return [];
          return Object.values(scene.exits ?? {}).map((exit) => {
            const verdict = evaluateSceneExit(exit, current, options);
            return { ...clone(exit), toScene: clone(getSceneById(current, exit.to)), allowed: verdict.allowed, blocked: !verdict.allowed, blockedReason: verdict.reason, missingRequirements: verdict.missingRequirements };
          });
        },
        getSceneHostDescriptor(options = {}) {
          const current = state();
          const exits = api.getAvailableExits(options);
          return {
            currentScene: clone(getCurrentScene(current)),
            previousScene: current.previousSceneId ? clone(getSceneById(current, current.previousSceneId)) : null,
            availableExits: exits.filter((exit) => exit.allowed),
            blockedExits: exits.filter((exit) => !exit.allowed),
            visitedSceneIds: clone(current.visitedSceneIds ?? []),
            activePayload: clone(current.activePayload ?? {}),
            lastAcceptedTransition: clone(current.lastAcceptedTransition),
            lastRejectedTransition: clone(current.lastRejectedTransition),
            lastMountedScene: clone(current.lastMountedScene)
          };
        },
        loadSceneSnapshot(snapshotState = {}) {
          return baseApi.loadSnapshot({
            ...createInitialSceneState({ ...config, scenes: snapshotState.registry ?? config.scenes ?? {} }),
            ...clone(snapshotState),
            registry: createSceneRegistry(snapshotState.registry ?? config.scenes ?? {})
          });
        }
      };

      return { ...api, ...userApi };
    }
  });
}
