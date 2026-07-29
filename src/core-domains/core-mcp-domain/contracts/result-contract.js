import {
  jsonClone,
  validateSchemaValue
} from "./contract-utilities.js";

export function normalizeMcpToolResult(value, outputSchema) {
  let result;
  const isEnvelope = Boolean(
    value
    && typeof value === "object"
    && !Array.isArray(value)
    && (
      Array.isArray(value.content)
      || Object.prototype.hasOwnProperty.call(value, "structuredContent")
    )
  );
  if (isEnvelope) {
    result = jsonClone(value, "MCP tool result");
  } else {
    const structuredContent = value == null ? {} : jsonClone(value, "MCP tool result");
    result = {
      content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(structuredContent) }],
      ...(typeof value === "string" ? {} : { structuredContent })
    };
  }
  if (outputSchema) {
    if (
      value == null
      || typeof value === "string"
      || !Object.prototype.hasOwnProperty.call(result, "structuredContent")
    ) {
      throw new TypeError("MCP tool output declared a schema but omitted structuredContent.");
    }
    const errors = validateSchemaValue(result.structuredContent, outputSchema);
    if (errors.length) throw new TypeError(`MCP tool output failed schema validation: ${errors.join(" ")}`);
  }
  return result;
}

export function normalizeMcpResourceResult(resource, uri, value) {
  if (value && typeof value === "object" && Array.isArray(value.contents)) {
    return jsonClone(value, `MCP resource ${uri} result`);
  }
  const text = typeof value === "string" ? value : JSON.stringify(jsonClone(value ?? null));
  return { contents: [{ uri, mimeType: resource.mimeType, text }] };
}

export function normalizeMcpPromptResult(value) {
  if (value && typeof value === "object" && Array.isArray(value.messages)) {
    return jsonClone(value, "MCP prompt result");
  }
  const text = typeof value === "string" ? value : JSON.stringify(jsonClone(value ?? null));
  return { messages: [{ role: "user", content: { type: "text", text } }] };
}
