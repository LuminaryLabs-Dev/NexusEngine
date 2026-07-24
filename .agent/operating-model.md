# NexusEngine Agent Operating Model

Status: active

Agents gather live evidence, follow the Core ownership gate, and write concise
results into the repository without silently changing architecture.

## Outputs

- `state/automation/`: manifests, lane prompts, trackers, and packets
- `state/automation/*/knowledge_nodes/`: reusable evidence-backed lessons
- `memory.md`: durable current decisions only
- `.agent/CHANGE_LOG.md`: agent-operating-layer changes

## Scope

Track NexusEngine Core, NexusEngine-Kits, experiments and games, public package
consumption, and runtime risks.

Do not turn suggestions into implementations. Do not direct work to the retired
ProtoKit workflow. Use `docs/KIT-OWNERSHIP.md` to route every production
capability.
