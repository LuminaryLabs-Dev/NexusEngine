import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function pursuitBandFor(distance, config) {
  if (distance <= config.catchDistance) return "caught";
  if (distance <= config.dangerDistance) return "danger";
  if (distance <= config.warningDistance) return "warning";
  return "clear";
}

export function normalizePursuitPressureConfig(config = {}) {
  const catchDistance = Math.max(0, finite(config.catchDistance, "catchDistance", 8));
  const dangerDistance = finite(config.dangerDistance, "dangerDistance", 28);
  const warningDistance = finite(config.warningDistance, "warningDistance", 56);
  const startDistance = Math.max(0, finite(config.startDistance, "startDistance", 80));
  const maxDistance = Math.max(startDistance, finite(config.maxDistance, "maxDistance", Math.max(100, startDistance)));
  if (!(catchDistance <= dangerDistance && dangerDistance <= warningDistance && warningDistance <= maxDistance)) throw new RangeError("Pursuit distances must satisfy catch <= danger <= warning <= max.");
  return { id: String(config.id ?? "pursuit-pressure"), startDistance, catchDistance, dangerDistance, warningDistance, closeRatePerSecond: Math.max(0, finite(config.closeRatePerSecond, "closeRatePerSecond", 1)), recoverRatePerSecond: Math.max(0, finite(config.recoverRatePerSecond, "recoverRatePerSecond", 0)), maxDistance };
}

export function createPursuitPressureState(config = {}) {
  const normalized = normalizePursuitPressureConfig(config);
  const band = pursuitBandFor(normalized.startDistance, normalized);
  return { pressureId: normalized.id, distance: normalized.startDistance, catchDistance: normalized.catchDistance, dangerDistance: normalized.dangerDistance, warningDistance: normalized.warningDistance, closeRatePerSecond: normalized.closeRatePerSecond, recoverRatePerSecond: normalized.recoverRatePerSecond, maxDistance: normalized.maxDistance, caught: band === "caught", band, transitionHistory: [], lastChange: null };
}

export function calculatePursuitTransition(state = {}, nextDistance, source = "adjust", metadata = {}) {
  const distance = Math.max(0, Math.min(state.maxDistance, finite(nextDistance, "distance")));
  const band = pursuitBandFor(distance, state);
  const caught = band === "caught";
  return cloneSerializableState({ schema: "nexusengine.pursuit-transition/1", beforeBand: state.band, band, beforeCaught: state.caught === true, caught, distance, source: String(source), metadata });
}
