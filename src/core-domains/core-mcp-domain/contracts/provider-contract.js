import {
  asList,
  jsonClone,
  stableName
} from "./contract-utilities.js";
import { normalizeMcpPrompt } from "./prompt-contract.js";
import {
  normalizeMcpResource,
  normalizeMcpResourceTemplate
} from "./resource-contract.js";
import { normalizeMcpTool } from "./tool-contract.js";

export function defineMcpProvider(input = {}) {
  const id = stableName(input.id, "MCP provider id");
  const tools = asList(input.tools).map((tool) => normalizeMcpTool(tool, id));
  const resources = asList(input.resources).map((resource) => normalizeMcpResource(resource, id));
  const resourceTemplates = asList(input.resourceTemplates)
    .map((template) => normalizeMcpResourceTemplate(template, id));
  const prompts = asList(input.prompts).map((prompt) => normalizeMcpPrompt(prompt, id));
  for (const [records, key, label] of [
    [tools, "name", "tool"],
    [resources, "uri", "resource"],
    [resourceTemplates, "uriTemplate", "resource template"],
    [prompts, "name", "prompt"]
  ]) {
    const values = records.map((record) => record[key]);
    if (new Set(values).size !== values.length) {
      throw new TypeError(`MCP provider ${id} contains a duplicate ${label}.`);
    }
  }
  return Object.freeze({
    id,
    version: String(input.version ?? "0.0.0"),
    tools: Object.freeze(tools),
    resources: Object.freeze(resources),
    resourceTemplates: Object.freeze(resourceTemplates),
    prompts: Object.freeze(prompts),
    metadata: Object.freeze(jsonClone(input.metadata ?? {}, `MCP provider ${id} metadata`))
  });
}

export function defineMcpProviderTemplate(input = {}) {
  const id = stableName(input.id, "MCP provider template id");
  if (typeof input.instantiate !== "function") throw new TypeError(`MCP provider template ${id} requires instantiate(bindings).`);
  return Object.freeze({
    id,
    version: String(input.version ?? "0.0.0"),
    instantiate(bindings = {}) {
      return defineMcpProvider(input.instantiate(bindings));
    }
  });
}
