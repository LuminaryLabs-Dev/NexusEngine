# NexusRealtime Automation Rules

Status: active

## Before Running

- Read `.agent/start-here.md`.
- Run `npm run automation:preflight` before writing an automation packet.
- Treat the preflight `latestReleaseBranch` as the branch to compare against.
- If the preflight cannot resolve remote branches or public links, record the failure and continue with local evidence only.

## Safety

- Audit lanes do not edit `src/`, `tests/`, public docs, release claims, or package metadata unless the user explicitly asks for implementation.
- Do not promote ProtoKits into core automatically.
- Do not change ECS, scheduler, renderer, or DSK architecture from scout lanes.
- Do not store secrets, tokens, credentials, or private URLs in reports.
- Public-link checks must use published URLs only.

## Evidence Rules

- Every report must say what was inspected.
- Every validation claim must include command evidence, file evidence, or public URL status.
- If a command fails, preserve the failure summary and exact next fix.
- If a report finds no issue, state the remaining risk.
- Prefer one recommended next action over a broad roadmap.

## Current Priority Order

1. DSK contract and promotion readiness
2. ProtoKits direct-import compatibility
3. Experiments proof paths
4. Public GitHub/CDN consumption
5. Runtime bug and long-term ecosystem risks
