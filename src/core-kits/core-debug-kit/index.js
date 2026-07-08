import { createCoreCapabilityKit } from "../core-capability-kit.js";

const DEFAULT_HISTORY_LIMIT = 120;
const DEFAULT_EXPORT_LIMIT = 24;
const DEFAULT_CHANNELS = Object.freeze({
  camera: true,
  movement: true,
  actor: true,
  collision: true,
  physics: true,
  input: true,
  animation: true,
  navigation: true,
  general: true
});
const COLOR_HEX = Object.freeze({
  red: "#ff3b30",
  green: "#34c759",
  blue: "#0a84ff",
  yellow: "#ffd60a",
  orange: "#ff9f0a",
  purple: "#bf5af2",
  cyan: "#64d2ff",
  white: "#ffffff",
  gray: "#8e8e93"
});

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function finite(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeId(value, fallback) {
  const next = typeof value === "string" ? value.trim() : "";
  if (next.length > 0) return next;
  if (fallback) return fallback;
  throw new TypeError("Core debug descriptors require a non-empty id.");
}

function normalizeChannel(value = "general") {
  const next = typeof value === "string" && value.trim().length > 0 ? value.trim() : "general";
  return next.replace(/[^a-zA-Z0-9_.:-]/g, "-");
}

function normalizeVector3(value, fallback = [0, 0, 0]) {
  if (Array.isArray(value)) {
    return [finite(value[0], fallback[0]), finite(value[1], fallback[1]), finite(value[2], fallback[2])];
  }
  if (isObject(value)) {
    return [finite(value.x, fallback[0]), finite(value.y, fallback[1]), finite(value.z, fallback[2])];
  }
  return [...fallback];
}

function length3(v) {
  return Math.hypot(finite(v[0]), finite(v[1]), finite(v[2]));
}

function normalizeDirection(value, fallback = [0, 0, -1]) {
  const direction = normalizeVector3(value, fallback);
  const length = length3(direction);
  if (length <= 1e-8) return [...fallback];
  return direction.map((entry) => entry / length);
}

function normalizeColor(value = "white") {
  if (typeof value !== "string") return "white";
  const next = value.trim().toLowerCase();
  if (COLOR_HEX[next] || /^#[0-9a-f]{6}$/i.test(next)) return next;
  return "white";
}

function colorToHex(color = "white") {
  const normalized = normalizeColor(color);
  return COLOR_HEX[normalized] ?? normalized;
}

function normalizeFrame(state, descriptor = {}) {
  return Number.isFinite(Number(descriptor.frame))
    ? Number(descriptor.frame)
    : Number(state?.frame ?? 0);
}

function descriptorBase(state, descriptor = {}) {
  const id = normalizeId(descriptor.id);
  return {
    id,
    label: descriptor.label ?? id,
    channel: normalizeChannel(descriptor.channel),
    scope: descriptor.scope ?? descriptor.source ?? "global",
    space: descriptor.space ?? "world",
    frame: normalizeFrame(state, descriptor),
    persistent: descriptor.persistent === true,
    visible: descriptor.visible !== false,
    metadata: clone(descriptor.metadata ?? {})
  };
}

function normalizeRay(state, descriptor = {}) {
  const base = descriptorBase(state, descriptor);
  const color = normalizeColor(descriptor.color ?? "white");
  return {
    ...base,
    kind: "ray",
    color,
    hex: colorToHex(color),
    origin: normalizeVector3(descriptor.origin, [0, 0, 0]),
    direction: normalizeDirection(descriptor.direction, [0, 0, -1]),
    length: Math.max(0, finite(descriptor.length, 1)),
    thickness: Math.max(0.001, finite(descriptor.thickness, 0.025))
  };
}

function normalizePoint(state, descriptor = {}) {
  const base = descriptorBase(state, descriptor);
  const color = normalizeColor(descriptor.color ?? "white");
  return {
    ...base,
    kind: "point",
    color,
    hex: colorToHex(color),
    position: normalizeVector3(descriptor.position ?? descriptor.origin, [0, 0, 0]),
    radius: Math.max(0, finite(descriptor.radius, 0.08))
  };
}

function normalizeScalar(state, descriptor = {}) {
  const base = descriptorBase(state, descriptor);
  return {
    ...base,
    kind: "scalar",
    value: finite(descriptor.value, 0),
    units: descriptor.units ?? "unit"
  };
}

function normalizeCapture(state, id, payload = {}, options = {}) {
  const captureId = normalizeId(id, `capture-${Number(state?.captures?.length ?? 0)}`);
  return {
    id: captureId,
    label: options.label ?? captureId,
    channel: normalizeChannel(options.channel ?? "general"),
    scope: options.scope ?? options.source ?? "global",
    frame: normalizeFrame(state, options),
    at: options.at ?? null,
    payload: clone(payload ?? {})
  };
}

function initialState(config = {}) {
  return {
    enabled: config.enabled !== false,
    frame: 0,
    channels: { ...DEFAULT_CHANNELS, ...(config.channels ?? {}) },
    rays: {},
    points: {},
    scalars: {},
    captures: [],
    exports: [],
    historyLimit: Number(config.historyLimit ?? DEFAULT_HISTORY_LIMIT),
    exportLimit: Number(config.exportLimit ?? DEFAULT_EXPORT_LIMIT),
    lastExport: null
  };
}

function scopedEntries(entries = {}, scope) {
  if (!scope) return {};
  return Object.fromEntries(Object.entries(entries).filter(([, entry]) => entry.scope !== scope));
}

function frameEntries(entries = {}, scope) {
  return Object.fromEntries(Object.entries(entries).filter(([, entry]) => {
    if (entry.persistent) return true;
    if (scope && entry.scope !== scope) return true;
    return false;
  }));
}

function limitedAppend(list = [], entry, limit = DEFAULT_HISTORY_LIMIT) {
  return [...list, entry].slice(-Math.max(1, Number(limit) || DEFAULT_HISTORY_LIMIT));
}

function snapshotForExport(state = {}, label = "debug-export", extra = {}) {
  return {
    id: normalizeId(extra.id, `${label}-${Number(state.frame ?? 0)}`),
    label,
    domain: "core-debug",
    frame: Number(state.frame ?? 0),
    enabled: state.enabled !== false,
    channels: clone(state.channels ?? {}),
    rays: clone(state.rays ?? {}),
    points: clone(state.points ?? {}),
    scalars: clone(state.scalars ?? {}),
    captures: clone(state.captures ?? []),
    extra: clone(extra.extra ?? extra.payload ?? {})
  };
}

export function createCoreDebugKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-debug",
    apiName: config.apiName ?? "coreDebug",
    purpose: "Renderer-agnostic debug descriptors, metric rays, markers, scalars, capture packets, and serializable state exports for realtime kit validation.",
    owns: [
      "debug rays",
      "debug points",
      "debug scalars",
      "debug state captures",
      "debug export packets",
      "debug channel toggles"
    ],
    doesNotOwn: [
      "Three.js objects",
      "WebGL line meshes",
      "DOM overlays",
      "external observability backends"
    ],
    services: ["rays", "points", "scalars", "captures", "exports", ...(config.services ?? [])],
    eventNames: [
      "configured",
      "updated",
      "reset",
      "snapshotLoaded",
      "descriptorChanged",
      "frameStarted",
      "frameCleared",
      "rayRegistered",
      "pointRegistered",
      "scalarSet",
      "stateCaptured",
      "stateExported",
      "channelChanged"
    ],
    initialState: initialState(config),
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      rendererAgnostic: true,
      descriptorTypes: ["ray", "point", "scalar", "capture", "export"],
      defaultRaySemantics: {
        red: "actor/root facing direction",
        green: "movement wish or solved control direction",
        blue: "camera/rendered forward basis"
      }
    },
    createApi({ baseApi }) {
      const state = () => baseApi.getState();
      const update = (patch, eventName) => baseApi.update(patch, eventName);

      return {
        isEnabled() {
          return state()?.enabled !== false;
        },
        setEnabled(enabled = true) {
          return update({ enabled: enabled !== false }, "configured");
        },
        setChannelEnabled(channel, enabled = true) {
          const nextChannel = normalizeChannel(channel);
          const current = state();
          return update({
            channels: { ...(current.channels ?? {}), [nextChannel]: enabled !== false }
          }, "channelChanged");
        },
        beginFrame(frameInfo = {}) {
          const current = state();
          const frame = Number.isFinite(Number(frameInfo.frame)) ? Number(frameInfo.frame) : Number(current.frame ?? 0) + 1;
          return update({ frame }, "frameStarted");
        },
        clearFrame(scope) {
          const current = state();
          return update({
            rays: frameEntries(current.rays, scope),
            points: frameEntries(current.points, scope),
            scalars: frameEntries(current.scalars, scope)
          }, "frameCleared");
        },
        clearScope(scope) {
          const current = state();
          return update({
            rays: scopedEntries(current.rays, scope),
            points: scopedEntries(current.points, scope),
            scalars: scopedEntries(current.scalars, scope)
          }, "frameCleared");
        },
        registerRay(descriptor = {}) {
          const current = state();
          const ray = normalizeRay(current, descriptor);
          return update({ rays: { ...(current.rays ?? {}), [ray.id]: ray } }, "rayRegistered");
        },
        registerPoint(descriptor = {}) {
          const current = state();
          const point = normalizePoint(current, descriptor);
          return update({ points: { ...(current.points ?? {}), [point.id]: point } }, "pointRegistered");
        },
        setScalar(idOrDescriptor, maybeValue, maybeOptions = {}) {
          const current = state();
          const descriptor = isObject(idOrDescriptor)
            ? idOrDescriptor
            : { ...maybeOptions, id: idOrDescriptor, value: maybeValue };
          const scalar = normalizeScalar(current, descriptor);
          return update({ scalars: { ...(current.scalars ?? {}), [scalar.id]: scalar } }, "scalarSet");
        },
        captureState(id, payload = {}, options = {}) {
          const current = state();
          const capture = normalizeCapture(current, id, payload, options);
          return update({
            captures: limitedAppend(current.captures ?? [], capture, current.historyLimit)
          }, "stateCaptured");
        },
        exportState(label = "debug-export", extra = {}) {
          const current = state();
          const packet = snapshotForExport(current, label, extra);
          update({
            lastExport: packet,
            exports: limitedAppend(current.exports ?? [], packet, current.exportLimit)
          }, "stateExported");
          return packet;
        },
        getRays(channel) {
          const rays = state()?.rays ?? {};
          return Object.values(rays).filter((ray) => !channel || ray.channel === channel).map(clone);
        },
        getPoints(channel) {
          const points = state()?.points ?? {};
          return Object.values(points).filter((point) => !channel || point.channel === channel).map(clone);
        },
        getScalars(channel) {
          const scalars = state()?.scalars ?? {};
          return Object.values(scalars).filter((scalar) => !channel || scalar.channel === channel).map(clone);
        },
        getDebugPacket(label = "debug-packet", extra = {}) {
          return snapshotForExport(state(), label, extra);
        },
        colorToHex
      };
    }
  });
}

export const CoreDebugColors = COLOR_HEX;
