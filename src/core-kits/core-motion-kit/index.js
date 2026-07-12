import { createCoreCapabilityKit } from "../core-capability-kit.js";
import {
  createMotionFrameDescriptor,
  createMotionIntentDescriptor,
  createMovementModeDescriptor,
  createRootMotionRequest,
  createTrajectoryDescriptor,
  validateMotionFrameDescriptor,
  validateMotionIntentDescriptor
} from "./contracts.js";

export * from "./contracts.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function createCoreMotionKit(config = {}) {
  const frameHistoryLimit = Math.max(1, Number(config.frameHistoryLimit ?? 120));
  const apiName = config.apiName ?? "coreMotion";
  return createCoreCapabilityKit({
    ...config,
    domain: "core-motion",
    apiName,
    purpose: "Intent-to-motion descriptors, movement modes, trajectories, root-motion requests, velocity state, and movement policies.",
    owns: [
      "movement modes",
      "motion intent",
      "velocity descriptors",
      "acceleration policy",
      "trajectories",
      "root-motion requests",
      "motion frames",
      "jump/dash/fly/swim descriptors",
      ...(config.owns ?? [])
    ],
    doesNotOwn: [
      "raw input bindings",
      "physics contacts",
      "rig pose solving",
      "renderer transforms",
      ...(config.doesNotOwn ?? [])
    ],
    services: [
      "movement-modes",
      "motion-intents",
      "trajectories",
      "root-motion-requests",
      "motion-frames",
      ...(config.services ?? [])
    ],
    eventNames: [
      "configured",
      "updated",
      "reset",
      "snapshotLoaded",
      "descriptorChanged",
      "movementModeRegistered",
      "intentSubmitted",
      "intentCleared",
      "trajectorySubmitted",
      "motionFrameCommitted"
    ],
    initialState: {
      movementModes: {},
      intents: {},
      trajectories: {},
      currentFrame: null,
      frames: [],
      ...(config.initialState ?? {})
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      coreDomain: true,
      rendererAgnostic: true,
      physicsIndependent: true
    },
    install(context) {
      context.engine.coreMotion = context.engine.n[apiName];
      config.install?.(context);
    },
    createApi({ baseApi }) {
      const state = () => baseApi.getState();
      const commit = (patch, eventName) => baseApi.update(patch, eventName);
      return {
        registerMovementMode(input = {}) {
          const descriptor = createMovementModeDescriptor(input);
          commit({
            movementModes: { ...(state().movementModes ?? {}), [descriptor.id]: descriptor }
          }, "movementModeRegistered");
          return clone(descriptor);
        },
        getMovementMode(id) {
          return clone(state().movementModes?.[String(id)] ?? null);
        },
        listMovementModes() {
          return Object.values(state().movementModes ?? {}).sort((a, b) => a.id.localeCompare(b.id)).map(clone);
        },
        submitIntent(input = {}) {
          const descriptor = createMotionIntentDescriptor(input);
          const validation = validateMotionIntentDescriptor(descriptor);
          if (!validation.valid) throw new TypeError(`Invalid motion intent: ${validation.issues.join(", ")}`);
          commit({
            intents: { ...(state().intents ?? {}), [descriptor.id]: descriptor }
          }, "intentSubmitted");
          return clone(descriptor);
        },
        getIntent(id) {
          return clone(state().intents?.[String(id)] ?? null);
        },
        clearIntent(id) {
          const key = String(id);
          const intents = { ...(state().intents ?? {}) };
          const removed = delete intents[key];
          if (removed) commit({ intents }, "intentCleared");
          return removed;
        },
        submitTrajectory(input = {}) {
          const descriptor = createTrajectoryDescriptor(input);
          commit({
            trajectories: { ...(state().trajectories ?? {}), [descriptor.id]: descriptor }
          }, "trajectorySubmitted");
          return clone(descriptor);
        },
        getTrajectory(id) {
          return clone(state().trajectories?.[String(id)] ?? null);
        },
        createRootMotionRequest,
        commitMotionFrame(input = {}) {
          const current = state();
          const frame = createMotionFrameDescriptor({
            ...input,
            intents: input.intents ?? Object.values(current.intents ?? {}),
            trajectories: input.trajectories ?? Object.values(current.trajectories ?? {})
          });
          const validation = validateMotionFrameDescriptor(frame);
          if (!validation.valid) throw new TypeError(`Invalid motion frame: ${validation.issues.join(", ")}`);
          commit({
            currentFrame: frame,
            frames: [...(current.frames ?? []), frame].slice(-frameHistoryLimit)
          }, "motionFrameCommitted");
          return clone(frame);
        },
        getMotionFrame() {
          return clone(state().currentFrame ?? null);
        },
        getMotionHistory() {
          return clone(state().frames ?? []);
        },
        validateIntent: validateMotionIntentDescriptor,
        validateFrame: validateMotionFrameDescriptor
      };
    }
  });
}
