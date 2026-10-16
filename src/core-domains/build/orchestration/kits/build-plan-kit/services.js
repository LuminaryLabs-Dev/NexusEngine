import {
  BUILD_PLAN_SCHEMA,
  contentIntegrity,
  stableJson,
  stableValue
} from "../../../contracts.js";

export function createBuildPlanService() {
  function freeze(value) {
    if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}
    return value;
  }
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
    return freeze({
      id: contentIntegrity(stableJson(payload)),
      ...payload
    });
  }

  return Object.freeze({ create });
}

export default createBuildPlanService;
