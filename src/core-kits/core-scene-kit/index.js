import { createCoreCapabilityKit } from "../core-capability-kit.js";

export const CORE_SCENE_DOMAIN_VERSION = "0.0.3";
export const DEFAULT_SCENE_KIND = "headless-scene";
export const DEFAULT_SCENE_HOST_BINDING = "headless";
export const SCENE_PAYLOAD_STORAGE_KEY = "nexus.scenePayload";
export const SCENE_SNAPSHOT_STORAGE_KEY = "nexus.sceneSnapshot";

const EVENT_NAMES = Object.freeze([
  "configured", "updated", "reset", "snapshotLoaded", "descriptorChanged",
  "sceneEntered", "sceneExited", "transitionAccepted", "transitionRejected",
  "sceneMounted", "tokenChanged"
]);

const HOST_BY_KIND = Object.freeze({
  "web-html-scene": "web-html",
  "web-module-scene": "web-module",
  "web-canvas-scene": "web-canvas",
  "web-three-scene": "web-three",
  "native-rust-scene": "rust-native",
  "native-command-scene": "rust-command-buffer",
  "openxr-scene": "openxr",
  "headless-scene": DEFAULT_SCENE_HOST_BINDING
});

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const isObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
const asArray = (value) => value === undefined || value === null ? [] : Array.isArray(value) ? value.slice() : [value];
const unique = (values) => Array.from(new Set(asArray(values).filter((value) => value !== undefined && value !== null).map(String)));

function id(value, label = "scene id") {
  if (typeof value !== "string" || value.trim().length === 0) throw new TypeError(`Core Scene Kit requires a non-empty ${label}.`);
  return value.trim();
}

function optionalId(value, label = "scene id") {
  return value === undefined || value === null || value === "" ? null : id(value, label);
}

function hostFor(kind, explicit) {
  return explicit !== undefined && explicit !== null && String(explicit).trim()
    ? String(explicit).trim()
    : HOST_BY_KIND[kind] ?? DEFAULT_SCENE_HOST_BINDING;
}

function requirements(...sources) {
  return unique(sources.flatMap((source) => asArray(source)));
}

function ledgerWith(ledger = {}, key, value, limit = 512) {
  const entries = Object.entries(ledger ?? {}).filter(([entryKey]) => entryKey !== key);
  entries.push([key, value]);
  const max = Number(limit);
  return Object.fromEntries(Number.isFinite(max) && max > 0 ? entries.slice(-max) : entries);
}

