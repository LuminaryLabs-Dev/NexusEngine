export async function authorizeMcpTool(tool, input, context, fallback) {
  if (tool.approval !== "required") return true;
  const authorize = context.authorize ?? fallback;
  const approved = typeof authorize === "function"
    ? await authorize({ tool, arguments: input, context })
    : false;
  if (approved !== true) throw new Error(`MCP tool ${tool.name} requires explicit authorization.`);
  return true;
}
