# State, Lifecycle, And Idempotence

Idempotence means repeating an accepted operation does not create a second effect. It is enforced locally by each atom and globally by the composition controller.

## Install

An atomic Kit has a stable identity and manifest fingerprint. Installing matching content again returns the installed API without adding state, systems, or subscriptions. Reusing the same identity with different content is a hard conflict.

## Commands

State-changing commands need a stable idempotency key when they may be retried. The state owner records the accepted key and result. Repeating the same command returns the original result. Reusing the key with changed content fails before mutation.

## Snapshot

A snapshot contains portable semantic state. It excludes renderer objects, functions, sockets, file handles, GPU resources, and vendor SDK instances. Providers snapshot their own implementation state behind their contract when necessary.

## Reset

Reset restores the configured baseline. Calling reset twice returns the same snapshot and must not duplicate resources or lifecycle hooks.

## Physics Lifecycle

The canonical Physics lifecycle uses explicit stages rather than treating
installation as proof that a provider is ready:

```txt
uninstalled -> installed -> starting -> ready -> stopping -> installed
                                  \-> failed <-/
```

Every mutation carries an `operationId`. Exact replay returns the original
receipt; changed content under the same ID fails before mutation. Installation
owns the phase. Startup, Step, Shutdown, Reset, and Snapshot own separate state
resources and coordinate only through public capability APIs. Multi-API reset
and restore operations capture pre-call snapshots and roll every component back
when any validation or load fails.

## Physics Materials

Physical material descriptors are immutable under one material ID. Defining a
new record requires an `operationId`; exact replay returns the original receipt,
changed command content fails before mutation, and a different command cannot
replace an existing ID with different material content. Removal follows the
same exact-once rule.

Friction, restitution, density, surface, and combine-policy normalization are
read-only. Pair resolution does not mutate either material or policy state and
returns byte-equivalent output when the two material arguments are reversed.
Snapshots contain only portable records, sorted IDs, revisions, and receipts.

## Physics Worlds

Gravity, force, wind, time-scale, simulation-region, and Physics world records
use immutable IDs and exact-once mutation receipts. Repeating an accepted
definition returns the original receipt. Reusing its operation ID with changed
content, or redefining a record ID with different content, fails before state
changes.

Field, region, scale, and aggregate world sampling are read-only. A world
snapshot stores only normalized records, sorted IDs, revisions, and receipts;
it never stores provider worlds, native handles, clocks, weather objects, or
query diagnostics. Loading a world snapshot validates every capability
reference before replacing state.

## Replay

Deterministic replay starts from an accepted snapshot and applies the same ordered inputs. Any nondeterministic source is injected by the host and recorded as input. Random behavior uses explicit seeds or provider receipts.

## Composition-Level Exactly-Once

The controller hashes the normalized request, dependency plan, exact Kit source descriptors, configuration, and resolved executable fingerprints. The resulting plan ID is reviewed by a human. After apply, its receipt is persisted. Repeating the same plan returns that receipt without invoking the host again.

## Transactional Failure

Before apply, the host supplies a snapshot. If host mutation or receipt persistence fails, the controller restores both host and controller state. A failed plan has no success receipt.
