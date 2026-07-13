import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";

export const CORE_STARTUP_VERSION = "0.1.0";
export const CORE_STARTUP_SCHEMA = "nexusengine.core-startup/1";

const StartupState = defineResource("core.startup.state");
const StartupLaunched = defineEvent("core.startup.launched");
const StartupPreparationChanged = defineEvent("core.startup.preparation-changed");
const StartupContinuationSelected = defineEvent("core.startup.continuation-selected");
const StartupFirstFramePresented = defineEvent("core.startup.first-frame-presented");
const StartupReady = defineEvent("core.startup.ready");
const StartupFailed = defineEvent("core.startup.failed");
const StartupCancelled = defineEvent("core.startup.cancelled");
const StartupRetried = defineEvent("core.startup.retried");
const StartupSnapshotLoaded = defineEvent("core.startup.snapshot-loaded");
const StartupReset = defineEvent("core.startup.reset");

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const asArray = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const sameValue = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const PREPARATION_STATUSES = new Set(["waiting", "working", "ready", "skipped", "failed"]);
const CONTINUATION_MODES = new Set(["undecided", "new", "restored", "recovered", "safe"]);
const TERMINAL_STATUSES = new Set(["ready", "failed", "cancelled"]);

function requiredId(value, label) {
  const id = String(value ?? "").trim();
  if (!id) throw new TypeError(`${label} requires a stable id.`);
  return id;
}

function optionalString(value) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function normalizePreparation(input = {}, index = 0) {
  const id = requiredId(input.id ?? `preparation-${index + 1}`, "Startup preparation");
  const status = PREPARATION_STATUSES.has(input.status) ? input.status : "waiting";
  const required = input.required !== false;
  return {
    id,
    label: String(input.label ?? id),
    required,
    weight: Math.max(0.0001, Number(input.weight) || 1),
    status,
    progress: status === "ready" || status === "skipped" ? 1 : clamp01(input.progress),
    detail: optionalString(input.detail),
    receipt: clone(input.receipt ?? null),
    failure: clone(input.failure ?? null),
    sequence: Math.max(0, Math.floor(Number(input.sequence) || 0)),
    metadata: clone(input.metadata ?? {})
  };
}

function mapPreparations(values = []) {
  const result = {};
  for (const [index, value] of asArray(values).entries()) {
    const preparation = normalizePreparation(value, index);
    if (result[preparation.id]) throw new TypeError(`Duplicate startup preparation id: ${preparation.id}.`);
    result[preparation.id] = preparation;
  }
  return result;
}

function createInitialState(config = {}) {
  return {
    schema: CORE_STARTUP_SCHEMA,
    version: CORE_STARTUP_VERSION,
    optional: true,
    sequence: 0,
    launch: {
      id: null,
      projectId: null,
      status: "idle",
      attempt: 0,
      previousLaunchId: null,
      metadata: {}
    },
    preparations: mapPreparations(config.preparations),
    continuation: {
      mode: "undecided",
      sourceId: null,
      receipt: null,
      metadata: {}
    },
    firstFrame: null,
    playable: false,
    failure: null,
    history: []
  };
}

function appendHistory(state, record, limit) {
  return [...state.history, clone(record)].slice(-limit);
}

function preparationProgress(preparation) {
  if (preparation.status === "ready" || preparation.status === "skipped") return 1;
  if (preparation.status === "failed") return preparation.progress;
  return clamp01(preparation.progress);
}

function summarize(state) {
  const preparations = Object.values(state.preparations).sort((a, b) => a.id.localeCompare(b.id));
  const totalWeight = preparations.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = preparations.reduce((sum, item) => sum + item.weight * preparationProgress(item), 0);
  const progress = totalWeight > 0 ? clamp01(completedWeight / totalWeight) : (state.playable ? 1 : 0);
  const blocking = preparations.filter((item) => item.required && item.status !== "ready");
  const failed = preparations.filter((item) => item.status === "failed");
  const active = preparations.find((item) => item.status === "working")
    ?? preparations.find((item) => item.status === "waiting")
    ?? null;
  return { preparations, totalWeight, completedWeight, progress, blocking, failed, active };
}

