# Model Context Protocol Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:mcp`
- Status: `stable-candidate`
- Registry SHA-256: `82eeb9fc6ff59d3d3a855e58ac6a726b25eaeec33465c1fbad6aca9b025c3aa2`
- Public entry: `nexusengine/domains/mcp`

## Responsibility

Own opt-in transport-neutral MCP contracts, provider registration, authorization, and protocol dispatch.

## Owns

- MCP provider contracts
- MCP registry state
- authorization gates
- prompt dispatch
- resource dispatch
- tool dispatch

## Does Not Own

- agent planning
- application tools
- automatic protocol exposure
- transport process lifecycle

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `mcp-registry-kit` | `nexusengine/domains/mcp/registry` | Register and dispatch schema-valid MCP providers through an explicit authorization boundary. |

## Lifecycle

- Duplicate install: Return the existing registry API when the manifest identity matches.
- Snapshot: Serialize provider metadata and authorization state without executable handlers.
- Reset: Restore the configured provider registry and authorization state.
