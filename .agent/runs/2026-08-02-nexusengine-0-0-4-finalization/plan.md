# Development Plan

## Goal

Finalize NexusEngine `0.0.4` as a reproducible, committed release candidate:

## Required outcomes

- [ ] Every production Build file is tracked and reproducible from a clean clone.
- [ ] `web-static` emits a complete local dependency closure; `web-live` uses the
- [ ] Android XR produces a validated ARM64 APK and PCVR produces a validated
- [ ] Build remains outside the runtime graph, projects remain byte-for-byte
- [ ] Repeated approved application returns the original receipt without rebuilding.
- [ ] NexusEngine-Kits, Editor, Simulator, and The Open Above install an exact
- [ ] Documentation, exports, MCP resources, catalogs, guide, PDF, and release
- [ ] All local, clean-clone, packed-tarball, hosted package, consumer, showcase,

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
