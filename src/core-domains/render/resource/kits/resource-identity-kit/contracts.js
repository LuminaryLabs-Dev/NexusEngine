import {
  assertSortedResourceRecords,
  createResourceIdentity,
  normalizeResourceIdentity,
  normalizeResourceOperation,
  normalizeResourceState
} from "../../resource-contracts.js";

export { createResourceIdentity, normalizeResourceIdentity };

export function normalizeIdentityRegistrationCommand(input) {
  const value = normalizeResourceOperation(input, ["resource"], "Render resource identity registration command");
  return { operationId: value.operationId, identity: createResourceIdentity(value.resource) };
}

export function normalizeResourceIdentitySnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-identity",
    fields: ["identities", "identityOrder", "identityRevision"],
    label: "Render Resource Identity snapshot",
    validate(state) {
      assertSortedResourceRecords(state, {
        collection: "identities",
        order: "identityOrder",
        revision: "identityRevision",
        normalizeRecord: normalizeResourceIdentity,
        idField: "identityId",
        label: "Render Resource Identity snapshot"
      });
    }
  });
}

export function resourceIdentityContract() {
  return Object.freeze({
    identityDerivation: "resource-id-and-revision",
    descriptorIntegrity: "sha256",
    dependenciesAreExactIdentityIds: true,
    revisionsAreMonotonic: true,
    exactOnceMutations: true
  });
}
