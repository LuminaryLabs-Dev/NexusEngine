# Composable Agent Loop architecture

The authoritative owners are:
- `n:agent:loop:step`: step envelopes, attempts, transitions, evidence references.
- `n:agent:loop:control`: loop continuation, budgets, terminal decisions.
- `n:agent:loop:coordination`: child delegation, reservation and joining.
- `n:inference`: provider-independent request and result contracts.
- `n:inference:provider`: provider instance admission, selection and capacity.
- `n:harness:routing`: model-decision resolution to installed capabilities.

Existing Runtime, MCP, Authoring and production host remain authoritative for actual execution and receipts. The optional inference host requires an explicit URL allow-policy; credentials remain host-managed. The production bridge dispatches only explicitly allowlisted operations.

The existing `n:compute:model` surface is preserved for compatibility and must be audited before any migration. No model is bundled.

Provider leases are snapshot-capable; expiration signals reconciliation rather than automatic replay. The optional checkpoint adapter uses an exclusive lock file and a revision check, failing closed on concurrent writers. A crash can leave a lock requiring operator inspection; the production host retains its own durable receipt authority. The self-propagation loop is bounded and works in memory, but crash-resumable end-to-end execution is not yet verified. Do not claim exactly-once effects from arbitrary providers.


## Goal-bound Worker composition

The optional Production Worker controller composes the existing Agent Worker,
Agent Goal/Graph and `runAgentLoop`. The decision provider selects self-work,
delegation, evidence gathering, correction or waiting. No hardcoded terrain,
character or game sequence is introduced. Goal operations still require current
graph and source bindings; a delegated assignment is not implementation proof.

A child receives bounded context plus immutable source/evidence references.
Coordination reserves parent budgets and rejects duplicate delegated identities.
A snapshot can be validated and restored; nested cancellation refunds unused
allocations once. Independent Workers may run separate Agent Loops, but the
host remains the sole serialized source writer.

An accepted wait checkpoint records a dependency and yields. The caller must
supply an authenticated wake receipt on resume. Interrupted external effects
remain subject to normal pending-receipt reconciliation. Parent completion is
verified independently of child completion, including visual/gameplay gates
when relevant. Host-level crash-recovery and concurrent integration must be
proven against the full installed system before declaring production readiness.

## Optional goal-scoped source references

Goals may declare specific `sourceRefs` (artifact ID and current revision).
When present, verification binds to those exact artifacts and relevant conditional
facts rather than unrelated project-wide changes. Implementation must supply
the observed current revisions for every declared source; missing source evidence
blocks acceptance, and a changed relevant revision marks the goal stale.
Goals without scoped references preserve their existing global source-revision
and evidence semantics for backwards compatibility.
