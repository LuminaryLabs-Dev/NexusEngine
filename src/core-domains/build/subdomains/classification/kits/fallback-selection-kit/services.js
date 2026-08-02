export function createFallbackSelectionService(config = {}) {
  const quickJsAvailable = config.quickJsAvailable === true;

  function select(classification, target, capabilityResolution, profile) {
    if (classification.mode === "unsupported") {
      return Object.freeze({ mode: "unsupported", reason: "source-classification-unsupported" });
    }
    if (!capabilityResolution.ok) {
      return Object.freeze({ mode: "unsupported", reason: "missing-capabilities", missing: capabilityResolution.missing });
    }
    if (["web-live", "web-static"].includes(target)) {
      return Object.freeze({ mode: "javascript", reason: "web-target-native-module-execution-is-not-required" });
    }
    if (classification.mode === "native") return Object.freeze({ mode: "native", reason: "all-modules-declare-portable-native-ir" });
    if (classification.mode === "native-adapter") return Object.freeze({ mode: "native-adapter", reason: "target-capability-adapters-resolved" });
    if (profile === "strict-native") return Object.freeze({ mode: "unsupported", reason: "strict-native-rejects-javascript" });
    if (!quickJsAvailable) {
      return Object.freeze({
        mode: "unsupported",
        reason: "quickjs-ng-runtime-unavailable",
        requirement: "quickjs-ng@v0.15.0"
      });
    }
    return Object.freeze({ mode: "javascript", reason: "whole-kit-quickjs-ng-fallback" });
  }

  return Object.freeze({ select });
}

export default createFallbackSelectionService;
