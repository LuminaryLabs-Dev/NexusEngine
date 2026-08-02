export function createJavascriptFallbackService(config = {}) {
  return Object.freeze({
    describe(classification) {
      return Object.freeze({
        schema: "nexusengine.javascript-fallback/1",
        engine: "quickjs-ng",
        source: config.sourceRecord ?? "git:quickjs-ng@v0.15.0",
        ambientCapabilities: Object.freeze([]),
        bridge: "stable-handles-batched-operations",
        available: config.available === true,
        modules: Object.freeze(classification.modules.filter((module) => module.mode === "javascript").map((module) => module.modulePath))
      });
    }
  });
}

export default createJavascriptFallbackService;
