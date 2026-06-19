# NexusRealtime Automation Manifest

Last updated: 2026-06-18

## Scope

This manifest indexes repo-local audit lanes for NexusRealtime. It does not replace `memory.md`, `.agent/*`, source files, tests, release notes, the expansion idea inventories in `docs/described_examples.md`, `docs/domain_ideas.md`, and `docs/kits_ideas.md`, or the routing guides in `docs/how-to-protokit.md`, `docs/how-to-experiment.md`, `docs/protokit-boundaries.md`, `docs/protokit-experiment-loop.md`, and `docs/visual-target-review.md`.

## .agent Status

- Status: active repo-local automation operating layer.
- Present guidance: `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`.
- Operating model: use `.agent` first, resolve latest remote release branch, check public links, then write lane-local evidence.
- Expansion model: use described examples, domain ideas, and kit ideas as non-canonical source material for possible DSK growth; report risks and candidates, but do not promote them from scout lanes.
- ProtoKit target rule: new reusable kit implementations belong in `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/` by default. NexusRealtime core changes should be limited to runtime primitives, DSK invariants, composer behavior, and validation surfaces.
- Experiment target rule: new playable proofs belong in `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/` and should compose core plus ProtoKits instead of owning reusable domain logic.

## Local Lanes

| Lane | Prompt | Output | Knowledge Nodes | Master |
| --- | --- | --- | --- | --- |
| Ecosystem State Scout | `ecosystem_state_scout/PROMPT.md` | `ecosystem_state_scout/packets/` | `ecosystem_state_scout/knowledge_nodes/` | `ecosystem_state_scout/master_ecosystem_state.md` |
| DSK Architecture Scout | app automation prompt | `dsk_architecture_scout/packets/` | `dsk_architecture_scout/knowledge_nodes/` | `dsk_architecture_scout/master_dsk_architecture.md` |
| Ecosystem Proof Scout | app automation prompt | `ecosystem_proof_scout/packets/` | `ecosystem_proof_scout/knowledge_nodes/` | `ecosystem_proof_scout/master_ecosystem_proof.md` |
| Deep Bug Report Scout | app automation prompt | `deep_bug_report_scout/packets/` | `deep_bug_report_scout/knowledge_nodes/` | `deep_bug_report_scout/master_deep_bug_reports.md` |
| Domain And Kit Idea Expander | `domain_kit_idea_expander/PROMPT.md` | `domain_kit_idea_expander/packets/` | `domain_kit_idea_expander/knowledge_nodes/` | `domain_kit_idea_expander/master_domain_kit_idea_expansion.md` |
| Runtime Bug Scout | `runtime_bug_scout/PROMPT.md` | `runtime_bug_scout/findings/` | `runtime_bug_scout/knowledge_nodes/` | `runtime_bug_scout/master_runtime_bugs.md` |
| Public Link Scout | `public_link_scout/PROMPT.md` | `public_link_scout/reports/` | `public_link_scout/knowledge_nodes/` | `public_link_scout/master_public_links.md` |

## Shared Preflight

- Command: `npm run automation:preflight`
- Purpose: resolve latest release branch from `origin`, compare it with the current branch, and check public GitHub/raw/CDN/package URLs.
- Branch rule: choose the highest semver-like branch from remote refs, currently expected to resolve to `0.0.2` until a newer branch exists.

## Shared Packet Startup

- Every automation packet must start from its lane goal.
- Every automation must read surrounding state before new analysis: its own master tracker and latest packets/nodes, plus relevant neighboring lane packets/nodes.
- State context is evidence, not authority. If packet state conflicts with source, tests, docs, or preflight, report the conflict and prefer the live source.

## App Automation Cadence

- `Nexus Realtime: Ecosystem State Packet`: hourly at minute 5, `gpt-5.5`, high reasoning.
- `Nexus Realtime: DSK Architecture State Packet`: hourly at minute 20, `gpt-5.5`, high reasoning.
- `Nexus Realtime: Ecosystem Proof State Packet`: hourly at minute 35, `gpt-5.5`, high reasoning.
- `Nexus Realtime: Deep Bug Report Packet`: hourly at minute 50, `gpt-5.5`, max reasoning.
- `Nexus Realtime: Domain And Kit Idea Expansion`: hourly at minute 58, `gpt-5.5`, high reasoning.

## Repo Lane Cadence

- Intended cadence: every 30 minutes when active.
- Each lane is independent and append-only.
- Main Goal Mode later decides what to merge into canonical docs, code, tests, releases, or memory.
