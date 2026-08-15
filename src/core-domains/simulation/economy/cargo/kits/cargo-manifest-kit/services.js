import { queryNearestCargo } from "./contracts.js";

export function createCargoManifestServices(baseApi) {
  return {
    availableItems: () => baseApi.getState().items.filter((item) => item.status === "available"),
    nearestAvailable: (point, radius) => queryNearestCargo(baseApi.getState(), point, radius),
    pickUp(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const itemId = String(request.itemId ?? "");
        const item = state.items.find((entry) => entry.id === itemId);
        if (!item || item.status !== "available") throw new TypeError(`Cargo ${itemId} is unavailable.`);
        const weight = item.weight * item.quantity;
        if (state.carriedWeight + weight > state.capacity) throw new RangeError(`Cargo ${itemId} exceeds capacity.`);
        const picked = { ...item, status: "carried", carrierId: String(request.carrierId ?? "carrier") };
        return { patch: { items: state.items.map((entry) => entry.id === itemId ? picked : entry), carried: [...state.carried, itemId], carriedWeight: state.carriedWeight + weight, lastEvent: { type: "picked-up", item: picked } }, result: { item: picked }, events: [{ name: "pickedup", payload: { item: picked } }] };
      });
    },
    deposit(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const carried = state.items.filter((item) => item.status === "carried" && (!request.carrierId || item.carrierId === String(request.carrierId)));
        if (!carried.length) throw new TypeError("Cargo deposit requires at least one carried item.");
        const value = carried.reduce((sum, item) => {
          const quality = item.condition / item.conditionMax;
          return sum + item.value * item.quantity * (1 + (quality - 1) * item.conditionValueMultiplier);
        }, 0);
        const zoneId = String(request.zoneId ?? "transfer-zone");
        const deposited = carried.map((item) => ({ ...item, status: "deposited", carrierId: null, zoneId }));
        const ids = new Set(deposited.map((item) => item.id));
        const deliveredValue = state.deliveredValue + value;
        const record = { zoneId, itemIds: [...ids].sort(), value, deliveredValue };
        return { patch: { items: state.items.map((item) => deposited.find((entry) => entry.id === item.id) ?? item), carried: state.carried.filter((id) => !ids.has(id)), carriedWeight: state.items.filter((item) => item.status === "carried" && !ids.has(item.id)).reduce((sum, item) => sum + item.weight * item.quantity, 0), deliveredValue, deliveredCount: state.deliveredCount + deposited.length, quotaComplete: deliveredValue >= state.quota, deposits: [...state.deposits, record], lastEvent: { type: "deposited", ...record } }, result: { items: deposited, ...record }, events: [{ name: "deposited", payload: record }, ...(deliveredValue >= state.quota && !state.quotaComplete ? [{ name: "quotacompleted", payload: record }] : [])] };
      });
    },
    advance(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const delta = Number(request.delta ?? 0);
        if (!Number.isFinite(delta) || delta < 0) throw new TypeError("Cargo advance delta must be finite and nonnegative.");
        const changed = [];
        const items = state.items.map((item) => {
          if (item.status !== "carried" || item.conditionDecayPerSecond === 0) return item;
          const condition = Math.max(0, item.condition - item.conditionDecayPerSecond * delta);
          if (condition !== item.condition) changed.push({ itemId: item.id, before: item.condition, after: condition });
          return { ...item, condition };
        });
        return { patch: { items, lastEvent: changed.length ? { type: "condition-changed", changed } : state.lastEvent }, result: { changed } };
      });
    }
  };
}
