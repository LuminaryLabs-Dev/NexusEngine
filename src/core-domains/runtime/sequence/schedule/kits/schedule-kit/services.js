import { advanceSchedule } from "./contracts.js";

export function createScheduleServices(baseApi) {
  return {
    advance(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const advanced = advanceSchedule(state, request);
        return { patch: { elapsedSeconds: advanced.elapsedSeconds, cycles: advanced.cycles, lastCycles: advanced.occurrences }, result: { occurrences: advanced.occurrences }, events: advanced.occurrences.map((occurrence) => ({ name: "cycle", payload: { occurrence } })) };
      });
    },
    setPaused(command = {}) {
      return baseApi.applyCommand(command, (_state, request) => ({ patch: { paused: request.paused === true }, result: { paused: request.paused === true } }));
    },
    setScale(command = {}) {
      return baseApi.applyCommand(command, (_state, request) => {
        const scale = Number(request.scale);
        if (!Number.isFinite(scale) || scale < 0) throw new TypeError("Schedule scale must be finite and nonnegative.");
        return { patch: { scale }, result: { scale } };
      });
    }
  };
}
