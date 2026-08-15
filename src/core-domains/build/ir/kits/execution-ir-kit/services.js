import {
  EXECUTION_IR_SCHEMA,
  contentIntegrity,
  stableJson
} from "../../../contracts.js";

function executionOrder(modules) {
  const byPath = new Map(modules.map((module) => [module.path, module]));
  const dependencies = new Map(modules.map((module) => [
    module.path,
    new Set(module.imports.filter((entry) => !entry.external && entry.resolved && byPath.has(entry.resolved)).map((entry) => entry.resolved))
  ]));
  const order = [];
  const remaining = new Set(byPath.keys());
  while (remaining.size) {
    const ready = [...remaining].filter((modulePath) => [...dependencies.get(modulePath)].every((dependency) => !remaining.has(dependency))).sort();
    if (!ready.length) break;
    for (const modulePath of ready) {
      remaining.delete(modulePath);
      order.push(modulePath);
    }
  }
  return {
    order,
    cycles: remaining.size ? [Object.freeze([...remaining].sort())] : []
  };
}

export function createExecutionIrService() {
  function create(kitIr) {
    const sorted = executionOrder(kitIr.modules);
    const operations = sorted.order.map((modulePath, sequence) => {
      const module = kitIr.modules.find((entry) => entry.path === modulePath);
      return Object.freeze({
        id: `evaluate:${modulePath}`,
        sequence,
        kind: "evaluate-module",
        modulePath,
        inputs: Object.freeze(module.imports.filter((entry) => !entry.external && entry.resolved).map((entry) => entry.resolved).sort()),
        capabilities: module.effects,
        nativeFunctions: module.nativeFunctions
      });
    });
    const payload = {
      schema: EXECUTION_IR_SCHEMA,
      sourceKitIrHash: kitIr.contentHash,
      operations,
      cycles: sorted.cycles
    };
    return Object.freeze({ ...payload, contentHash: contentIntegrity(stableJson(payload)) });
  }

  return Object.freeze({ create });
}

export default createExecutionIrService;
