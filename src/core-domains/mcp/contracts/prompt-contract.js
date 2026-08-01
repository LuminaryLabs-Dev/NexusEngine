import {
  asList,
  clone,
  stableName
} from "./contract-utilities.js";

export function normalizeMcpPrompt(input, providerId) {
  if (typeof input?.render !== "function") throw new TypeError(`MCP prompt ${input?.name ?? "unknown"} requires a render handler.`);
  const name = stableName(input.name, "MCP prompt name");
  const argumentsList = asList(input.arguments).map((argument) => ({
    name: stableName(argument?.name, `MCP prompt ${name} argument`),
    description: argument?.description == null ? null : String(argument.description),
    required: argument?.required === true
  }));
  return Object.freeze({
    providerId,
    name,
    title: input.title == null ? null : String(input.title),
    description: input.description == null ? null : String(input.description),
    arguments: Object.freeze(argumentsList),
    render: input.render
  });
}

export function publicMcpPrompt(prompt) {
  return {
    name: prompt.name,
    title: prompt.title,
    description: prompt.description,
    arguments: clone(prompt.arguments),
    providerId: prompt.providerId
  };
}
