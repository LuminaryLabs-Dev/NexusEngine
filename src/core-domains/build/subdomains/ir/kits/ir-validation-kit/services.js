export function createIrValidationService() {
  function validate(kitIr, executionIr) {
    const errors = [];
    if (kitIr.schema !== "nexusengine.kit-ir/1") errors.push({ code: "invalid-kit-ir-schema" });
    if (executionIr.schema !== "nexusengine.execution-ir/1") errors.push({ code: "invalid-execution-ir-schema" });
    if (executionIr.sourceKitIrHash !== kitIr.contentHash) errors.push({ code: "ir-lineage-mismatch" });
    if (executionIr.cycles.length) errors.push({ code: "module-cycle", cycles: executionIr.cycles });
    for (const module of kitIr.modules) {
      if (module.diagnostics.some((diagnostic) => diagnostic.category === "error")) {
        errors.push({ code: "parse-error", path: module.path, diagnostics: module.diagnostics });
      }
      if (module.unsupported.length) {
        errors.push({ code: "unsupported-effect", path: module.path, effects: module.unsupported });
      }
    }
    if (!kitIr.dependencies.ok) {
      errors.push({
        code: "dependency-closure-incomplete",
        unresolved: kitIr.dependencies.unresolved,
        missingRelativeImports: kitIr.dependencies.missingRelativeImports
      });
    }
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
  }

  return Object.freeze({ validate });
}

export default createIrValidationService;
