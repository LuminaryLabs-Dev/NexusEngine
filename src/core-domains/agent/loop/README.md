# Agent Loop — one runner and one memory handoff

`runAgentLoop` is implemented in `runner.js`. The old `runSelfPropagation` name and self-propagation import path forward to that same function. There is one execution loop; no separate propagation scheduler or memory database is introduced.

## Ordered steps

Pass a serializable `steps` array with 1–256 unique `{id, operation, kind, input, version}` descriptors. Kinds are `compute` (the default, side-effect-free), `effect` (requires an authoritative operation receipt), and `verify` (the single final completion gate). Each handler runs through the supplied `execute` port; the final step uses `verify`. The optional host applies its existing Harness capability authorization before dispatch. Pure functions need no model provider. Handlers that use inference must report actual usage through `accountUsage`; no inference or delegation starts automatically.

The same ports receive `{step, input, memory, memoryRevision, idempotencyKey, signal}` plus the existing state/context fields. Memory is a copied read view. Return `{ok, output?, memoryPatch?, receiptRef?}`. Patches use explicit top-level `{set:{key:value}, remove:[key]}`; there is no implicit deep merge. Rejecting a step or invalid patch preserves accepted memory. Compute results do not fabricate execution receipts; effects and final verification require real evidence references.

Every accepted step commits one revision through the existing Agent context store, including unchanged memory, before handing it to the next step. The store supports optional expectedRevision CAS and commitId for idempotent acceptance; existing callers keep their API. The runner uses one scoped record, default key `loop:<loopId>`, under the supplied agent. Default memory is bounded by the context store's existing limits. Use compact evidence/asset references, not full logs or geometry. No context is implicitly copied from another agent.

Step definitions are copied and fingerprinted, including their declared versions. Hosts must update a descriptor's version when its handler contract changes; function code is not serialized into checkpoints. Definitions cannot be silently swapped during resume.

## Existing routes

Existing `infer` and model-neutral `decide` calls are an internal repeatable one-step recipe on the same runner. Existing observation, authorization, execution, budgets and verification remain. Coding is an ordered recipe; retrieval, planning and validation helpers remain reusable step operations. Task graphs and coordination are descriptions/contracts, not additional executors. Direct authoring and game operations remain available without requiring this loop.

## Persistence and interruption

New checkpoints use `nexusengine.agent.loop.run/2`: existing control/trace/pending state plus definition hash, cursor and accepted memory record. The optional host forwards checkpoint/resume/resolver ports. Revision-guarded writes preserve the existing fail-closed storage behavior. v1 checkpoints migrate in memory only through their original adaptive compatibility route; they are never reinterpreted as a different array. Preserve old originals.

Pending execution never automatically dispatches again. The trusted resolver must retrieve the original native receipt and return the same loop/agent/goal/step/idempotency bindings. The loop cannot authenticate an arbitrary external receipt store itself. A successful result is checkpointed as pending acceptance before memory is committed. If memory commits but cursor persistence fails, resume recognizes that exact commit and advances without repeating the operation or memory update. A fresh memory store can restore the accepted entry without replacing unrelated records. External memory edits or stale revisions block continuation.

Source operations and loop checkpoints can live in separate stores; this does not create a distributed atomic transaction. Keep both stores and reconcile original receipts. Cancelled runs may reconcile completed effects but remain cancelled. Interrupted decisions and verification remain unresolved for explicit handoff, not blind inference replay. Original checkpoint errors propagate without another execution.

Actual usage is retained even over budget, then continuation blocks. Missing provider usage remains explicit. Provider adapters must honor AbortSignal; portable Core cannot forcibly stop uncooperative providers. Existing coordination does not imply durable multi-worker execution. Successful receipts and task status do not establish modeling quality, gameplay or device acceptance.
