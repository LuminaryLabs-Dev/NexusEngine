# Worker and Authoring ledger integration

Validated scope: n:agent:worker assignment contracts and optional loop-host adapter;
coordination snapshot restoration; manifest/schema-derived Authoring capability
ledger and versioned evidence status; generated Core/package/document surfaces.

Baseline: origin/main 88ca445. Integration uses the isolated Worker candidate.
The older primary checkout and all its 96 modified/untracked files were preserved
with an external source snapshot, binary diff and SHA-256 manifest. All 96 hashes
remain unchanged. The ledger was transferred as the delta from its preserved
pre-task files, excluding concurrent persistence, tool-schema and Studio work.
Previous rollbacks remain retained. No live service activation or paid inference.

Changes: portable Worker assignment/state API, installed manifest-owned Worker kit,
model-neutral hosted execution, coordination restoration and bounded records;
Authoring metadata validation, automatic operation/sub-operation discovery,
manifest ownership and contract/source/verifier-bound evidence. The default ledger
discovers 80 commands and 94 capabilities and leaves verification unasserted until
matching evidence is supplied. Registration is never execution authorization.

Validation: 9 Worker/Agent test entries and 26 Authoring tests passed. Core freshness,
executable parity for 399 kits, ownership, boundaries, Authoring freshness, generated
public test exports, release manifest, guide source/PDF and package dry-run passed.
Evidence views demonstrated current, stale and missing status and protection of the
default catalogue. Parent goal acceptance and host authority remain external to a
Worker record. No visual gameplay, provider quality or Cloud deployment claim.

Core drift was fixed by regeneration on the integrated source. The first validation
also detected the expected stale generated test surface for the new Worker export;
the existing generator repaired it, followed by passing checks. Generated guide,
PDF, MCP guide resources and release manifest were reconciled. Failed-attempt logs
and final logs remain in the external maintenance evidence folder for this run.

Route: preserve → isolate scoped deltas → regenerate → validate → review scoped
index → commit → ordinary fast-forward push → verify remote identity. Publication
identity and CI status are read back separately after pushing; local validation
does not imply completed remote CI. Primary worktree synchronization is deliberately
separate because its unfinished changes remain in place.
