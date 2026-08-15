import { contentIntegrity, stableJson } from "../../../contracts.js";

export function createSourceMapService() {
  function create(kitIr, executionIr) {
    const mappings = executionIr.operations.map((operation) => {
      const source = kitIr.modules.find((module) => module.path === operation.modulePath);
      return Object.freeze({
        operationId: operation.id,
        sourcePath: source.path,
        sourceAstHash: source.astHash,
        statementCount: source.statementCount
      });
    });
    const payload = { version: 1, sourceKitIrHash: kitIr.contentHash, mappings };
    return Object.freeze({ ...payload, contentHash: contentIntegrity(stableJson(payload)) });
  }

  return Object.freeze({ create });
}

export default createSourceMapService;
