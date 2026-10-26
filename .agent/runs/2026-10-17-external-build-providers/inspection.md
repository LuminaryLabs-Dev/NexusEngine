# Source inspection

Owning domain: n:build. Existing kits: target-registry-kit and target-set-kit. The registry already supports explicit provider registration and reset; orchestration normalizes allowed target IDs through a separate fixed target set. createBuildDomain supplies only built-ins to both, so registering a provider later cannot make its ID requestable. MCP target input already uses an open string array and requires no schema widening.

NexusEngine was clean on main before this change. Existing generated tracker points to completed 2026-08-02-nexusengine-0-0-4-finalization; it is preserved. Previous task input is copied to previous-target.md. No controller-generated passing evidence is created manually.
