import {
  assertResourceTransition,
  canResourceTransition,
  normalizeResourceState,
  normalizeResourceStateRecord,
  renderResourceEnums
} from "../../resource-contracts.js";

export { assertResourceTransition, canResourceTransition, normalizeResourceStateRecord };

export function normalizeResourceStateContractSnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-state",
    fields: [],
    label: "Render Resource State Contract snapshot"
  });
}

export function resourceStateContract() {
  return Object.freeze({
    phases: renderResourceEnums.phases,
    transitions: renderResourceEnums.transitions,
    portableStateOnly: true,
    registryOwnedByLifecycleKit: true,
    providerExecutionOwnedExternally: true
  });
}
