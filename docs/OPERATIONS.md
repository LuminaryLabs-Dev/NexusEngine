# NexusEngine Operations

This is the repository operating guide for development, validation, and
packaging. NexusEngine is a library, not a hosted service; this document does
not imply a deployment or incident-response runbook.

## Operating Boundary

```text
NexusEngine Core
  universal deterministic contracts and behavior

Trusted Kit registry
  reusable optional or specialized behavior

Application repository
  complete product, authored content, UI, and tuning
```

Route every production change through [Kit Ownership](KIT-OWNERSHIP.md).
Unknown ownership stays outside Core until evidence supports promotion.

## Source of Truth

Resolve conflicts in this order:

1. current source and passing tests
2. [Kit Ownership](KIT-OWNERSHIP.md)
3. [Current Architecture](CURRENT-ARCHITECTURE.md)
4. active contract documentation

Planning inventories, generated packets, historical run evidence, and legacy
pages preserve context but do not override current contracts.

## Guided Development

Read `AGENTS.md`, `.agent/target.md`, and `.agent/tracker.md`, then use the Core
Headless Editor from the repository root:

```bash
nexus-editor target
nexus-editor start
nexus-editor resume
nexus-editor status
nexus-editor next
nexus-editor continue
nexus-editor report
```

The active run owns plans, risks, validation, verification, observed
differences, and completion evidence. Do not manually replace generated
tracker state.

## Install and Validate

Use the lockfile and avoid lifecycle scripts during documentation validation:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run test:release
npm run ownership:generate
npm run release:manifest
npm run docs:check
npm run boundaries:check
```

| Command | Evidence |
| --- | --- |
| `npm test` | Complete Core smoke suite |
| `npm run test:release` | Current release-candidate contract suite |
| `npm run ownership:generate` | Source-derived Kit ownership ledger |
| `npm run release:manifest` | Current DSK release manifest |
| `npm run docs:check` | Active versus historical documentation classification |
| `npm run boundaries:check` | Core production/test/import boundary checks |

Review the worktree after generators run. A tracked difference is a contract
change and must not be discarded or accepted silently.

## Package Inspection

Before any publication decision, inspect the package without publishing it:

```bash
npm pack --dry-run --json
```

Confirm the file list contains only intentional package surfaces. This package
includes `docs/`, so repository image assets contribute to the packed size.
The dry run does not prove registry publication, release tagging, or consumer
compatibility.

The 2026-08-01 documentation candidate measured about 8 MB compressed and
10 MB unpacked across 527 files. Repository images account for most of that
payload. Re-run the dry run after any asset or package-boundary change rather
than treating these rounded review-time figures as permanent.

## Release Boundary

The current repository does not define a complete release or deployment
procedure. Treat version changes, npm publication, tags, GitHub releases,
backports, and support promises as separately authorized work. A green local
suite is necessary evidence but is not proof that a release exists.

## Current Limitations

- No npm publication, Git tag, or GitHub release for `0.0.4` was verified
  during the 2026-08-01 documentation review.
- `package.json` declares MIT, but the repository has no license file.
- No incident-response procedure, support channel, or release timetable is
  documented.
- The MCP SDK is optional and only required when a Node host connects the
  explicit MCP transport.
