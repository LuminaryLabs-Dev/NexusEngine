import {
  clone,
  jsonClone,
  normalizeSchema,
  stableName,
  validateSchemaValue
} from "./contract-utilities.js";

const APPROVAL_MODES = new Set(["none", "required"]);

export function normalizeMcpTool(input, providerId) {
  if (typeof input?.handler !== "function") throw new TypeError(`MCP tool ${input?.name ?? "unknown"} requires a handler.`);
  const name = stableName(input.name, "MCP tool name");
  const approval = String(input.approval ?? "none");
  if (!APPROVAL_MODES.has(approval)) throw new TypeError(`MCP tool ${name} has unsupported approval mode ${approval}.`);
  return Object.freeze({
    providerId,
    name,
    title: input.title == null ? null : String(input.title),
    description: String(input.description ?? name),
    inputSchema: normalizeSchema(input.inputSchema, `MCP tool ${name} inputSchema`),
    outputSchema: input.outputSchema == null
      ? null
      : normalizeSchema(input.outputSchema, `MCP tool ${name} outputSchema`, { objectRoot: false }),
    annotations: Object.freeze(jsonClone(input.annotations ?? {}, `MCP tool ${name} annotations`)),
    approval,
    handler: input.handler
  });
}

export function publicMcpTool(tool) {
  return {
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: clone(tool.inputSchema),
    ...(tool.outputSchema ? { outputSchema: clone(tool.outputSchema) } : {}),
    annotations: clone(tool.annotations),
    providerId: tool.providerId,
    approval: tool.approval
  };
}

export function validateMcpToolInput(tool, value) {
  const errors = validateSchemaValue(value, tool.inputSchema);
  if (errors.length) throw new TypeError(`MCP tool ${tool.name} arguments failed validation: ${errors.join(" ")}`);
}
