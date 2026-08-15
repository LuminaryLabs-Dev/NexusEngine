import {
  assertSortedResourceRecords,
  normalizeResourceOperation,
  normalizeResourceReference,
  normalizeResourceState,
  requireResourceText
} from "../../resource-contracts.js";

export { normalizeResourceReference };

export function normalizeReferenceAdditionCommand(input) {
  const value = normalizeResourceOperation(input, ["reference"], "Render resource reference addition command");
  return { operationId: value.operationId, reference: normalizeResourceReference(value.reference) };
}

export function normalizeReferenceRemovalCommand(input) {
  const value = normalizeResourceOperation(input, ["referenceId"], "Render resource reference removal command");
  return { operationId: value.operationId, referenceId: requireResourceText(value.referenceId, "Render resource reference removal command.referenceId") };
}

export function normalizeResourceReferenceSnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-reference",
    fields: ["references", "referenceOrder", "referenceRevision"],
    label: "Render Resource Reference snapshot",
    validate(state) {
      assertSortedResourceRecords(state, {
        collection: "references",
        order: "referenceOrder",
        revision: "referenceRevision",
        normalizeRecord: normalizeResourceReference,
        idField: "referenceId",
        label: "Render Resource Reference snapshot"
      });
    }
  });
}

export function resourceReferenceContract() {
  return Object.freeze({
    exactIdentityReferences: true,
    ownerAndUsageRecorded: true,
    releaseGuardInput: true,
    queryMutationAllowed: false,
    exactOnceMutations: true
  });
}
