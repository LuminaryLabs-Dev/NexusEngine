import assert from "node:assert/strict";
import { createEngine } from "../../../engine.js";
import {
  createCoreMcpDomain,
  defineMcpProvider,
  defineMcpProviderTemplate
} from "../index.js";

const bareEngine = createEngine();
assert.equal(bareEngine.n.coreMcp, undefined, "MCP must remain absent until installed");

const provider = defineMcpProvider({
  id: "smoke-provider",
  version: "1.0.0",
  tools: [{
    name: "echo",
    inputSchema: {
      type: "object",
      required: ["message"],
      properties: { message: { type: "string" } },
      additionalProperties: false
    },
    outputSchema: {
      type: "object",
      required: ["message"],
      properties: { message: { type: "string" } }
    },
    handler: ({ message }) => ({ message })
  }],
  resources: [{
    uri: "nexus://status",
    name: "status",
    read: () => ({ ready: true })
  }],
  resourceTemplates: [{
    uriTemplate: "nexus://objects/{objectId}",
    name: "object",
    read: ({ parameters }) => ({ objectId: parameters.objectId })
  }],
  prompts: [{
    name: "inspect-object",
    arguments: [{ name: "objectId", required: true }],
    render: ({ objectId }) => `Inspect ${objectId}`
  }]
});
const configuredEngine = createEngine({ kits: createCoreMcpDomain({ providers: [provider] }) });
const firstReset = configuredEngine.n.coreMcp.reset();
const secondReset = configuredEngine.n.coreMcp.reset();
assert.deepEqual(secondReset, firstReset, "MCP reset must reproduce the configured baseline");
assert.equal(firstReset.revision, 0, "configured providers are baseline state, not mutations");

const engine = createEngine({ kits: createCoreMcpDomain() });

engine.n.coreMcp.registerProvider(provider);
assert.deepEqual(engine.n.coreMcp.listProviders().map(({ id }) => id), ["smoke-provider"]);
assert.deepEqual((await engine.n.coreMcp.callTool("echo", { message: "ready" })).structuredContent, {
  message: "ready"
});
assert.deepEqual(
  JSON.parse((await engine.n.coreMcp.readResource("nexus://status")).contents[0].text),
  { ready: true }
);
assert.deepEqual(
  JSON.parse((await engine.n.coreMcp.readResource("nexus://objects/bridge-1")).contents[0].text),
  { objectId: "bridge-1" }
);
assert.equal(
  (await engine.n.coreMcp.getPrompt("inspect-object", { objectId: "bridge-1" })).messages[0].content.text,
  "Inspect bridge-1"
);

const template = defineMcpProviderTemplate({
  id: "bound-provider",
  instantiate: ({ id }) => ({
    id,
    resources: [{ uri: `nexus://${id}`, read: () => id }]
  })
});
engine.n.coreMcp.registerTemplate(template, { id: "template-instance" });
assert.ok(engine.n.coreMcp.getProvider("template-instance"));
assert.equal(engine.n.coreMcp.getSnapshot().providers.length, 2);

engine.n.coreMcp.reset();
assert.equal(engine.n.coreMcp.listProviders().length, 0);
console.log("core MCP registry smoke ok");
