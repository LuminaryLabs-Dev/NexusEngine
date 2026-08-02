# Development Target

## Goal

Finalize NexusEngine `0.0.4` as a reproducible, committed release candidate:
track and finish `n:build`, integrate current `origin/main`, prove Web and native
package outputs, validate exact-SHA consumers and The Open Above, and prepare the
exact commit for human-approved `main` and immutable `0.0.4` branch creation.

## Required Outcomes

- Every production Build file is tracked and reproducible from a clean clone.
- `web-static` emits a complete local dependency closure; `web-live` uses the
  same verified closure with content-addressed runtime caching.
- Android XR produces a validated ARM64 APK and PCVR produces a validated
  Windows x64 package. Hardware execution is explicitly deferred.
- Build remains outside the runtime graph, projects remain byte-for-byte
  unchanged, and generated stages remain under external Build storage.
- Repeated approved application returns the original receipt without rebuilding.
- NexusEngine-Kits, Editor, Simulator, and The Open Above install an exact
  committed Engine SHA without local symlinks or private source imports.
- Documentation, exports, MCP resources, catalogs, guide, PDF, and release
  manifest agree on the same registry hash.
- All local, clean-clone, packed-tarball, hosted package, consumer, showcase,
  Playwright, and Human View gates pass for one exact candidate SHA.

## Safety And Release Gates

- Preserve current work externally before editing; never stash, reset, rebase,
  force-clean, or absorb unrelated worktrees.
- Do not push, deploy, publish, mutate Google Drive, archive repositories,
  install to hardware, create tags or releases, or create `origin/0.0.4`
  without the corresponding explicit approval.
- The exact branch approval phrase is `APPROVE NexusEngine 0.0.4 <full-sha>`.
