import {
  BUILD_CLASSIFICATION_SCHEMA,
  contentIntegrity,
  stableJson
} from "../../../../contracts.js";

function classifyModule(module, typeErrors) {
  const errors = typeErrors.filter((diagnostic) => diagnostic.path === module.path && diagnostic.category === "error");
  let mode = "javascript";
  const reasons = [];
  if (module.diagnostics.some((diagnostic) => diagnostic.category === "error") || errors.length || module.unsupported.length) {
    mode = "unsupported";
    reasons.push("source-or-effect-errors");
  } else if (module.explicitBuildMode === "native") {
    if (module.nativeDiagnostics.length || module.nativeFunctions.length === 0) {
      mode = "unsupported";
      reasons.push("native-lowering-surface-unsupported");
    } else if (module.effects.length === 0) mode = "native";
    else {
      mode = "native-adapter";
      reasons.push("native-module-requires-capability-adapter");
    }
  } else if (module.explicitBuildMode != null && module.explicitBuildMode !== "javascript") {
    mode = "unsupported";
    reasons.push(`unknown-explicit-build-mode:${module.explicitBuildMode}`);
  } else {
    reasons.push("javascript-fallback-required");
  }
  return Object.freeze({
    modulePath: module.path,
    sourceAstHash: module.astHash,
    mode,
    effects: module.effects,
    nativeFunctions: module.nativeFunctions,
    nativeDiagnostics: module.nativeDiagnostics,
    reasons: Object.freeze(reasons),
    typeErrors: Object.freeze(errors)
  });
}

export function createPortabilityClassifierService() {
  function classify(kitIr) {
    const modules = kitIr.modules.map((module) => classifyModule(module, kitIr.typeDiagnostics));
    const modes = new Set(modules.map((module) => module.mode));
    const mode = modes.has("unsupported")
      ? "unsupported"
      : modes.has("javascript")
        ? "javascript"
        : modes.has("native-adapter")
          ? "native-adapter"
          : "native";
    const payload = { schema: BUILD_CLASSIFICATION_SCHEMA, sourceKitIrHash: kitIr.contentHash, mode, modules };
    return Object.freeze({ ...payload, contentHash: contentIntegrity(stableJson(payload)) });
  }

  return Object.freeze({ classify });
}

export default createPortabilityClassifierService;
