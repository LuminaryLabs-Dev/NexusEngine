import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";
import { DEFAULT_CAMERA_FRAMING_POLICY } from "../../core-domains/core-presentation-domain/contracts.js";
import {
  add3,
  calculatePerspectiveCameraFit,
  clamp,
  finite,
  length3,
  normalizeVector3,
  scale3,
  subtract3
} from "./perspective-fit.js";
import { calculateOrthographicCameraFit } from "./orthographic-fit.js";

export * from "./perspective-fit.js";
export * from "./orthographic-fit.js";

const VERSION = "0.0.3";
const Framing = defineResource("core.presentation.camera-framing");
const FramingChanged = defineEvent("core.presentation.framing-changed");
const Reset = defineEvent("core.presentation.framing-reset");
const SnapshotLoaded = defineEvent("core.presentation.framing-snapshot-loaded");
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function normalizeControllerConfig(input = {}) {
  return {
    id: String(input.id ?? "main"),
    padding: Math.max(1, finite(input.padding, DEFAULT_CAMERA_FRAMING_POLICY.padding)),
    smoothTime: Math.max(0, finite(input.smoothTime, DEFAULT_CAMERA_FRAMING_POLICY.smoothTime)),
    minimumDistance: Math.max(0.01, finite(input.minimumDistance, DEFAULT_CAMERA_FRAMING_POLICY.minimumDistance)),
    maximumDistance: Math.max(0.01, finite(input.maximumDistance, DEFAULT_CAMERA_FRAMING_POLICY.maximumDistance)),
    teleportThreshold: Math.max(0, finite(input.teleportThreshold, DEFAULT_CAMERA_FRAMING_POLICY.teleportThreshold))
  };
}

function initialState() {
  return { version: VERSION, status: "ready", controllers: {}, sequence: 0 };
}

function rawFit(request, config) {
  const nextRequest = { ...request, padding: request.padding ?? config.padding };
  const descriptor = request.camera?.projection === "orthographic"
    ? calculateOrthographicCameraFit(nextRequest)
    : calculatePerspectiveCameraFit(nextRequest);
  descriptor.distance = clamp(descriptor.distance, config.minimumDistance, config.maximumDistance);
  descriptor.position = add3(descriptor.target, scale3(normalizeVector3(descriptor.direction), descriptor.distance));
  descriptor.near = Math.max(0.01, Math.min(descriptor.near, descriptor.distance));
  descriptor.far = Math.max(descriptor.near + 0.01, descriptor.far);
  return descriptor;
}

function dampVector(current, target, alpha) {
  return current.map((value, index) => value + (target[index] - value) * alpha);
}

