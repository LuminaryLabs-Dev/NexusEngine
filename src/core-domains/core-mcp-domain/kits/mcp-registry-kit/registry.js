import {
  asList,
  clone,
  jsonClone
} from "../../contracts/contract-utilities.js";
import {
  defineMcpProvider
} from "../../contracts/provider-contract.js";
import { publicMcpPrompt } from "../../contracts/prompt-contract.js";
import {
  matchMcpResourceTemplate,
  publicMcpResource,
  publicMcpResourceTemplate
} from "../../contracts/resource-contract.js";
import {
  normalizeMcpPromptResult,
  normalizeMcpResourceResult,
  normalizeMcpToolResult
} from "../../contracts/result-contract.js";
import {
  publicMcpTool,
  validateMcpToolInput
} from "../../contracts/tool-contract.js";
import {
  createMcpRegistrySnapshot
} from "../../state/registry-snapshot.js";
import { authorizeMcpTool } from "./authorization.js";

export function createMcpRegistry(config = {}, engine = null) {
  const providers = new Map();
  const tools = new Map();
  const resources = new Map();
  const resourceTemplates = new Map();
  const prompts = new Map();
  let revision = 0;

  function removeProviderRecords(providerId) {
    for (const [name, record] of tools) if (record.providerId === providerId) tools.delete(name);
    for (const [uri, record] of resources) if (record.providerId === providerId) resources.delete(uri);
    for (const [uri, record] of resourceTemplates) if (record.providerId === providerId) resourceTemplates.delete(uri);
    for (const [name, record] of prompts) if (record.providerId === providerId) prompts.delete(name);
  }

  function assertAvailable(provider, options = {}) {
    const replacing = options.replace === true ? provider.id : null;
    for (const [map, records, label, key] of [
      [tools, provider.tools, "tool", "name"],
      [resources, provider.resources, "resource", "uri"],
      [resourceTemplates, provider.resourceTemplates, "resource template", "uriTemplate"],
      [prompts, provider.prompts, "prompt", "name"]
    ]) {
      for (const record of records) {
        const existing = map.get(record[key]);
        if (existing && existing.providerId !== replacing) throw new TypeError(`MCP ${label} collision: ${record[key]}.`);
      }
    }
  }

  function publicProvider(provider) {
    if (!provider) return null;
    return {
      id: provider.id,
      version: provider.version,
      tools: provider.tools.map(publicMcpTool),
      resources: provider.resources.map(publicMcpResource),
      resourceTemplates: provider.resourceTemplates.map(publicMcpResourceTemplate),
      prompts: provider.prompts.map(publicMcpPrompt),
      metadata: clone(provider.metadata)
    };
  }

  function registerProvider(input, options = {}, updateRevision = true) {
    const provider = defineMcpProvider(input);
    const existing = providers.get(provider.id);
    if (existing && options.replace !== true) throw new TypeError(`MCP provider collision: ${provider.id}.`);
    assertAvailable(provider, options);
    if (existing) removeProviderRecords(provider.id);
    providers.set(provider.id, provider);
    for (const record of provider.tools) tools.set(record.name, record);
    for (const record of provider.resources) resources.set(record.uri, record);
    for (const record of provider.resourceTemplates) resourceTemplates.set(record.uriTemplate, record);
    for (const record of provider.prompts) prompts.set(record.name, record);
    if (updateRevision) revision += 1;
    return publicProvider(provider);
  }

  function registerTemplate(template, bindings = {}, options = {}, updateRevision = true) {
    if (!template || typeof template.instantiate !== "function") {
      throw new TypeError("MCP provider template requires instantiate(bindings).");
    }
    return registerProvider(template.instantiate(bindings), options, updateRevision);
  }

  function snapshot() {
    return createMcpRegistrySnapshot({
      revision,
      providers: [...providers.values()].sort((a, b) => a.id.localeCompare(b.id)).map(publicProvider),
      tools: [...tools.values()].sort((a, b) => a.name.localeCompare(b.name)).map(publicMcpTool),
      resources: [...resources.values()].sort((a, b) => a.uri.localeCompare(b.uri)).map(publicMcpResource),
      resourceTemplates: [...resourceTemplates.values()]
        .sort((a, b) => a.uriTemplate.localeCompare(b.uriTemplate))
        .map(publicMcpResourceTemplate),
      prompts: [...prompts.values()].sort((a, b) => a.name.localeCompare(b.name)).map(publicMcpPrompt)
    });
  }

  const api = {
    registerProvider,
    registerTemplate(template, bindings = {}, options = {}) {
      return registerTemplate(template, bindings, options);
    },
    removeProvider(id) {
      const providerId = String(id);
      if (!providers.has(providerId)) return false;
      removeProviderRecords(providerId);
      providers.delete(providerId);
      revision += 1;
      return true;
    },
    getProvider(id) { return publicProvider(providers.get(String(id))); },
    listProviders() { return snapshot().providers; },
    listTools() { return snapshot().tools; },
    listResources() { return snapshot().resources; },
    listResourceTemplates() { return snapshot().resourceTemplates; },
    listPrompts() { return snapshot().prompts; },
    async callTool(name, args = {}, context = {}) {
      const tool = tools.get(String(name));
      if (!tool) throw new RangeError(`Unknown MCP tool: ${name}.`);
      const input = args == null ? {} : jsonClone(args, `MCP tool ${tool.name} arguments`);
      validateMcpToolInput(tool, input);
      await authorizeMcpTool(publicMcpTool(tool), clone(input), context, config.authorize);
      const value = await tool.handler(clone(input), {
        engine,
        providerId: tool.providerId,
        signal: context.signal ?? null,
        metadata: context.metadata ?? null
      });
      return normalizeMcpToolResult(value, tool.outputSchema);
    },
    async readResource(uri, context = {}) {
      const requestedUri = String(uri);
      let resource = resources.get(requestedUri);
      let parameters = {};
      if (!resource) {
        for (const candidate of resourceTemplates.values()) {
          const match = matchMcpResourceTemplate(candidate, requestedUri);
          if (match) {
            resource = candidate;
            parameters = match;
            break;
          }
        }
      }
      if (!resource) throw new RangeError(`Unknown MCP resource: ${uri}.`);
      const value = await resource.read({
        engine,
        uri: requestedUri,
        parameters: clone(parameters),
        providerId: resource.providerId,
        signal: context.signal ?? null,
        metadata: context.metadata ?? null
      });
      return normalizeMcpResourceResult(resource, requestedUri, value);
    },
    async getPrompt(name, args = {}, context = {}) {
      const prompt = prompts.get(String(name));
      if (!prompt) throw new RangeError(`Unknown MCP prompt: ${name}.`);
      const input = args == null ? {} : jsonClone(args, `MCP prompt ${prompt.name} arguments`);
      for (const argument of prompt.arguments) {
        if (argument.required && !Object.prototype.hasOwnProperty.call(input, argument.name)) {
          throw new TypeError(`MCP prompt ${prompt.name} requires argument ${argument.name}.`);
        }
      }
      const value = await prompt.render(clone(input), {
        engine,
        providerId: prompt.providerId,
        signal: context.signal ?? null,
        metadata: context.metadata ?? null
      });
      return normalizeMcpPromptResult(value);
    },
    getState: snapshot,
    getSnapshot: snapshot,
    snapshot,
    reset() {
      providers.clear();
      tools.clear();
      resources.clear();
      resourceTemplates.clear();
      prompts.clear();
      revision = 0;
      for (const provider of asList(config.providers)) registerProvider(provider, {}, false);
      for (const entry of asList(config.templates)) {
        if (entry?.template) registerTemplate(entry.template, entry.bindings ?? {}, {}, false);
        else registerTemplate(entry, {}, {}, false);
      }
      return snapshot();
    }
  };

  api.reset();
  return Object.freeze(api);
}
