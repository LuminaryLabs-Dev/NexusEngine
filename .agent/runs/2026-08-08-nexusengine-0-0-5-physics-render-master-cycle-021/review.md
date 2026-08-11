# Constraints Source Review

## Accepted Ownership

`n:physics:constraints` owns portable constraint descriptor schemas, exact
records, enabled/disabled/terminal-broken status, revisions, and pure break
policy evaluation. It does not solve constraints, submit provider work, own
body records, or apply gameplay effects.

`constraint-registry-kit` is the only mutable owner. Ten type Kits normalize
one independent constraint descriptor type. `constraint-break-kit` is a pure
policy normalizer and evaluator.

## Review Dispositions

| Finding | Disposition |
| --- | --- |
| Candidate imports did not resolve from Kit folders | Repaired with canonical package-relative imports. |
| Every type Kit owned a second mutable descriptor state | Removed; type Kits are stateless normalizers and the Registry is the sole record owner. |
| Type schemas accepted interchangeable arbitrary objects | Replaced with strict parameters and invariants for ball-socket, cone-twist, distance, drive, fixed, hinge, limit, motor, slider, and spring constraints. |
| Frames omitted rotational and coordinate-space meaning | Added local-body position and normalized quaternion frames; axis types use normalized local axes. |
| Registry omitted replace and status commands | Added strict define, replace, remove, transition, and terminal break commands with expected revisions and exact-once receipts. |
| Registry used raw serialization for semantic identity | Replaced with canonical portable-value comparison after type normalization. |
| Body references were not checked | Define, replace, and snapshot load now require both IDs in the public Body registry. |
| Break Kit owned separate policy and broken state | Break Kit is pure; policy stays in the descriptor and terminal status/break evidence stay in the Registry record. |
| Angular motor/drive limits were mislabeled as force | Linear mode now requires `maxForce`; angular mode requires `maxTorque`. |
| Snapshots could inject malformed exact-once receipts | Added strict state, receipt, SHA-256, revision, Kit identity, record, order, and aggregate revision validation. |
| Direct Body removal can bypass the detachment guard | Kept `assertBodyDetachable()` public and assigned enforcement to the planned `n:physics:integration` package; no hidden optional coupling was added to Body. |
| Constraint records do not yet execute in a solver/provider | Assigned synchronization to planned Physics Integration/Solver/Provider packages; this source package remains explicitly unproven. |
| Generated package exports, docs, and catalog are stale | Intentionally deferred until source freeze under the active source-first policy. |

## Remaining Validation

No feature test ran in this cycle. All 84 detailed Constraints actions remain
pending until the post-freeze phase proves direct behavior, exact replay,
snapshots, detachment enforcement, provider synchronization, composition,
generated outputs, packaging, MCP discovery, and consumer use.
