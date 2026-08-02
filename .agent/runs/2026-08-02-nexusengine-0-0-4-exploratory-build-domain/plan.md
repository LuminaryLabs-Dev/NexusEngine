# Development Plan

## Goal

Implement the NexusEngine `0.0.4` exploratory Build Domain as a manifest-driven,

## Required outcomes

- [ ] The Build Domain tree, subdomain manifests, atomic Kit manifests, generated
- [ ] Planning, approval, receipt reuse, reset, snapshot/load, deterministic hashes,
- [ ] JavaScript/TypeScript analysis uses a real parser rather than regex source
- [ ] Web-live and web-static complete through fresh fixtures without mutating the
- [ ] Runtime-to-Build imports, output inside source projects, moving references,
- [ ] Existing Engine release gates remain green and Build evidence is recorded in

## Required checks

- [ ] repository-integrity
- [ ] test-coverage
- [ ] kit-composition
- [ ] installed-api-parity
- [ ] descriptor-integrity
- [ ] snapshot-reset-replay
- [ ] public-export-integrity
- [ ] browser-startup
- [ ] deterministic-replay
- [ ] runtime-tick

## Steps

1. Inspect the owning domain and nearest existing kit.
2. Implement the smallest compositional change that satisfies the target.
3. Reconcile public exports, package surfaces, docs, snapshots, and fixtures.
4. Run and record repository-integrity.
5. Run and record test-coverage.
6. Run and record kit-composition.
7. Run and record installed-api-parity.
8. Run and record descriptor-integrity.
9. Run and record snapshot-reset-replay.
10. Run and record public-export-integrity.
11. Run and record browser-startup.
12. Run and record deterministic-replay.
13. Run and record runtime-tick.
14. Verify and compare observed evidence before claiming completion.
