# Inference domain clean cutover

The canonical inference lifecycle now belongs to `n:inference`. The Compute Model Kit (`n:compute:model`) owns descriptors, registry and capabilities only. The inference Provider pool owns admission, leases, health and deployment selection. Host adapters own transport and credentials; Harness routing still owns agent capability decisions.

## Breaking public API changes

- Removed `createInferenceRequest`, `createInferenceResult`, and `createModelAdapterBoundary` from the Compute Model Kit public exports.
- Removed `engine.n.model.infer()`, `getInferenceResult()`, and `registerAdapter()`. Replace inference calls with `createInferenceRequest` and `executeInference` from `nexusengine/domains/inference`.
- Removed the obsolete Compute Model inference/request/result/adapter source modules.
- Removed `n:compute:model:inference` and `n:compute:model:inference:provider` manifest subdomains. The authoritative domains are `n:inference` and `n:inference:provider`.

## Execution contract

Call `executeInference({request,pool,adapter,allowPaid,maxAttempts,timeoutMs,signal})` with a canonical request, a provider pool and a host adapter implementing `infer({request,instance,signal})`. The returned result contains status, output, provider/deployment identity, usage and attempt history. Unknown cost stays null. Paid capacity requires explicit `allowPaid:true`; otherwise only instances with `free:true` may be selected. The Provider pool does not manually decrement daily provider quotas.

Providers may expose a deployment-specific `providerModelId`; the OpenAI-compatible adapter uses it for the API payload. Transport-level uncertainty must not trigger blind replay. A provider rate-limit response can safely trigger another eligible provider, subject to bounded attempts and cooldowns.

## Verification

Run the repository's existing test scripts, including `node tests/core-kits/core-mlnn-kit-smoke.mjs` and `node tests/core-kits/core-agent-inference-routing-smoke.mjs`, using the exact checked-out commit. External consumers must migrate explicitly; no compatibility alias is provided.
