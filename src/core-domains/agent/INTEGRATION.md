# Agent integration ownership

The existing agent-cycle-kit remains the public owner of identity, observations, proposals and execution evidence. Context remains small and bounded. `engine.n.agent.workflows` owns portable workflow definitions, task graphs and answer sessions; it does not execute tools or choose a model. `getInteractionSnapshot`/`loadInteractionSnapshot` capture this state explicitly. Task completion is evidence bookkeeping, not automatic visual acceptance.

Execution ledgers support optional count/byte budgets and archive/retrieval callbacks. The default ledger preserves its existing unbounded contract; hosts opting into bounded windows must retain durable evidence. The optional Engine production host does so and stores compact receipt references in Agent descriptors. `eventState:"delta"` opts into state-free event payloads; default domain publication remains compatible.

Runtime owns headless operation commit and scheduling; Composition owns dependencies; Authoring owns geometry and source; MCP owns protocol; host providers own filesystem and browser execution. Do not introduce a competing harness domain. Tool discovery never grants execution permission; hosts reauthorize execution.

Generic agents can import `nexusengine/kits/agent/production`, bind a workspace and call `production.discover`. Codex-specific prompts and presentation remain in Nexus Engine Kit. The optional host is not imported by portable Core defaults.
