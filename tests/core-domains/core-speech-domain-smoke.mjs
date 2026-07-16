import assert from "node:assert/strict";
import {
  createCoreAssetsKit,
  createCoreSpeechDomain,
  createRealtimeGame,
  createTinyTTSProvider
} from "../../src/index.js";

const engine = createRealtimeGame({ kits: [
  createCoreAssetsKit(),
  ...createCoreSpeechDomain()
] });

const loaded = [];
engine.n.coreAssets.registerProvider({
  id: "memory-speech-assets",
  async load(asset) {
    loaded.push(asset.id);
    return { value: { id: asset.id, source: asset.source }, portable: { id: asset.id } };
  }
});

const provider = createTinyTTSProvider({
  assetProviderId: "memory-speech-assets",
  modelUri: "memory://tinytts.onnx",
  phonemizerUri: "memory://phonemizer.json",
  vocabularyUri: "memory://vocabulary.json",
  async createSession({ model, phonemizer, vocabulary }) {
    assert.ok(model && phonemizer && vocabulary);
    return {
      async synthesize(request) {
        return { generatedAssetId: `speech-audio:${request.id}`, sampleRate: 44100, channels: 1, samples: [0, 0.25, 0] };
      },
      dispose() {}
    };
  }
});

const speech = engine.n.coreSpeech;
assert.ok(speech);
assert.equal(engine.n.ownerOf("n:speech"), "core-speech-domain");
speech.registerProvider(provider);
speech.registerVoice({ id: "guide", provider: "tiny-tts", language: "en" });

const utterance = await speech.speak({ id: "welcome", text: "Welcome.", voice: "guide" });
assert.equal(utterance.status, "ready");
assert.equal(utterance.generatedAssetId, "speech-audio:welcome");
assert.equal(loaded.length, 3);
assert.equal(speech.getProvider("tiny-tts").status, "ready");
assert.equal(speech.getSnapshot().utterances.welcome.result.samples.length, 3);
structuredClone(speech.getSnapshot());

speech.reset();
assert.equal(Object.keys(speech.getSnapshot().utterances).length, 0);
assert.equal(speech.getProvider("tiny-tts").status, "unavailable");

console.log("core speech asset-backed TinyTTS smoke ok");
