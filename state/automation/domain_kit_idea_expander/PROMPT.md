# Domain And Kit Idea Expansion Automation Prompt

```text
GOAL:
Expand NexusEngine domain and kit idea inventories from described examples and automation packet evidence.

RUN CONFIG:
- Environment: local
- Workspace: /Users/crimsonwheeler/Documents/GitHub/NexusEngine
- Primary docs:
  - docs/described_examples.md
  - docs/domain_ideas.md
  - docs/kits_ideas.md
  - docs/how-to-protokit.md
  - docs/how-to-experiment.md
- Output lane: state/automation/domain_kit_idea_expander/packets/
- Knowledge node lane: state/automation/domain_kit_idea_expander/knowledge_nodes/
- Master tracker: state/automation/domain_kit_idea_expander/master_domain_kit_idea_expansion.md

PROCESS:
1. Start by restating this lane goal in the packet draft: expand domain and kit idea inventories from evidence and described examples.
2. Use agent-it mentality: read .agent/start-here.md, .agent/operating-model.md, .agent/automation-rules.md, .agent/report-format.md, .agent/AGENT_MEMORY.md, .agent/CHANGE_LOG.md, memory.md, and state/automation/AUTOMATION_MANIFEST.md.
3. Read surrounding state context before new analysis: current lane master tracker, latest 1-3 current lane packets/nodes, and latest 1-2 packets/nodes from ecosystem_state_scout, dsk_architecture_scout, ecosystem_proof_scout, and deep_bug_report_scout when present.
4. Run npm run automation:preflight. Use latestReleaseBranch as the branch comparison target.
5. Read docs/described_examples.md, docs/domain_ideas.md, docs/kits_ideas.md, docs/how-to-protokit.md, and docs/how-to-experiment.md.
6. Read recent packets and trackers from ecosystem_state_scout, dsk_architecture_scout, ecosystem_proof_scout, and deep_bug_report_scout.
7. Extract only reviewable, reusable expansion candidates:
   - domains implied by multiple examples or packets
   - kits implied by missing proofs, architecture gaps, or repeated service needs
   - path ownership ideas that clarify DSK boundaries
   - composition scenarios that make existing domains/kits easier to audit
8. Update docs/domain_ideas.md and docs/kits_ideas.md additively.
9. Update docs/described_examples.md only when a new scenario or long-form intent clearly improves the composition map.
10. Write one timestamped packet to state/automation/domain_kit_idea_expander/packets/.
11. Write one timestamped knowledge node to state/automation/domain_kit_idea_expander/knowledge_nodes/ using the node contract.
12. Update state/automation/domain_kit_idea_expander/master_domain_kit_idea_expansion.md.

HARD BOUNDARIES:
- Do not edit src, tests, package metadata, README, memory.md, or public claims.
- Do not implement kits.
- Do not create new tests.
- Do not promote ideas to core or ProtoKits.
- Treat every new reusable kit idea as targeting NexusEngine-ProtoKits by default, not NexusEngine core.
- Recommend NexusEngine core changes only for runtime primitives, DSK invariants, composer behavior, or validation surfaces.
- Do not remove existing ideas unless they are exact duplicates or clearly obsolete.
- Do not turn weak single-use ideas into durable domains; place them in the packet as candidates instead.
- Keep all additions generic, product-neutral, service-oriented, and DSK-compatible.

EXPANSION RULES:
- Domains must own state, lifecycle, service contract, and path ownership.
- Kits must declare likely owns/provides/requires/used-by.
- Kits must declare likely target repo: normally NexusEngine-ProtoKits; only core when the idea is a runtime primitive or DSK contract concern.
- Prefer domain families over one-off product ideas.
- Every new idea should explain why it helps long-term composability.
- Mark uncertain ideas as candidates, not accepted durable ideas.

PACKET MUST INCLUDE:
- Timestamp
- Lane Goal
- Prior State Context
- Latest branch
- Files inspected
- Packets inspected
- Ideas added
- Ideas deferred
- Duplicates avoided
- DSK boundary notes
- Open questions
- Not claimed
```
