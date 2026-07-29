import { defineMcpProvider } from "../../../core-mcp-domain/index.js";
import { createCompositionApplyController } from "../../services/composition-apply-controller.js";

const OBJECT_OUTPUT = Object.freeze({
  type: "object"
});
const STRING_ARRAY = Object.freeze({
  type: "array",
  items: { type: "string" }
});
const COMPOSITION_REQUEST_PROPERTIES = Object.freeze({
  kits: STRING_ARRAY,
  domains: STRING_ARRAY,
  bundles: STRING_ARRAY,
  configs: { type: "object" },
  allowedStatuses: STRING_ARRAY,
  tree: { type: "object" },
  scopeNodeId: { type: "string" }
});

function compositionRequest(input = {}) {
  return Object.fromEntries(
    Object.keys(COMPOSITION_REQUEST_PROPERTIES)
      .filter((key) => Object.prototype.hasOwnProperty.call(input, key))
      .map((key) => [key, input[key]])
  );
}

export function createCompositionMcpProvider(options = {}) {
  const composition = options.composition;
  if (!composition?.registry || !composition?.planning || !composition?.capabilities) {
    throw new TypeError("Composition MCP provider requires the Core Composition API.");
  }
  const controller = options.controller ?? createCompositionApplyController({
    composition,
    host: options.host,
    initialSnapshot: options.initialSnapshot,
    persist: options.persist
  });

  return defineMcpProvider({
    id: options.id ?? "nexusengine-composition",
    version: options.version ?? "0.0.4",
    metadata: {
      applicationOwned: true,
      optIn: true,
      mutationTool: "composition_apply"
    },
    tools: [
      {
        name: "domains_list",
        description: "List the active deterministic Core Composition Domain catalog.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: OBJECT_OUTPUT,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ query = "" }) {
          const text = String(query).trim().toLowerCase();
          const domains = composition.registry.listDomains().filter((domain) => !text || [
            domain.id,
            domain.domainPath,
            domain.label,
            ...domain.ownedMeaning
          ].some((value) => String(value).toLowerCase().includes(text)));
          return { domains };
        }
      },
      {
        name: "domain_get",
        description: "Read one Domain record by stable registry id.",
        inputSchema: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: OBJECT_OUTPUT,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ id }) {
          return { domain: composition.registry.getDomain(id) };
        }
      },
      {
        name: "kits_list",
        description: "List active Kit records, optionally filtered by Domain or text.",
        inputSchema: {
          type: "object",
          properties: {
            domainId: { type: "string" },
            domainPath: { type: "string" },
            query: { type: "string" }
          },
          additionalProperties: false
        },
        outputSchema: OBJECT_OUTPUT,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ domainId, domainPath, query = "" }) {
          const domain = domainId ? composition.registry.getDomain(domainId) : null;
          const selectedPath = domainPath ?? domain?.domainPath ?? null;
          const text = String(query).trim().toLowerCase();
          const kits = composition.registry.listKits().filter((kit) => {
            const inDomain = !selectedPath
              || kit.domainPath === selectedPath
              || kit.domainPath.startsWith(`${selectedPath}:`);
            const matches = !text || [
              kit.id,
              kit.domain,
              kit.domainPath,
              ...kit.requires,
              ...kit.provides
            ].some((value) => String(value).toLowerCase().includes(text));
            return inDomain && matches;
          });
          return { kits };
        }
      },
      {
        name: "kit_explain",
        description: "Explain one Kit's providers, requirements, dependents, and missing capabilities.",
        inputSchema: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: OBJECT_OUTPUT,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ id }) {
          return { explanation: composition.capabilities.explainKit(id) };
        }
      },
      {
        name: "composition_plan",
        description: "Resolve and preflight a deterministic composition without mutating the host.",
        inputSchema: {
          type: "object",
          properties: COMPOSITION_REQUEST_PROPERTIES,
          additionalProperties: false
        },
        outputSchema: OBJECT_OUTPUT,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler(input, context) {
          return controller.prepare(compositionRequest(input), context);
        }
      },
      {
        name: "composition_apply",
        description: "Apply the exact reviewed composition plan through the trusted application host.",
        approval: "required",
        inputSchema: {
          type: "object",
          required: ["expectedPlanId"],
          properties: {
            expectedPlanId: { type: "string" },
            ...COMPOSITION_REQUEST_PROPERTIES
          },
          additionalProperties: false
        },
        outputSchema: OBJECT_OUTPUT,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        },
        handler(input, context) {
          return controller.apply(compositionRequest(input), {
            expectedPlanId: input.expectedPlanId,
            context
          });
        }
      }
    ],
    resources: [{
      name: "composition-apply-receipts",
      uri: "nexus-composition://receipts",
      title: "Composition Apply Receipts",
      description: "Persistent exactly-once composition receipts owned by this application host.",
      read: () => controller.getSnapshot()
    }]
  });
}

export default createCompositionMcpProvider;