export function createSceneExit(exit = {}) {
  if (!isObject(exit)) throw new TypeError("createSceneExit expects an exit object.");
  const to = id(exit.to ?? exit.toSceneId ?? exit.sceneId, "scene exit target");
  const exitId = id(exit.id ?? exit.exitId ?? to, "scene exit id");
  return Object.freeze({
    id: exitId,
    to,
    label: exit.label ?? exitId,
    enabled: exit.enabled !== false,
    requires: Object.freeze(requirements(exit.requires, exit.requiredTokens)),
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
  const sceneId = id(scene.id ?? scene.sceneId, "scene id");
  const kind = id(scene.kind ?? DEFAULT_SCENE_KIND, "scene kind");
  return Object.freeze({
    id: sceneId,
    title: scene.title ?? sceneId,
    kind,
    hostBinding: hostFor(kind, scene.hostBinding),
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

function initialSceneState(config = {}) {
  const registry = createSceneRegistry(config.registry ?? config.manifest ?? config.scenes ?? {});
  const first = Object.keys(registry)[0] ?? null;
  const currentSceneId = optionalId(config.initialSceneId ?? config.currentSceneId ?? first, "initial scene id");
  if (currentSceneId && !registry[currentSceneId]) throw new Error(`Initial scene does not exist in registry: ${currentSceneId}`);
  const entryId = currentSceneId ? `initial:${currentSceneId}` : null;
  return {
    sceneDomainVersion: CORE_SCENE_DOMAIN_VERSION,
    registry,
    currentSceneId,
    previousSceneId: null,
    visitedSceneIds: currentSceneId ? [currentSceneId] : [],
    sceneEntryLedger: currentSceneId ? { [entryId]: { entryId, sceneId: currentSceneId, source: "initial", payload: clone(config.initialPayload ?? {}) } } : {},
    sceneExitLedger: {},
    transitionLedger: {},
    rejectedTransitionLedger: {},
    mountedSceneLedger: {},
    activePayload: clone(config.initialPayload ?? {}),
    unlockedTokens: unique(config.tokens ?? config.unlockedTokens ?? []),
    sceneFlags: clone(config.sceneFlags ?? {}),
    lastAcceptedTransition: null,
    lastRejectedTransition: null,
    lastMountedScene: null,
    transitionSequence: 0
  };
}

const sceneById = (state, sceneId) => state?.registry?.[sceneId] ?? null;
const currentScene = (state) => state?.currentSceneId ? sceneById(state, state.currentSceneId) : null;
const ledgerValues = (ledger = {}) => Object.values(ledger).map(clone);
const addVisited = (visited = [], sceneId) => unique([...visited, sceneId]);

function availableTokens(state, request = {}) {
  const flagTokens = Object.entries(state?.sceneFlags ?? {}).filter(([, enabled]) => Boolean(enabled)).map(([token]) => token);
  return new Set(unique([...(state?.unlockedTokens ?? []), ...flagTokens, ...(request.availableTokens ?? []), ...(request.tokens ?? [])]));
}

function evaluate(exit, state, request = {}) {
  if (!exit) return { allowed: false, reason: "missing-exit", missingRequirements: [] };
  if (exit.enabled === false) return { allowed: false, reason: "exit-disabled", missingRequirements: [] };
  const tokens = availableTokens(state, request);
  const missingRequirements = (exit.requires ?? []).filter((token) => !tokens.has(token));
  return { allowed: missingRequirements.length === 0, reason: missingRequirements.length ? "missing-requirements" : null, missingRequirements };
}

function rejectedTransition(state, request, reason, extra = {}) {
  const fromSceneId = request.fromSceneId ?? state.currentSceneId ?? null;
  const transitionId = id(request.transitionId ?? `rejected:${Number(state.transitionSequence ?? 0) + 1}:${fromSceneId ?? "none"}:${request.exitId ?? extra.toSceneId ?? "unknown"}`, "transition id");
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

function acceptedTransition(state, request, fromScene, targetScene, exit) {
  const fromSceneId = request.fromSceneId ?? fromScene?.id ?? state.currentSceneId ?? null;
  const transitionId = id(request.transitionId ?? `transition:${Number(state.transitionSequence ?? 0) + 1}:${fromSceneId ?? "none"}:${exit?.id ?? targetScene.id}`, "transition id");
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
    mount: Object.freeze({ sceneId: targetScene.id, kind: targetScene.kind, hostBinding: request.hostBinding ?? targetScene.hostBinding, entry: targetScene.entry }),
    payload,
    restore: clone(request.restore ?? targetScene.restore ?? {}),
    sequence: Number(state.transitionSequence ?? 0) + 1
  });
}

export function createSceneHostBinding(config = {}) {
  if (!isObject(config)) throw new TypeError("createSceneHostBinding expects a config object.");
  const hostId = id(config.id ?? config.hostBinding ?? "scene-host", "scene host binding id");
  const kinds = new Set(unique(config.kinds ?? config.kind ?? []));
  return {
    id: hostId,
    kinds: Object.freeze(Array.from(kinds)),
    canLoad(scene) { return typeof config.canLoad === "function" ? Boolean(config.canLoad(scene)) : kinds.size === 0 || kinds.has(scene?.kind); },
    unload(transition, context = {}) { return typeof config.unload === "function" ? config.unload(transition, context) : { hostBinding: hostId, unloaded: true, sceneId: transition?.fromSceneId ?? null }; },
    load(transition, context = {}) { return typeof config.load === "function" ? config.load(transition, context) : { hostBinding: hostId, mounted: true, sceneId: transition?.toSceneId ?? transition?.scene?.id ?? null, entry: transition?.scene?.entry ?? null }; }
  };
}

export function createHeadlessSceneHostBinding(config = {}) {
  const mounts = [];
  const host = createSceneHostBinding({
    id: config.id ?? DEFAULT_SCENE_HOST_BINDING,
    kinds: config.kinds ?? [],
    canLoad: config.canLoad ?? (() => true),
    load(transition, context = {}) {
      const mount = { hostBinding: config.id ?? DEFAULT_SCENE_HOST_BINDING, mounted: true, sceneId: transition.toSceneId, transitionId: transition.transitionId, entry: transition.scene?.entry ?? null, payload: clone(transition.payload ?? {}), context: clone(context) };
      mounts.push(mount);
      return clone(mount);
    }
  });
  return Object.freeze({ ...host, getMounts: () => clone(mounts) });
}

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
        storage.setItem(storageKey, JSON.stringify({ transitionId: transition.transitionId, sceneId: transition.toSceneId, payload: clone(transition.payload ?? {}), scene: clone(transition.scene) }));
        if (context.snapshot) storage.setItem(snapshotKey, JSON.stringify(context.snapshot));
      }
      if (config.autoNavigate !== false) navigate(transition.scene?.entry, transition, context);
      return { hostBinding: config.id ?? "web-html", mounted: false, navigating: config.autoNavigate !== false, sceneId: transition.toSceneId, entry: transition.scene?.entry ?? null };
    }
  });
}

