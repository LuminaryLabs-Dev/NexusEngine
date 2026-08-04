# Inferred Reliability Risks

## repository-integrity

Every development run must prove the repository and relative module graph can be inspected.

## test-coverage

Every completed change needs an executed test result, not only source inspection.

## kit-composition

Kit or domain changes must be exercised through a composed engine path.

## installed-api-parity

Public direct APIs and APIs installed into engine.n must agree.

## descriptor-integrity

Descriptor-producing behavior must emit complete identifiers, schemas, and references.

## snapshot-reset-replay

Stateful domains must prove snapshot, reset, and replay behavior.

## public-export-integrity

Public entrypoints and package exports must resolve after the change.

## deterministic-replay

Procedural or seeded behavior must reproduce the same output for the same input.

## runtime-tick

Realtime behavior must be composed and advanced through deterministic ticks.
