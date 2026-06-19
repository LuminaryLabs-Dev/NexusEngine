# Automation Knowledge Node Contract

## Purpose

Each audit automation records reusable lessons as small hierarchy nodes so future runs know where to look next.

## File Placement

- Ecosystem State Scout: `state/automation/ecosystem_state_scout/knowledge_nodes/`
- Runtime Bug Scout: `state/automation/runtime_bug_scout/knowledge_nodes/`
- Public Link Scout: `state/automation/public_link_scout/knowledge_nodes/`

## Node Rule

- Write one timestamped knowledge-node file per run.
- Update the lane-local master tracker with newest root lesson, child branches, and next search branches.
- Keep nodes advisory only.
- Do not edit source, tests, public claims, package metadata, or canonical memory from scout lanes.
- Link to files, tests, public URLs, and prior automation packets when useful.

## Required Node Shape

```md
# Knowledge Nodes: <lane> <timestamp>

## Root Lesson
- id:
- statement:
- why it matters:

## Child Nodes
- id:
  parent:
  lesson:
  evidence:
  look further:

## Related Nodes
- source:
- relationship:
- reason:

## Next Search Branches
- branch:
- files or folders:
- question:

## Not Claimed
- <what this node does not prove or fix>
```

## Master Tracker Shape

```md
# Master <Lane> Tracker

## Current Root Lessons
- id:
- status:
- latest packet:
- latest node:
- summary:

## Branch Tree
- parent:
- child:
- relationship:
- look further:

## Open Search Branches
- branch:
- owner:
- priority:
- next files:

## Resolved Or Superseded
- id:
- reason:
- evidence:
```
