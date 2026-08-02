import { requirePlainObject, requireText } from "../../../../contracts.js";

export function createBuildApprovalService() {
  function requireApproval(planId, input) {
    const approval = typeof input === "string"
      ? { planId: input, approved: true }
      : requirePlainObject(input, "Build approval");
    const approvedPlanId = requireText(approval.planId ?? approval.approvePlan, "Approved Build plan id");
    if (approval.approved === false) throw new Error(`Build plan ${planId} was not approved.`);
    if (approvedPlanId !== planId) {
      throw new TypeError(`Build plan changed after review: expected ${approvedPlanId}, received ${planId}.`);
    }
    return Object.freeze({
      schema: "nexusengine.build-approval/1",
      planId,
      approved: true,
      actor: approval.actor == null ? "human" : String(approval.actor)
    });
  }

  return Object.freeze({ requireApproval });
}

export default createBuildApprovalService;
