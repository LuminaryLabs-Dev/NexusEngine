# Physics Constraints contract

Constraints defines portable relationships between two distinct registered bodies.
It owns descriptor validation and registry lifecycle, including broken-state
evidence. A solver/provider must separately implement physical motion.

Attachment frames are `frames.bodyA` and `frames.bodyB`, each in its body's local
coordinates. Positions default to zero. Rotations use normalized XYZW quaternions
with a canonical sign. Axes default to positive X and normalize without overflow.
Vectors with magnitude at most 1e-12 reject. Input objects remain unchanged.

| Type | Parameter contract |
| --- | --- |
| Ball socket, fixed | Attachment frames; no additional parameters |
| Hinge, slider | Unit `axisA` and `axisB`; limits use the separate Limit descriptor |
| Cone twist | Cone angle [0, pi], ordered twist limits [-pi, pi], radians |
| Distance | Nonnegative ordered minimum/maximum distance, defaults 0/1 |
| Spring | Linear/angular mode, positive stiffness, nonnegative damping; linear rest is nonnegative |
| Limit | Linear/angular mode, ordered minimum/maximum |
| Motor | Target velocity, positive maxForce for linear or maxTorque for angular |
| Drive | Target position/velocity, positive stiffness, nonnegative damping, mode-specific effort |

Linear units follow the owning Physics world; angular values use radians. The
constraint schema does not introduce a unit conversion. Default spring/drive
stiffness and maximum effort are 1; damping and targets default to zero.

Break policies default disabled. Enabled policies require positive force and/or
torque thresholds. Equality reaches a threshold. Only enabled constraints can
break; a broken record is terminal for replacement and re-enabling, but can be
removed. Measurements and exceeded-threshold flags remain in the broken record.

`defineConstraint`, `replaceConstraint`, `removeConstraint`,
`transitionConstraint`, and `breakConstraint` require an operation ID. Retrying an
identical normalized request returns the original receipt, including after a
snapshot restore. Reusing an ID with different content rejects. New successful
commands advance the operation sequence; only changed records advance record and
registry revisions. Expected revisions reject stale edits. All counters must be
safe integers; exhaustion fails before any state change.

Constraint IDs may include `constructor` or `__proto__`. Operation IDs reserve
own property names of Object.prototype because the shared Runtime command ledger
uses an object map. Raw update/configure/applyCommand/setDescriptor APIs reject;
use the typed operations. Reset explicitly clears records and retained receipts.

Snapshots validate schemas, identity, counters, sorted indexes, receipts, body
references and break evidence before replacing state. Failed commands/restores
leave the current registry and receipts unchanged. Snapshot restoration preserves
the existing Runtime revision semantics; it is not an Authoring history epoch.

Before deleting a body, call `assertBodyDetachable(bodyId)` and resolve each
referencing constraint, including disabled or broken records. Body removal does
not automatically call this guard. `validateReferences()` detects missing bodies
after an external removal. Automatic cross-domain deletion coordination remains
the integration owner's responsibility.

Proof: the four `tests/core-domains/core-physics-constraints-*.mjs` tests cover
descriptors, registry mutations, all installed kits and public factories.
