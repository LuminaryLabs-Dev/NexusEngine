import { collectLifecycleFacilityActions } from "./contracts.js";

export function createLifecycleFacilityAdapterServices(baseApi, facilities) {
  return {
    apply(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const actions = collectLifecycleFacilityActions(request.lifecycleReceipt);
        const receipts = actions.map((action, index) => action.type === "add"
          ? facilities.add({ operationId: `lifecycle-facility:${request.operationId}:${index + 1}`, facility: action.facility })
          : facilities.setStatus({ operationId: `lifecycle-facility:${request.operationId}:${index + 1}`, facilityId: action.facilityId, status: action.status }));
        const result = { actions, receipts };
        return { patch: { applications: state.applications + 1, lastResult: result }, result };
      });
    }
  };
}
