# NexusEngine Automation Rules

Status: active

## Before Running

- Read `.agent/start-here.md`, `.agent/target.md`, and `.agent/tracker.md`.
- Run `npm run automation:preflight` before writing an automation packet.
- Prefer current source, tests, and canonical docs over packet history.

## Safety

- Audit lanes do not edit production source, tests, public docs, package
  metadata, release claims, or other repositories.
- Automations may record non-Core suggestions but may not implement them.
- Automations may not create or update ProtoKits.
- Automations may not add niche, genre, platform, or product production behavior
  to NexusEngine.
- Core implementation requires the ownership gate in
  `docs/KIT-OWNERSHIP.md` and explicit implementation approval.
- Reusable non-Core implementation targets NexusEngine-Kits or another trusted
  registry only after approval.
- Complete game behavior targets an experiment or game repository.
- Do not store secrets, credentials, tokens, or private URLs.

## Evidence

- Name what was inspected and the exact command, file, or public URL.
- Preserve failures and identify one next repair.
- A suggestion is not an implementation decision.
- Generated packets are evidence, not current architecture.

## Priority

1. Core ownership and public-entrypoint integrity
2. Trusted registry installability
3. Experiment and game proof
4. Public package consumption
5. Runtime and long-term ecosystem risks
