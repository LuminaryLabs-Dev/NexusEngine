# Model Context Protocol Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:mcp`
- Status: `stable-candidate`
- Registry SHA-256: `740e0916c8017e4e2a91be79c7b02359c4fa1186d7174a52d6311ec8563cb3af`
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
