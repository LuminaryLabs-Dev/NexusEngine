import { calculatePursuitTransition } from "./contracts.js";

function applyTransition(baseApi, command, nextDistance, source) {
  return baseApi.applyCommand(command, (state, request) => {
    const transition = calculatePursuitTransition(state, nextDistance(state, request), source, request.metadata ?? {});
    if (state.caught && !transition.caught && request.recovery !== true) throw new TypeError("Leaving caught state requires an explicit recovery transition.");
    if (!state.caught && request.recovery === true) throw new TypeError("Recovery is invalid when pursuit is not caught.");
    const changed = transition.beforeBand !== transition.band;
    return { patch: { distance: transition.distance, band: transition.band, caught: transition.caught, lastChange: transition, transitionHistory: changed ? [...state.transitionHistory, transition].slice(-256) : state.transitionHistory }, result: { transition }, events: changed ? [{ name: "changed", payload: { transition } }, ...(transition.caught && !state.caught ? [{ name: "caught", payload: { transition } }] : []), ...(!transition.caught && state.caught ? [{ name: "recovered", payload: { transition } }] : [])] : [] };
  });
}

export function createPursuitPressureServices(baseApi) {
  return {
    adjust(command = {}) {
      return applyTransition(baseApi, command, (state, request) => {
        const amount = Number(request.amount ?? 0);
        if (!Number.isFinite(amount)) throw new TypeError("Pursuit adjustment must be finite.");
        return state.distance + amount;
      }, "adjust");
    },
    setDistance(command = {}) {
      return applyTransition(baseApi, command, (_state, request) => request.distance, "set-distance");
    },
    recover(command = {}) {
      return applyTransition(baseApi, { ...command, recovery: true }, (_state, request) => request.distance, "recovery");
    },
    advance(command = {}) {
      return applyTransition(baseApi, command, (state, request) => {
        const delta = Number(request.delta ?? 0);
        if (!Number.isFinite(delta) || delta < 0) throw new TypeError("Pursuit delta must be finite and nonnegative.");
        return state.distance - state.closeRatePerSecond * delta + state.recoverRatePerSecond * delta;
      }, "drift");
    }
  };
}
