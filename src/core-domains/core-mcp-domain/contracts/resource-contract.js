import {
  clone,
  stableName,
  stableUri
} from "./contract-utilities.js";

function resourceName(input, value, label) {
  return stableName(
    input.name ?? value.replace(/\{[^}]+\}|[^A-Za-z0-9._-]+/g, "-").replace(/^-|-$/g, ""),
    label
  );
}

export function normalizeMcpResource(input, providerId) {
  if (typeof input?.read !== "function") throw new TypeError(`MCP resource ${input?.uri ?? "unknown"} requires a read handler.`);
  const uri = stableUri(input.uri, "MCP resource");
  return Object.freeze({
    providerId,
    uri,
    name: resourceName(input, uri, "MCP resource name"),
    title: input.title == null ? null : String(input.title),
    description: input.description == null ? null : String(input.description),
    mimeType: String(input.mimeType ?? "application/json"),
    read: input.read
  });
}

export function normalizeMcpResourceTemplate(input, providerId) {
  if (typeof input?.read !== "function") {
    throw new TypeError(`MCP resource template ${input?.uriTemplate ?? "unknown"} requires a read handler.`);
  }
  const uriTemplate = stableUri(input.uriTemplate, "MCP resource template", { template: true });
  const variables = [...uriTemplate.matchAll(/\{([A-Za-z0-9._-]+)\}/g)].map((match) => match[1]);
  if (!variables.length) throw new TypeError(`MCP resource template ${uriTemplate} requires at least one {variable}.`);
  if (new Set(variables).size !== variables.length) {
    throw new TypeError(`MCP resource template ${uriTemplate} contains duplicate variables.`);
  }
  const pattern = uriTemplate
    .split(/(\{[A-Za-z0-9._-]+\})/g)
    .map((part) => /^\{.+\}$/.test(part) ? "([^/?#]+)" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("");
  return Object.freeze({
    providerId,
    uriTemplate,
    name: resourceName(input, uriTemplate, "MCP resource template name"),
    title: input.title == null ? null : String(input.title),
    description: input.description == null ? null : String(input.description),
    mimeType: String(input.mimeType ?? "application/json"),
    variables: Object.freeze(variables),
    matcher: new RegExp(`^${pattern}$`),
    read: input.read
  });
}

export function matchMcpResourceTemplate(template, uri) {
  const match = template.matcher.exec(uri);
  if (!match) return null;
  return Object.fromEntries(template.variables.map((name, index) => [name, decodeURIComponent(match[index + 1])]));
}

export function publicMcpResource(resource) {
  return {
    uri: resource.uri,
    name: resource.name,
    title: resource.title,
    description: resource.description,
    mimeType: resource.mimeType,
    providerId: resource.providerId
  };
}

export function publicMcpResourceTemplate(template) {
  return {
    uriTemplate: template.uriTemplate,
    name: template.name,
    title: template.title,
    description: template.description,
    mimeType: template.mimeType,
    providerId: template.providerId
  };
}

export function cloneTemplateParameters(value) {
  return clone(value);
}
