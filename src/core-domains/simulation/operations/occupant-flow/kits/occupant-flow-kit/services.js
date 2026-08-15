import { advanceOccupantFlow, normalizeOccupant } from "./contracts.js";

export function createOccupantFlowServices(baseApi) {
  return {
    spawn(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const occupant = normalizeOccupant(request.occupant, state.nextSequence - 1);
        if (state.occupants.some((entry) => entry.id === occupant.id)) throw new TypeError(`Occupant ${occupant.id} already exists.`);
        return { patch: { occupants: [...state.occupants, occupant], nextSequence: state.nextSequence + 1, lastEvent: { type: "spawned", occupantId: occupant.id } }, result: { occupant }, events: [{ name: "spawned", payload: { occupant } }] };
      });
    },
    serve(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const occupantId = String(request.occupantId ?? "");
        const occupant = state.occupants.find((entry) => entry.id === occupantId);
        if (!occupant) throw new TypeError(`Unknown occupant ${occupantId}.`);
        if (occupant.status !== "waiting") throw new TypeError(`Occupant ${occupantId} is already ${occupant.status}.`);
        const served = { ...occupant, status: "served" };
        return { patch: { occupants: state.occupants.map((entry) => entry.id === occupantId ? served : entry), lastEvent: { type: "served", occupantId } }, result: { occupant: served }, events: [{ name: "served", payload: { occupant: served } }] };
      });
    },
    advance(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const advanced = advanceOccupantFlow(state, request);
        return { patch: { elapsedSeconds: advanced.elapsedSeconds, nextSequence: advanced.nextSequence, occupants: advanced.occupants, spawnRules: advanced.spawnRules, lastEvent: advanced.abandoned.length ? { type: "abandoned", occupantIds: advanced.abandoned } : advanced.spawned.length ? { type: "spawned", occupantIds: advanced.spawned.map((entry) => entry.id) } : state.lastEvent }, result: { spawned: advanced.spawned, abandoned: advanced.abandoned } };
      });
    }
  };
}
