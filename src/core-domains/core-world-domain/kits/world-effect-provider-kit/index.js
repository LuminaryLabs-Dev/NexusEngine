export const WORLD_EFFECT_PHASES = Object.freeze(["foundation", "classification", "population", "presentation"]);

export function defineWorldEffectProvider({ id, phase = "population", provides = [], requires = [], matches = () => true, build, release = () => {} }) {
  if (!id) throw new TypeError("World effect provider id is required.");
  if (!WORLD_EFFECT_PHASES.includes(phase)) throw new TypeError(`Unsupported world effect phase: ${phase}`);
  if (typeof build !== "function") throw new TypeError("World effect provider build is required.");
  return Object.freeze({ id, phase, provides: Object.freeze([...provides]), requires: Object.freeze([...requires]), matches, build, release });
}

export function createWorldEffect({ id, providerId, worldId, cellId, kind, payload = {}, capabilities = [] }) {
  return Object.freeze({ id, providerId, worldId, cellId, kind, payload, capabilities: Object.freeze([...capabilities]) });
}
