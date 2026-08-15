import { createDomainKit } from "../../../../domain-kit.js";
import {
  normalizeResourceBudget,
  normalizeResourceBudgetDefinitionCommand,
  normalizeResourceBudgetRemovalCommand,
  normalizeResourceBudgetSnapshot,
  normalizeResourceClaim,
  normalizeResourceClaimCommand,
  normalizeResourceClaimReleaseCommand,
  resourceBudgetContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render resource budget requires public capability ${name}.`);
  return api;
}

export function createResourceBudgetKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "resource-budget-kit",
    id: config.id ?? "resource-budget-kit",
    domain: "render-resource-budget",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceBudgets",
    requires: ["n:render:resource", "render:resource-identity", "render:device-memory"],
    provides: ["render:resource-budget"],
    purpose: "Map exact Render resource identities to existing Device Memory reservations without duplicating capacity authority.",
    owns: ["resource budget policies", "resource-to-reservation claims", "portable claim reports"],
    doesNotOwn: ["device capacity", "device reservations", "GPU allocation", "eviction execution"],
    initialState: { budgets: {}, budgetOrder: [], claims: {}, claimOrder: [], budgetRevision: 0 },
    createApi({ baseApi, engine }) {
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      const memory = () => requiredApi(engine, "renderDeviceMemory");
      function getBudget(budgetId) {
        return baseApi.getState().budgets[String(budgetId)] ?? null;
      }
      function getClaim(claimId) {
        return baseApi.getState().claims[String(claimId)] ?? null;
      }
      function validateBudget(budget) {
        const deviceBudget = memory().getBudget(budget.deviceBudgetId);
        if (!deviceBudget) throw new TypeError(`Render resource budget ${budget.budgetId} targets unknown Device Memory budget ${budget.deviceBudgetId}.`);
        if (budget.maxResourceBytes > deviceBudget.capacityBytes) {
          throw new TypeError(`Render resource budget ${budget.budgetId} maxResourceBytes exceeds Device Memory capacity.`);
        }
        return budget;
      }
      function validateClaim(claim, state) {
        const budget = state.budgets[claim.budgetId];
        if (!budget) throw new TypeError(`Render resource claim ${claim.claimId} targets unknown budget ${claim.budgetId}.`);
        const identity = identities().get(claim.identityId);
        if (!identity) throw new TypeError(`Render resource claim ${claim.claimId} targets unknown identity ${claim.identityId}.`);
        if (budget.allowedKinds.length && !budget.allowedKinds.includes(identity.resource.kind)) {
          throw new TypeError(`Render resource kind ${identity.resource.kind} is not allowed by budget ${budget.budgetId}.`);
        }
        if (claim.sizeBytes > budget.maxResourceBytes) {
          throw new TypeError(`Render resource claim ${claim.claimId} exceeds maxResourceBytes for budget ${budget.budgetId}.`);
        }
        const reservation = memory().getReservation(claim.reservationId);
        if (!reservation) throw new TypeError(`Render resource claim ${claim.claimId} targets unknown Device Memory reservation ${claim.reservationId}.`);
        if (reservation.budgetId !== budget.deviceBudgetId || reservation.sizeBytes !== claim.sizeBytes) {
          throw new TypeError(`Render resource claim ${claim.claimId} does not exactly match Device Memory reservation ${claim.reservationId}.`);
        }
        const reused = Object.values(state.claims).find((entry) => entry.claimId !== claim.claimId && entry.reservationId === claim.reservationId);
        if (reused) throw new TypeError(`Device Memory reservation ${claim.reservationId} is already claimed by ${reused.claimId}.`);
        return claim;
      }
      function validateState(state) {
        Object.values(state.budgets).forEach(validateBudget);
        Object.values(state.claims).forEach((claim) => validateClaim(claim, state));
        return state;
      }
      return {
        ...baseApi,
        getContract: resourceBudgetContract,
        normalizeBudget: normalizeResourceBudget,
        normalizeClaim: normalizeResourceClaim,
        defineBudget(command = {}) {
          const request = normalizeResourceBudgetDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            validateBudget(request.budget);
            const existing = state.budgets[request.budget.budgetId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.budget)) {
              throw new TypeError(`Render resource budget ${request.budget.budgetId} already exists with different content.`);
            }
            const created = !existing;
            const budgets = created ? { ...state.budgets, [request.budget.budgetId]: request.budget } : state.budgets;
            const budgetRevision = created ? state.budgetRevision + 1 : state.budgetRevision;
            return {
              patch: { budgets, budgetOrder: Object.keys(budgets).sort(), budgetRevision },
              result: { budget: request.budget, created, budgetRevision }
            };
          });
        },
        removeBudget(command = {}) {
          const request = normalizeResourceBudgetRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (!state.budgets[request.budgetId]) throw new TypeError(`Unknown Render resource budget ${request.budgetId}.`);
            if (Object.values(state.claims).some((claim) => claim.budgetId === request.budgetId)) {
              throw new TypeError(`Render resource budget ${request.budgetId} still has claims.`);
            }
            const budgets = { ...state.budgets };
            delete budgets[request.budgetId];
            return {
              patch: { budgets, budgetOrder: Object.keys(budgets).sort(), budgetRevision: state.budgetRevision + 1 },
              result: { budgetId: request.budgetId, removed: true, budgetRevision: state.budgetRevision + 1 }
            };
          });
        },
        claim(command = {}) {
          const request = normalizeResourceClaimCommand(command);
          return baseApi.applyCommand(request, (state) => {
            validateClaim(request.claim, state);
            const existing = state.claims[request.claim.claimId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.claim)) {
              throw new TypeError(`Render resource claim ${request.claim.claimId} already exists with different content.`);
            }
            const created = !existing;
            const claims = created ? { ...state.claims, [request.claim.claimId]: request.claim } : state.claims;
            const budgetRevision = created ? state.budgetRevision + 1 : state.budgetRevision;
            return {
              patch: { claims, claimOrder: Object.keys(claims).sort(), budgetRevision },
              result: { claim: request.claim, created, budgetRevision }
            };
          });
        },
        releaseClaim(command = {}) {
          const request = normalizeResourceClaimReleaseCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const claim = state.claims[request.claimId];
            if (!claim) throw new TypeError(`Unknown Render resource claim ${request.claimId}.`);
            const claims = { ...state.claims };
            delete claims[request.claimId];
            return {
              patch: { claims, claimOrder: Object.keys(claims).sort(), budgetRevision: state.budgetRevision + 1 },
              result: { claimId: request.claimId, reservationId: claim.reservationId, released: true, budgetRevision: state.budgetRevision + 1 }
            };
          });
        },
        getBudget,
        listBudgets() {
          const state = baseApi.getState();
          return state.budgetOrder.map((budgetId) => state.budgets[budgetId]);
        },
        getClaim,
        listClaims(budgetId = null) {
          const state = baseApi.getState();
          return state.claimOrder
            .map((claimId) => state.claims[claimId])
            .filter((claim) => budgetId === null || claim.budgetId === budgetId);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeResourceBudgetSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createResourceBudgetKit;
