import {
  createDefaultSequenceNodeLibrary,
  createSequenceNodeRuntime,
  validateSequenceNode,
} from "nexusengine/domains/runtime/sequence";
import {
  registerDocumentService,
  typedDocument,
} from "../contracts/services.js";
import {
  authoringError as error,
  canonical,
  freeze,
  hash,
  requireFields,
  requireInteger,
  requireText,
} from "../contracts/value.js";
export function normalizeAuthoringSequence(input) {
  const c = canonical(input);
  requireFields(c, ["before", "during", "after", "maxAttempts"], "sequence");
  c.maxAttempts = requireInteger(c.maxAttempts ?? 1, "attempt budget", 1, 16);
  const ids = new Set();
  let count = 0;
  for (const phase of ["before", "during", "after"]) {
    c[phase] ??= [];
    if (!Array.isArray(c[phase]))
      throw error("AUTHORING_INVALID_SEQUENCE", "Phases must be arrays.");
    for (const step of c[phase]) {
      requireFields(step, ["id", "operations"], "step");
      requireText(step.id, "step ID");
      if (ids.has(step.id))
        throw error("AUTHORING_INVALID_SEQUENCE", "Duplicate step ID.");
      ids.add(step.id);
      if (
        !Array.isArray(step.operations) ||
        !step.operations.length ||
        step.operations.length > 256
      )
        throw error(
          "AUTHORING_INVALID_SEQUENCE",
          "Each step needs 1–256 operations.",
        );
      for (const op of step.operations) {
        requireFields(op, ["id", "args"], "operation");
        requireText(op.id, "operation ID");
      }
      count++;
    }
  }
  if (!c.during.length || count > 256)
    throw error(
      "AUTHORING_INVALID_SEQUENCE",
      "A sequence needs a nonempty During and at most 256 total steps.",
    );
  return c;
}
function nodeId(runId, stepId) {
  return JSON.stringify([runId, stepId]);
}
export function createAuthoringSequenceExecution(
  project,
  definition,
  { runId, epoch = project.context().epoch } = {},
) {
  requireText(runId, "run ID");
  requireInteger(epoch, "epoch", 1);
  const c = normalizeAuthoringSequence(definition),
    available = new Set(project.tools().map((t) => t.id));
  for (const phase of ["before", "during", "after"])
    for (const step of c[phase])
      for (const op of step.operations)
        if (!available.has(op.id))
          throw error(
            "AUTHORING_OPERATION_MISSING",
            `Sequence operation ${op.id} is not installed.`,
          );
  const library = createDefaultSequenceNodeLibrary();
  library.register({
    type: "authoring.operation",
    defaultCompletionMode: "manual",
    allowedCompletionModes: ["manual"],
    defaultDriver: "manual",
    allowedDrivers: ["manual"],
    inputs: ["project request"],
    outputs: ["project receipt"],
  });
  const rootId = nodeId(runId, "$root"),
    stepMap = new Map();
  const graph = {
    id: rootId,
    type: "group",
    driver: "manual",
    completionMode: "sequence",
    children: ["before", "during", "after"]
      .filter((phase) => c[phase].length)
      .map((phase) => ({
        id: nodeId(runId, `$phase:${phase}`),
        type: "phase",
        driver: "manual",
        completionMode: "sequence",
        children: c[phase].map((step) => {
          const id = nodeId(runId, step.id);
          if (id === rootId || step.id.startsWith("$"))
            throw error(
              "AUTHORING_INVALID_SEQUENCE",
              "Step IDs beginning with $ are reserved.",
            );
          stepMap.set(id, step);
          return {
            id,
            type: "authoring.operation",
            driver: "manual",
            completionMode: "manual",
            config: { stepId: step.id },
          };
        }),
      })),
  };
  const validation = validateSequenceNode(graph, library);
  if (!validation.ok)
    throw error(
      "AUTHORING_INVALID_SEQUENCE",
      "Runtime rejected the authored graph.",
      { errors: validation.errors },
    );
  const runtime = createSequenceNodeRuntime({
      library,
      disableTickFrameDispatch: true,
      historyLimit: 2048,
    }),
    receipts = new Map();
  let released = false,
    terminal = null;
  runtime.mount(graph, { autoStart: false });
  runtime.start(rootId);
  const state = () => terminal ?? runtime.getNodeState(rootId),
    release = () => {
      if (!released) {
        terminal = state();
        runtime.dispose();
        released = true;
      }
    };
  return Object.freeze({
    runId,
    definitionHash: hash(c),
    runtimeOwner: "n:runtime:sequence",
    status() {
      return freeze({
        runId,
        state: state(),
        released,
        active: released
          ? []
          : [...stepMap]
              .filter(([id]) => runtime.getNodeState(id) === "running")
              .map(([, step]) => step.id),
        receipts: [...receipts.values()],
      });
    },
    request(stepId) {
      const id = nodeId(runId, stepId);
      if (
        !stepMap.has(id) ||
        (!receipts.has(id) &&
          (released || runtime.getNodeState(id) !== "running"))
      )
        throw error(
          "AUTHORING_SEQUENCE_TARGET",
          "Only the active step of this run can execute.",
        );
      return freeze({
        requestId: `sequence:${id}`,
        epoch,
        operations: stepMap.get(id).operations,
      });
    },
    acknowledge(stepId, receipt) {
      const id = nodeId(runId, stepId);
      if (receipts.has(id)) {
        if (hash(receipts.get(id)) !== hash(receipt))
          throw error(
            "AUTHORING_SEQUENCE_RECEIPT",
            "Receipt differs from the acknowledged result.",
          );
        return receipts.get(id);
      }
      const request = this.request(stepId),
        recorded = project.getReceipt(request.requestId);
      if (
        !recorded ||
        hash(recorded) !== hash(receipt) ||
        recorded.requestHash !== hash({ ...request, action: "execute" })
      )
        throw error(
          "AUTHORING_SEQUENCE_RECEIPT",
          "Acknowledgement requires the actual committed Project receipt.",
        );
      receipts.set(id, recorded);
      runtime.complete(id, { requestId: recorded.requestId });
      if (["finished", "failed", "cancelled"].includes(state())) release();
      return recorded;
    },
    fail(stepId, cause) {
      const id = nodeId(runId, stepId);
      if (released || runtime.getNodeState(id) !== "running")
        throw error(
          "AUTHORING_SEQUENCE_TARGET",
          "Failure must target the active step.",
        );
      runtime.fail(id, {
        code: cause.code ?? "AUTHORING_SEQUENCE_FAILED",
        message: cause.message,
      });
      release();
      return this.status();
    },
    advance(stepId) {
      const request = this.request(stepId);
      try {
        return this.acknowledge(stepId, project.execute(request));
      } catch (cause) {
        this.fail(stepId, cause);
        throw cause;
      }
    },
    cancel() {
      if (!released) {
        runtime.cancel(rootId, { runId });
        release();
      }
      return this.status();
    },
    tick(delta = 0) {
      runtime.tick(delta);
      return this.status();
    },
    snapshot() {
      return canonical(runtime.snapshot());
    },
    dispose() {
      if (!released) this.cancel();
      return this.status();
    },
  });
}
export function installAuthoringSequenceServices(project) {
  registerDocumentService(project, {
    kind: "sequence",
    normalize: normalizeAuthoringSequence,
    validateReferences(c) {
      const tools = new Set(project.tools().map((t) => t.id));
      for (const phase of ["before", "during", "after"])
        for (const step of c[phase])
          for (const op of step.operations)
            if (!tools.has(op.id))
              throw error(
                "AUTHORING_OPERATION_MISSING",
                `Unknown sequence operation ${op.id}.`,
              );
    },
    profile: "finite-before-during-after-linear-manual-advancement/1",
  });
  const runs = new Map();
  return {
    normalize: normalizeAuthoringSequence,
    createExecution: (definition, options) =>
      createAuthoringSequenceExecution(project, definition, options),
    start(id, options) {
      requireText(options?.runId, "run ID");
      const doc = project.getDocument(id);
      if (doc.kind !== "sequence")
        throw error("AUTHORING_DEPENDENCY_KIND", "Expected sequence.");
      const signature = hash({
        sourceHash: doc.hash,
        epoch: options.epoch ?? project.context().epoch,
      });
      const prior = runs.get(options.runId);
      if (prior) {
        if (prior.signature !== signature)
          throw error(
            "AUTHORING_REQUEST_CONFLICT",
            "Run ID has different source or epoch.",
          );
        return prior.execution;
      }
      if (runs.size >= 1000)
        throw error(
          "AUTHORING_SEQUENCE_CAPACITY",
          "Run receipt capacity reached; open a new host session.",
        );
      const execution = createAuthoringSequenceExecution(
        project,
        doc.content,
        options,
      );
      runs.set(options.runId, { signature, execution });
      return execution;
    },
    dispose() {
      for (const run of runs.values()) run.execution.dispose();
      runs.clear();
    },
  };
}
