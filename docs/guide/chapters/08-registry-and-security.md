# Registries And Security

A registry record is metadata. Reading, searching, merging, or validating it must not execute package code.

## Exact Source Identity

An executable Kit record includes:

- package name and exact version
- canonical package subpath and export name
- immutable 40-character source commit
- SHA-256 integrity
- environments and requested permissions
- requires and provides tokens
- status and settings schema

Moving branches, tags, and unpinned URLs are not executable identities.

## Resolution Rules

The host verifies that paths stay inside the resolved package root, imports the declared export only, compares integrity, and computes an executable fingerprint. Browser modules require immutable commit URLs. Local and package paths cannot escape their package root.

## No Runtime Installation

Core never runs a package manager during composition. When required code is absent, planning returns a structured installation receipt with the exact package and version. Installation is a separate human-controlled operation; planning is repeated afterward.

## Collision Rules

- An imported registry cannot replace a Core identity.
- Two Domains cannot claim the same semantic path.
- One Kit ID cannot refer to changed content.
- A repeated accepted plan returns its original receipt.
- Integrity mismatch, wrong export, path escape, or missing source fails before mutation.

## Trust Boundary

Integrity proves identity, not benevolence. Approved JavaScript still runs with the permissions of its host. Review source ownership, commit, permissions, and environment before approval. Use process or platform isolation when untrusted code must run.
