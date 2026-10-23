# Toolchain and Code acceptance

Run `validation.toolchain-code.json` through the separately installed Nexus Audit Kit. The local validation uses NexusAuditor `310b25e2ffdabe7c714358923e983faad06e070e` (0.2.1 local candidate, not a published dependency). This profile requires no Docker or browser. Doctor, dry-run and approved run-local receipts identify the actual external engine. Do not substitute passing source lint for runtime acceptance. Node, Rust and the package's TypeScript dependency must be installed. Outputs remain in ignored `Auditor/runs`.

The command scenarios execute contract, real compiler/runtime and loopback-host checks plus focused existing regressions. Visible editor review is separate; LSP/DAP transport fixtures do not prove an installed third-party language server or debugger.
