# Agent Loop — portable semantic contracts

Paths: n:agent:loop, n:agent:loop:step, n:agent:loop:control, n:agent:loop:coordination.

Step owns immutable outcome records; Control owns single-loop continuation; Coordination owns parent-child delegation and joins. Runtime and authorized hosts execute operations. MCP owns tool dispatch and authorization. Agent continues to own observations, proposals, and authoritative execution receipts.

The self-propagation kit composes these contracts through injected observe/infer/execute/verify functions. This portable implementation has no Node, network, filesystem, LM Studio, or Codex dependency. A missing execution receipt blocks continuation rather than retrying an uncertain mutation. Additional memory/planning/coding/validation compositions and durable host recovery remain future milestones.
