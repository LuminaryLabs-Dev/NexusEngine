# Cycle 008 Goal

Execute `master-package-n-physics-lifecycle` as one bounded semantic package.

Replace the transitional installation-only implementation with the canonical
`n:physics:lifecycle` subdomain and six atomic Kits: installation, startup,
step, shutdown, reset, and snapshot. Preserve one state owner per lifecycle
concept, public capability dependencies, deterministic exact-once commands,
portable snapshots, repeat-stable reset, and hard-cutover package exports.

This cycle does not authorize a push, deployment, or release-branch mutation.
