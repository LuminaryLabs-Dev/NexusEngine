import {
  authoringToolInputSchema,
  authoringToolOwnership,
} from "../contracts/tool-schema.js";
import {
  authoringError as error,
  canonical,
  sharedCanonical,
  freeze,
  hash,
  owns,
  requireFields,
  requireInteger,
  requireText,
} from "../contracts/value.js";

export const AUTHORING_PROJECT_SCHEMA = "nexusengine.authoring-project/1";
const summary = (doc) =>
  doc && { id: doc.id, kind: doc.kind, revision: doc.revision, hash: doc.hash };
const contentHash = (doc) =>
  hash({
    kind: doc.kind,
    schemaVersion: doc.schemaVersion,
    content: doc.content,
    dependencies: doc.dependencies,
  });

/** A project-specific commit authority, using the installed kit's resource writer. */
export function createAuthoringProjectStore({
  read,
  write,
  projectId = "project",
  maxHistory = 128,
  maxReceipts = 10000,
}) {
  requireText(projectId, "projectId");
  requireInteger(maxHistory, "maxHistory", 1, 10000);
  requireInteger(maxReceipts, "maxReceipts", 1, 1000000);
  const kinds = new Map(),
    operations = new Map();
  let executing = false;
  const empty = (clock = 0, epoch = 1) => ({
    schema: AUTHORING_PROJECT_SCHEMA,
    projectId,
    clock,
    epoch,
    documents: {},
    receipts: {},
    undo: [],
    redo: [],
  });
  if (!read()) write(freeze(empty()));
  let recoveryState = null;
  const state = () => recoveryState ?? read();
  const publish = (value) => {
    if (recoveryState) recoveryState = value;
    else write(value);
  };
  const nextClock = (current) =>
    requireInteger(current + 1, "document clock", 1);
  const required = (docs, id) => {
    requireText(id, "document ID");
    if (!owns(docs, id))
      throw error("AUTHORING_DOCUMENT_MISSING", `Unknown document ${id}.`, {
        id,
      });
    return docs[id];
  };
  const kindOf = (id) => {
    if (!kinds.has(id))
      throw error(
        "AUTHORING_KIND_MISSING",
        `Document kind ${id} is not installed.`,
      );
    return kinds.get(id);
  };

  function normalizeDocument(input, revision) {
    requireFields(
      input,
      [
        "id",
        "kind",
        "schemaVersion",
        "revision",
        "hash",
        "content",
        "dependencies",
      ],
      "document",
    );
    requireText(input.id, "document ID");
    requireText(input.kind, "document kind");
    const kind = kindOf(input.kind);
    if ((input.schemaVersion ?? kind.version) !== kind.version)
      throw error(
        "AUTHORING_SCHEMA_UNSUPPORTED",
        `Unsupported ${input.kind} schema.`,
      );
    const content = sharedCanonical(
      kind.normalize(
        kind.id === "mesh"
          ? sharedCanonical(input.content)
          : canonical(input.content),
      ),
    );
    const dependencies = canonical(kind.dependencies(content));
    for (const ref of dependencies) {
      requireFields(ref, ["id", "kind", "revision"], "dependency");
      requireText(ref.id, "dependency ID");
      requireText(ref.kind, "dependency kind");
      if (ref.revision !== "latest")
        requireInteger(ref.revision, "dependency revision", 1);
    }
    const doc = {
      id: input.id,
      kind: input.kind,
      schemaVersion: kind.version,
      revision: requireInteger(revision, "document revision", 1),
      content,
      dependencies,
    };
    doc.hash = contentHash(doc);
    return freeze(doc);
  }

  function validateDocuments(documents) {
    for (const doc of Object.values(documents))
      for (const ref of doc.dependencies) {
        const target = required(documents, ref.id);
        if (target.kind !== ref.kind)
          throw error(
            "AUTHORING_DEPENDENCY_KIND",
            `${doc.id} requires ${ref.kind} ${ref.id}.`,
          );
        if (ref.revision !== "latest" && target.revision !== ref.revision)
          throw error(
            "AUTHORING_STALE_REFERENCE",
            `${doc.id} references stale ${ref.id}.`,
          );
      }
    // Source dependencies are acyclic. Assembly hierarchy has its own typed validation.
    const visiting = new Set(),
      visited = new Set();
    const visit = (id) => {
      if (visiting.has(id))
        throw error(
          "AUTHORING_DEPENDENCY_CYCLE",
          `Document dependency cycle at ${id}.`,
        );
      if (visited.has(id)) return;
      visiting.add(id);
      for (const ref of documents[id].dependencies) visit(ref.id);
      visiting.delete(id);
      visited.add(id);
    };
    for (const id of Object.keys(documents)) visit(id);
    for (const doc of Object.values(documents))
      kindOf(doc.kind).validateReferences?.(doc.content, (id) =>
        required(documents, id),
      );
  }

  function normalizeRequest(input, action) {
    const request = canonical(input);
    requireFields(
      request,
      action === "execute"
        ? ["requestId", "epoch", "operations"]
        : ["requestId", "epoch"],
      action,
    );
    requireText(request.requestId, "requestId");
    requireInteger(request.epoch, "epoch", 1);
    if (action === "execute") {
      if (
        !Array.isArray(request.operations) ||
        !request.operations.length ||
        request.operations.length > 256
      )
        throw error(
          "AUTHORING_OPERATION_BUDGET",
          "A transaction needs 1–256 operations.",
        );
      for (const operation of request.operations) {
        requireFields(operation, ["id", "args"], "operation");
        requireText(operation.id, "operation ID");
      }
    }
    return { ...request, action };
  }

  function priorReceipt(request) {
    const current = state(),
      requestHash = hash(request);
    if (owns(current.receipts, request.requestId)) {
      const receipt = current.receipts[request.requestId];
      if (receipt.requestHash !== requestHash)
        throw error(
          "AUTHORING_REQUEST_CONFLICT",
          "Request ID already has different content.",
        );
      return receipt;
    }
    if (request.epoch !== current.epoch)
      throw error("AUTHORING_STALE_EPOCH", "The project epoch changed.");
    if (Object.keys(current.receipts).length >= maxReceipts)
      throw error(
        "AUTHORING_RECEIPT_CAPACITY",
        "Receipt retention is full. Preserve a checkpoint and open a new project with the source documents; reset discards this project.",
      );
    return null;
  }

  function commit(
    current,
    request,
    documents,
    deltas,
    clock,
    undo,
    redo,
    results = [],
  ) {
    validateDocuments(documents);
    const receipt = freeze({
      schema: "nexusengine.authoring-receipt/1",
      requestId: request.requestId,
      requestHash: hash(request),
      epoch: current.epoch,
      status: "completed",
      beforeClock: current.clock,
      afterClock: clock,
      changed: deltas.map((d) => ({
        id: d.id,
        before: summary(d.before),
        after: summary(d.after),
      })),
      results: canonical(results),
      validation: { valid: true },
      warnings: [],
      recovery: { undoAvailable: undo.length > 0 },
    });
    publish(
      freeze({
        ...current,
        clock,
        documents,
        receipts: { ...current.receipts, [request.requestId]: receipt },
        undo,
        redo,
      }),
    );
    return receipt;
  }

  function execute(input, { preview = false } = {}) {
    if (executing)
      throw error(
        "AUTHORING_REENTRANT",
        "Nested project mutations are unsupported.",
      );
    const request = normalizeRequest(input, "execute"),
      previous = priorReceipt(request);
    if (previous) {
      if (preview)
        throw error(
          "AUTHORING_PREVIEW_ALREADY_APPLIED",
          "Cannot preview an already applied request.",
        );
      return previous;
    }
    const current = state(),
      documents = Object.assign(Object.create(null), current.documents),
      changed = new Map();
    let clock = current.clock;
    const tx = Object.freeze({
      get(id, expectedRevision) {
        const doc = required(documents, id);
        if (expectedRevision !== undefined) {
          const isCreated =
            !owns(current.documents, id) &&
            changed.has(id) &&
            changed.get(id).before === null;
          if (
            isCreated
              ? expectedRevision !== 0
              : !owns(current.documents, id) ||
                current.documents[id].revision !==
                  requireInteger(expectedRevision, "expectedRevision", 1)
          )
            throw error("AUTHORING_STALE_REVISION", `Stale document ${id}.`);
        }
        return doc;
      },
      put(input, expectedRevision) {
        const existing = owns(documents, input.id) ? documents[input.id] : null;
        if (existing) {
          if (expectedRevision === undefined)
            throw error(
              "AUTHORING_REVISION_REQUIRED",
              `Editing ${input.id} requires its expected revision.`,
            );
          tx.get(input.id, expectedRevision);
          if (existing.kind !== input.kind)
            throw error(
              "AUTHORING_KIND_CHANGE",
              "Document kinds cannot change in place.",
            );
        } else if (expectedRevision !== undefined)
          throw error(
            "AUTHORING_DOCUMENT_MISSING",
            `Unknown document ${input.id}.`,
          );
        const next = normalizeDocument(input, nextClock(clock));
        if (existing && existing.hash === next.hash) return existing;
        if (!changed.has(input.id))
          changed.set(input.id, {
            id: input.id,
            before: owns(current.documents, input.id)
              ? current.documents[input.id]
              : null,
          });
        documents[input.id] = next;
        clock = next.revision;
        return next;
      },
      remove(id, expectedRevision) {
        if (expectedRevision === undefined)
          throw error(
            "AUTHORING_REVISION_REQUIRED",
            "Deletion requires an expected revision.",
          );
        tx.get(id, expectedRevision);
        if (!changed.has(id))
          changed.set(id, {
            id,
            before: owns(current.documents, id) ? current.documents[id] : null,
          });
        delete documents[id];
        clock = nextClock(clock);
      },
      list(kind) {
        return Object.values(documents).filter(
          (doc) => !kind || doc.kind === kind,
        );
      },
    });
    executing = true;
    try {
      const results = request.operations.map((operation) => {
        const definition = operations.get(operation.id);
        if (!definition)
          throw error(
            "AUTHORING_OPERATION_MISSING",
            `Operation ${operation.id} is not installed.`,
          );
        const result = definition.execute(tx, canonical(operation.args ?? {}));
        if (result && typeof result.then === "function")
          throw error(
            "AUTHORING_ASYNC_TRANSACTION",
            "Transactions require synchronous staged operations.",
          );
        return canonical(result ?? null);
      });
      const deltas = [...changed.values()]
        .map((d) => ({
          ...d,
          after: owns(documents, d.id) ? documents[d.id] : null,
        }))
        .filter((d) => {
          if ((d.before?.hash ?? null) !== (d.after?.hash ?? null)) return true;
          if (d.before) documents[d.id] = d.before;
          else delete documents[d.id];
          return false;
        });
      validateDocuments(documents);
      if (preview)
        return freeze({
          schema: "nexusengine.authoring-preview/1",
          epoch: current.epoch,
          baseClock: current.clock,
          request: canonical(input),
          changed: deltas.map(
            (d) => summary(d.after) ?? { id: d.id, deleted: true },
          ),
          documents: deltas.filter((d) => d.after).map((d) => d.after),
        });
      const undo = deltas.length
        ? [...current.undo, { deltas }].slice(-maxHistory)
        : current.undo;
      return commit(
        current,
        request,
        documents,
        deltas,
        clock,
        undo,
        deltas.length ? [] : current.redo,
        results,
      );
    } finally {
      executing = false;
    }
  }

  function travel(input, direction) {
    if (executing)
      throw error(
        "AUTHORING_REENTRANT",
        "Nested project mutations are unsupported.",
      );
    const request = normalizeRequest(input, direction),
      previous = priorReceipt(request);
    if (previous) return previous;
    const current = state(),
      stack = current[direction];
    if (!stack.length)
      throw error("AUTHORING_HISTORY_EMPTY", `No ${direction} is available.`);
    const change = stack.at(-1),
      documents = Object.assign(Object.create(null), current.documents),
      deltas = [];
    let clock = current.clock;
    for (const delta of change.deltas) {
      const target = direction === "undo" ? delta.before : delta.after;
      const before = owns(documents, delta.id) ? documents[delta.id] : null;
      clock = nextClock(clock);
      const after = target ? normalizeDocument(target, clock) : null;
      if (after) documents[delta.id] = after;
      else delete documents[delta.id];
      deltas.push({ id: delta.id, before, after });
    }
    const undo =
      direction === "undo"
        ? current.undo.slice(0, -1)
        : [...current.undo, change].slice(-maxHistory);
    const redo =
      direction === "redo"
        ? current.redo.slice(0, -1)
        : [...current.redo, change].slice(-maxHistory);
    return commit(current, request, documents, deltas, clock, undo, redo);
  }

  function validateSnapshot(input) {
    const value = canonical(input);
    requireFields(
      value,
      [
        "schema",
        "projectId",
        "clock",
        "epoch",
        "documents",
        "receipts",
        "undo",
        "redo",
      ],
      "project snapshot",
    );
    if (
      value.schema !== AUTHORING_PROJECT_SCHEMA ||
      value.projectId !== projectId
    )
      throw error(
        "AUTHORING_SCHEMA_UNSUPPORTED",
        "Snapshot schema or project identity differs.",
      );
    requireInteger(value.clock, "clock");
    requireInteger(value.epoch, "epoch", 1);
    for (const field of ["documents", "receipts"])
      if (
        !value[field] ||
        typeof value[field] !== "object" ||
        Array.isArray(value[field])
      )
        throw error(
          "AUTHORING_INVALID_SNAPSHOT",
          `${field} must be an object.`,
        );
    const checkDoc = (doc, id) => {
      if (doc === null) return null;
      const normalized = normalizeDocument(doc, doc.revision);
      if (
        normalized.id !== id ||
        normalized.hash !== doc.hash ||
        hash(normalized) !== hash(doc) ||
        doc.revision > value.clock
      )
        throw error(
          "AUTHORING_INVALID_SNAPSHOT",
          `Invalid document identity/content ${id}.`,
        );
      return normalized;
    };
    for (const [id, doc] of Object.entries(value.documents)) {
      if (doc === null)
        throw error("AUTHORING_INVALID_SNAPSHOT", "Null document.");
      value.documents[id] = checkDoc(doc, id);
    }
    validateDocuments(value.documents);
    for (const field of ["undo", "redo"]) {
      if (!Array.isArray(value[field]) || value[field].length > maxHistory)
        throw error("AUTHORING_INVALID_SNAPSHOT", "Invalid history size.");
      for (const change of value[field]) {
        requireFields(change, ["deltas"], "history change");
        if (
          !Array.isArray(change.deltas) ||
          !change.deltas.length ||
          new Set(change.deltas.map((d) => d.id)).size !== change.deltas.length
        )
          throw error("AUTHORING_INVALID_SNAPSHOT", "Invalid history deltas.");
        for (const d of change.deltas) {
          requireFields(d, ["id", "before", "after"], "history delta");
          requireText(d.id, "delta ID");
          if (d.before === null && d.after === null)
            throw error("AUTHORING_INVALID_SNAPSHOT", "Empty history delta.");
          checkDoc(d.before, d.id);
          checkDoc(d.after, d.id);
        }
      }
      const cursor = Object.assign(Object.create(null), value.documents);
      for (const change of [...value[field]].reverse())
        for (const d of change.deltas) {
          const from = field === "undo" ? d.after : d.before,
            to = field === "undo" ? d.before : d.after;
          const actual = owns(cursor, d.id) ? cursor[d.id] : null;
          if ((actual?.hash ?? null) !== (from?.hash ?? null))
            throw error(
              "AUTHORING_INVALID_SNAPSHOT",
              "History does not match the current document chain.",
            );
          if (to) cursor[d.id] = to;
          else delete cursor[d.id];
        }
    }
    if (Object.keys(value.receipts).length > maxReceipts)
      throw error(
        "AUTHORING_RECEIPT_CAPACITY",
        "Snapshot exceeds receipt capacity.",
      );
    for (const [id, receipt] of Object.entries(value.receipts)) {
      if (
        receipt.schema !== "nexusengine.authoring-receipt/1" ||
        receipt.requestId !== id ||
        receipt.status !== "completed" ||
        !Number.isSafeInteger(receipt.epoch) ||
        receipt.epoch < 1 ||
        receipt.epoch > value.epoch ||
        !/^sha256:[0-9a-f]{64}$/.test(receipt.requestHash)
      )
        throw error("AUTHORING_INVALID_SNAPSHOT", "Malformed receipt.");
      requireInteger(receipt.beforeClock, "receipt before clock");
      requireInteger(
        receipt.afterClock,
        "receipt after clock",
        receipt.beforeClock,
        value.clock,
      );
      if (
        !Array.isArray(receipt.changed) ||
        !Array.isArray(receipt.results) ||
        receipt.validation?.valid !== true
      )
        throw error("AUTHORING_INVALID_SNAPSHOT", "Incomplete receipt.");
      for (const changed of receipt.changed) {
        requireText(changed.id, "changed document ID");
        for (const doc of [changed.before, changed.after])
          if (doc !== null) {
            requireFields(
              doc,
              ["id", "kind", "revision", "hash"],
              "receipt document",
            );
            if (
              doc.id !== changed.id ||
              !/^sha256:[0-9a-f]{64}$/.test(doc.hash)
            )
              throw error(
                "AUTHORING_INVALID_SNAPSHOT",
                "Invalid receipt content identity.",
              );
            requireInteger(
              doc.revision,
              "receipt revision",
              1,
              receipt.afterClock,
            );
            requireText(doc.kind, "receipt document kind");
          }
      }
    }
    return value;
  }

  return Object.freeze({
    registerKind(definition) {
      if (executing)
        throw error("AUTHORING_REENTRANT", "Cannot register during execution.");
      requireText(definition.id, "kind ID");
      requireInteger(definition.version, "kind version", 1);
      if (
        typeof definition.normalize !== "function" ||
        typeof definition.dependencies !== "function"
      )
        throw error(
          "AUTHORING_INVALID_KIND",
          "Kinds need normalization and dependency functions.",
        );
      if (kinds.has(definition.id))
        throw error(
          "AUTHORING_KIND_CONFLICT",
          `Kind ${definition.id} already registered.`,
        );
      kinds.set(definition.id, Object.freeze({ ...definition }));
    },
    registerOperation(definition) {
      if (executing)
        throw error("AUTHORING_REENTRANT", "Cannot register during execution.");
      requireText(definition.id, "operation ID");
      requireText(definition.domainPath, "domain path");
      if (
        !(
          definition.domainPath === "n:authoring" ||
          definition.domainPath.startsWith("n:authoring:")
        ) ||
        typeof definition.execute !== "function"
      )
        throw error(
          "AUTHORING_INVALID_OPERATION",
          "Operation needs an Authoring path and executor.",
        );
      if (operations.has(definition.id))
        throw error(
          "AUTHORING_OPERATION_CONFLICT",
          `Operation ${definition.id} already registered.`,
        );
      const { execute, ...metadata } = definition;
      metadata.inputSchema = authoringToolInputSchema(
        definition.id,
        definition.parameters?.fields ?? [],
      );
      metadata.effects = authoringToolOwnership(definition.id);
      metadata.documentation = "AUTHORING.md#capability-profiles";
      metadata.validation =
        "Project.preview validates typed schemas, limits, references and the complete prospective state before commit.";
      operations.set(
        definition.id,
        Object.freeze({
          ...freeze(
            canonical({
              cost: "bounded-document",
              requiredKits: [],
              expectedRevisions: "existing targets required",
              resultSchema: "nexusengine.authoring-receipt/1",
              errors: [
                "AUTHORING_INVALID_INPUT",
                "AUTHORING_STALE_REVISION",
                "AUTHORING_DEPENDENCY_KIND",
              ],
              ...metadata,
            }),
          ),
          execute,
        }),
      );
    },
    tools() {
      return [...operations.values()]
        .map(({ execute, ...metadata }) => metadata)
        .sort((a, b) => a.id.localeCompare(b.id));
    },
    kinds() {
      return [...kinds.keys()].sort();
    },
    context() {
      return freeze({ projectId, epoch: state().epoch, clock: state().clock });
    },
    getReceipt(id) {
      requireText(id, "request ID");
      return owns(state().receipts, id) ? state().receipts[id] : null;
    },
    getDocument(id) {
      return required(state().documents, id);
    },
    listDocuments(kind) {
      return Object.values(state().documents)
        .filter((doc) => !kind || doc.kind === kind)
        .map(summary);
    },
    dependents(id) {
      required(state().documents, id);
      return Object.values(state().documents)
        .filter((doc) => doc.dependencies.some((ref) => ref.id === id))
        .map(summary);
    },
    execute,
    preview(input) {
      return execute(input, { preview: true });
    },
    acceptPreview(preview) {
      if (
        preview.epoch !== state().epoch ||
        preview.baseClock !== state().clock
      )
        throw error("AUTHORING_STALE_PREVIEW", "Preview source changed.");
      return execute(preview.request);
    },
    undo(input) {
      return travel(input, "undo");
    },
    redo(input) {
      return travel(input, "redo");
    },
    getSnapshot({ immutable = false } = {}) {
      return immutable ? freeze(sharedCanonical(state())) : canonical(state());
    },
    loadSnapshot(input) {
      if (executing)
        throw error("AUTHORING_REENTRANT", "Cannot restore during execution.");
      const next = validateSnapshot(input);
      let clock = nextClock(Math.max(next.clock, state().clock));
      next.epoch = nextClock(Math.max(next.epoch, state().epoch));
      // Current source receives fresh revisions. Retained receipts remain historical facts.
      for (const id of Object.keys(next.documents).sort())
        next.documents[id] = normalizeDocument(
          next.documents[id],
          (clock = nextClock(clock)),
        );
      next.clock = clock;
      validateDocuments(next.documents);
      publish(freeze(next));
      return this.context();
    },
    recover(checkpoint, journal = []) {
      if (executing || recoveryState)
        throw error("AUTHORING_REENTRANT", "Cannot nest recovery.");
      if (!Array.isArray(journal) || journal.length > maxReceipts)
        throw error(
          "AUTHORING_INVALID_JOURNAL",
          "Invalid recovery journal size.",
        );
      const validated = validateSnapshot(checkpoint);
      let recovered;
      recoveryState = freeze(validated);
      try {
        for (const record of canonical(journal)) {
          requireFields(record, ["action", "request"], "journal record");
          if (record.action === "execute") execute(record.request);
          else if (record.action === "undo" || record.action === "redo")
            travel(record.request, record.action);
          else
            throw error(
              "AUTHORING_INVALID_JOURNAL",
              "Unsupported recovery action.",
            );
        }
        recovered = canonical(recoveryState);
      } finally {
        recoveryState = null;
      }
      return this.loadSnapshot(recovered);
    },
    reset() {
      if (executing)
        throw error("AUTHORING_REENTRANT", "Cannot reset during execution.");
      const current = state();
      publish(
        freeze(empty(nextClock(current.clock), nextClock(current.epoch))),
      );
      return this.context();
    },
  });
}
