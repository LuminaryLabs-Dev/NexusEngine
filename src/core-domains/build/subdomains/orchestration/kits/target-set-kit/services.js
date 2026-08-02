import { sortedUnique } from "../../../../contracts.js";

export const BUILD_TARGET_IDS = Object.freeze([
  "android-xr",
  "pcvr",
  "web-live",
  "web-static"
]);

export function createTargetSetService(config = {}) {
  const allowed = new Set(config.targets ?? BUILD_TARGET_IDS);

  function normalize(value) {
    const targets = sortedUnique(Array.isArray(value) ? value : value == null ? [] : [value]);
    if (!targets.length) throw new TypeError("Build request requires at least one --target.");
    const unknown = targets.filter((target) => !allowed.has(target));
    if (unknown.length) throw new RangeError(`Unknown Build target(s): ${unknown.join(", ")}.`);
    return Object.freeze(targets);
  }

  return Object.freeze({ normalize, list: () => Object.freeze([...allowed].sort()) });
}

export default createTargetSetService;
