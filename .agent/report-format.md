# NexusRealtime Agent Report Format

Status: active

## Required Report Sections

Use this shape unless the automation prompt asks for a stricter format:

```txt
# <Report Name>

Timestamp:
Automation:
Scope:
Latest branch:

## Result
- pass/fail/blocked/partial

## Evidence
- commands run
- files inspected
- public links checked
- artifacts written

## Findings
- highest-value findings only

## Regressions
- new breakages or drift, or "none found"

## Next Action
- one exact next action

## Not Claimed
- what this does not prove or fix
```

## Style

- Be concise.
- Prefer bullets.
- Avoid speculation unless clearly marked.
- Do not duplicate long architecture text.
