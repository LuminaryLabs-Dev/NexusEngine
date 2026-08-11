import { createDomainKit } from "../../../../../domain-kit.js";
import { getPhysicsCommandSchema, inspectPhysicsCommand, normalizePhysicsCommand, validatePhysicsCommand } from "./contracts.js";

export {
  PHYSICS_COMMAND_SCHEMA,
  getPhysicsCommandSchema,
  inspectPhysicsCommand,
  normalizePhysicsCommand,
  validatePhysicsCommand
} from "./contracts.js";

export function createPhysicsCommandSchemaKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-command-schema-kit",
    id: config.id ?? "physics-command-schema-kit",
    domain: "physics-command-schema",
    domainPath: "n:physics:contracts",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsCommandSchema",
    requires: ["n:physics"],
    provides: ["physics:command-schema"],
    purpose: "Define deterministic, exact-once Physics command envelopes.",
    owns: ["physics command envelope", "operation identity", "command validation"],
    doesNotOwn: ["command execution", "solver mutation", "provider dispatch"],
    initialState: { schemaRevision: 1 },
    services: ["command-schema"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getSchema: getPhysicsCommandSchema,
        inspectCommand: inspectPhysicsCommand,
        validateCommand: validatePhysicsCommand,
        normalizeCommand: normalizePhysicsCommand
      };
    },
    metadata: { exactOnce: true, jsonPortable: true }
  });
}

export default createPhysicsCommandSchemaKit;
