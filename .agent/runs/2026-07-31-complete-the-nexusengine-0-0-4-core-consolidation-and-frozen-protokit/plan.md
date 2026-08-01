# Development Plan

## Goal

Complete the NexusEngine `0.0.4` Core consolidation and frozen ProtoKit

## Required outcomes

- [ ] ProtoKit export disposition coverage is exactly 100 percent.
- [ ] Every universal atom is implemented and evidence-backed.
- [ ] Every public Core module has exactly one manifest owner.
- [ ] No transitional Core Kit folder, old identifier, old import, or forwarding export remains.
- [ ] Engine, Kits, Editor, Simulator, clean-install, MCP, registry, docs, PDF, Playwright, and Human View gates pass.
- [ ] No external publication or mutation occurs without its separate human approval.

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
