# Camel Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:camel`
- Status: `experimental`
- Registry SHA-256: `0455ad956cb59e81793210c166509c9081aa65d470e6e03fe5f21a7ec246d120`
- Public entry: `nexusengine/domains/camel`

## Responsibility

Own bundled Camel execution and browser/native binding to the installed public Nexus API graph.

## Owns

- Camel execution receipts
- Camel invocations
- Camel runtime binding
- Camel source identity

## Does Not Own

- composition dependency planning
- game rules
- model weights
- other domain state

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `camel-runtime-kit` | `nexusengine/domains/camel/runtime` | Execute a pinned bundled Camel interpreter against shared Nexus instances. |

## Lifecycle

- Duplicate install: Return the installed Camel API without duplicate state or systems.
- Snapshot: Serialize Camel state and descriptors.
- Reset: Restore the configured Camel baseline.
