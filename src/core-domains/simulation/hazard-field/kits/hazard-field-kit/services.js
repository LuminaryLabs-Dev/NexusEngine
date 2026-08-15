import { advanceHazardField, queryHazardCircle } from "./contracts.js";

export function createHazardFieldServices(baseApi) {
  return {
    checkCircle: (circle) => queryHazardCircle(baseApi.getState(), circle),
    advance(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const advanced = advanceHazardField(state, request);
        return { patch: { elapsedSeconds: advanced.elapsedSeconds, hazards: advanced.hazards, spawnRules: advanced.spawnRules, nextSequence: advanced.nextSequence, lastSpawn: advanced.spawned.at(-1) ?? state.lastSpawn }, result: { spawned: advanced.spawned }, events: advanced.spawned.map((hazard) => ({ name: "spawned", payload: { hazard } })) };
      });
    },
    setBounds(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const width = Number(request.bounds?.width);
        const height = Number(request.bounds?.height);
        const padding = Number(request.bounds?.padding ?? 0);
        if (![width, height, padding].every(Number.isFinite) || width <= 0 || height <= 0 || padding < 0) throw new TypeError("Hazard bounds are invalid.");
        for (const hazard of state.hazards) if (hazard.radius * 2 + padding * 2 > width || hazard.radius * 2 + padding * 2 > height) throw new RangeError(`Hazard ${hazard.id} does not fit within requested bounds.`);
        const bounds = { width, height, padding };
        return { patch: { bounds }, result: { bounds } };
      });
    }
  };
}
