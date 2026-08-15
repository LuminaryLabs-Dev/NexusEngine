import { resolveWorldContact } from "./contracts.js";

export function createWorldContactServices(baseApi, config) {
  return {
    resolve(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const result = resolveWorldContact(state, request, config);
        return {
          patch: { bounds: request.bounds ?? state.bounds, grounded: result.contact.grounded, stability: result.contact.stability, contact: result.contact, correction: result.correction, recoveryRequired: result.recoveryRequired, sequence: result.sequence, lastResult: result },
          result,
          events: result.transitions.map((transition) => ({ name: transition.replaceAll("-", ""), payload: { result } }))
        };
      });
    },
    getContact: () => baseApi.getState().contact,
    getCorrection: () => baseApi.getState().correction
  };
}
