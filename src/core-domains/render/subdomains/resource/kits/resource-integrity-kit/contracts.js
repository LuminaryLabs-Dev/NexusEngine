import {
  assertSortedResourceRecords,
  canonicalResourceValue,
  normalizeIntegrityProof,
  normalizeResourceOperation,
  normalizeResourceState,
  rejectResourceFields,
  requireResourceObject,
  requireResourceText
} from "../../resource-contracts.js";

export { normalizeIntegrityProof };

export function normalizeIntegrityProofCommand(input) {
  const value = normalizeResourceOperation(input, ["proof"], "Render resource integrity proof command");
  requireResourceObject(value.proof, "Render resource integrity proof command.proof");
  rejectResourceFields(value.proof, ["schema", "proofId", "identityId", "algorithm", "expected", "actual", "status", "sourceId", "metadata"], "Render resource integrity proof command.proof");
  const proof = canonicalResourceValue(value.proof, "Render resource integrity proof command.proof");
  proof.proofId = requireResourceText(proof.proofId, "Render resource integrity proof command.proof.proofId");
  proof.identityId = requireResourceText(proof.identityId, "Render resource integrity proof command.proof.identityId");
  proof.actual = requireResourceText(proof.actual, "Render resource integrity proof command.proof.actual");
  return { operationId: value.operationId, proof };
}

export function normalizeResourceIntegritySnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-integrity",
    fields: ["proofs", "proofOrder", "integrityRevision"],
    label: "Render Resource Integrity snapshot",
    validate(state) {
      assertSortedResourceRecords(state, {
        collection: "proofs",
        order: "proofOrder",
        revision: "integrityRevision",
        normalizeRecord: normalizeIntegrityProof,
        idField: "proofId",
        label: "Render Resource Integrity snapshot"
      });
    }
  });
}

export function resourceIntegrityContract() {
  return Object.freeze({
    algorithm: "sha256",
    externalObservationOnly: true,
    fetchingAllowed: false,
    byteStorageAllowed: false,
    mismatchesAreRecorded: true,
    exactOnceMutations: true
  });
}