export function createCoreCameraFramingKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "core-camera-framing-kit",
    domain: "presentation-camera-framing",
    domainPath: "n:presentation:camera-framing",
    parentDomainPath: "n:presentation",
    apiName: config.apiName ?? "cameraFraming",
    version: VERSION,
    stability: "stable-candidate",
    services: ["subject-framing", "perspective-fit", "orthographic-fit", "framing-damping"],
    resources: { Framing },
    events: { FramingChanged, Reset, SnapshotLoaded },
    metadata: {
      purpose: "Renderer-neutral, aspect-aware perspective and orthographic subject framing.",
      owns: ["subject bounds fit", "camera target descriptors", "distance policy", "near/far policy", "framing damping"],
      doesNotOwn: ["renderer camera objects", "Three.js bounds", "DOM measurement", "gameplay camera intent"],
      rendererAgnostic: true,
      deterministic: true,
      optional: true,
      snapshot: true,
      reset: true
    },
    initWorld({ world }) {
      world.setResource(Framing, initialState());
    },
    createApi({ world }) {
      const commitController = (id, record, event = FramingChanged) => {
        const state = world.getResource(Framing);
        const next = {
          ...state,
          sequence: state.sequence + 1,
          controllers: { ...state.controllers, [id]: record }
        };
        world.setResource(Framing, next);
        world.emit(event, { id, controller: clone(record) });
        return clone(record.descriptor);
      };
      const getRecord = (id) => world.getResource(Framing).controllers[String(id)];
      const updateController = (id, request = {}) => {
        const record = getRecord(id);
        if (!record) throw new RangeError(`Unknown camera framing controller: ${id}`);
        const target = rawFit(request, record.config);
        const dt = Math.max(0, Math.min(0.25, finite(request.deltaTime, 1 / 60)));
        const current = record.descriptor;
        const teleported = !record.initialized || !current || length3(subtract3(target.target, current.target)) > record.config.teleportThreshold || request.reset === true;
        let descriptor = target;
        if (!teleported && record.config.smoothTime > 0) {
          const alpha = 1 - Math.exp(-dt / Math.max(1e-6, record.config.smoothTime));
          descriptor = {
            ...target,
            target: dampVector(current.target, target.target, alpha),
            position: dampVector(current.position, target.position, alpha),
            distance: current.distance + (target.distance - current.distance) * alpha,
            near: current.near + (target.near - current.near) * alpha,
            far: current.far + (target.far - current.far) * alpha,
            status: "damping"
          };
        }
        return commitController(String(id), {
          ...record,
          initialized: true,
          descriptor,
          targetDescriptor: target,
          updates: record.updates + 1
        });
      };
      const controllerApi = (id) => Object.freeze({
        update: (request) => updateController(id, request),
        getDescriptor: () => clone(getRecord(id)?.descriptor ?? null),
        getSnapshot: () => clone(getRecord(id) ?? null),
        loadSnapshot(snapshot = {}) {
          const record = {
            config: normalizeControllerConfig({ id, ...(snapshot.config ?? {}) }),
            initialized: snapshot.initialized === true,
            descriptor: clone(snapshot.descriptor ?? null),
            targetDescriptor: clone(snapshot.targetDescriptor ?? null),
            updates: Math.max(0, Number(snapshot.updates ?? 0))
          };
          commitController(String(id), record, SnapshotLoaded);
          return clone(record);
        },
        reset(request) {
          const record = getRecord(id);
          const resetRecord = { ...record, initialized: false, descriptor: null, targetDescriptor: null, updates: 0 };
          commitController(String(id), resetRecord, Reset);
          return request ? updateController(id, { ...request, reset: true }) : null;
        }
      });
      return {
        create(controllerConfig = {}) {
          const normalized = normalizeControllerConfig({ ...config, ...controllerConfig });
          const existing = getRecord(normalized.id);
          if (!existing) {
            commitController(normalized.id, {
              config: normalized,
              initialized: false,
              descriptor: null,
              targetDescriptor: null,
              updates: 0
            });
          }
          return controllerApi(normalized.id);
        },
        get(id) {
          return getRecord(id) ? controllerApi(String(id)) : null;
        },
        has: (id) => Boolean(getRecord(id)),
        remove(id) {
          const key = String(id);
          const state = world.getResource(Framing);
          if (!state.controllers[key]) return false;
          const controllers = { ...state.controllers };
          delete controllers[key];
          world.setResource(Framing, { ...state, sequence: state.sequence + 1, controllers });
          return true;
        },
        list: () => Object.keys(world.getResource(Framing).controllers),
        getState: () => clone(world.getResource(Framing)),
        getSnapshot: () => clone(world.getResource(Framing)),
        loadSnapshot(snapshot = {}) {
          const next = { ...initialState(), ...clone(snapshot), version: VERSION, status: "ready" };
          world.setResource(Framing, next);
          world.emit(SnapshotLoaded, { state: clone(next) });
          return clone(next);
        },
        reset() {
          const next = initialState();
          world.setResource(Framing, next);
          world.emit(Reset, { state: clone(next) });
          return clone(next);
        }
      };
    }
  });
}