function validateSnapshot(snapshot = {}, config = {}) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    throw new TypeError("Core Startup snapshots must be objects.");
  }
  if (snapshot.schema !== CORE_STARTUP_SCHEMA) {
    throw new TypeError(`Unsupported Core Startup snapshot schema: ${snapshot.schema}.`);
  }
  const base = createInitialState(config);
  const preparations = mapPreparations(Object.values(snapshot.preparations ?? {}));
  const launchStatus = ["idle", "starting", "ready", "failed", "cancelled"].includes(snapshot.launch?.status)
    ? snapshot.launch.status
    : "idle";
  const continuationMode = CONTINUATION_MODES.has(snapshot.continuation?.mode)
    ? snapshot.continuation.mode
    : "undecided";
  return {
    ...base,
    ...clone(snapshot),
    schema: CORE_STARTUP_SCHEMA,
    version: CORE_STARTUP_VERSION,
    sequence: Math.max(0, Math.floor(Number(snapshot.sequence) || 0)),
    launch: {
      ...base.launch,
      ...clone(snapshot.launch ?? {}),
      status: launchStatus,
      attempt: Math.max(0, Math.floor(Number(snapshot.launch?.attempt) || 0)),
      metadata: clone(snapshot.launch?.metadata ?? {})
    },
    preparations,
    continuation: {
      ...base.continuation,
      ...clone(snapshot.continuation ?? {}),
      mode: continuationMode,
      metadata: clone(snapshot.continuation?.metadata ?? {})
    },
    firstFrame: clone(snapshot.firstFrame ?? null),
    playable: Boolean(snapshot.playable),
    failure: clone(snapshot.failure ?? null),
    history: asArray(snapshot.history).map(clone)
  };
}

export function createCoreStartupDescriptor(state) {
  const summary = summarize(state);
  return Object.freeze({
    schema: "nexusengine.core-startup-descriptor/1",
    kind: "core-startup",
    launchId: state.launch.id,
    projectId: state.launch.projectId,
    status: state.launch.status,
    attempt: state.launch.attempt,
    progress: summary.progress,
    activePreparation: summary.active ? clone(summary.active) : null,
    preparations: Object.freeze(summary.preparations.map((item) => Object.freeze(clone(item)))),
    blockingPreparationIds: Object.freeze(summary.blocking.map((item) => item.id)),
    continuation: Object.freeze(clone(state.continuation)),
    firstFrame: state.firstFrame ? Object.freeze(clone(state.firstFrame)) : null,
    firstFramePresented: Boolean(state.firstFrame),
    playable: Boolean(state.playable),
    failure: state.failure ? Object.freeze(clone(state.failure)) : null,
    canRetry: state.launch.status === "failed" && state.failure?.retryable !== false
  });
}

