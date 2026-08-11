import { normalizeMaterialState, normalizeMaterialValidation, requireMaterialInteger, requireMaterialObject, normalizeMaterialTextList } from "../../material-contracts.js";

export { normalizeMaterialValidation };

export function materialValidationContract() {
  return Object.freeze({
    schema: "nexusengine.render-material-validation/1",
    exactCompileAndReflectionRequired: true,
    currentDependencyValidationRequired: true,
    providerExecution: false,
    exactOnceMutations: true
  });
}

export function normalizeMaterialValidationSnapshot(snapshot) {
  return normalizeMaterialState(snapshot, {
    domain: "render-material-validation",
    fields: ["validations", "validationOrder", "validationRevision"],
    label: "Render Material Validation snapshot",
    validate(state) {
      requireMaterialObject(state.validations, "Render Material Validation snapshot.validations");
      state.validations = Object.fromEntries(Object.entries(state.validations).map(([validationId, validation]) => {
        const normalized = normalizeMaterialValidation(validation);
        if (normalized.validationId !== validationId) throw new TypeError(`Render Material Validation snapshot key ${validationId} does not match validationId.`);
        return [validationId, normalized];
      }));
      state.validationOrder = normalizeMaterialTextList(state.validationOrder, "Render Material Validation snapshot.validationOrder");
      if (JSON.stringify(state.validationOrder) !== JSON.stringify(Object.keys(state.validations).sort())) throw new TypeError("Render Material Validation snapshot.validationOrder must equal sorted validation keys.");
      requireMaterialInteger(state.validationRevision, "Render Material Validation snapshot.validationRevision");
    }
  });
}
