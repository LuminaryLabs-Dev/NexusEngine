# Agent integration ownership

The existing `agent-cycle-kit` remains the stable public entry point. It owns agent identity, observations, proposed actions and execution evidence. It does **not** execute tools or select an LLM.

Optional `context` stores small, per-agent JSON values and source references with bounded sizes. The full project, meshes, logs and runtime state remain authoritative in their existing domains. `context.snapshot()` and `context.restore()` support explicit host persistence; persistence is not automatic.

Optional `toolAccess` is enabled by a host-supplied `listTools` callback and optional `authorizeTool`. It discovers tool metadata and checks access before a host chooses to invoke the actual domain API. It never runs a tool or bypasses domain permissions. The host must still reauthorize at actual execution.

Other ownership: `n:mcp` provides protocol connectivity; Runtime and Composition own execution and composition graphs; Authoring owns asset source, validation and publishing. Do not introduce `n:harness` unless a distinct non-agent orchestration requirement is demonstrated.

## Programmatic entry

```js
import { createAgentContextStore, createAgentToolAccess } from "nexusengine/domains/agent/cycle";
const context = createAgentContextStore();
context.put("bird-agent", "current-task", { project: "birds", phase: "rigging" });
const access = createAgentToolAccess({
  listTools: () => engine.n.authoringProject.tools(),
  authorize: ({ agentId, tool, action }) => policyAllows(agentId, tool, action)
});
const permitted = access.list("bird-agent", { domainPath: "n:authoring:mesh" });
```

Model planning, task-graph scheduling, persistence adapters, MCP CLI exposure and full integrated Authoring production tests are **not** implemented by these helpers.