export function createCoreStartupKit(config = {}) {
  const historyLimit = Math.max(8, Math.floor(Number(config.historyLimit) || 128));
  const initial = createInitialState(config);

  return defineDomainServiceKit({
    id: config.id ?? "core-startup-domain",
    domain: "core-startup",
    domainPath: config.domainPath ?? "n:core-startup",
    apiName: config.apiName ?? "coreStartup",
    version: CORE_STARTUP_VERSION,
    stability: config.stability ?? "stable-candidate",
    services: ["launch", "preparation", "continuation", "failure", "playable-readiness", "descriptor", "snapshot", "reset"],
    resources: { StartupState },
    events: {
      StartupLaunched,
      StartupPreparationChanged,
      StartupContinuationSelected,
      StartupFirstFramePresented,
      StartupReady,
      StartupFailed,
      StartupCancelled,
      StartupRetried,
      StartupSnapshotLoaded,
      StartupReset
    },
    metadata: {
      purpose: "Optional application-startup authority for launch truth, required preparation facts, continuation choice, structured failure, and first-playable-frame readiness.",
      owns: [
        "startup launch identity and outcome",
        "required preparation facts and receipts",
        "authoritative continuation choice",
        "structured startup failure",
        "first presented frame receipt",
        "playable-ready acknowledgement",
        "renderer-neutral startup descriptor"
      ],
      doesNotOwn: [
        "module fetching",
        "asset transport",
        "kit installation mechanics",
        "save migration mechanics",
        "renderer initialization implementation",
        "DOM or loading-screen layout",
        "splash-screen order or timing",
        "player-facing loading copy",
        "gameplay rules"
      ],
      optional: true,
      deterministic: true,
      rendererAgnostic: true,
      hostAgnostic: true,
      snapshot: true,
      reset: true,
      ...(config.metadata ?? {})
    },
    initWorld({ world }) {
      world.setResource(StartupState, clone(initial));
    },
    createApi({ engine, world }) {
      const getStateInternal = () => world.getResource(StartupState);
      const emitState = (next, event, payload = {}) => {
        world.setResource(StartupState, next);
        world.emit(event, { state: clone(next), descriptor: createCoreStartupDescriptor(next), ...clone(payload) });
        return clone(next);
      };
      const update = (patch, event, payload = {}, history = null) => {
        const state = getStateInternal();
        const sequence = Number(state.sequence ?? 0) + 1;
        const next = {
          ...state,
          ...clone(patch),
          sequence,
          history: history
            ? appendHistory(state, { sequence, ...clone(history) }, historyLimit)
            : state.history
        };
        return emitState(next, event, payload);
      };
      const assertActive = () => {
        const state = getStateInternal();
        if (state.launch.status !== "starting") {
          throw new Error(`Core Startup is not active; current status is ${state.launch.status}.`);
        }
        return state;
      };

      function launch(request = {}) {
        const state = getStateInternal();
        const launchId = requiredId(request.launchId ?? request.id, "Startup launch");
        const projectId = requiredId(request.projectId, "Startup project");
        const attempt = request.attempt == null
          ? Number(state.launch.attempt ?? 0) + 1
          : Math.max(1, Math.floor(Number(request.attempt) || 1));
        const requestPreparations = request.preparations == null
          ? Object.values(state.preparations)
          : asArray(request.preparations);
        const preparations = mapPreparations(requestPreparations.map((item) => ({
          ...item,
          status: "waiting",
          progress: 0,
          receipt: null,
          failure: null,
          sequence: 0
        })));
        const continuationMode = CONTINUATION_MODES.has(request.continuation?.mode)
          ? request.continuation.mode
          : "undecided";
        const nextSequence = Number(state.sequence ?? 0) + 1;
        const next = {
          ...createInitialState(config),
          sequence: nextSequence,
          launch: {
            id: launchId,
            projectId,
            status: "starting",
            attempt,
            previousLaunchId: state.launch.id,
            metadata: clone(request.metadata ?? {})
          },
          preparations,
          continuation: {
            mode: continuationMode,
            sourceId: optionalString(request.continuation?.sourceId),
            receipt: clone(request.continuation?.receipt ?? null),
            metadata: clone(request.continuation?.metadata ?? {})
          },
          history: appendHistory(state, {
            sequence: nextSequence,
            type: "launch",
            launchId,
            projectId,
            attempt
          }, historyLimit)
        };
        emitState(next, StartupLaunched, { launchId, projectId, attempt });
        return createCoreStartupDescriptor(next);
      }

      function addPreparation(input = {}) {
        const state = assertActive();
        const preparation = normalizePreparation(input, Object.keys(state.preparations).length);
        const existing = state.preparations[preparation.id];
        const nextPreparation = existing
          ? { ...existing, ...preparation, sequence: existing.sequence }
          : preparation;
        if (existing && sameValue(existing, nextPreparation)) return clone(existing);
        update({
          preparations: { ...state.preparations, [preparation.id]: nextPreparation }
        }, StartupPreparationChanged, { preparation: clone(nextPreparation) }, {
          type: "preparation-added",
          preparationId: preparation.id
        });
        return clone(nextPreparation);
      }

      function reportPreparation(id, report = {}) {
        const state = assertActive();
        const key = requiredId(id, "Startup preparation");
        const current = state.preparations[key];
        if (!current) throw new RangeError(`Unknown startup preparation: ${key}.`);
        const status = PREPARATION_STATUSES.has(report.status) ? report.status : current.status;
        if (status === "skipped" && current.required) {
          throw new Error(`Required startup preparation ${key} cannot be skipped.`);
        }
        const candidate = {
          ...current,
          status,
          progress: status === "ready" || status === "skipped" ? 1 : clamp01(report.progress ?? current.progress),
          detail: report.detail === undefined ? current.detail : optionalString(report.detail),
          receipt: report.receipt === undefined ? current.receipt : clone(report.receipt),
          failure: report.failure === undefined ? (status === "failed" ? current.failure : null) : clone(report.failure),
          metadata: report.metadata === undefined ? current.metadata : { ...current.metadata, ...clone(report.metadata) }
        };
        if (sameValue(candidate, current)) return clone(current);
        const nextPreparation = { ...candidate, sequence: current.sequence + 1 };
        const preparations = { ...state.preparations, [key]: nextPreparation };
        const patch = { preparations };
        if (status === "failed" && current.required) {
          patch.launch = { ...state.launch, status: "failed" };
          patch.failure = clone(report.failure ?? {
            code: "startup.preparation.failed",
            message: `Startup preparation failed: ${key}.`,
            source: key,
            retryable: true,
            fallback: null,
            metadata: {}
          });
        }
        update(
          patch,
          status === "failed" && current.required ? StartupFailed : StartupPreparationChanged,
          { preparation: clone(nextPreparation) },
          { type: "preparation-reported", preparationId: key, status }
        );
        return clone(nextPreparation);
      }

      function selectContinuation(selection = {}) {
        const state = assertActive();
        const mode = selection.mode ?? "new";
        if (!CONTINUATION_MODES.has(mode) || mode === "undecided") {
          throw new TypeError(`Unsupported startup continuation mode: ${mode}.`);
        }
        const continuation = {
          mode,
          sourceId: optionalString(selection.sourceId),
          receipt: clone(selection.receipt ?? null),
          metadata: clone(selection.metadata ?? {})
        };
        if (sameValue(continuation, state.continuation)) return clone(state.continuation);
        update({ continuation }, StartupContinuationSelected, { continuation: clone(continuation) }, {
          type: "continuation-selected",
          mode,
          sourceId: continuation.sourceId
        });
        return clone(continuation);
      }

      function presentFirstFrame(receipt = {}) {
        const state = assertActive();
        const frameId = requiredId(receipt.frameId ?? receipt.id, "First frame");
        const firstFrame = {
          frameId,
          presentationId: optionalString(receipt.presentationId),
          backend: optionalString(receipt.backend),
          receipt: clone(receipt.receipt ?? null),
          metadata: clone(receipt.metadata ?? {})
        };
        if (sameValue(firstFrame, state.firstFrame)) return clone(state.firstFrame);
        update({ firstFrame }, StartupFirstFramePresented, { firstFrame: clone(firstFrame) }, {
          type: "first-frame-presented",
          frameId
        });
        return clone(firstFrame);
      }

      function enter(payload = {}) {
        const currentState = getStateInternal();
        if (currentState.launch.status === "ready" && currentState.playable) {
          return createCoreStartupDescriptor(currentState);
        }
        const state = assertActive();
        const summary = summarize(state);
        const requiredFailures = summary.failed.filter((item) => item.required);
        if (requiredFailures.length) {
          throw new Error(`Core Startup cannot enter while preparations failed: ${requiredFailures.map((item) => item.id).join(", ")}.`);
        }
        if (summary.blocking.length) {
          throw new Error(`Core Startup cannot enter while required preparations are incomplete: ${summary.blocking.map((item) => item.id).join(", ")}.`);
        }
        if (!state.firstFrame) {
          throw new Error("Core Startup cannot enter before the first successful frame is presented.");
        }
        if (payload.inputReady === false) {
          throw new Error("Core Startup cannot enter before player input is ready.");
        }
        update({
          launch: { ...state.launch, status: "ready" },
          playable: true,
          failure: null
        }, StartupReady, { firstFrame: clone(state.firstFrame) }, {
          type: "startup-ready",
          launchId: state.launch.id,
          frameId: state.firstFrame.frameId
        });
        return createCoreStartupDescriptor(getStateInternal());
      }

      function fail(error = {}) {
        const state = getStateInternal();
        if (state.launch.status === "idle") throw new Error("Core Startup cannot fail before launch.");
        const failure = {
          code: String(error.code ?? "startup.failed"),
          message: String(error.message ?? error.error ?? "Application startup failed."),
          source: optionalString(error.source),
          retryable: error.retryable !== false,
          fallback: clone(error.fallback ?? null),
          metadata: clone(error.metadata ?? {})
        };
        update({
          launch: { ...state.launch, status: "failed" },
          playable: false,
          failure
        }, StartupFailed, { failure: clone(failure) }, {
          type: "startup-failed",
          code: failure.code,
          source: failure.source
        });
        return clone(failure);
      }

      function cancel(reason = "cancelled") {
        const state = getStateInternal();
        if (TERMINAL_STATUSES.has(state.launch.status)) return createCoreStartupDescriptor(state);
        update({
          launch: { ...state.launch, status: "cancelled" },
          playable: false,
          failure: null
        }, StartupCancelled, { reason: String(reason) }, {
          type: "startup-cancelled",
          reason: String(reason)
        });
        return createCoreStartupDescriptor(getStateInternal());
      }

      function retry(request = {}) {
        const state = getStateInternal();
        if (state.launch.status !== "failed" && state.launch.status !== "cancelled") {
          throw new Error(`Core Startup can retry only after failure or cancellation; current status is ${state.launch.status}.`);
        }
        const launchId = request.launchId
          ?? `${state.launch.id ?? "startup"}:retry:${Number(state.launch.attempt ?? 0) + 1}`;
        const descriptor = launch({
          launchId,
          projectId: request.projectId ?? state.launch.projectId,
          preparations: Object.values(state.preparations),
          continuation: request.continuation ?? state.continuation,
          metadata: { ...state.launch.metadata, ...clone(request.metadata ?? {}) },
          attempt: Number(state.launch.attempt ?? 0) + 1
        });
        const next = getStateInternal();
        world.emit(StartupRetried, {
          state: clone(next),
          descriptor,
          previousLaunchId: state.launch.id
        });
        return descriptor;
      }

      const api = {
        launch,
        addPreparation,
        reportPreparation,
        ready(id, receipt = null, detail = null) {
          return reportPreparation(id, { status: "ready", progress: 1, receipt, detail });
        },
        working(id, progress = 0, detail = null) {
          return reportPreparation(id, { status: "working", progress, detail });
        },
        skip(id, detail = null) {
          return reportPreparation(id, { status: "skipped", progress: 1, detail });
        },
        selectContinuation,
        presentFirstFrame,
        enter,
        fail,
        cancel,
        retry,
        getState: () => clone(getStateInternal()),
        getSnapshot: () => clone(getStateInternal()),
        getDescriptor: () => createCoreStartupDescriptor(getStateInternal()),
        getPreparation(id) {
          return clone(getStateInternal().preparations[String(id)] ?? null);
        },
        listPreparations() {
          return summarize(getStateInternal()).preparations.map(clone);
        },
        loadSnapshot(snapshot = {}) {
          const next = validateSnapshot(snapshot, config);
          return emitState(next, StartupSnapshotLoaded);
        },
        reset() {
          return emitState(createInitialState(config), StartupReset);
        }
      };

      engine.coreStartup = api;
      return api;
    }
  });
}

export default createCoreStartupKit;
