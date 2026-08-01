import assert from "node:assert/strict";
import {
  createPresentationKit,
  createSpeechKit,
  createEngine
} from "../helpers/public-package-surface.mjs";

const engine = createEngine({ kits: [
  createPresentationKit(),
  createSpeechKit()
] });

let initializes = 0;
let executions = 0;
const provider = {
  id: "fixture-speech",
  version: "1",
  metadata: { environment: "test" },
  async initialize() {
    initializes += 1;
  },
  async synthesize(request) {
    executions += 1;
    return {
      generatedAssetId: `speech-audio:${request.id}`,
      sampleRate: 44100,
      channels: 1,
      samples: [0, 0.25, 0]
    };
  },
  reset() {}
};

const speech = engine.n.speech;
assert.ok(speech);
assert.equal(engine.n.ownerOf("n:presentation:speech"), "speech-contract-kit");
assert.equal(speech.registerProvider(provider), provider.id);
assert.equal(speech.registerProvider(provider), provider.id);
speech.registerVoice({ id: "guide", provider: provider.id, language: "en" });

const request = { id: "welcome", text: "Welcome.", voice: "guide" };
const utterance = await speech.speak(request);
assert.equal(utterance.status, "ready");
assert.equal(utterance.generatedAssetId, "speech-audio:welcome");
assert.equal(initializes, 1);
assert.equal(executions, 1);
assert.deepEqual(await speech.speak(request), utterance);
assert.equal(initializes, 1);
assert.equal(executions, 1);
await assert.rejects(
  speech.speak({ ...request, text: "Different content." }),
  /different content/
);

const acceptedSnapshot = speech.getSnapshot();
assert.notEqual(speech.getSnapshot(), acceptedSnapshot);
assert.doesNotThrow(() => structuredClone(acceptedSnapshot));

const firstReset = speech.reset();
assert.equal(speech.getProvider(provider.id).status, "unavailable");
const secondReset = speech.reset();
assert.deepEqual(secondReset, firstReset);
assert.deepEqual(speech.getSnapshot(), firstReset);

speech.loadSnapshot(acceptedSnapshot);
assert.deepEqual(speech.getSnapshot(), acceptedSnapshot);

console.log("core speech provider-neutral contract smoke ok");
