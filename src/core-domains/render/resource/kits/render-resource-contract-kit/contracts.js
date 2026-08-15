import {
  RENDER_RESOURCE_BUDGET_SCHEMA,
  RENDER_RESOURCE_CACHE_ENTRY_SCHEMA,
  RENDER_RESOURCE_CLAIM_SCHEMA,
  RENDER_RESOURCE_IDENTITY_SCHEMA,
  RENDER_RESOURCE_INTEGRITY_PROOF_SCHEMA,
  RENDER_RESOURCE_REFERENCE_SCHEMA,
  RENDER_RESOURCE_RELEASE_RECEIPT_SCHEMA,
  RENDER_RESOURCE_RELEASE_RECORD_SCHEMA,
  RENDER_RESOURCE_RELEASE_SCHEMA,
  RENDER_RESOURCE_STATE_SCHEMA,
  RENDER_RESOURCE_UPLOAD_RECEIPT_SCHEMA,
  RENDER_RESOURCE_UPLOAD_RECORD_SCHEMA,
  RENDER_RESOURCE_UPLOAD_SCHEMA,
  createResourceIdentity,
  normalizeResourceIdentity,
  normalizeResourceState
} from "../../resource-contracts.js";
import { normalizeRenderResource } from "../../../contracts/kits/render-resource-schema-kit/contracts.js";

export { createResourceIdentity, normalizeRenderResource, normalizeResourceIdentity };

export function normalizeRenderResourceContractSnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-contract",
    fields: [],
    label: "Render Resource Contract snapshot"
  });
}

export function renderResourceContract() {
  return Object.freeze({
    identitySchema: RENDER_RESOURCE_IDENTITY_SCHEMA,
    referenceSchema: RENDER_RESOURCE_REFERENCE_SCHEMA,
    stateSchema: RENDER_RESOURCE_STATE_SCHEMA,
    cacheEntrySchema: RENDER_RESOURCE_CACHE_ENTRY_SCHEMA,
    budgetSchema: RENDER_RESOURCE_BUDGET_SCHEMA,
    claimSchema: RENDER_RESOURCE_CLAIM_SCHEMA,
    uploadSchema: RENDER_RESOURCE_UPLOAD_SCHEMA,
    uploadRecordSchema: RENDER_RESOURCE_UPLOAD_RECORD_SCHEMA,
    uploadReceiptSchema: RENDER_RESOURCE_UPLOAD_RECEIPT_SCHEMA,
    releaseSchema: RENDER_RESOURCE_RELEASE_SCHEMA,
    releaseRecordSchema: RENDER_RESOURCE_RELEASE_RECORD_SCHEMA,
    releaseReceiptSchema: RENDER_RESOURCE_RELEASE_RECEIPT_SCHEMA,
    integrityProofSchema: RENDER_RESOURCE_INTEGRITY_PROOF_SCHEMA,
    portableStateOnly: true,
    providerHandlesAllowed: false,
    providerExecutionOwnedExternally: true,
    assetContentOwnedExternally: true,
    deviceAllocationOwnedExternally: true
  });
}
