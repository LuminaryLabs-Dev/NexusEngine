const TARGET_CAPABILITIES = Object.freeze({
  "web-live": new Set(["browser:document", "browser:navigator", "browser:storage", "browser:window", "network:fetch", "network:websocket"]),
  "web-static": new Set(["browser:document", "browser:navigator", "browser:storage", "browser:window"]),
  "android-xr": new Set(["browser:navigator"]),
  pcvr: new Set([])
});

export function createCapabilityResolutionService(config = {}) {
  const substitutions = new Map(Object.entries(config.substitutions ?? {}));

  function resolve(classification, target) {
    const available = TARGET_CAPABILITIES[target] ?? new Set();
    const requested = [...new Set(classification.modules.flatMap((module) => module.effects))].sort();
    const resolved = [];
    const missing = [];
    for (const capability of requested) {
      if (available.has(capability)) resolved.push({ capability, provider: "target" });
      else if (substitutions.has(`${target}:${capability}`)) {
        resolved.push({ capability, provider: substitutions.get(`${target}:${capability}`) });
      } else missing.push(capability);
    }
    return Object.freeze({
      target,
      requested: Object.freeze(requested),
      resolved: Object.freeze(resolved),
      missing: Object.freeze(missing),
      ok: missing.length === 0
    });
  }

  return Object.freeze({ resolve });
}

export default createCapabilityResolutionService;
