import { defineMcpProvider } from "../../../mcp/index.js";

const OPEN_OBJECT = Object.freeze({ type: "object", additionalProperties: true });
const STRING_ARRAY = Object.freeze({ type: "array", items: { type: "string" } });

export function createBuildMcpProvider(options = {}) {
  const build = options.build;
  if (!build || typeof build.plan !== "function" || typeof build.apply !== "function") {
    throw new TypeError("Build MCP provider requires a Build Domain service.");
  }

  return defineMcpProvider({
    id: options.id ?? "nexusengine-build",
    version: options.version ?? "0.0.4",
    metadata: {
      buildTimeOnly: true,
      mutationTool: "build_apply",
      projectMutation: false
    },
    tools: [
      {
        name: "build_targets_list",
        description: "List explicit NexusEngine Build target providers and required environments.",
        inputSchema: { type: "object", additionalProperties: false },
        outputSchema: {
          type: "object",
          required: ["targets"],
          properties: { targets: { type: "array", items: OPEN_OBJECT } },
          additionalProperties: false
        },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler() { return { targets: build.listTargets() }; }
      },
      {
        name: "build_inspect",
        description: "Inspect one project through the read-only source, AST, type, effect, dependency, and IR pipeline.",
        inputSchema: {
          type: "object",
          required: ["project"],
          properties: { project: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: OPEN_OBJECT,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ project }) { return build.inspect(project); }
      },
      {
        name: "build_plan",
        description: "Create one deterministic normalized multi-target Build plan without executing it.",
        inputSchema: {
          type: "object",
          required: ["project", "targets"],
          properties: {
            project: { type: "string" },
            targets: STRING_ARRAY,
            profile: { type: "string" },
            options: OPEN_OBJECT
          },
          additionalProperties: false
        },
        outputSchema: OPEN_OBJECT,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler(input) { return build.plan(input); }
      },
      {
        name: "build_apply",
        description: "Apply one previously prepared Build plan after authorization for its exact hash.",
        approval: "required",
        inputSchema: {
          type: "object",
          required: ["planId", "approvePlan"],
          properties: {
            planId: { type: "string" },
            approvePlan: { type: "string" },
            out: { type: "string" }
          },
          additionalProperties: false
        },
        outputSchema: OPEN_OBJECT,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        },
        handler({ planId, approvePlan, out }) {
          return build.apply(planId, { planId: approvePlan, approved: true, actor: "mcp-human-approval" }, {
            ...(out ? { out } : {})
          });
        }
      },
      {
        name: "build_receipt_get",
        description: "Read the persistent aggregate receipt for one Build plan hash.",
        inputSchema: {
          type: "object",
          required: ["planId"],
          properties: { planId: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: {
          type: "object",
          required: ["receipt"],
          properties: { receipt: { anyOf: [OPEN_OBJECT, { type: "null" }] } },
          additionalProperties: false
        },
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        async handler({ planId }) { return { receipt: await build.getReceipt(planId) }; }
      }
    ],
    resources: [
      {
        name: "build-targets",
        uri: "nexus-build://targets",
        title: "NexusEngine Build Targets",
        description: "Explicit target providers. Reading metadata never provisions or executes a toolchain.",
        read: () => ({ targets: build.listTargets() })
      },
      {
        name: "build-state",
        uri: "nexus-build://state",
        title: "NexusEngine Build State",
        description: "Current in-process plans and receipts without source bytes or executable code.",
        read: () => build.snapshot()
      }
    ],
    resourceTemplates: [
      {
        name: "build-receipt",
        uriTemplate: "nexus-build://receipts/{planId}",
        title: "NexusEngine Build Receipt",
        description: "One persistent Build receipt by exact plan identity.",
        read: ({ parameters }) => build.getReceipt(parameters.planId)
      }
    ]
  });
}

export default createBuildMcpProvider;
