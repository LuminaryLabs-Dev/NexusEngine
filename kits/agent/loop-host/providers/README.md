# Optional inference adapters

Core Agent loops do not select a model. Applications may inject a deterministic `decide` implementation, an LLM, or a classifier. The existing OpenAI-compatible adapter and the optional TypeSafe adapter implement the canonical Inference adapter port. Neither is loaded by Core imports.

`createTypeSafeInference` consumes a neutral classification request (`createClassificationInferenceRequest`): `input.state`, versioned `input.questions` with `choice/options`, `score/levels`, or `probability`. It maps these into TypeSafe System One questions. It requires explicit thresholds and an existing approved TypeSafe project budget. Choice options must include `unknown` to satisfy the runtime profile. The adapter targets the validated TypeSafe-Kit 0.2.1 runtime, currently pinned to `jev-1.14.0`. Unsupported models/endpoints fail explicitly; changing a model is not a silent fallback. Other protocols need separate adapters. General provider instances remain configurable through the existing Inference pool.

Use `createTypeSafeRuntimeBridge({runtimeScript,scriptSha256,stateDirectory})` with an explicitly selected installed TypeSafe-Kit `server/server.py` and its SHA-256. This is a host integration, not a bundled Codex cache path. The script pin verifies the selected entry; the operator must preserve the entire matching runtime distribution including core.py and resources. Its private configuration/credential handling, project/global budgets, cost reservations, validated result cache and unknown-outcome recovery remain authoritative. The bridge never reads the key, changes caps, advances checkpoints, archives data or resets spending. Runtime commands use JSON stdin, limited environment and sanitized errors. Work input files are private and caller-selected, outside source projects. The runtime retains inputs and ledger according to its storage policy; no automatic deletion is performed.

An application supplies `project` only after approving the selected data transmission and shared budget. `create_job` is stable by Engine request identity: different input/profile/limits for the same ID fail instead of buying a duplicate. `UNKNOWN`, paused and failed records are never converted into negative judgments or automatically requeued. Concurrent invocations in different hosts are serialized by the runtime job lock. `REVIEW` remains uncertain, including rounded probability distributions. Credentials and HTTP stay outside Engine Core; no optional adapter makes a request merely by importing or installing Core.

Example (configuration only):

```js
import {createTypeSafeInference, createTypeSafeRuntimeBridge} from 'nexusengine/kits/agent/typesafe-provider';
const runtime = createTypeSafeRuntimeBridge({runtimeScript, scriptSha256, stateDirectory});
const adapter = createTypeSafeInference({runtime, project: approvedProjectId,
  thresholds: {category: {confidence: 0.9}}, budgetUsd: '0.01'});
// Pass adapter to executeInference with a configured classification-capable
// instance, explicit allowPaid policy, bounded limits and an AbortSignal.
```

Official protocol: https://docs.typesafe.ai/api/system-one . No raw HTTP clone or inference/spending ledger is implemented here. Synthetic runtime fixtures establish interface behavior; actual Jev inference is a separate authorized check.
