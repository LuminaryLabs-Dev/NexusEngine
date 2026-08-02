import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createEngine } from "../../../engine.js";
import { createMcpDomain } from "../../mcp/index.js";
import { createBuildDomain, createBuildMcpProvider } from "../index.js";

const fixture = path.resolve("src/core-domains/build/tests/fixtures/minimal-project");
const stateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-mcp-state-"));
const outputRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-mcp-output-"));
const build = createBuildDomain({ stateRoot });
const provider = createBuildMcpProvider({ build });
const engine = createEngine({ kits: createMcpDomain({ providers: [provider] }) });

assert.deepEqual(engine.n.mcp.listTools().filter((tool) => tool.name.startsWith("build_")).map((tool) => tool.name), [
  "build_apply",
  "build_inspect",
  "build_plan",
  "build_receipt_get",
  "build_targets_list"
]);
const targets = await engine.n.mcp.callTool("build_targets_list", {});
assert.equal(targets.structuredContent.targets.length, 4);
const planned = await engine.n.mcp.callTool("build_plan", {
  project: fixture,
  targets: ["web-static"]
});
const planId = planned.structuredContent.id;

await assert.rejects(
  engine.n.mcp.callTool("build_apply", { planId, approvePlan: planId, out: outputRoot }),
  /requires explicit authorization/
);
await assert.rejects(
  engine.n.mcp.callTool("build_apply", { planId, approvePlan: "sha256:" + "0".repeat(64), out: outputRoot }, { authorize: async () => true }),
  /changed after review/
);
const applied = await engine.n.mcp.callTool(
  "build_apply",
  { planId, approvePlan: planId, out: outputRoot },
  { authorize: async ({ tool, arguments: args }) => tool.name === "build_apply" && args.planId === planId }
);
assert.equal(applied.structuredContent.status, "succeeded");
const receipt = await engine.n.mcp.callTool("build_receipt_get", { planId });
assert.equal(receipt.structuredContent.receipt.planId, planId);

console.log("Build MCP inspect, plan, exact approval, apply, and receipt tools ok");
