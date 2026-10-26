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

Provider leases are snapshot-capable; expiration signals reconciliation rather than automatic replay. The optional staged-rename checkpoint adapter does not provide multi-process atomic CAS. The self-propagation loop is bounded and works in memory, but crash-resumable end-to-end execution is not yet verified. Do not claim exactly-once effects from arbitrary providers.
