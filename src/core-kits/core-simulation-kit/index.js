import { createCoreCapabilityKit } from "../core-capability-kit.js";
import { createSimulationResolutionExtension } from "./resolution.js";

export { TimingWindowState, TimingWindowAction, TimingWindowResolved, createTimingWindowKit, gradeTimingWindow } from "../../timing-window-kit.js";
export { ResourcePressureState, ResourcePressureAdjust, ResourcePressureChanged, ResourcePressureDepleted, createResourcePressureKit, pressureValue } from "../../resource-pressure-kit.js";
export { ObjectiveFlowState, ObjectiveFlowAction, ObjectiveFlowReset, ObjectiveFlowCompleted, ObjectiveStepCompleted, createObjectiveFlowKit } from "../../objective-flow-kit.js";
export * from "./timers.js";
export * from "./resources.js";
export * from "./pressure.js";
export * from "./objectives.js";
export * from "./checkpoints.js";
export * from "./hazards.js";
export * from "./resolution.js";

export function createCoreSimulationKit(config = {}) {
  const resolutionEnabled = config.resolution === true;
  const resolution = resolutionEnabled
    ? createSimulationResolutionExtension(config.resolutionConfig ?? {})
    : null;
  const baseServices = ["resource meters", "pressure channels", "timers", "cooldowns", "objectives", "routes", "checkpoints", "hazards"];
  const services = [
    ...(config.services ?? []),
    ...(resolutionEnabled ? ["step-resolution", "proposal-collection", "observation-collection", "committed-frame"] : [])
  ];

  return createCoreCapabilityKit({
    ...config,
    domain: "core-simulation",
    apiName: config.apiName ?? "coreSimulation",
    purpose: resolutionEnabled
      ? "Deterministic resource meters, pressure channels, timers, objectives, routes, checkpoints, hazards, and authoritative per-tick simulation resolution."
      : "Deterministic resource meters, pressure channels, timers, objectives, routes, checkpoints, and hazards.",
    owns: [
      ...baseServices,
      ...(resolutionEnabled ? ["authoritative simulation step resolution", "committed simulation frame"] : []),
      ...(config.owns ?? [])
    ],
    doesNotOwn: [
      "game-specific loop fiction",
      "rendering",
      "raw input",
      "physics backend implementation",
      ...(config.doesNotOwn ?? [])
    ],
    services,
    resources: {
      ...(config.resources ?? {}),
      ...(resolution?.resources ?? {})
    },
    events: {
      ...(config.events ?? {}),
      ...(resolution?.events ?? {})
    },
    systems: [
      ...(config.systems ?? []),
      ...(resolution?.systems ?? [])
    ],
    initWorld(context) {
      config.initWorld?.(context);
      resolution?.initWorld?.(context);
    },
    createApi(context) {
      const customApi = config.createApi?.(context) ?? {};
      const resolutionApi = resolution?.createApi?.(context) ?? {};
      const api = { ...customApi, ...resolutionApi };
      context.engine.coreSimulation = api;
      return api;
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      resolutionEnabled,
      rendererAgnostic: true
    }
  });
}
