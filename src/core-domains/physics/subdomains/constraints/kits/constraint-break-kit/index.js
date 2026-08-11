import { createAtomicConstraintKit } from "../../atomic-constraint-kit.js";
import {
  CONSTRAINT_BREAK_POLICY_SCHEMA,
  constraintBreakContract,
  evaluateConstraintBreak,
  normalizeConstraintBreakPolicy
} from "./contracts.js";

export function createConstraintBreakKit(config = {}) {
  return createAtomicConstraintKit(config, {
    manifestId: "constraint-break-kit",
    domain: "physics-constraint-break",
    apiName: "physicsConstraintBreak",
    provides: ["physics:constraint-break"],
    purpose: "Normalize and evaluate portable constraint break thresholds without owning solver or lifecycle state.",
    owns: ["constraint break policy validation", "pure break-threshold evaluation"],
    doesNotOwn: ["constraint records", "constraint status", "solver impulses", "provider handles", "gameplay break effects"],
    schema: CONSTRAINT_BREAK_POLICY_SCHEMA,
    contract: constraintBreakContract,
    normalize: normalizeConstraintBreakPolicy,
    extendApi() {
      return { evaluate: evaluateConstraintBreak };
    }
  });
}

export default createConstraintBreakKit;
