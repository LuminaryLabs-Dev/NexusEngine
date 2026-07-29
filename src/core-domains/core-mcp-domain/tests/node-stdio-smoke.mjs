import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { createEngine } from "../../../engine.js";
import { createCoreMcpDomain } from "../index.js";
import { connectMcpStdio } from "../adapters/node-mcp-sdk-adapter/index.js";

if (process.argv.includes("--server")) {
  const engine = createEngine({ kits: createCoreMcpDomain() });
  engine.n.coreMcp.registerProvider({
    id: "stdio-smoke-provider",
    tools: [{
      name: "stdio-echo",
      inputSchema: {
        type: "object",
        required: ["message"],
        properties: { message: { type: "string" } }
      },
      handler: ({ message }) => ({ message })
    }]
  });
  await connectMcpStdio({
    mcp: engine.n.coreMcp,
    name: "nexusengine-stdio-smoke",
    version: "1.0.0"
  });
} else {
  const client = new Client({ name: "nexusengine-test-client", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(import.meta.url), "--server"],
    stderr: "pipe"
  });
  try {
    await client.connect(transport);
    const listed = await client.listTools();
    assert.deepEqual(listed.tools.map(({ name }) => name), ["stdio-echo"]);
    const result = await client.callTool({
      name: "stdio-echo",
      arguments: { message: "framed" }
    });
    assert.deepEqual(result.structuredContent, { message: "framed" });
  } finally {
    await client.close();
  }
  console.log("core MCP stdio smoke ok");
}
