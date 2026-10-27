# Agent Decision implementation and validation

Goal: generic Engine classification/judgment contracts, model-neutral steps, optional Jev provider integration. Cloud remains unchanged. Run: 2026-10-26-agent-decision.

Route: inspect -> domain/kit ownership -> isolated candidate from remote main -> implement complete code/docs -> generate -> validate/repair -> scoped publication.

Base remote main: 87c6af580be8f078409bc20b7704155cd8866445. The primary dirty checkout remains at its original HEAD and is not reset, stashed, staged or merged. One unrelated AUTHORING-PACKAGES.md change was observed concurrently; both observed versions are retained externally and neither was reverted.

Owners:
- n:agent:decision / agent-decision-kit: versioned typed questions, judgments, existing-proposal references, evidence freshness, retained history and lifecycle.
- n:agent:loop: injected decide or backward-compatible infer, explicit actual attempts/tokens, zero-model budgets/delegation, cancellation and receipt-based recovery. Model decisions are optional caller implementations; no default model/provider.
- n:inference: neutral classification input/capability envelope; canonical executor and provider pool reused.
- n:harness:routing unchanged: host authorization remains independent of judgment.
- Optional TypeSafe runtime bridge/adapter under kits/agent/loop-host/providers. Uses explicitly pinned runtime script and private input directory, existing approved project/global financial ledger, stable client references, validated results and UNKNOWN handling. No direct HTTP client, new spending ledger, credential extraction or fallback to Jev is introduced. Runtime 0.2.1/Jev 1.14 is supported explicitly; incompatible endpoints/models reject.

Implementation completed before tests. Repairs occurred in the final validation phase: export-generator reconciliation, zero-model delegation, retained overrun usage and recovery deduplication. No new repository test files were added; existing suites were extended and wired into npm test.

Validation:
- Focused Agent/loop/inference/installed-kit/optional-adapter suite: 10 files PASS.
- npm test: 137 smoke tests PASS, exit 0.
- npm run test:release: 34 release-candidate tests PASS, exit 0.
- Core boundaries, generated catalogues, 395 manifest-backed Kit execution parity, ownership and public-test surface: PASS.
- Documentation guide regenerated and rendered; docs check/PDF proof PASS (228 nonblank unclipped pages).
- ProtoKit/migration checks PASS. Release manifest regenerated.
- Package dry-run PASS: 2540 files / 25,366,410 unpacked bytes; new Core API and optional provider included; no env/ledger file included.
- Publication requires final fresh-remote comparison, scoped commit and remote readback. That readback is retained externally and reported in the completion response.

Evidence root: /Users/crimsonwheeler/Library/Application Support/Nexus Engine Maintenance/agent-decision-20261026-212108. Native Engine task/session and workspace pointers are in run.json. Engine status receipts record workflow progress only; the actual validator outputs above establish correctness.

Limits: provider behavior uses synthetic ports and a subprocess fixture, not paid Jev/Cerebras inference. No live model accuracy, Cloud integration, runtime deployment or provider-key claim. The TypeSafe bridge requires an operator-selected matching trusted runtime distribution; it does not bundle a global Codex plugin cache. Completion confidence is high for the tested Engine contracts and bounded adapter interface, not for unmeasured model judgment quality.
