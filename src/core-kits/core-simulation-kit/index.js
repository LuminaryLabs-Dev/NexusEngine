import { createCoreCapabilityKit } from "../core-capability-kit.js";

export { TimingWindowState, TimingWindowAction, TimingWindowResolved, createTimingWindowKit, gradeTimingWindow } from "../../timing-window-kit.js";
export { ResourcePressureState, ResourcePressureAdjust, ResourcePressureChanged, ResourcePressureDepleted, createResourcePressureKit, pressureValue } from "../../resource-pressure-kit.js";
export { ObjectiveFlowState, ObjectiveFlowAction, ObjectiveFlowReset, ObjectiveFlowCompleted, ObjectiveStepCompleted, createObjectiveFlowKit } from "../../objective-flow-kit.js";
export * from "./timers.js";
export * from "./resources.js";
export * from "./pressure.js";
export * from "./objectives.js";
export * from "./checkpoints.js";
export * from "./hazards.js";

export function createCoreSimulationKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-simulation",
    apiName: config.apiName ?? "coreSimulation",
    purpose: "Deterministic resource meters, pressure channels, timers, objectives, routes, checkpoints, and hazards.",
    owns: ["resource meters", "pressure channels", "timers", "cooldowns", "objectives", "routes", "checkpoints", "hazards"],
    doesNotOwn: ["game-specific loop fiction", "rendering", "raw input"],
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true
    }
  });
}