export function createNativeSceneHostBinding(config = {}) {
  return createSceneHostBinding({
    id: config.id ?? "rust-native",
    kinds: config.kinds ?? ["native-rust-scene", "native-command-scene", "openxr-scene"],
    canLoad: config.canLoad,
    load: config.load ?? ((transition) => ({ hostBinding: config.id ?? "rust-native", mounted: true, sceneId: transition.toSceneId, entry: transition.scene?.entry ?? null, commandBuffer: transition.scene?.descriptors?.commandBuffer ?? [] }))
  });
}

export function mountAcceptedSceneTransition(engine, hostBinding, resultOrTransition, context = {}) {
  const transition = resultOrTransition?.transition ?? resultOrTransition;
  if (!transition?.accepted) throw new Error("mountAcceptedSceneTransition expects an accepted scene transition.");
  if (!hostBinding?.canLoad?.(transition.scene)) throw new Error(`Scene host binding ${hostBinding?.id ?? "unknown"} cannot load scene kind ${transition.scene?.kind}.`);
  const apply = (mountResult) => ({
    transition,
    mountResult,
    mountedState: engine?.n?.coreScene?.mountScene?.({ mountId: context.mountId ?? transition.transitionId, transitionId: transition.transitionId, sceneId: transition.toSceneId, hostBinding: hostBinding.id, result: mountResult })
  });
  const result = hostBinding.load(transition, context);
  return typeof result?.then === "function" ? result.then(apply) : apply(result);
}

