# Toolchain and Code Authoring implementation

## Result

Implemented five Core kits: Toolchain registry and resolution, compiler driver, Code documents and Code intelligence. Reused Project transactions/history/persistence, Build approvals, isolated stages and bounded process execution. Added optional language profiles and a loopback IDE host with source editing, navigation, TypeScript intelligence, save/reopen, build and run. Source work is isolated from the original dirty checkout.

Base: `081fea1cdd9ca1662bc15116e7174d9c27821630` (published main). Nexus Engine Kit 0.4.0 discovery succeeded. Per user direction the obsolete persistent Editor controller was not reinstated; Runtime/Agent retain execution ownership.

## Observed validation

Checks ran through the separate NexusAuditor adapter using local engine candidate `310b25e2ffdabe7c714358923e983faad06e070e` (unpublished 0.2.1 candidate). This is not a new engine runtime dependency.

- New acceptance: **6/6 PASS**, including real Rust, TypeScript, C++ and Python build/run, exact approvals, artifact mutation rejection, source and save-conflict boundaries, Project history, stale intelligence, atomic refactoring, IDE composition, and LSP/DAP fixture lifecycle.
- Generated public surfaces check: PASS with existing `--allow-pending`; pending manifest proof statuses remain pending.
- Manifest executable parity: PASS, 390 kits.
- Build domain tree: PASS, 51 kits and acyclic traversal.
- Existing Authoring roundtrips: **9/9 PASS**.
- Visible Mac browser IDE: manually edited main.ts, requested diagnostics (none), saved, built the snapshot, and ran its matching output. Visible output was `Hello from Nexus Toolchain`, exit 0. Dark editor, left explorer, document tabs and development output were readable. This was a visible review, not headless rendering.

Full four-scenario audit attempt 8 remains **FAIL (3 PASS / 1 FAIL)** because regression checks retain inherited failures. Exact baseline comparison passed separately after also checking the existing Authoring fixture:

- Both published baseline and candidate boundary checks flag the unchanged IndexedDB persistence provider and Camel browser test paths.
- Both published baseline and candidate Authoring public tests fail the existing import registry ownership expectation (`authoring-import-registry-kit` versus `authoring-import-validation-kit`).

These failures were not suppressed or fixed by changing unrelated expectations. This is not a clean engine-wide release pass. Raw local evidence is retained, ignored by Git, under `Auditor/runs/attempt-8/`, `baseline-final/`, `baseline/`, `commands/` and `visible-ide.png`.

## Scope and limits

QuickJS/web providers and C# stay explicitly unavailable without prepared drivers. This does not implement general JavaScript-to-Rust compilation or build Agora's native Mac application/APK. Actual debugger-provider acceptance, full PTY/terminal UI and IDE maturity remain follow-up work. The LSP/DAP transport passed fixtures, not an installed external debugger. Save-all detects disk conflicts but is not a multi-file filesystem transaction. Guide Markdown/HTML were regenerated; the PDF was not rendered because its renderer uses headless Chromium, excluded by the user.

See `docs/CODE-AUTHORING-TOOLCHAINS.md`, optional kit READMEs, and the example for usage and supported boundaries. No Docker, headless browser checks, push of original dirty changes, or claim of physical Quest proof.
