# Camel Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:camel`
- Status: `experimental`
- Registry SHA-256: `86284ea5467d882727b07751d5742c12275b44da1f867f90f5f3ccae0d56f2ad`
- Public entry: `nexusengine/domains/camel`

## Responsibility

Own bundled Camel execution and native binding to the installed public Nexus API graph.

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
