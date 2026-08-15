import { advanceFacilities, normalizeFacility } from "./contracts.js";

export function createFacilityOperationsServices(baseApi) {
  return {
    add(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const facility = normalizeFacility(request.facility, state.facilities.length);
        if (state.facilities.some((entry) => entry.id === facility.id)) throw new TypeError(`Facility ${facility.id} already exists.`);
        return { patch: { facilities: [...state.facilities, facility] }, result: { facility } };
      });
    },
    setStatus(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const facilityId = String(request.facilityId ?? "");
        if (!state.facilities.some((entry) => entry.id === facilityId)) throw new TypeError(`Unknown facility ${facilityId}.`);
        const status = String(request.status ?? "").trim();
        if (!status) throw new TypeError("Facility status is required.");
        return { patch: { facilities: state.facilities.map((entry) => entry.id === facilityId ? { ...entry, status } : entry) }, result: { facilityId, status } };
      });
    },
    advance(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const advanced = advanceFacilities(state, request);
        return {
          patch: { elapsedSeconds: advanced.elapsedSeconds, facilities: advanced.facilities, outputReceipts: [...state.outputReceipts, ...advanced.outputReceipts].slice(-512), lastOutput: advanced.outputReceipts.at(-1) ?? state.lastOutput },
          result: { outputs: advanced.outputReceipts, conditionChanges: advanced.conditionChanges },
          events: advanced.outputReceipts.map((receipt) => ({ name: "outputproduced", payload: { receipt } }))
        };
      });
    }
  };
}
