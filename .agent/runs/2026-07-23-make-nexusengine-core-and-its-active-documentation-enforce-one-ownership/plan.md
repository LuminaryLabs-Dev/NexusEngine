# Development Plan

## Goal

Make NexusEngine Core and its active documentation enforce one ownership rule:

## Required outcomes

- [ ] Every NexusEngine public production module has a recorded owner,
- [ ] NexusEngine public entrypoints cannot reach fishing, Reef Rescue, or another
- [ ] `createFishingKit` and `createReefRescueKit` are not NexusEngine exports.
- [ ] The fishing kit installs through NexusEngine-Kits using only public
- [ ] Reef Rescue runs from a dedicated game repository using NexusEngine plus the
- [ ] No active documentation or automation instructs a human or agent to create,
- [ ] Historical and generated evidence remains unchanged and clearly non-current.
- [ ] A fresh reader can answer the five ownership questions in the approved plan
- [ ] All focused Core tests, full NexusEngine tests, NexusEngine-Kits checks,

## Required checks

- [ ] repository-integrity
- [ ] test-coverage
- [ ] kit-composition
- [ ] installed-api-parity
- [ ] snapshot-reset-replay
- [ ] public-export-integrity
- [ ] browser-startup

## Steps

1. Inspect the owning domain and nearest existing kit.
2. Implement the smallest compositional change that satisfies the target.
3. Reconcile public exports, package surfaces, docs, snapshots, and fixtures.
4. Run and record repository-integrity.
5. Run and record test-coverage.
6. Run and record kit-composition.
7. Run and record installed-api-parity.
8. Run and record snapshot-reset-replay.
9. Run and record public-export-integrity.
10. Run and record browser-startup.
11. Verify and compare observed evidence before claiming completion.
