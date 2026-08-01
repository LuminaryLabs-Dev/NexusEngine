import assert from "node:assert/strict";
import { createEngine } from "../../../engine.js";
import { createMcpDomain, defineMcpProvider } from "../index.js";

assert.throws(
  () => defineMcpProvider({ id: "missing-handler", tools: [{ name: "broken" }] }),
  /requires a handler/
);
assert.throws(
  () => defineMcpProvider({
    id: "internal-collision",
    tools: [
      { name: "duplicate", handler: () => null },
      { name: "duplicate", handler: () => null }
    ]
  }),
  /duplicate tool/
);

const engine = createEngine({ kits: createMcpDomain() });
engine.n.mcp.registerProvider({
  id: "protected-provider",
  tools: [{
    name: "write-state",
    approval: "required",
    inputSchema: {
      type: "object",
      required: ["value"],
      properties: { value: { type: "number" } },
      additionalProperties: false
    },
    handler: ({ value }) => ({ value })
  }]
});

await assert.rejects(
  engine.n.mcp.callTool("write-state", { value: 1 }),
  /requires explicit authorization/
);
await assert.rejects(
  engine.n.mcp.callTool("write-state", { value: "bad" }, { authorize: () => true }),
  /failed validation/
);
assert.equal(
  (await engine.n.mcp.callTool("write-state", { value: 2 }, { authorize: () => true }))
    .structuredContent.value,
  2
);

const invalidOutputs = [
  ["string", () => "invalid"],
  ["content-only", () => ({ content: [{ type: "text", text: "invalid" }] })],
  ["null", () => null],
  ["malformed", () => ({ value: "invalid" })]
];
for (const [id, handler] of invalidOutputs) {
  engine.n.mcp.registerProvider({
    id: `invalid-output-${id}`,
    tools: [{
      name: `invalid-output-${id}`,
      outputSchema: {
        type: "object",
        required: ["value"],
        properties: { value: { type: "number" } },
        additionalProperties: false
      },
      handler
    }]
  });
  await assert.rejects(
    engine.n.mcp.callTool(`invalid-output-${id}`),
    /omitted structuredContent|failed schema validation/
  );
}

assert.throws(
  () => engine.n.mcp.registerProvider({
    id: "collision-provider",
    tools: [{ name: "write-state", handler: () => "collision" }]
  }),
  /tool collision/
);
assert.throws(
  () => engine.n.mcp.registerProvider({
    id: "protected-provider",
    tools: []
  }),
  /provider collision/
);
console.log("core MCP contract negative checks ok");
