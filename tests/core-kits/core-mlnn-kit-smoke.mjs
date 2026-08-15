import assert from "node:assert/strict";
import { createComputeKit, createEngine } from "../helpers/public-package-surface.mjs";
import {
  createModelAdapterBoundary,
  createModelKit,
  createModelRegistry,
  createModelDescriptor,
  createInferenceRequest,
  createInferenceResult
} from "../../src/core-domains/compute/model/kits/model-kit/index.js";

const registry = createModelRegistry();
registry.register(createModelDescriptor({ id: "mock", kind: "classifier" }));
assert.equal(registry.get("mock").kind, "classifier", "model registry stores descriptor");

const request = createInferenceRequest({ modelId: "mock", input: { value: 1 } });
assert.equal(request.modelId, "mock", "inference request stores model id");
assert.equal(createInferenceResult({ output: { label: "ok" } }).output.label, "ok", "inference result stores output");

let executions = 0;
const adapter = createModelAdapterBoundary({
  id: "fixture-model-provider",
  kind: "test",
  infer(inference) {
    executions += 1;
    return { output: { label: inference.input.text, score: 1 } };
  }
});
const engine = createEngine({ kits: [
  createComputeKit(),
  createModelKit({
    models: [{ id: "fixture", kind: "classifier", adapterId: adapter.id }],
    adapters: [adapter]
  })
] });
const inference = { id: "fixture-request", modelId: "fixture", input: { text: "ok" } };
const result = engine.n.model.infer(inference);
assert.equal(result.output.label, "ok", "Core delegates inference to an injected adapter");
assert.deepEqual(engine.n.model.infer(inference), result, "repeated inference returns the accepted result");
assert.equal(executions, 1, "repeated inference does not execute the adapter twice");
assert.throws(
  () => engine.n.model.infer({ ...inference, input: { text: "changed" } }),
  /different content/
);

const withoutProvider = createEngine({ kits: [
  createComputeKit(),
  createModelKit({ models: [{ id: "unbound" }] })
] });
assert.throws(
  () => withoutProvider.n.model.infer({ modelId: "unbound" }),
  /No model adapter is available/
);

console.log("core model provider contract smoke ok");
