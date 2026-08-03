import { createSoftRespawnResult } from "./contracts.js";

export function createSoftRespawnServices(baseApi) {
  return {
    recover(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const recovery = createSoftRespawnResult(state, request);
        return {
          patch: { recoveries: recovery.recoveryNumber, subjects: { ...(state.subjects ?? {}), [recovery.subjectId]: recovery }, lastRecovery: recovery },
          result: recovery,
          events: [{ name: "recovered", payload: { recovery } }]
        };
      });
    },
    getSubject: (subjectId) => baseApi.getState().subjects?.[String(subjectId)] ?? null
  };
}
