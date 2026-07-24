# NexusEngine Automation Manifest

**Updated:** 2026-07-23

This manifest indexes read-only evidence lanes. It does not override source,
tests, `docs/KIT-OWNERSHIP.md`, `docs/CURRENT-ARCHITECTURE.md`, `memory.md`, or
the active Headless Editor state.

## Ownership Constraints

- NexusEngine receives only atomic, idempotent, fully reusable Core behavior
  after an ownership-gate decision.
- NexusEngine-Kits is the first-party destination for reusable optional, niche,
  genre, or platform behavior.
- Experiments and game repositories own complete games, presets, authored
  content, routes, and product behavior.
- Automations may record suggestions but cannot implement non-Core behavior.
- Automations cannot create or update ProtoKits.

## Lanes

| Lane | Output |
| --- | --- |
| Ecosystem State Scout | `ecosystem_state_scout/packets/` |
| DSK Architecture Scout | `dsk_architecture_scout/packets/` |
| Ecosystem Proof Scout | `ecosystem_proof_scout/packets/` |
| Deep Bug Report Scout | `deep_bug_report_scout/packets/` |
| Domain And Kit Idea Expander | `domain_kit_idea_expander/packets/` |
| Runtime Bug Scout | `runtime_bug_scout/findings/` |
| Public Link Scout | `public_link_scout/reports/` |

## Preflight

Run `npm run automation:preflight`. Resolve current remotes and public links
instead of trusting an old branch name or packet.

Every packet must distinguish:

```txt
observed current fact
historical evidence
suggestion
approved implementation
```

Lanes are append-only evidence producers. They do not merge, publish, promote,
or implement.
