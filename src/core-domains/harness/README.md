# Harness Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:harness`
- Status: `stable-candidate`
- Registry SHA-256: `c31d7b0cb162415ad77c669691d5683eed98cb582aa599bf6cb1e7ba505ad185`
- Public entry: `nexusengine/domains/harness`

## Responsibility

Own reusable harness capability composition contracts.

## Owns

- harness capability composition

## Does Not Own

- agent continuation
- inference transport
- tool execution

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:harness:routing` | Resolve model decisions to registered capabilities without executing them. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `decision-routing-kit` | `nexusengine/domains/harness/routing` | Validate and resolve capability route requests. |

## Lifecycle

- Duplicate install: Return the installed Harness API without duplicate state or systems.
- Snapshot: Serialize Harness state and descriptors.
- Reset: Restore the configured Harness baseline.
