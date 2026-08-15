import { advanceVehicleDynamics } from "./contracts.js";

export function createVehicleDynamicsServices(baseApi) {
  return {
    step(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const frame = advanceVehicleDynamics(state, request);
        return {
          patch: { position: frame.position, velocity: frame.velocity, heading: frame.heading, boost: frame.boost, sequence: frame.sequence, lastInput: frame.input, lastImpact: frame.impact, lastFrame: frame },
          result: frame,
          events: frame.impact ? [{ name: "impact", payload: frame.impact }] : []
        };
      });
    },
    setBounds(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const bounds = {
          minX: Number(request.bounds?.minX), maxX: Number(request.bounds?.maxX),
          minZ: Number(request.bounds?.minZ), maxZ: Number(request.bounds?.maxZ)
        };
        if (Object.values(bounds).some((value) => !Number.isFinite(value))) throw new TypeError("Vehicle bounds must be finite.");
        if (bounds.minX > bounds.maxX || bounds.minZ > bounds.maxZ) throw new RangeError("Vehicle bounds minimums cannot exceed maximums.");
        return { patch: { bounds }, result: { bounds } };
      });
    },
    getFrame: () => baseApi.getState().lastFrame
  };
}
