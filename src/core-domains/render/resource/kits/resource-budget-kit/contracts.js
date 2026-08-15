import {
  assertSortedResourceRecords,
  normalizeResourceBudget,
  normalizeResourceClaim,
  normalizeResourceOperation,
  normalizeResourceState,
  requireResourceText
} from "../../resource-contracts.js";

export { normalizeResourceBudget, normalizeResourceClaim };

export function normalizeResourceBudgetDefinitionCommand(input) {
  const value = normalizeResourceOperation(input, ["budget"], "Render resource budget definition command");
  return { operationId: value.operationId, budget: normalizeResourceBudget(value.budget) };
}

export function normalizeResourceBudgetRemovalCommand(input) {
  const value = normalizeResourceOperation(input, ["budgetId"], "Render resource budget removal command");
  return { operationId: value.operationId, budgetId: requireResourceText(value.budgetId, "Render resource budget removal command.budgetId") };
}

export function normalizeResourceClaimCommand(input) {
  const value = normalizeResourceOperation(input, ["claim"], "Render resource budget claim command");
  return { operationId: value.operationId, claim: normalizeResourceClaim(value.claim) };
}

export function normalizeResourceClaimReleaseCommand(input) {
  const value = normalizeResourceOperation(input, ["claimId"], "Render resource budget claim release command");
  return { operationId: value.operationId, claimId: requireResourceText(value.claimId, "Render resource budget claim release command.claimId") };
}

export function normalizeResourceBudgetSnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-budget",
    fields: ["budgets", "budgetOrder", "claims", "claimOrder", "budgetRevision"],
    label: "Render Resource Budget snapshot",
    validate(state) {
      assertSortedResourceRecords(state, {
        collection: "budgets",
        order: "budgetOrder",
        revision: "budgetRevision",
        normalizeRecord: normalizeResourceBudget,
        idField: "budgetId",
        label: "Render Resource Budget snapshot"
      });
      assertSortedResourceRecords(state, {
        collection: "claims",
        order: "claimOrder",
        revision: "budgetRevision",
        normalizeRecord: normalizeResourceClaim,
        idField: "claimId",
        label: "Render Resource Budget snapshot"
      });
    }
  });
}

export function resourceBudgetContract() {
  return Object.freeze({
    deviceMemoryIsCapacityAuthority: true,
    reservationsAreExternalInputs: true,
    allocationExecutionOwnedExternally: true,
    resourceClaimsArePortable: true,
    exactOnceMutations: true
  });
}
