# Changelog

## 0.0.4

- Added explicit Core Domain manifests with parent, requirement, and capability
  contracts.
- Moved Core Composition, MCP, and the complete Object family under
  `src/core-domains/`.
- Added opt-in MCP discovery, planning, and approval-required exactly-once
  composition apply.
- Added persistent plan receipts and pre-mutation Kit fingerprint conflicts.
- Made MCP reset deterministic and enforced structured output schemas.
- Removed legacy Composition and Object package aliases without forwarding
  exports.

See [0.0.4 Domain Cutover](docs/migrations/0.0.4-domain-cutover.md) for exact
import replacements.
