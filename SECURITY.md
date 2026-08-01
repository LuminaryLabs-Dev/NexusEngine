# Security Policy

## Scope

This policy covers vulnerabilities in the NexusEngine package and its public
Core interfaces. Applications, hosts, providers, transports, and optional Kits
remain responsible for the behavior and privileges they add.

## Supported Versions

Repository metadata identifies version `0.0.4` as a stable candidate. This
repository does not currently define a supported-version matrix, backport
policy, or security-support window.

Include the affected package version, commit, and public import path in a
report when available.

## Reporting

Do not disclose sensitive vulnerability details in a public issue,
discussion, fixture, or example. GitHub private vulnerability reporting is not
currently enabled for this repository, and no repository-specific security
contact or response timeline is documented.

Use an existing private channel with the LuminaryLabs-Dev maintainers when one
is available. Include a concise description, impact, reproduction steps, and a
sanitized proof of concept. Remove credentials, tokens, personal data, private
paths, and private endpoints. If no private channel is available, do not post
exploit details publicly while a reporting route is being established.

## MCP and Composition Boundaries

Core MCP is inactive by default. An application must explicitly install the
MCP Domain, register application-owned providers, and connect a transport
before tools, resources, or prompts are exposed.

- Register only providers and Kit factories the application intends to run.
- Treat provider input, transport metadata, and external Kit behavior as trust
  boundaries.
- Keep credentials and private configuration out of provider metadata,
  snapshots, fixtures, logs, and documentation.
- Require explicit authorization for approval-required MCP tools.
- Use public package entrypoints; do not make integrations depend on private
  source paths.

The Core registry enforces its declared authorization boundary. It is not a
general authentication, sandboxing, secrets-management, or network-security
system.

## Disclosure

Public disclosure should wait until maintainers and affected integrators can
assess the report and prepare a fix or mitigation. This repository does not
currently document a CVE or coordinated-disclosure process.
