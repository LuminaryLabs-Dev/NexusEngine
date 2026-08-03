import { createOccupantRequests } from "./contracts.js";

export function createOccupantRequestAdapterServices(baseApi, requestQueue) {
  return {
    apply(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const requests = createOccupantRequests(request.occupantReceipt, request.defaults);
        const receipts = requests.map((queued) => requestQueue.add({ operationId: `occupant-request:${queued.id}`, request: queued }));
        const result = { requests, receipts };
        return { patch: { applications: state.applications + 1, lastResult: result }, result };
      });
    }
  };
}
