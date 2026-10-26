# Additional Build target providers

Applications may compose explicit build-time target providers with:

```js
const build = createBuildDomain({
  stateRoot,
  additionalTargetProviders: [applicationPackagingProvider]
});
```

Each provider uses the existing target-provider contract: id, label, environments, capabilities, sourceRecords, plan(context), execute(context), and optional validate(context). Built-in IDs cannot be replaced; duplicate IDs fail. Allowed request target IDs derive from the installed registry. Additional providers participate in existing source inspection, deterministic plans, exact-plan approval, isolated stages, receipts and project immutability checks.

Providers are executable trusted build adapters, supplied explicitly by the host. They must use context.stage for package output and keep source immutable. Their plans must include immutable source/toolchain identities that execution can recheck. No additional provider enters the application runtime graph or grants runtime platform capabilities.

Dynamic registry registration after domain composition does not extend the configured request target set. Supply providers during createBuildDomain so request normalization and registry share one installation.

Source implementation is not promotion evidence. Agora retains its existing engine pin until installed-composition, MCP, failure-path and regression checks pass and the engine revision is approved for adoption.
