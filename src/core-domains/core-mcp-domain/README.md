# Core MCP Domain

`n:core-mcp` owns explicit, transport-neutral MCP provider registration and dispatch.

The domain is opt-in. Installing NexusEngine does not expose MCP tools, resources, or prompts. A host must install `createCoreMcpDomain()`, register an application-owned provider, and connect an explicit transport adapter.

The registry owns protocol contracts, collisions, authorization gates, metadata snapshots, and reset. Applications own the capabilities they expose. The Node adapter owns only official SDK translation and stdio lifecycle.
