import {
  BUILD_PLAN_SCHEMA,
  contentIntegrity,
  stableJson,
  stableValue
} from "../../../../contracts.js";

export function createBuildPlanService() {
  function create(input = {}) {
    const payload = stableValue({
      schema: BUILD_PLAN_SCHEMA,
      request: input.request,
      projectFingerprint: input.projectFingerprint,
      registryHash: input.registryHash,
      kitIrHash: input.kitIrHash,
      executionIrHash: input.executionIrHash,
      classificationHash: input.classificationHash,
      sourceMapHash: input.sourceMapHash,
      sourceRecords: input.sourceRecords,
      sharedStages: input.sharedStages,
      targets: input.targets
    });
    return Object.freeze({
      id: contentIntegrity(stableJson(payload)),
      ...payload
    });
  }

  return Object.freeze({ create });
}

export default createBuildPlanService;