export function createCoreSceneKit(config = {}) {
  const startState = initialSceneState(config);
  return createCoreCapabilityKit({
    ...config,
    domain: "core-scene",
    apiName: config.apiName ?? "coreScene",
    eventNames: config.eventNames ?? EVENT_NAMES,
    services: ["scene-lifecycle", "scene-transition", "scene-host-contract", "scene-descriptors", ...(config.services ?? [])],
    purpose: "Host-agnostic scene lifecycle, scene identity, peer scene transitions, host binding descriptors, visited ledgers, and scene snapshot state.",
    owns: ["scene identity", "scene lifecycle", "scene transitions", "scene exits", "visited scene ledgers", "transition validation", "scene host descriptors", "scene snapshot state"],
    doesNotOwn: ["HTML navigation implementation", "native scene loading implementation", "renderer meshes", "dialogue text", "quest completion", "inventory rewards", "combat outcomes"],
    initialState: startState,
    metadata: { ...(config.metadata ?? {}), piecesFirst: true, sceneDomain: true, hostAgnostic: true, supportedSceneKinds: Object.keys(HOST_BY_KIND) },
    createApi(context) {
      const { baseApi } = context;
      const userApi = typeof config.createApi === "function" ? config.createApi(context) : {};
      const state = () => baseApi.getState();
      const snap = () => baseApi.getSnapshot();
      const limit = config.transitionHistoryLimit ?? 512;
      const commit = (patch, eventName, payload = {}) => baseApi.update(patch, eventName, payload);
      const reject = (request, reason, extra = {}) => {
        const current = state();
        const transition = rejectedTransition(current, request, reason, extra);
        const next = commit({ rejectedTransitionLedger: ledgerWith(current.rejectedTransitionLedger, transition.transitionId, transition, limit), lastRejectedTransition: transition, transitionSequence: transition.sequence }, "transitionRejected", { transition });
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
        getScene: (sceneId) => clone(sceneById(snap(), id(sceneId, "scene id"))),
        getCurrentScene: () => clone(currentScene(snap())),
        getVisitedScenes: () => clone(snap().visitedSceneIds ?? []),
        getTransitionLedger: () => ledgerValues(snap().transitionLedger),
        getRejectedTransitionLedger: () => ledgerValues(snap().rejectedTransitionLedger),
        getMountedSceneLedger: () => ledgerValues(snap().mountedSceneLedger),
        getUnlockedTokens: () => clone(snap().unlockedTokens ?? []),
        grantToken(token) {
          const current = state();
          const tokenId = id(token, "scene token");
          return commit({ unlockedTokens: unique([...(current.unlockedTokens ?? []), tokenId]) }, "tokenChanged", { token: tokenId, granted: true });
        },
        revokeToken(token) {
          const current = state();
          const tokenId = id(token, "scene token");
          return commit({ unlockedTokens: (current.unlockedTokens ?? []).filter((entry) => entry !== tokenId) }, "tokenChanged", { token: tokenId, granted: false });
        },
        setSceneFlag(flagId, value = true) {
          const current = state();
          const flag = id(flagId, "scene flag id");
          return commit({ sceneFlags: { ...(current.sceneFlags ?? {}), [flag]: Boolean(value) } }, "tokenChanged", { flagId: flag, value: Boolean(value) });
        },
        enterScene(request = {}) {
          const current = state();
          const sceneId = id(request.sceneId ?? request.id ?? current.currentSceneId, "scene id");
          const scene = sceneById(current, sceneId);
          if (!scene) return reject(request, "unknown-scene", { toSceneId: sceneId });
          const entryId = id(request.entryId ?? `enter:${Number(current.transitionSequence ?? 0) + 1}:${sceneId}`, "scene entry id");
          if (current.sceneEntryLedger?.[entryId]) return { accepted: true, duplicate: true, entry: clone(current.sceneEntryLedger[entryId]), state: current };
          const entry = Object.freeze({ entryId, sceneId, fromSceneId: current.currentSceneId ?? null, source: request.source ?? "api", payload: clone(request.payload ?? {}) });
          const next = commit({ previousSceneId: current.currentSceneId ?? null, currentSceneId: sceneId, visitedSceneIds: addVisited(current.visitedSceneIds, sceneId), sceneEntryLedger: ledgerWith(current.sceneEntryLedger, entryId, entry, limit), activePayload: clone(request.payload ?? {}) }, "sceneEntered", { entry, scene });
          return { accepted: true, entry, state: clone(next) };
        },
        requestTransition(request = {}) {
          if (!isObject(request)) throw new TypeError("coreScene.requestTransition expects a request object.");
          const current = state();
          const transitionId = request.transitionId ? id(request.transitionId, "transition id") : null;
          if (transitionId && current.transitionLedger?.[transitionId]) return { accepted: true, duplicate: true, transition: clone(current.transitionLedger[transitionId]), state: current };
          if (transitionId && current.rejectedTransitionLedger?.[transitionId]) return { accepted: false, duplicate: true, transition: clone(current.rejectedTransitionLedger[transitionId]), state: current };
          const fromSceneId = request.fromSceneId ?? current.currentSceneId;
          const fromScene = fromSceneId ? sceneById(current, fromSceneId) : null;
          if (!fromScene && fromSceneId) return reject({ ...request, transitionId }, "unknown-from-scene", { toSceneId: request.toSceneId ?? null });
          const exit = request.exitId ? fromScene?.exits?.[request.exitId] ?? null : null;
          if (request.exitId && !exit) return reject({ ...request, transitionId }, "missing-exit");
          const directAllowed = request.direct === true || config.allowDirectTransitions === true;
          const toSceneId = exit?.to ?? request.toSceneId ?? request.sceneId ?? null;
          if (!toSceneId) return reject({ ...request, transitionId }, "missing-target-scene");
          if (!exit && !directAllowed) return reject({ ...request, transitionId }, "direct-transition-disabled", { toSceneId });
          const targetScene = sceneById(current, toSceneId);
          if (!targetScene) return reject({ ...request, transitionId }, "unknown-target-scene", { exit, toSceneId });
          const verdict = evaluate(exit ?? { enabled: true, requires: request.requires ?? [] }, current, request);
          if (!verdict.allowed) return reject({ ...request, transitionId }, verdict.reason, { exit, toSceneId, missingRequirements: verdict.missingRequirements });
          const transition = acceptedTransition(current, { ...request, transitionId }, fromScene, targetScene, exit);
          const sceneEntryId = `transition:${transition.transitionId}:enter:${transition.toSceneId}`;
          const sceneExitId = transition.fromSceneId ? `transition:${transition.transitionId}:exit:${transition.fromSceneId}` : null;
          const sceneEntry = Object.freeze({ entryId: sceneEntryId, sceneId: transition.toSceneId, fromSceneId: transition.fromSceneId, transitionId: transition.transitionId, payload: clone(transition.payload ?? {}) });
          const sceneExit = sceneExitId ? Object.freeze({ exitId: sceneExitId, sceneId: transition.fromSceneId, toSceneId: transition.toSceneId, transitionId: transition.transitionId }) : null;
          const next = commit({
            previousSceneId: transition.fromSceneId,
            currentSceneId: transition.toSceneId,
            visitedSceneIds: addVisited(current.visitedSceneIds, transition.toSceneId),
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
          const sceneId = id(request.sceneId ?? current.currentSceneId, "mounted scene id");
          const scene = sceneById(current, sceneId);
          if (!scene) return reject(request, "unknown-scene", { toSceneId: sceneId });
          const mountId = id(request.mountId ?? `mount:${Number(current.transitionSequence ?? 0) + 1}:${sceneId}`, "scene mount id");
          if (current.mountedSceneLedger?.[mountId]) return { accepted: true, duplicate: true, mount: clone(current.mountedSceneLedger[mountId]), state: current };
          const mount = Object.freeze({ mountId, transitionId: request.transitionId ?? null, sceneId, hostBinding: request.hostBinding ?? scene.hostBinding, kind: scene.kind, entry: scene.entry, result: clone(request.result ?? {}) });
          const next = commit({ mountedSceneLedger: ledgerWith(current.mountedSceneLedger, mountId, mount, limit), lastMountedScene: mount }, "sceneMounted", { mount, scene });
          return { accepted: true, mount, state: clone(next) };
        },
        getAvailableExits(options = {}) {
          const current = state();
          const scene = options.sceneId ? sceneById(current, id(options.sceneId, "scene id")) : currentScene(current);
          if (!scene) return [];
          return Object.values(scene.exits ?? {}).map((exit) => {
            const verdict = evaluate(exit, current, options);
            return { ...clone(exit), toScene: clone(sceneById(current, exit.to)), allowed: verdict.allowed, blocked: !verdict.allowed, blockedReason: verdict.reason, missingRequirements: verdict.missingRequirements };
          });
        },
        getSceneHostDescriptor(options = {}) {
          const current = state();
          const exits = api.getAvailableExits(options);
          return {
            currentScene: clone(currentScene(current)),
            previousScene: current.previousSceneId ? clone(sceneById(current, current.previousSceneId)) : null,
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
            ...initialSceneState({ ...config, scenes: snapshotState.registry ?? config.scenes ?? {} }),
            ...clone(snapshotState),
            registry: createSceneRegistry(snapshotState.registry ?? config.scenes ?? {})
          });
        }
      };
      return { ...api, ...userApi };
    }
  });
}
