# NexusRealtime Agent Operating Model

Status: active

## Mentality

Agents should make the NexusRealtime ecosystem easier to understand, validate, and promote by writing structured evidence back into the repo.

## Operating Shape

- Gather facts from the live checkout before making claims.
- Always resolve the latest remote release branch before comparing branch state.
- Prefer evidence files over chat-only conclusions.
- Keep reports short, inspectable, and linked to commands or files.
- Separate source changes from evidence updates.
- Do not hide important findings inside automation logs only.

## Agent Outputs

- `state/automation/` for automation manifests, lane prompts, trackers, and run packets.
- `state/automation/*/knowledge_nodes/` for reusable lessons.
- `memory.md` for durable repo decisions only.
- `.agent/CHANGE_LOG.md` for agent-operating-layer changes.

## Ecosystem Scope

Track NexusRealtime core, ProtoKits, Experiments, public GitHub/CDN consumption, DSK promotion readiness, and long-term runtime issues without turning product-specific experiment behavior into core runtime code.
